import Cart from "../../models/CartModel.js";
import Product from "../../models/ProductModel.js";
import Address from "../../models/AddressModel.js";
import Order from "../../models/OrderModel.js";
import PDFDocument from "pdfkit";

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
    const addressDoc = await Address.findOne({user:userId,isDefault:true});
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

    const tax=Math.round(subtotal*0.18);
    const shipping=0;
    const discount=subtotal>5000?500:0;
    const grandTotal=subtotal+tax+shipping-discount;

    const order=await Order.create({
      user:userId,
      items:orderItems,
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
      grandTotal
    });

    for(const item of cart.items){
      const product=await Product.findById(item.productId._id);
      const variant=product.variants.id(item.variantId);
      variant.stock-=item.quantity;
      await product.save();
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

    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    const formatted = orders.map(order => ({
          _id: order._id, 
      orderId: order._id,
      status: order.status,
      date: order.createdAt,
      total: order.grandTotal,
      items: order.items.length
    }));

    res.json(formatted);

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

// CANCEL ORDER
export const cancelOrder = async (req, res) => {
  try {

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    if (!["Placed","Packaging"].includes(order.status))
      return res.status(400).json({ message: "Cannot cancel now" });

    order.items.forEach(item => {
      if (item.status === "Active") {
        item.cancelRequest = "Pending";
      }
    });

    await order.save();

    res.json({ message: "Cancel request sent to admin" });

  } catch {
    res.status(500).json({ message: "Cancel failed" });
  }
};

export const cancelOrderItem = async (req, res) => {

  const { itemId, reason } = req.body;

  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  const item = order.items.id(itemId);

  if (!item) return res.status(404).json({ message: "Item not found" });

  if (item.cancelRequest !== "None")
    return res.status(400).json({ message: "Already requested" });

  item.cancelRequest = "Pending";
  item.cancelReason = reason;

  await order.save();

  res.json({ message: "Cancel request sent to admin" });
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


export const downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!order)
      return res.status(404).json({ message: "Order not found" });


    // CREATE PDF
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order._id}.pdf`
    );

    doc.pipe(res);

    // HEADER
    doc.fontSize(20).text("LENS WORLD", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text("INVOICE", { align: "center" });

    doc.moveDown();

    // ORDER INFO
    doc.fontSize(12).text(`Order ID: ${order._id}`);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`);
    doc.text(`Status: ${order.status}`);

    doc.moveDown();

    doc.text("Shipping Address:");
    doc.text(order.address.address);
    doc.text(`${order.address.city}, ${order.address.state}`);
    doc.text(order.address.pincode);
    doc.text(`Phone: ${order.address.phone}`);

    doc.moveDown();

    doc.text("Items:");
    doc.moveDown(0.5);

    order.items.forEach(item => {
      doc.text(
        `${item.name}  | Qty: ${item.quantity}  | ₹${item.price}  | ₹${item.total}`
      );
    });

    doc.moveDown();


    doc.text(`Subtotal: ₹${order.subtotal}`);
    doc.text(`Tax: ₹${order.tax}`);
    doc.text(`Shipping: ₹${order.shipping}`);
    doc.text(`Grand Total: ₹${order.grandTotal}`);

    doc.end();

  } catch (err) {
    res.status(500).json({ message: "Invoice failed" });
  }
};
