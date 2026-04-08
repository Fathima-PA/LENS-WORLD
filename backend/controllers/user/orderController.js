import Cart from "../../models/CartModel.js";
import Product from "../../models/ProductModel.js";
import Address from "../../models/AddressModel.js";
import Order from "../../models/OrderModel.js";
import PDFDocument from "pdfkit";
import razorpay from "../../config/razorpay.js";
import crypto from "crypto";
import User from "../../models/userModel.js";
import Coupon from "../../models/couponModel.js";
import Category from "../../models/CategoryModel.js";
export const placeOrderCOD = async (req,res)=>{
  try{

    const userId = req.user._id;

    const cart = await Cart.findOne({userId}).populate("items.productId");
    if(!cart || cart.items.length===0)
      return res.status(400).json({message:"Cart is empty"});
    for(const item of cart.items){

      const product = item.productId;

      if(!product || !product.isActive)
        return res.status(400).json({message:"Some products unavailable"});

      const variant = product.variants.id(item.variantId);

      
      if(!variant || variant.stock < item.quantity)
        return res.status(400).json({message:"Stock changed, please review cart"});
    }
  const { addressId, paymentMethod,couponCode } = req.body;

const addressDoc = await Address.findOne({
  _id: addressId,
  user: userId
});
    if(!addressDoc)
      return res.status(400).json({message:"Please select address"});

    let subtotal=0;
    const orderItems=[];

    for(const item of cart.items){

      const product = item.productId;
      const variant = product.variants.id(item.variantId);

      const total=item.price*item.quantity;
      subtotal+=total;

      orderItems.push({
        productId:product._id,
        variantId: variant._id,
        name:product.name,
        image:variant.images?.[0]||"",
        price:item.price,
        quantity:item.quantity,
        total
      });
    }

 let discount = subtotal > 5000 ? 500 : 0;

if (couponCode) {

  const coupon = await Coupon.findOne({
    code: couponCode.toUpperCase(),
    isActive: true
  });

  if (!coupon) {
    return res.status(400).json({ message: "Invalid coupon" });
  }

  if (coupon.expiryDate < new Date()) {
    return res.status(400).json({ message: "Coupon expired" });
  }

  if (subtotal < coupon.minPurchase) {
    return res.status(400).json({
      message: `Minimum purchase ₹${coupon.minPurchase} required`
    });
  }

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

    if(paymentMethod === "COD"){

  if(grandTotal > 10000){
    return res.status(400).json({
      message:"COD not allowed above ₹10,000"
    });
  }

}

// if(paymentMethod === "WALLET"){

//   const user = await User.findById(userId);

//   if(user.wallet < grandTotal){
//     return res.status(400).json({
//       message:"Insufficient wallet balance"
//     });
//   }

//   user.wallet -= grandTotal;
//   await user.save();

// }

if (paymentMethod === "WALLET") {

  const user = await User.findById(req.user._id);

  if (user.wallet < grandTotal) {
  return res.status(400).json({ message: "Insufficient wallet balance" });
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
 for (const item of cart.items) {

  const updatedProduct = await Product.findOneAndUpdate(
    {
      _id: item.productId._id,
      "variants._id": item.variantId,
      "variants.stock": { $gte: item.quantity } // 🔥 condition
    },
    {
      $inc: { "variants.$.stock": -item.quantity }
    },
    { new: true }
  );

  if (!updatedProduct) {
    return res.status(400).json({
      message: "Stock changed, please review cart"
    });
  }

  await Category.findByIdAndUpdate(item.productId.category, {
    $inc: {
      stock: -item.quantity,
      sold: item.quantity
    }
  });
}

    const order=await Order.create({
      user:userId,
      items:orderItems,
      couponCode,
      address:{
        address:addressDoc.address,
        city:addressDoc.city,
        state:addressDoc.state,
        phone:addressDoc.phone,
        pincode:addressDoc.pincode
      },
      subtotal,
      tax,
      shipping,
      discount,
      grandTotal,
        paymentMethod,
          paymentStatus: paymentMethod === "RAZORPAY" ? "Pending" : "Paid"
    });


if(paymentMethod === "RAZORPAY"){

  const razorpayOrder = await razorpay.orders.create({
    amount: grandTotal * 100,
    currency:"INR",
    receipt: order._id.toString()
  });
  return res.json({
    razorpay:true,
    orderId:order._id,
    razorpayOrder
  });

}
 
    cart.items=[];
    await cart.save();

    res.json({success:true,orderId:order._id});

  }catch(err){
    console.error(err);
    res.status(500).json({message:"Order failed"});
  }
};


export const getMyOrders = async (req, res) => {
  try {

     let { page = 1, limit = 8,search = "" } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);


    const query = { user: req.user._id };
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
      .sort({ createdAt: -1 }).limit(limit).skip((page-1)*limit);

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

    res.json({formatted, totalPages: Math.ceil(total / limit)});

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};


// GET SINGLE ORDER
export const getOrderDetails = async (req, res) => {
  try {

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    res.json(order);

  } catch {
    res.status(500).json({ message: "Failed to fetch order" });
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


// CANCEL ORDER
export const cancelOrder = async (req, res) => {
  try {

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    if (!["Placed", "Packaging"].includes(order.status))
      return res.status(400).json({ message: "Cannot cancel now" });

    const activeItems = order.items.filter(i => i.status === "Active");

    if (activeItems.length === 0)
      return res.status(400).json({ message: "Order already cancelled" });

    let refundAmount = 0;

    for (const item of activeItems) {
      refundAmount += calculateRefund(item, order);
    }

   for (const item of activeItems) {

  item.status = "Cancelled";

  const product = await Product.findById(item.productId);
  if (!product) continue;

  const variant = product.variants.id(item.variantId);

  if (variant) {
    variant.stock += item.quantity;
    await product.save();
  }

  // ✅ MOVE CATEGORY UPDATE HERE
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

    res.json({ message: "Order cancelled successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Cancel failed" });
  }
};

export const cancelOrderItem = async (req, res) => {

  try {

    const { itemId } = req.body;

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    if (!["Placed", "Packaging"].includes(order.status))
      return res.status(400).json({ message: "Cannot cancel now" });

    const item = order.items.id(itemId);

    if (!item)
      return res.status(404).json({ message: "Item not found" });

    if (item.status === "Cancelled")
      return res.status(400).json({ message: "Already cancelled" });

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

    res.json({ message: "Item cancelled successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Cancel failed" });
  }
};

// RETURN ORDER
export const returnOrder = async (req, res) => {

  const { reason } = req.body;

  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (order.status !== "Delivered")
    return res.status(400).json({ message: "Only delivered orders can be returned" });

  order.items.forEach(item => {
    if (item.status === "Active") {
      item.returnRequest = "Pending";
      item.returnReason = reason;
    }
  });

  await order.save();

  res.json({ message: "Return request submitted" });
};


export const returnSingleItem = async (req, res) => {
  try {
    const { itemId, reason } = req.body;

    if (!itemId || !reason) {
      return res.status(400).json({ message: "Item and reason required" });
    }

     const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "Delivered") {
      return res.status(400).json({
        message: "Order not delivered yet",
      });
    }

    const item = order.items.id(itemId);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.status !== "Active") {
      return res.status(400).json({
        message: "Item cannot be returned",
      });
    }

    if (item.returnRequest !== "None") {
      return res.status(400).json({
        message: "Return already requested",
      });
    }

    
    item.returnRequest = "Pending";
    item.returnReason = reason;

    await order.save();

    res.json({ message: "Return request submitted for item" });

  } catch (error) {
    console.error("RETURN ITEM ERROR:", error);
    res.status(500).json({ message: "Return failed" });
  }
};


export const downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!order)
      return res.status(404).json({ message: "Order not found" });

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

      // 🎨 STATUS COLOR
      if (item.status === "Cancelled") {
        doc.fillColor("red");
      } else if (item.status === "Returned") {
        doc.fillColor("orange");
      } else {
        doc.fillColor("green");
      }

      doc.text(item.status || "Active", statusX, position);
      doc.fillColor("black"); // reset color

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

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Invoice failed" });
  }
};


export const verifyRazorpayPayment = async (req,res)=>{
  try{

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if(expectedSign !== razorpay_signature){
      return res.status(400).json({message:"Payment verification failed"});
    }

    const order = await Order.findById(orderId);

    if(!order){
      return res.status(404).json({message:"Order not found"});
    }

    if(order.paymentStatus === "Paid"){
      return res.json({success:true});
    }

    order.paymentStatus = "Paid";
    order.paymentId = razorpay_payment_id;
   
if (order.couponCode) {
  const coupon = await Coupon.findOne({ code: order.couponCode });

  if (coupon && !coupon.usedBy.includes(order.user)) {
    coupon.usedBy.push(order.user);
    await coupon.save();
  }
}
    await order.save();

  
for (const item of order.items) {
  const product = await Product.findById(item.productId);

 const updatedProduct = await Product.findOneAndUpdate(
  {
    _id: item.productId,
    "variants._id": item.variantId,
    "variants.stock": { $gte: item.quantity } // 🔥 atomic check
  },
  {
    $inc: { "variants.$.stock": -item.quantity }
  },
  { new: true }
);

if (!updatedProduct) {
  return res.status(400).json({
    message: "Stock not available after payment"
  });
}

  await Category.findByIdAndUpdate(product.category, {
  $inc: {
    stock: -item.quantity,
    sold: item.quantity
  }
});
}


await Cart.updateOne(
  { userId: order.user },   
  { $set: { items: [] } }
);

    res.json({
      success:true,
      message:"Payment successful"
    });

  }catch(err){
    console.error("VERIFY ERROR:",err);
    res.status(500).json({message:"Verification failed"});
  }
};

export const getWallet = async (req,res)=>{

 const user = await User.findById(req.user._id)
   .select("wallet walletHistory");

 res.json(user);

};
export const retryRazorpayPayment = async (req,res)=>{
  try{

    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if(!order){
      return res.status(404).json({
        message:"Order not found"
      });
    }

    if(order.paymentStatus === "Paid"){
      return res.json({
        success:false,
        message:"Order already paid"
      });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: order.grandTotal * 100,
      currency:"INR",
      receipt: order._id.toString()
    });

    res.json({
      success:true,
      razorpayOrder,
      orderId: order._id
    });

  }catch(err){
    console.error(err);
    res.status(500).json({
      message:"Retry payment failed"
    });
  }
};
export const markPaymentFailed = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.paymentStatus === "Failed") {
      return res.json({ success: true });
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

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update payment" });
  }
};