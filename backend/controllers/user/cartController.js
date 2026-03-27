import Cart from "../../models/CartModel.js";
import Product from "../../models/ProductModel.js";
import Wishlist from "../../models/WhistlistModel.js";
import mongoose from "mongoose";
import Offer from "../../models/OfferModel.js";
import { getBestOfferPrice } from "../../utils/offerHelper.js";

const MAX_QTY = 5;

// ADD TO CART

export const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, variantId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isActive)
      return res.status(400).json({ message: "Product unavailable" });

    const variant = product.variants.id(variantId);
    if (!variant)
      return res.status(404).json({ message: "Variant not found" });

    let cart = await Cart.findOne({ userId });
    if (!cart) cart = new Cart({ userId, items: [] });

    const existingItem = cart.items.find(
      i =>
        i.productId.toString() === productId &&
        i.variantId.toString() === variantId
    );

    if (existingItem) {

      const newQty = existingItem.quantity + quantity;

      if (newQty > MAX_QTY)
        return res.status(400).json({ message: "Maximum limit reached" });

      if (variant.stock < newQty)
        return res.status(400).json({ message: "Out of stock" });

      existingItem.quantity = newQty;

    } else {

      if (quantity > MAX_QTY)
        return res.status(400).json({ message: "Maximum limit reached" });

      if (variant.stock < quantity)
        return res.status(400).json({ message: "Out of stock" });


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

    res.json({ message: "Added to cart" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Add to cart failed" });
  }
};

// GET CART
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id })
      .populate("items.productId");

    if (!cart) return res.json([]);

    let removed = false;
    const validItems = [];

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
     validItems.push({
  itemId: item._id.toString(),
  productId: product._id,
  name: product.name,
  brand: product.brand,
  image: variant.images?.[0] || "",
  color: variant.color,

  originalPrice: variant.price, 

  price: item.price,
  stock: variant.stock,
  quantity: item.quantity,
  total: item.price * item.quantity,

  isActive: product.isActive,
  isAvailable: variant.stock > 0 && item.quantity <= variant.stock
});
    }
    cart.items = cart.items.filter(item =>
      validItems.some(v => v.itemId === item._id.toString())
    );

    await cart.save();

    if (removed) {
      return res.status(200).json({
        warning: "Some items were removed because they no longer exist",
        items: validItems
      });
    }

    res.json(validItems);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fetch cart failed" });
  }
};

// REMOVE ITEM
export const removeCartItem = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items.pull({ _id: req.params.itemId });
    await cart.save();

    res.json({ message: "Item removed" });

  } catch (err) {
    res.status(500).json({ message: "Remove failed" });
  }
};

// UPDATE QUANTITY
export const updateCartQuantity = async (req, res) => {
  try {
    const { itemId, action } = req.body;

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const product = await Product.findById(item.productId);
    const variant = product.variants.id(item.variantId);

    if (action === "inc") {
      if (variant.stock <= 0 || variant.stock < item.quantity+1)
        return res.status(400).json({ message: "Out of stock" });

      if (item.quantity + 1 > MAX_QTY)
        return res.status(400).json({ message: "Maximum limit reached" });

      item.quantity += 1;
      // variant.stock -= 1;
    }

    if (action === "dec") {
      if (item.quantity <= 1)
        return res.status(400).json({ message: "Minimum quantity is 1" });

      item.quantity -= 1;
      // variant.stock += 1;
    }

    // await product.save();
    await cart.save();

    res.json({ message: "Quantity updated" });

  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};

// CHECKOUT VALIDATION
export const validateCheckout = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });

    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      const variant = product.variants.id(item.variantId);

      if (!variant || variant.stock < item.quantity) {
        return res.status(400).json({
          message: `${product.name} is out of stock`
        });
      }
    }
    res.json({ message: "Checkout allowed" });
  } catch (err) {
    res.status(500).json({ message: "Checkout failed" });
  }
};
