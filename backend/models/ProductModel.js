import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

   color: {
  type: String, 
  required: true,
},
    price: {
      type: Number,
      required: true,
    },

    stock: {
      type: Number,
      required: true,
    },

    images: {
      type: [String],
      required: true,
      validate: {
        validator: (v) => v.length >= 3,
        message: "Minimum 3 images required",
      },
    },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    brand: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    variants: {
      type: [variantSchema],
      validate: {
        validator: (v) => v.length > 0,
        message: "Product must have at least one variant",
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
