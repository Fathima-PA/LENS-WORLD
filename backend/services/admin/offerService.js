import Offer from "../../models/OfferModel.js";
import Product from "../../models/ProductModel.js";

export const addOfferService = async (data) => {

  const {
    title,
    type,
    product,
    category,
    discountType,
    discountValue,
    startDate,
    endDate
  } = data;

  if (discountType === "percentage" && discountValue > 100) {
    return {
      success: false,
      message: "Percentage cannot exceed 100"
    };
  }

  if (type === "product") {

    const productData = await Product.findById(product);

    if (!productData) {
      return {
        success: false,
        message: "Product not found"
      };
    }

    const prices = productData.variants.map(v => v.price);
    const minPrice = Math.min(...prices);

    if (discountType === "flat" && discountValue >= minPrice) {
      return {
        success: false,
        message: `Discount must be less than product price (₹${minPrice})`
      };
    }
  }

  const existingOffer = await Offer.findOne({
    type,
    ...(type === "product" ? { product } : { category }),
    isActive: true,
    endDate: { $gte: new Date() }
  });

  if (existingOffer) {
    return {
      success: false,
      message:
        "An active offer already exists. Create a new one after it expires."
    };
  }

  const offer = new Offer({
    title,
    type,
    product: type === "product" ? product : null,
    category: type === "category" ? category : null,
    discountType,
    discountValue,
    startDate,
    endDate
  });

  await offer.save();

  return {
    success: true,
    message: "Offer created successfully"
  };
};



export const getOffersService = async (queryParams) => {

  let { type, page = 1, limit = 5, search = "" } = queryParams;

  page = parseInt(page);
  limit = parseInt(limit);

  const filter = {};

  if (type) {
    filter.type = type;
  }

  if (search) {
    filter.title = { $regex: search, $options: "i" };
  }

  const totalOffers = await Offer.countDocuments(filter);

  const offers = await Offer.find(filter)
    .populate("product")
    .populate("category")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    success: true,
    offers,
    totalPages: Math.ceil(totalOffers / limit),
    currentPage: page
  };
};


export const updateOfferService = async (id, body) => {

  const {
    title,
    type,
    product,
    category,
    discountType,
    discountValue,
    startDate,
    endDate,
    isActive
  } = body;

  const offer = await Offer.findById(id);

  if (!offer) {
    return {
      success: false,
      message: "Offer not found"
    };
  }

  if (discountType === "percentage" && discountValue > 100) {
    return {
      success: false,
      message: "Percentage cannot exceed 100"
    };
  }

  const productId = product || null;
  const categoryId = category || null;

  const existingOffer = await Offer.findOne({
    _id: { $ne: id },
    type,
    ...(type === "product"
      ? { product: productId }
      : { category: categoryId }),
    isActive: true,
    endDate: { $gte: new Date() }
  });

  if (existingOffer) {
    return {
      success: false,
      message: "Another active offer already exists"
    };
  }

  offer.title = title;
  offer.product = type === "product" ? product : null;
  offer.category = type === "category" ? category : null;
  offer.discountType = discountType;
  offer.discountValue = discountValue;
  offer.startDate = startDate;
  offer.endDate = endDate;
  offer.isActive = isActive;

  await offer.save();

  return {
    success: true,
    message: "Offer updated successfully",
    offer
  };
};

export const toggleOfferStatusService = async (id) => {

  const offer = await Offer.findById(id);

  if (!offer) {
    return { success: false, message: "Offer not found" };
  }

  offer.isActive = !offer.isActive;

  await offer.save();

  return {
    success: true,
    message: offer.isActive ? "Offer Unblocked" : "Offer Blocked"
  };
};