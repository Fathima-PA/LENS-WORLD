import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const categoryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "lensworld-ecommerce/categories",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const categoryUpload = multer({ storage: categoryStorage });

export default categoryUpload;
