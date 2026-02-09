import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/user/userRoutes.js";
import cors from "cors";
import adminRoutes from "./routes/admin/adminRoutes.js";
import authRoutes from "./routes/user/authRoutes.js";
import addressRoutes from "./routes/user/addressRoutes.js"
import productRoutes from "./routes/user/productRoutes.js"
import cookieParser from "cookie-parser";



dotenv.config();



const app = express();
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

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


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
