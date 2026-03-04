import Product from "../../models/ProductModel.js";
import Category from "../../models/CategoryModel.js";

export const createProductWithVariant = async (req, res) => {
  try {
    const { name, brand, description, category } = req.body;

    if (!name || !brand || !description || !category) {
      return res.status(400).json({
        message: "All product fields are required",
      });
    }
    const categoryDoc = await Category.findById(category);

if (!categoryDoc) {
  return res.status(404).json({
    message: "Category not found",
  });
}

if (!categoryDoc.isActive) {
  return res.status(400).json({
    message: "Cannot add product to a blocked category",
  });
}

    const variants = JSON.parse(req.body.variants || "[]");

    if (!Array.isArray(variants) || variants.length === 0) {
      return res.status(400).json({
        message: "At least one variant is required",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "Variant images are required",
      });
    }

    let fileIndex = 0;

    const formattedVariants = variants.map((variant) => {
      const { name, color, price, stock } = variant;
      console.log("Saving color:", color);


      if (!name || !color || !price || !stock) {
        throw new Error("All variant fields are required");
      }

      const variantImages = req.files
        .slice(fileIndex, fileIndex + 3)
        .map((file) => file.path);

      if (variantImages.length !== 3) {
        throw new Error("Each variant must have exactly 3 images");
      }

      fileIndex += 3;

      return {
        name,
        color,
        price,
        stock,
        images: variantImages,
      };
    });

    const product = await Product.create({
      name,
      brand,
      description,
      category,
      variants: formattedVariants,
    });

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("CREATE PRODUCT ERROR 👉", error);
    res.status(500).json({ message: error.message });
  }
};



export const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, filter } = req.query;

    let query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (filter === "instock") {
        query["variants.stock"] = { $gt: 0 };
    }

    if (filter === "outofstock") {
      query["variants.stock"] = 0;
    }

    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      data: products,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* TOGGLE PRODUCT ACTIVE STATUS */
export const toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.isActive = !product.isActive;
    await product.save();

    res.json({
      message: product.isActive
        ? "Product activated successfully"
        : "Product blocked successfully",
      isActive: product.isActive,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("category");

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.json(product);
};


export const updateProductWithVariant = async (req, res) => {
  try {
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const { name, brand, description, category } = req.body;
    const variants = JSON.parse(req.body.variants || "[]");

    if (!name || !brand || !description || !category) {
      return res.status(400).json({ message: "All product fields required" });
    }

let fileIndex = 0;

const formattedVariants = variants.map((variant) => {
  const { id, name, color, price, stock, isNew } = variant;

  if (!name || !price || !stock || !color) {
    throw new Error("Variant fields missing");
  }


  if (isNew) {
    const newImages = (req.files || [])
      .slice(fileIndex, fileIndex + 3)
      .map((file) => file.path || file.secure_url);

    if (newImages.length !== 3) {
      throw new Error("Each new variant must have exactly 3 images");
    }

    fileIndex += 3;

    return {
      name,
      color,
      price,
      stock,
      images: newImages,
    };
  }


  const oldVariant = existingProduct.variants.find(
    (v) => v._id.toString() === id
  );

  return {
    name,
    color,
    price,
    stock,
    images: oldVariant?.images || [],
  };
});


    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        brand,
        description,
        category,
        variants: formattedVariants,
      },
      { new: true }
    );

    res.json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR ", error);
    res.status(500).json({ message: error.message });
  }
};



