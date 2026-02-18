import Wishlist from "../../models/WhistlistModel.js";
import Product from "../../models/ProductModel.js";

// TOGGLE WISHLIST
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

// GET WISHLIST
export const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user._id })
      .populate("products.productId");

    if (!wishlist) return res.json([]);

    let removed = false;
    const validItems = [];

    for (const item of wishlist.products) {

      const product = item.productId;

      if (!product) {
        removed = true;
        continue;
      }

      const variant = product.variants?.find(
        v => v._id.toString() === item.variantId?.toString()
      );

      if (!variant) {
        removed = true;
        continue;
      }

      validItems.push({
        productId: product._id,
        variantId: variant._id,
        name: product.name,
        brand: product.brand,
        stock: variant.stock ?? 0,
        image: variant.images?.[0] ?? "",
        price: variant.price ?? 0,
        color: variant.color ?? "",

        isActive: product.isActive,
        isOutOfStock: variant.stock === 0,
        isAvailable: product.isActive && variant.stock > 0
      });
    }

    // remove only deleted items from DB
    wishlist.products = wishlist.products.filter(item =>
      validItems.some(v =>
        v.productId.toString() === item.productId.toString() &&
        v.variantId.toString() === item.variantId.toString()
      )
    );

    await wishlist.save();

    if (removed) {
      return res.status(200).json({
        warning: "Some items were removed because they no longer exist",
        items: validItems
      });
    }

    res.json(validItems);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fetch wishlist failed" });
  }
};
