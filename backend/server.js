import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/user/userRoutes.js";
import cors from "cors";
import adminRoutes from "./routes/admin/adminRoutes.js";
import authRoutes from "./routes/user/authRoutes.js";
import addressRoutes from "./routes/user/addressRoutes.js"
import productRoutes from "./routes/user/productRoutes.js"
import cartRoutes from "./routes/user/cartRoutes.js"
import wishlistRoutes from "./routes/user/wishlistRoutes.js"
import orderRoutes from "./routes/user/orderRoutes.js"
import cookieParser from "cookie-parser";



dotenv.config();



const app = express();
const allowedOrigins = process.env.CORS_ORIGIN.split(",");

app.use(cors({
origin:allowedOrigins,
  credentials: true,
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(cookieParser());
connectDB();

app.get("/", (req, res) => {
  res.send("API is working");
});

app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/address",addressRoutes);
app.use("/api/products",productRoutes);
app.use("/api/cart",cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/order",orderRoutes);



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
