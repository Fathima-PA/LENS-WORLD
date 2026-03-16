import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    user: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true,
},
    name:String,
    address: String,
    city: String,
    state: String,
    phone: String,
    pincode: String,
    isDefault: {
  type: Boolean,
  default: false,
}

  },
  { timestamps: true }
);

const Address = mongoose.model("Address", addressSchema);
export default Address;

