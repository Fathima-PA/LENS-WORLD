import Cart from "../../models/CartModel.js";
import Product from "../../models/ProductModel.js";
import Address from "../../models/AddressModel.js";
import Order from "../../models/OrderModel.js";
import razorpay from "../../config/razorpay.js";
import User from "../../models/userModel.js";
import Coupon from "../../models/couponModel.js";
import Category from "../../models/CategoryModel.js";
import crypto from "crypto";
 import mongoose from "mongoose";
export const placeOrderCODService = async (userId, data) => {

  const { addressId, paymentMethod, couponCode } = data;

  const cart = await Cart.findOne({ userId }).populate("items.productId");

  if (!cart || cart.items.length === 0) {
    const error = new Error("Cart is empty");
    error.statusCode = 400;
    throw error;
  }

  // ✅ VALIDATION
  for (const item of cart.items) {

    const product = item.productId;

    if (!product || !product.isActive) {
      throw new Error("Some products unavailable");
    }

    const variant = product.variants.id(item.variantId);

    if (!variant || variant.stock < item.quantity) {
      throw new Error("Stock changed, please review cart");
    }
  }

  // ✅ ADDRESS
  const addressDoc = await Address.findOne({
    _id: addressId,
    user: userId
  });

  if (!addressDoc) {
    throw new Error("Please select address");
  }

  let subtotal = 0;
  const orderItems = [];

  for (const item of cart.items) {

    const product = item.productId;
    const variant = product.variants.id(item.variantId);

    const total = item.price * item.quantity;
    subtotal += total;

    orderItems.push({
      productId: product._id,
      variantId: variant._id,
      name: product.name,
      image: variant.images?.[0] || "",
      price: item.price,
      quantity: item.quantity,
      total
    });
  }

  // ✅ DISCOUNT
  let discount = subtotal > 5000 ? 500 : 0;

  if (couponCode) {

    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true
    });

    if (!coupon) throw new Error("Invalid coupon");

    if (coupon.expiryDate < new Date())
      throw new Error("Coupon expired");

    if (subtotal < coupon.minPurchase)
      throw new Error(`Minimum purchase ₹${coupon.minPurchase} required`);

    if (coupon.discountType === "percentage") {

      discount = subtotal * coupon.discountValue / 100;

      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }

    } else {
      discount = coupon.discountValue;
    }
  }

  const tax = Math.round(subtotal * 0.18);
  const shipping = 0;
  const grandTotal = subtotal + tax + shipping - discount;

  // ✅ COD LIMIT
  if (paymentMethod === "COD" && grandTotal > 10000) {
    throw new Error("COD not allowed above ₹10,000");
  }

  // ✅ WALLET
  if (paymentMethod === "WALLET") {

    const user = await User.findById(userId);

    if (user.wallet < grandTotal) {
      throw new Error("Insufficient wallet balance");
    }

    user.wallet -= grandTotal;

    user.walletHistory.push({
      type: "DEBIT",
      amount: grandTotal,
      reason: "Order Payment",
      date: new Date()
    });

    await user.save();
  }

  // ✅ STOCK UPDATE
  for (const item of cart.items) {

    const updatedProduct = await Product.findOneAndUpdate(
      {
        _id: item.productId._id,
        "variants._id": item.variantId,
        "variants.stock": { $gte: item.quantity }
      },
      {
        $inc: { "variants.$.stock": -item.quantity }
      },
      { new: true }
    );

    if (!updatedProduct) {
      throw new Error("Stock changed, please review cart");
    }

    await Category.findByIdAndUpdate(item.productId.category, {
      $inc: {
        stock: -item.quantity,
        sold: item.quantity
      }
    });
  }

  // ✅ CREATE ORDER
  const order = await Order.create({
    user: userId,
    items: orderItems,
    couponCode,
    address: {
      address: addressDoc.address,
      city: addressDoc.city,
      state: addressDoc.state,
      phone: addressDoc.phone,
      pincode: addressDoc.pincode
    },
    subtotal,
    tax,
    shipping,
    discount,
    grandTotal,
    paymentMethod,
    paymentStatus: paymentMethod === "RAZORPAY" ? "Pending" : "Paid"
  });

  // ✅ RAZORPAY
  if (paymentMethod === "RAZORPAY") {

    const razorpayOrder = await razorpay.orders.create({
      amount: grandTotal * 100,
      currency: "INR",
      receipt: order._id.toString()
    });

    return {
      razorpay: true,
      orderId: order._id,
      razorpayOrder
    };
  }

  // ✅ CLEAR CART
  cart.items = [];
  await cart.save();

  return {
    success: true,
    orderId: order._id
  };
};



export const getMyOrdersService = async (userId, queryParams) => {

  let { page = 1, limit = 8, search = "" } = queryParams;

  page = parseInt(page);
  limit = parseInt(limit);

  const query = { user: userId };

  if (search) {
    query.$expr = {
      $regexMatch: {
        input: { $toString: "$_id" },
        regex: search,
        options: "i"
      }
    };
  }

  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit);

  const total = await Order.countDocuments(query);

  const formatted = orders.map(order => ({
    _id: order._id,
    orderId: order._id,
    status: order.status,
    paymentStatus: order.paymentStatus || "Pending",
    paymentMethod: order.paymentMethod,
    date: order.createdAt,
    total: order.grandTotal,
    items: order.items.length
  }));

  return {
    formatted,
    totalPages: Math.ceil(total / limit)
  };
};



export const getOrderDetailsService = async (userId, orderId) => {

  const order = await Order.findOne({
    _id: orderId,
    user: userId
  });

  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  return order;
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





export const cancelOrderService = async (userId, orderId) => {

  const order = await Order.findOne({
    _id: orderId,
    user: userId
  });

  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  if (!["Placed", "Packaging"].includes(order.status)) {
    const error = new Error("Cannot cancel now");
    error.statusCode = 400;
    throw error;
  }

  const activeItems = order.items.filter(i => i.status === "Active");

  if (activeItems.length === 0) {
    const error = new Error("Order already cancelled");
    error.statusCode = 400;
    throw error;
  }

  let refundAmount = 0;

  for (const item of activeItems) {
    refundAmount += calculateRefund(item, order);
  }

  // ✅ UPDATE ITEMS + STOCK
  for (const item of activeItems) {

    item.status = "Cancelled";

    const product = await Product.findById(item.productId);
    if (!product) continue;

    const variant = product.variants.id(item.variantId);

    if (variant) {
      variant.stock += item.quantity;
      await product.save();
    }

    if (product.category) {
      await Category.findByIdAndUpdate(product.category, {
        $inc: {
          stock: item.quantity,
          sold: -item.quantity
        }
      });
    }
  }

  order.status = "Cancelled";

  // ✅ REFUND
  if (order.paymentMethod !== "COD" && order.paymentStatus === "Paid") {

    const user = await User.findById(order.user);

    user.wallet += refundAmount;

    user.walletHistory.push({
      type: "CREDIT",
      amount: refundAmount,
      reason: "Order Cancel Refund"
    });

    await user.save();
  }

  await order.save();

  return { message: "Order cancelled successfully" };
};


export const cancelOrderItemService = async (userId, orderId, itemId) => {

  const order = await Order.findOne({
    _id: orderId,
    user: userId
  });

  if (!order)
    throw Object.assign(new Error("Order not found"), { statusCode: 404 });

  if (!["Placed", "Packaging"].includes(order.status))
    throw Object.assign(new Error("Cannot cancel now"), { statusCode: 400 });

  const item = order.items.id(itemId);

  if (!item)
    throw Object.assign(new Error("Item not found"), { statusCode: 404 });

  if (item.status === "Cancelled")
    throw Object.assign(new Error("Already cancelled"), { statusCode: 400 });

  item.status = "Cancelled";

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

  if (order.paymentMethod !== "COD" && order.paymentStatus === "Paid") {

    const user = await User.findById(order.user);

    const refundAmount = calculateRefund(item, order);

    user.wallet += refundAmount;

    user.walletHistory.push({
      type: "CREDIT",
      amount: refundAmount,
      reason: "Item Cancel Refund"
    });

    await user.save();
  }

  const allCancelled = order.items.every(i => i.status === "Cancelled");

  if (allCancelled) {
    order.status = "Cancelled";
  }

  await order.save();

  return { message: "Item cancelled successfully" };
};


export const returnOrderService = async (userId, orderId, reason) => {

  const order = await Order.findOne({
    _id: orderId,
    user: userId
  });

  if (order.status !== "Delivered")
    throw Object.assign(
      new Error("Only delivered orders can be returned"),
      { statusCode: 400 }
    );

  order.items.forEach(item => {
    if (item.status === "Active") {
      item.returnRequest = "Pending";
      item.returnReason = reason;
    }
  });

  await order.save();

  return { message: "Return request submitted" };
};



export const returnSingleItemService = async (userId, orderId, data) => {

  const { itemId, reason } = data;

  if (!itemId || !reason) {
    throw Object.assign(
      new Error("Item and reason required"),
      { statusCode: 400 }
    );
  }

  const order = await Order.findOne({
    _id: orderId,
    user: userId
  });

  if (!order) {
    throw Object.assign(
      new Error("Order not found"),
      { statusCode: 404 }
    );
  }

  if (order.status !== "Delivered") {
    throw Object.assign(
      new Error("Order not delivered yet"),
      { statusCode: 400 }
    );
  }

  const item = order.items.id(itemId);

  if (!item) {
    throw Object.assign(
      new Error("Item not found"),
      { statusCode: 404 }
    );
  }

  if (item.status !== "Active") {
    throw Object.assign(
      new Error("Item cannot be returned"),
      { statusCode: 400 }
    );
  }

  if (item.returnRequest !== "None") {
    throw Object.assign(
      new Error("Return already requested"),
      { statusCode: 400 }
    );
  }

  item.returnRequest = "Pending";
  item.returnReason = reason;

  await order.save();

  return { message: "Return request submitted for item" };
};


export const downloadInvoiceService = async (userId, orderId, res) => {

  const order = await Order.findOne({
    _id: orderId,
    user: userId
  });

  if (!order)
    throw Object.assign(new Error("Order not found"), { statusCode: 404 });

  const PDFDocument = (await import("pdfkit")).default;
  const doc = new PDFDocument({ margin: 40 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=invoice-${order._id}.pdf`
  );

  doc.pipe(res);

  /* ---------------- HEADER ---------------- */
  doc.fontSize(22).text("LENS WORLD", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(16).text("INVOICE", { align: "center" });
  doc.moveDown(2);

  /* ---------------- ORDER INFO ---------------- */
  doc.fontSize(12);
  doc.text(`Order ID: ${order._id}`);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`);
  doc.text(`Status: ${order.status}`);
  doc.moveDown();

  doc.text("Shipping Address:");
  doc.text(order.address.address);
  doc.text(`${order.address.city}, ${order.address.state}`);
  doc.text(order.address.pincode);
  doc.text(`Phone: ${order.address.phone}`);
  doc.moveDown(2);

  /* ---------------- TABLE HEADER ---------------- */
  const tableTop = doc.y;
  const itemX = 40;
  const qtyX = 260;
  const priceX = 310;
  const totalX = 390;
  const statusX = 470;

  doc.font("Helvetica-Bold");
  doc.text("Item", itemX, tableTop);
  doc.text("Qty", qtyX, tableTop);
  doc.text("Price", priceX, tableTop);
  doc.text("Total", totalX, tableTop);
  doc.text("Status", statusX, tableTop);

  doc.moveTo(itemX, tableTop + 15)
    .lineTo(550, tableTop + 15)
    .stroke();

  doc.font("Helvetica");

  /* ---------------- TABLE ROWS ---------------- */
  let position = tableTop + 25;

  order.items.forEach((item) => {

    doc.text(item.name, itemX, position);
    doc.text(item.quantity.toString(), qtyX, position);
    doc.text(`₹${item.price}`, priceX, position);
    doc.text(`₹${item.total}`, totalX, position);

    if (item.status === "Cancelled") {
      doc.fillColor("red");
    } else if (item.status === "Returned") {
      doc.fillColor("orange");
    } else {
      doc.fillColor("green");
    }

    doc.text(item.status || "Active", statusX, position);
    doc.fillColor("black");

    position += 25;
  });

  doc.moveTo(itemX, position - 10)
    .lineTo(550, position - 10)
    .stroke();

  /* ---------------- TOTAL SECTION ---------------- */
  doc.moveDown(2);

  doc.text(`Subtotal: ₹${order.subtotal}`, { align: "right" });
  doc.text(`Tax (18%): ₹${order.tax}`, { align: "right" });
  doc.text(`Shipping: ₹${order.shipping}`, { align: "right" });
  doc.text(`Discount: ₹${order.discount}`, { align: "right" });

  doc.font("Helvetica-Bold");
  doc.text(`Grand Total: ₹${order.grandTotal}`, { align: "right" });

  doc.end();
};




export const verifyRazorpayPaymentService = async (data) => {

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId
  } = data;

  const sign = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSign = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(sign)
    .digest("hex");

  if (expectedSign !== razorpay_signature) {
    throw Object.assign(
      new Error("Payment verification failed"),
      { statusCode: 400 }
    );
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw Object.assign(
      new Error("Order not found"),
      { statusCode: 404 }
    );
  }

  if (order.paymentStatus === "Paid") {
    return { success: true };
  }

  // ✅ MARK PAID
  order.paymentStatus = "Paid";
  order.paymentId = razorpay_payment_id;

  // ✅ COUPON
  if (order.couponCode) {
    const coupon = await Coupon.findOne({ code: order.couponCode });

    if (coupon && !coupon.usedBy.includes(order.user)) {
      coupon.usedBy.push(order.user);
      await coupon.save();
    }
  }

  await order.save();

  // ✅ CLEAR CART
  await Cart.updateOne(
    { userId: order.user },
    { $set: { items: [] } }
  );

  return {
    success: true,
    message: "Payment successful"
  };
};



export const retryRazorpayPaymentService = async (orderId) => {

  const order = await Order.findById(orderId);

  if (!order) {
    throw Object.assign(
      new Error("Order not found"),
      { statusCode: 404 }
    );
  }

  if (order.paymentStatus === "Paid") {
    return {
      success: false,
      message: "Order already paid"
    };
  }

  const razorpayOrder = await razorpay.orders.create({
    amount: order.grandTotal * 100,
    currency: "INR",
    receipt: order._id.toString()
  });

  return {
    success: true,
    razorpayOrder,
    orderId: order._id
  };
};

export const markPaymentFailedService = async (orderId) => {

  const order = await Order.findById(orderId);

  if (!order) {
    throw Object.assign(
      new Error("Order not found"),
      { statusCode: 404 }
    );
  }

  if (order.paymentStatus === "Failed") {
    return { success: true };
  }

  for (const item of order.items) {

    await Product.findOneAndUpdate(
      {
        _id: item.productId,
        "variants._id": item.variantId
      },
      {
        $inc: { "variants.$.stock": item.quantity }
      }
    );

    const product = await Product.findById(item.productId);

    await Category.findByIdAndUpdate(product.category, {
      $inc: {
        stock: item.quantity,
        sold: -item.quantity
      }
    });
  }

  order.paymentStatus = "Failed";
  // order.status = "Cancelled"; 
  await order.save();

  return { success: true };
};