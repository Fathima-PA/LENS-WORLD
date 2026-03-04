import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: mongoose.Schema.Types.ObjectId,
    variantId: mongoose.Schema.Types.ObjectId,   
  name: String,
  image: String,
  price: Number,
  quantity: Number,
  total: Number,
    status: {
    type: String,
    enum: ["Active","Cancelled","Returned"],
    default: "Active"
  },
 cancelRequest: {
    type: String,
    enum: ["None","Pending","Approved","Rejected"],
    default: "None"
  },

  returnRequest: {
    type: String,
    enum: ["None","Pending","Approved","Rejected"],
    default: "None"
  },
  cancelReason: String,
  returnReason: String
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  items: [orderItemSchema],

  address: {
    address: String,
    city: String,
    state: String,
    phone: String,
    pincode: String
  },

  paymentMethod: {
    type: String,
    enum: ["COD", "RAZORPAY", "WALLET"],
    default: "COD"
  },

  subtotal: Number,
  tax: Number,
  shipping: Number,
  discount: Number,
  grandTotal: Number,

  status: {
    type: String,
     enum: ["Placed", "Packaging", "Shipped", "Delivered", "Cancelled", "Returned"],
    default: "Placed"
  },
    deliveredAt: Date,
  returnReason: String


},{timestamps:true});

export default mongoose.model("Order",orderSchema);
