import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({

  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },

  discountType: {
    type: String,
    enum: ["percentage","flat"],
    required: true
  },

  discountValue: Number,

  minPurchase: {
    type: Number,
    default: 0
  },

  maxDiscount: Number,

  expiryDate: Date,

  isActive: {
    type: Boolean,
    default: true
  },
  usedBy:[
  {
    type: mongoose.Schema.Types.ObjectId,
    ref:"User"
  }
]

},{timestamps:true});

export default mongoose.model("Coupon",couponSchema);