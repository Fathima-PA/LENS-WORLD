import mongoose from "mongoose";
import Product from "../../models/ProductModel.js";
import Category from "../../models/CategoryModel.js";


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
    if(category == null){
      return;
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

    if (minPrice || maxPrice) {
      pipeline.push({
        $match: {
          displayPrice: {
            ...(minPrice && { $gte: Number(minPrice) }),
            ...(maxPrice && { $lte: Number(maxPrice) }),
          },
        },
      });
    }

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

    const products = await Product.aggregate(pipeline);

    const totalProducts = await Product.countDocuments(matchStage);

    res.status(200).json({
      products,
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
      isActive: true,
    }).populate("category");

    if (!product) {
      return res.status(404).json({ message: "Product not available" });
    }

    res.status(200).json(product);
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
      .select("name brand variants");

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




