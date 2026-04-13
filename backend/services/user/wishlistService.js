import Wishlist from "../../models/WhistlistModel.js";
import Offer from "../../models/OfferModel.js";
import { getBestOfferPrice } from "../../utils/offerHelper.js";


export const toggleWishlistService = async (userId, data) => {

  const { productId, variantId } = data;

  let wishlist = await Wishlist.findOne({ userId });

  if (!wishlist) {
    wishlist = new Wishlist({ userId, products: [] });
  }

  const exists = wishlist.products.find(
    p =>
      p.productId.toString() === productId &&
      p.variantId.toString() === variantId
  );

  if (exists) {
    wishlist.products = wishlist.products.filter(
      p =>
        !(
          p.productId.toString() === productId &&
          p.variantId.toString() === variantId
        )
    );

    await wishlist.save();

    return { message: "Removed from wishlist" };
  }

  wishlist.products.push({ productId, variantId });

  await wishlist.save();

  return { message: "Added to wishlist" };
};





export const getWishlistService = async (userId) => {

  const wishlist = await Wishlist.findOne({ userId })
    .populate("products.productId");

  if (!wishlist) return [];

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

  for (const item of wishlist.products) {

    const product = item.productId;
    if (!product) continue;

    const variant = product.variants?.find(
      v => v._id.toString() === item.variantId?.toString()
    );

    if (!variant) continue;

    const productOffer = productOffers.find(
      offer => offer.product?.toString() === product._id.toString()
    );

    const categoryOffer = categoryOffers.find(
      offer => offer.category?.toString() === product.category?.toString()
    );

    const finalPrice = getBestOfferPrice(
      variant.price,
      productOffer,
      categoryOffer
    );

    validItems.push({
      productId: product._id,
      variantId: variant._id,
      name: product.name,
      brand: product.brand,
      stock: variant.stock ?? 0,
      image: variant.images?.[0] ?? "",
      color: variant.color ?? "",

      originalPrice: variant.price,
      price: finalPrice,

      isActive: product.isActive,
      isOutOfStock: variant.stock === 0,
      isAvailable: product.isActive && variant.stock > 0
    });
  }

  return validItems;
};