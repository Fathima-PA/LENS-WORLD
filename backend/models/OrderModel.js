import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: mongoose.Schema.Types.ObjectId,
  name: String,
  image: String,
  price: Number,
  quantity: Number,
  total: Number
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
    default: "COD"
  },

  subtotal: Number,
  tax: Number,
  shipping: Number,
  discount: Number,
  grandTotal: Number,

  status: {
    type: String,
    default: "Placed"
  }

},{timestamps:true});

export default mongoose.model("Order",orderSchema);
