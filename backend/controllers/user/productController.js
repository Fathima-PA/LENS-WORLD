import Category from "../../models/CategoryModel.js";
import { getProductsService,getProductByIdService,getRelatedProductsService } from "../../services/user/productService.js";

export const getProducts = async (req, res) => {
  try {

    const result = await getProductsService(req.query);

    res.status(200).json(result);

  } catch (error) {

    console.error("GET PRODUCTS ERROR:", error);

    res.status(500).json({
      message: error.message
    });

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

    const result = await getProductByIdService(req.params.id);

    res.status(200).json(result);

  } catch (error) {

    console.error("GET PRODUCT ERROR:", error);

    res.status(error.statusCode || 500).json({
      message: error.message
    });

  }
};

/* RELATED PRODUCTS */

export const getRelatedProducts = async (req, res) => {
  try {

    const result = await getRelatedProductsService(req.query);

    res.json(result);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};