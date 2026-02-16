import Cart from "../../models/CartModel.js";
import Product from "../../models/ProductModel.js";
import Wishlist from "../../models/WhistlistModel.js";
import mongoose from "mongoose";

const MAX_QTY = 5;

//////////////////////////////////////////////////////////
// ADD TO CART
//////////////////////////////////////////////////////////
export const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, variantId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isActive)
      return res.status(400).json({ message: "Product unavailable" });

    const variant = product.variants.id(variantId);
    if (!variant) return res.status(404).json({ message: "Variant not found" });

    if (variant.stock < quantity)
      return res.status(400).json({ message: "Out of stock" });

    let cart = await Cart.findOne({ userId });
    if (!cart) cart = new Cart({ userId, items: [] });

    const existingItem = cart.items.find(
      i => i.productId.toString() === productId &&
           i.variantId.toString() === variantId
    );

    if (existingItem) {
      if (existingItem.quantity + quantity > MAX_QTY)
        return res.status(400).json({ message: "Maximum limit reached" });

      existingItem.quantity += quantity;
    } else {
      

cart.items.push({
  productId: new mongoose.Types.ObjectId(productId),
  variantId: new mongoose.Types.ObjectId(variantId),
  quantity,
  price: variant.price
});
    }

    // remove from wishlist
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

//////////////////////////////////////////////////////////
// GET CART
//////////////////////////////////////////////////////////
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id })
      .populate("items.productId");

    if (!cart) return res.json([]);

   const formattedCart = cart.items.map(item => {
  const product = item.productId;

  const variant = product.variants.find(
    v => v._id.toString() === item.variantId.toString()
  );

  return {
    itemId: item._id.toString(),
    productId: product._id,
    name: product.name,
    brand: product.brand,
    image: variant?.images?.[0],
    color: variant?.color,
    price: item.price,
    stock: variant?.stock,
    quantity: item.quantity,
    total: item.price * item.quantity
  };
});

res.json(formattedCart);


  } catch (err) {
    res.status(500).json({ message: "Fetch cart failed" });
  }
};

//////////////////////////////////////////////////////////
// REMOVE ITEM
//////////////////////////////////////////////////////////
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

//////////////////////////////////////////////////////////
// UPDATE QUANTITY
//////////////////////////////////////////////////////////
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
      if (variant.stock <= 0)
        return res.status(400).json({ message: "Out of stock" });

      if (item.quantity + 1 > MAX_QTY)
        return res.status(400).json({ message: "Maximum limit reached" });

      item.quantity += 1;
      variant.stock -= 1;
    }

    if (action === "dec") {
      if (item.quantity <= 1)
        return res.status(400).json({ message: "Minimum quantity is 1" });

      item.quantity -= 1;
      variant.stock += 1;
    }

    await product.save();
    await cart.save();

    res.json({ message: "Quantity updated" });

  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};

//////////////////////////////////////////////////////////
// CHECKOUT VALIDATION
//////////////////////////////////////////////////////////
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
