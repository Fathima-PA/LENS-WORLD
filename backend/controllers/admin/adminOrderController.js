import Order from "../../models/OrderModel.js";
import User from "../../models/userModel.js";
import Product from "../../models/ProductModel.js";

// GET ORDERS
export const getAllOrders = async (req, res) => {
  try {
    let { search = "", status = "all", page = 1, limit = 8 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const query = {};

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

    res.json({
      orders,
      totalPages: Math.ceil(total / limit)
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// CHANGE ORDER STATUS
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json(order);

  } catch (err) {
    res.status(500).json({ message: "Status update failed" });
  }
};



export const getOrderDetailsAdmin = async (req, res) => {
  try {

    const order = await Order.findById(req.params.id)
      .populate("user", "username email");

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch order" });
  }
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

  if (returned > 0) {
    order.status = "Returned";
    return;
  }

};

// APPROVE CANCEL ITEM


export const approveCancel = async (req, res) => {
  try {

    const { itemId } = req.body;

    const order = await Order.findById(req.params.id);

    const item = order.items.id(itemId);

    if (!item)
      return res.status(404).json({ message: "Item not found" });

    if (item.status === "Cancelled") {
      return res.status(400).json({ message: "Item already cancelled" });
    }

    item.cancelRequest = "Approved";
    item.status = "Cancelled";


    const product = await Product.findById(item.productId);
    const variant = product?.variants.id(item.variantId);

    if (variant) {
      variant.stock += item.quantity;
      await product.save();
    }

   

    if (order.paymentMethod !== "COD") {

      const user = await User.findById(order.user);

      user.wallet += item.total;

      user.walletHistory.push({
        type: "CREDIT",
        amount: item.total,
        reason: "Order Item Cancel Refund"
      });

      await user.save();
    }

   

    recalculateOrderStatus(order);

    await order.save();

    res.json({ message: "Cancel approved and refund added to wallet" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error approving cancel" });
  }
};

// REJECT CANCEL ITEM
export const rejectCancel = async (req, res) => {
  try {

    const { itemId } = req.body;

    const order = await Order.findById(req.params.id);

    const item = order.items.id(itemId);

    item.cancelRequest = "Rejected";

    await order.save();

    res.json({ message: "Cancel rejected" });

  } catch {
    res.status(500).json({ message: "Error rejecting cancel" });
  }
};

// APPROVE RETURN ITEM

export const approveReturn = async (req, res) => {
  try {

    const { itemId } = req.body;

    const order = await Order.findById(req.params.id);
    const item = order.items.id(itemId);

    if (!item)
      return res.status(404).json({ message: "Item not found" });

    
    if (item.status === "Returned") {
      return res.status(400).json({ message: "Item already returned" });
    }

    item.returnRequest = "Approved";
    item.status = "Returned";

   

    const product = await Product.findById(item.productId);
    const variant = product?.variants.id(item.variantId);

    if (variant) {
      variant.stock += item.quantity;
      await product.save();
    }

   

    if (order.paymentMethod !== "COD") {

      const user = await User.findById(order.user);

      user.wallet += item.total;

      user.walletHistory.push({
        type: "CREDIT",
        amount: item.total,
        reason: "Order Return Refund"
      });

      await user.save();
    }

   

    recalculateOrderStatus(order);

    await order.save();

    res.json({ message: "Return approved and refund added to wallet" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error approving return" });
  }
};

// REJECT RETURN ITEM
export const rejectReturn = async (req, res) => {
  try {

    const { itemId } = req.body;

    const order = await Order.findById(req.params.id);
    const item = order.items.id(itemId);

    item.returnRequest = "Rejected";

    await order.save();

    res.json({ message: "Return rejected" });

  } catch {
    res.status(500).json({ message: "Error rejecting return" });
  }
};

