import Cart from "../../models/CartModel.js";
import Product from "../../models/ProductModel.js";
import Wishlist from "../../models/WhistlistModel.js";
import mongoose from "mongoose";
import Offer from "../../models/OfferModel.js";
import { getBestOfferPrice } from "../../utils/offerHelper.js";

const MAX_QTY = 5;

export const addToCartService = async (userId, data) => {

  const { productId, variantId, quantity = 1 } = data;

  const product = await Product.findById(productId);

  if (!product || !product.isActive) {
    const error = new Error("Product unavailable");
    error.statusCode = 400;
    throw error;
  }

  const variant = product.variants.id(variantId);

  if (!variant) {
    const error = new Error("Variant not found");
    error.statusCode = 404;
    throw error;
  }

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = new Cart({ userId, items: [] });
  }

  const existingItem = cart.items.find(
    i =>
      i.productId.toString() === productId &&
      i.variantId.toString() === variantId
  );

  if (existingItem) {

    const newQty = existingItem.quantity + quantity;

    if (newQty > MAX_QTY) {
      const error = new Error("Maximum limit reached");
      error.statusCode = 400;
      throw error;
    }

    if (variant.stock < newQty) {
      const error = new Error("Out of stock");
      error.statusCode = 400;
      throw error;
    }

    existingItem.quantity = newQty;

  } else {

    if (quantity > MAX_QTY) {
      const error = new Error("Maximum limit reached");
      error.statusCode = 400;
      throw error;
    }

    if (variant.stock < quantity) {
      const error = new Error("Out of stock");
      error.statusCode = 400;
      throw error;
    }

    const today = new Date();

    const productOffer = await Offer.findOne({
      type: "product",
      product: product._id,
      isActive: true,
      startDate: { $lte: today },
      endDate: { $gte: today }
    });

    const categoryOffer = await Offer.findOne({
      type: "category",
      category: product.category,
      isActive: true,
      startDate: { $lte: today },
      endDate: { $gte: today }
    });

    const finalPrice = getBestOfferPrice(
      variant.price,
      productOffer,
      categoryOffer
    );

    cart.items.push({
      productId: new mongoose.Types.ObjectId(productId),
      variantId: new mongoose.Types.ObjectId(variantId),
      quantity,
      price: finalPrice
    });
  }

  await Wishlist.updateOne(
    { userId },
    { $pull: { products: { productId, variantId } } }
  );

  await cart.save();

  return { message: "Added to cart" };
};




export const getCartService = async (userId) => {

  const cart = await Cart.findOne({ userId })
    .populate("items.productId");

  if (!cart) return [];

  let removed = false;
  const validItems = [];

  const today = new Date();

  const productOffers = await Offer.find({
    type: "product",
    isActive: true,
    startDate: { $lte: today },
    endDate: { $gte: today }
  });

  const categoryOffers = await Offer.find({
    type: "category",
    isActive: true,
    startDate: { $lte: today },
    endDate: { $gte: today }
  });

  for (const item of cart.items) {

    const product = item.productId;

    if (!product) {
      removed = true;
      continue;
    }

    const variant = product.variants.find(
      v => v._id.toString() === item.variantId.toString()
    );

    if (!variant) {
      removed = true;
      continue;
    }

    const productOffer = productOffers.find(
      o => o.product?.toString() === product._id.toString()
    );

    const categoryOffer = categoryOffers.find(
      o => o.category?.toString() === product.category?.toString()
    );

    const latestPrice = getBestOfferPrice(
      variant.price,
      productOffer,
      categoryOffer
    );

    if (item.price !== latestPrice) {
      item.price = latestPrice;
    }

    validItems.push({
      itemId: item._id.toString(),
      productId: product._id,
      name: product.name,
      brand: product.brand,
      image: variant.images?.[0] || "",
      color: variant.color,

      originalPrice: variant.price,
      price: latestPrice,

      stock: variant.stock,
      quantity: item.quantity,
      total: Number((latestPrice * item.quantity).toFixed(2)),

      isActive: product.isActive,
      isAvailable: variant.stock > 0 && item.quantity <= variant.stock
    });
  }

  cart.items = cart.items.filter(item =>
    validItems.some(v => v.itemId === item._id.toString())
  );

  await cart.save();

  return {
    removed,
    items: validItems
  };
};


export const removeCartItemService = async (userId, itemId) => {

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    const error = new Error("Cart not found");
    error.statusCode = 404;
    throw error;
  }

  cart.items.pull({ _id: itemId });

  await cart.save();

  return { message: "Item removed" };
};




export const updateCartQuantityService = async (userId, data) => {

  const { itemId, action } = data;

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    const error = new Error("Cart not found");
    error.statusCode = 404;
    throw error;
  }

  const item = cart.items.id(itemId);

  if (!item) {
    const error = new Error("Item not found");
    error.statusCode = 404;
    throw error;
  }

  const product = await Product.findById(item.productId);
  const variant = product.variants.id(item.variantId);

  if (action === "inc") {

    if (variant.stock <= 0 || variant.stock < item.quantity + 1) {
      const error = new Error("Out of stock");
      error.statusCode = 400;
      throw error;
    }

    if (item.quantity + 1 > MAX_QTY) {
      const error = new Error("Maximum limit reached");
      error.statusCode = 400;
      throw error;
    }

    item.quantity += 1;
  }

  if (action === "dec") {

    if (item.quantity <= 1) {
      const error = new Error("Minimum quantity is 1");
      error.statusCode = 400;
      throw error;
    }

    item.quantity -= 1;
  }

  await cart.save();

  return { message: "Quantity updated" };
};



export const validateCheckoutService = async (userId) => {

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    const error = new Error("Cart not found");
    error.statusCode = 404;
    throw error;
  }

  for (const item of cart.items) {

    const product = await Product.findById(item.productId);

    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    const variant = product.variants.id(item.variantId);

    if (!variant || variant.stock < item.quantity) {
      const error = new Error(`${product.name} is out of stock`);
      error.statusCode = 400;
      throw error;
    }
  }

  return { message: "Checkout allowed" };
};