import Order from "../../models/OrderModel.js";
import User from "../../models/userModel.js";

import Product from "../../models/ProductModel.js";
import Category from "../../models/CategoryModel.js";


export const getAllOrdersService = async (queryParams) => {

  let { search = "", status = "all", page = 1, limit = 8 } = queryParams;

  page = parseInt(page);
  limit = parseInt(limit);

  const query = { paymentStatus: { $ne: "Failed" } };

  if (status !== "all") {
    query.status = status;
  }

  if (search) {

    const users = await User.find({
      username: { $regex: search, $options: "i" }
    }).select("_id");

    query.$or = [
      { _id: search.match(/^[0-9a-fA-F]{24}$/) ? search : null },
      { user: { $in: users.map(u => u._id) } }
    ];
  }

  const total = await Order.countDocuments(query);

  const orders = await Order.find(query)
    .populate("user", "username email")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    orders,
    totalPages: Math.ceil(total / limit)
  };
};



export const updateOrderStatusService = async (id, status) => {

  const order = await Order.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );

  return order;
};


export const getOrderDetailsAdminService = async (id) => {

  const order = await Order.findById(id)
    .populate("user", "username email");

  if (!order) {
    return {
      success: false,
      message: "Order not found"
    };
  }

  return {
    success: true,
    order
  };
};


const recalculateOrderStatus = (order) => {

  const total = order.items.length;

  const cancelled = order.items.filter(i => i.status === "Cancelled").length;
  const returned  = order.items.filter(i => i.status === "Returned").length;
  const active    = order.items.filter(i => i.status === "Active").length;

  if (cancelled === total) {
    order.status = "Cancelled";
    return;
  }

  if (returned === total) {
    order.status = "Returned";
    return;
  }

  

};

const calculateRefund = (item, order) => {

  const totalItemsAmount = order.items.reduce(
    (sum, i) => sum + (i.total || 0),
    0
  );

  if (!totalItemsAmount) return 0;

  // convert to paise
  const itemTotal = Math.round(item.total * 100);
  const total = Math.round(totalItemsAmount * 100);
  const tax = Math.round(order.tax * 100);
  const discount = Math.round(order.discount * 100);

  const ratio = itemTotal / total;

  const taxShare = Math.round(ratio * tax);
  const discountShare = Math.round(ratio * discount);

  const refundPaise = itemTotal + taxShare - discountShare;

  return refundPaise / 100; // back to rupees
};






export const approveReturnService = async (orderId, itemId) => {

  const order = await Order.findById(orderId);

  const item = order.items.id(itemId);

  if (!item) {
    return { success: false, message: "Item not found" };
  }

  if (item.status === "Returned") {
    return { success: false, message: "Item already returned" };
  }

  item.returnRequest = "Approved";
  item.status = "Returned";

  // STOCK RESTORE
  const product = await Product.findById(item.productId);
  const variant = product?.variants.id(item.variantId);

  if (variant) {
    variant.stock += item.quantity;
    await product.save();
  }

  if (product?.category) {
    await Category.findByIdAndUpdate(product.category, {
      $inc: {
        stock: item.quantity,
        sold: -item.quantity
      }
    });
  }

  // REFUND
  if (order.paymentStatus === "Paid" && order.paymentMethod !== "COD") {

    const user = await User.findById(order.user);

    const refundAmount = calculateRefund(item, order);

    user.wallet += refundAmount;

    user.walletHistory.push({
      type: "CREDIT",
      amount: refundAmount,
      reason: "Order Return Refund"
    });

    await user.save();
  }

  // UPDATE ORDER STATUS
  recalculateOrderStatus(order);

  await order.save();

  return {
    success: true,
    message: "Return approved and refund added to wallet"
  };
};


export const rejectReturnService = async (orderId, itemId) => {

  const order = await Order.findById(orderId);

  if (!order) {
    return { success: false, message: "Order not found" };
  }

  const item = order.items.id(itemId);

  if (!item) {
    return { success: false, message: "Item not found" };
  }

  item.returnRequest = "Rejected";

  await order.save();

  return {
    success: true,
    message: "Return rejected"
  };
};