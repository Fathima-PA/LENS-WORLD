import Product from "../../models/ProductModel.js";
import Category from "../../models/CategoryModel.js";

export const createProductWithVariantService = async (body, files) => {

  const { name, brand, description, category } = body;

  if (!name || !brand || !description || !category) {
    return { success: false, message: "All product fields are required" };
  }

  const categoryDoc = await Category.findById(category);

  if (!categoryDoc) {
    return { success: false, message: "Category not found" };
  }

  if (!categoryDoc.isActive) {
    return { success: false, message: "Cannot add product to a blocked category" };
  }

  const variants = JSON.parse(body.variants || "[]");

  if (!Array.isArray(variants) || variants.length === 0) {
    return { success: false, message: "At least one variant is required" };
  }

  if (!files || files.length === 0) {
    return { success: false, message: "Variant images are required" };
  }

  let fileIndex = 0;

  const formattedVariants = variants.map((variant) => {

    const { name, color, price, stock } = variant;

    if (!name || !color || !price || !stock) {
      throw new Error("All variant fields are required");
    }

    const variantImages = files
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

  const totalStock = formattedVariants.reduce(
    (sum, v) => sum + Number(v.stock),
    0
  );

  await Category.findByIdAndUpdate(category, {
    $inc: { stock: totalStock }
  });

  return {
    success: true,
    message: "Product created successfully",
    product
  };
};


export const getProductsService = async (queryParams) => {

  let { page = 1, limit = 10, search, filter } = queryParams;

  page = Number(page);
  limit = Number(limit);

  let query = {};

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  if (filter === "instock") {
    query.variants = {
      $elemMatch: { stock: { $gt: 0 } }
    };
  }

  if (filter === "outofstock") {
    query.variants = {
      $not: {
        $elemMatch: { stock: { $gt: 0 } }
      }
    };
  }

  const total = await Product.countDocuments(query);

  const products = await Product.find(query)
    .populate("category", "name")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    data: products,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
};


export const toggleProductStatusService = async (id) => {

  const product = await Product.findById(id);

  if (!product) {
    return { success: false, message: "Product not found" };
  }

  product.isActive = !product.isActive;

  await product.save();

  return {
    success: true,
    message: product.isActive
      ? "Product activated successfully"
      : "Product blocked successfully",
    isActive: product.isActive,
  };
};


export const getProductByIdService = async (id) => {

  const product = await Product.findById(id)
    .populate("category");

  if (!product) {
    return { success: false, message: "Product not found" };
  }

  return {
    success: true,
    product
  };
};


export const updateProductWithVariantService = async (id, body, files) => {

  const existingProduct = await Product.findById(id);

  if (!existingProduct) {
    return { success: false, message: "Product not found" };
  }

  const oldTotalStock = existingProduct.variants.reduce(
    (sum, v) => sum + Number(v.stock),
    0
  );

  const { name, brand, description, category } = body;

  if (!name || !brand || !description || !category) {
    return { success: false, message: "All product fields required" };
  }

  let variants = [];
  try {
    variants = JSON.parse(body.variants || "[]");
  } catch {
    throw new Error("Invalid variants format");
  }

  const variantIndexes = body.variantIndex || [];
  const indexArray = Array.isArray(variantIndexes)
    ? variantIndexes
    : [variantIndexes];

  const imageMap = {};

  (files || []).forEach((file, i) => {
    const idx = indexArray[i];

    if (!imageMap[idx]) imageMap[idx] = [];
    imageMap[idx].push(file.path || file.secure_url);
  });

  const formattedVariants = variants.map((variant, index) => {

    const { id: variantId, name, color, price, stock, isNew } = variant;

    if (!name || !price || !stock || !color) {
      throw new Error("Variant fields missing");
    }

    const newImages = imageMap[index] || [];

    // 🔹 NEW VARIANT
    if (isNew) {
      if (newImages.length !== 3) {
        throw new Error("New variant must have 3 images");
      }

      return {
        name,
        color,
        price,
        stock,
        images: newImages,
      };
    }

    // 🔹 EXISTING VARIANT
    const oldVariant = existingProduct.variants.find(
      (v) => v._id.toString() === variantId
    );

    if (!oldVariant) {
      throw new Error("Variant not found");
    }

    return {
      _id: oldVariant._id,
      name,
      color,
      price,
      stock,
      images: newImages.length === 3 ? newImages : oldVariant.images,
    };
  });

  const newTotalStock = formattedVariants.reduce(
    (sum, v) => sum + Number(v.stock),
    0
  );

  const stockDifference = newTotalStock - oldTotalStock;

  const product = await Product.findByIdAndUpdate(
    id,
    {
      name,
      brand,
      description,
      category,
      variants: formattedVariants,
    },
    { new: true }
  );

  await Category.findByIdAndUpdate(category, {
    $inc: { stock: stockDifference }
  });

  return {
    success: true,
    message: "Product updated successfully",
    product
  };
};