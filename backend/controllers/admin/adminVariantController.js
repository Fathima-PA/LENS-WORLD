
// import Product from "../../models/ProductModel.js";


// export const addVariantToProduct = async (req, res) => {
//   try {
//     const { productId } = req.params;
//     const { name, sku, price, stock } = req.body;

//     if (!req.files || req.files.length < 3) {
//       return res.status(400).json({
//         message: "Minimum 3 images required",
//       });
//     }

//     const images = req.files.map((file) => file.path);

//     const product = await Product.findById(productId);

//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     product.variants.push({
//       name,
//       sku,
//       price,
//       stock,
//       images,
//     });

//     await product.save();

//     res.json({
//       message: "Variant added successfully",
//       product,
//     });
//   } catch (error) {
//     console.error("ADD VARIANT ERROR ", error);
//     res.status(500).json({ message: error.message });
//   }
// };
