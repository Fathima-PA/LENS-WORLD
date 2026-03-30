import mongoose from "mongoose";
import Product from "../../models/ProductModel.js";
import Category from "../../models/CategoryModel.js";
import Offer from "../../models/OfferModel.js";
import { getBestOfferPrice } from "../../utils/offerHelper.js";

export const getProducts = async (req, res) => {
  try {
    const {
      search = "",
      sort = "new",
      category,
      minPrice,
      maxPrice,
      page = 1,
      limit = 12,
    } = req.query;


    const pipeline = [];



    const matchStage = { isActive: true };

    if (search) {
      matchStage.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ];
    }
    if (category) {
      matchStage.category = new mongoose.Types.ObjectId(category);
    }

    pipeline.push({ $match: matchStage });

    
    pipeline.push({
      $addFields: {
        displayPrice: { $min: "$variants.price" },
      },
    });

    // if (minPrice || maxPrice) {
    //   pipeline.push({
    //     $match: {
    //       displayPrice: {
    //         ...(minPrice && { $gte: Number(minPrice) }),
    //         ...(maxPrice && { $lte: Number(maxPrice) }),
    //       },
    //     },
    //   });
    // }

    let sortStage = {};
    switch (sort) {
      case "price_low":
        sortStage = { displayPrice: 1 };
        break;
      case "price_high":
        sortStage = { displayPrice: -1 };
        break;
      case "az":
        sortStage = { name: 1 };
        break;
      case "za":
        sortStage = { name: -1 };
        break;
      default:
        sortStage = { createdAt: -1 };
    }

    pipeline.push({ $sort: sortStage });

    const skip = (Number(page) - 1) * Number(limit);
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: Number(limit) });


    pipeline.push({
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category",
      },
    });

    pipeline.push({ $unwind: "$category" });
    
    
pipeline.push({
  $match: {
    "category.isActive": true,
  },
});

const products = await Product.find(matchStage)
  .populate("category")
  .sort(sortStage)
  .skip(skip)
  .limit(Number(limit))
  .lean(); // important   


    const today = new Date();

const productOffers = await Offer.find({
  type: "product",
  isActive: true,
  startDate: { $lte: today },
  endDate: { $gte: today },
});

const categoryOffers = await Offer.find({
  type: "category",
  isActive: true,
  startDate: { $lte: today },
  endDate: { $gte: today },
});


const productOfferMap = new Map();
productOffers.forEach(o => {
  productOfferMap.set(o.product.toString(), o);
});

const categoryOfferMap = new Map();
categoryOffers.forEach(o => {
  categoryOfferMap.set(o.category.toString(), o);
});
const updatedProducts = products.map((product) => {

  const productOffer = productOfferMap.get(product._id.toString());
const categoryOffer = categoryOfferMap.get(product.category._id.toString());

const defaultVariant = product.variants[0];

const finalPrice = getBestOfferPrice(
  defaultVariant.price,
  productOffer,
  categoryOffer
);

  return {
    ...product,
    displayPrice: defaultVariant.price,
    finalPrice,
  };

});
let filteredProducts = updatedProducts;

if (minPrice || maxPrice) {
  filteredProducts = updatedProducts.filter(p => {
    if (minPrice && p.finalPrice < Number(minPrice)) return false;
    if (maxPrice && p.finalPrice > Number(maxPrice)) return false;
    return true;
  });
}
const totalProducts = filteredProducts.length;

    res.status(200).json({
      products: filteredProducts,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

/*GET USER CATEGORIES*/
export const getUserCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



/* GET PRODUCT BY ID  */
export const getProductById = async (req, res) => {
  try {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Invalid product" });
    }

    const product = await Product.findOne({
      _id: id,
      isActive: true
    }).populate("category");

    if (!product) {
      return res.status(403).json({
        message: "Product not available or product is blocked"
      });
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
  category: product.category._id,
  isActive: true,
  startDate: { $lte: today },
  endDate: { $gte: today }
});

const updatedVariants = product.variants.map((variant) => {

  const finalPrice = getBestOfferPrice(
    variant.price,
    productOffer,
    categoryOffer
  );

  return {
    ...variant.toObject(),
    finalPrice
  };

});

res.status(200).json({
  ...product.toObject(),
  variants: updatedVariants
});

  } catch (error) {
    console.error("GET PRODUCT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

/* RELATED PRODUCTS */
export const getRelatedProducts = async (req, res) => {
  try {
    const { categoryId, productId } = req.query;

    const products = await Product.find({
      category: categoryId,
      _id: { $ne: productId },
      isActive: true,
    })
      .limit(4)
      .select("name brand variants category")
      .lean();

    const today = new Date();

    const productOffers = await Offer.find({
      type: "product",
      isActive: true,
      startDate: { $lte: today },
      endDate: { $gte: today },
    });

    const categoryOffers = await Offer.find({
      type: "category",
      isActive: true,
      startDate: { $lte: today },
      endDate: { $gte: today },
    });

    const formatted = products.map(p => {
      const v = p.variants?.[0];

      if (!v) return null;

      const productOffer = productOffers.find(
        offer => offer.product?.toString() === p._id.toString()
      );

      const categoryOffer = categoryOffers.find(
        offer => offer.category?.toString() === p.category.toString()
      );

      const finalPrice = getBestOfferPrice(
        v.price,
        productOffer,
        categoryOffer
      );

      return {
        _id: p._id,
        name: p.name,
        brand: p.brand,
        displayPrice: v.price,
        finalPrice,
        image: v.images?.[0] || ""
      };
    });

    res.json(formatted.filter(Boolean));

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




