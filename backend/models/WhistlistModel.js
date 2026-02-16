import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: true,
    required: true
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      },
      variantId: {
        type: mongoose.Schema.Types.ObjectId
      }
    }
  ]
}, { timestamps: true });

export default mongoose.model("Wishlist", wishlistSchema);
