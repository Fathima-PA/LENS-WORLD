
import { createProductWithVariantService,
  getProductsService,toggleProductStatusService,
  getProductByIdService,updateProductWithVariantService  } from "../../services/admin/productService.js";
import { STATUS_CODES } from "../../utils/statusCodes.js";


export const createProductWithVariant = async (req, res) => {
  try {

    const result = await createProductWithVariantService(req.body, req.files);

    if (!result.success) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: result.message });
    }

    res.status(STATUS_CODES.CREATED).json({
      message: result.message,
      product: result.product
    });

  } catch (error) {
    console.error("CREATE PRODUCT ERROR ", error);
    res.status(STATUS_CODES.SERVER_ERROR).json({ message: error.message });
  }
};


export const getProducts = async (req, res) => {
  try {

    const result = await getProductsService(req.query);

    res.status(STATUS_CODES.OK).json(result);

  } catch (error) {
    res.status(STATUS_CODES.SERVER_ERROR).json({ message: error.message });
  }
};

/* TOGGLE PRODUCT ACTIVE STATUS */

export const toggleProductStatus = async (req, res) => {
  try {

    const result = await toggleProductStatusService(req.params.id);

    if (!result.success) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: result.message });
    }

    res.status(STATUS_CODES.OK).json({
      message: result.message,
      isActive: result.isActive,
    });

  } catch (error) {
    res.status(STATUS_CODES.SERVER_ERROR).json({ message: error.message });
  }
};


export const getProductById = async (req, res) => {
  try {

    const result = await getProductByIdService(req.params.id);

    if (!result.success) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: result.message });
    }

     res.status(STATUS_CODES.OK).json({
      success: true,
      product: result.product
    });

  } catch (error) {
    res.status(STATUS_CODES.SERVER_ERROR).json({ message: error.message });
  }
};


export const updateProductWithVariant = async (req, res) => {
  try {

    const result = await updateProductWithVariantService(
      req.params.id,
      req.body,
      req.files
    );

    if (!result.success) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: result.message });
    }

     res.status(STATUS_CODES.OK).json({
      success: true,
      message: result.message,
      product: result.product
    });

  } catch (error) {
    console.error("UPDATE PRODUCT ERROR ", error);
    res.status(STATUS_CODES.SERVER_ERROR).json({ message: error.message });
  }
};