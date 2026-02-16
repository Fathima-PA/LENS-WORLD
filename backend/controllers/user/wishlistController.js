import Wishlist from "../../models/WhistlistModel.js";
import Product from "../../models/ProductModel.js";

/////////////////////////////////////////////////
// TOGGLE WISHLIST
/////////////////////////////////////////////////
export const toggleWishlist = async (req, res) => {
  const userId = req.user._id;
  const { productId, variantId } = req.body;

  let wishlist = await Wishlist.findOne({ userId });
  if (!wishlist) wishlist = new Wishlist({ userId, products: [] });

  const exists = wishlist.products.find(
    p => p.productId.toString() === productId &&
         p.variantId.toString() === variantId
  );

  if (exists) {
    wishlist.products = wishlist.products.filter(
      p => !(p.productId.toString() === productId &&
             p.variantId.toString() === variantId)
    );
    await wishlist.save();
    return res.json({ message: "Removed from wishlist" });
  }

  wishlist.products.push({ productId, variantId });
  await wishlist.save();

  res.json({ message: "Added to wishlist" });
};

/////////////////////////////////////////////////
// GET WISHLIST
/////////////////////////////////////////////////
export const getWishlist = async (req, res) => {
  const wishlist = await Wishlist.findOne({ userId: req.user._id })
    .populate("products.productId");

  if (!wishlist) return res.json([]);

  const formatted = wishlist.products.map(item => {
    const product = item.productId;
    const variant = product.variants.find(
      v => v._id.toString() === item.variantId.toString()
    );

    return {
      productId: product._id,
      variantId: variant._id,
      name: product.name,
      brand: product.brand,
       stock: variant.stock,
      image: variant.images[0],
      price: variant.price,
      color: variant.color
    };
  });

  res.json(formatted);
};
