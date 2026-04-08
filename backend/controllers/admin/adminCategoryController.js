import { getCategoriesService,createCategoryService,getCategoryByIdService,updateCategoryService,toggleCategoryStatusService} from "../../services/admin/categoryServices.js";
import { STATUS_CODES } from "../../utils/statusCodes.js";

/* ===================== GET CATEGORIES ===================== */
export const getCategories = async (req, res) => {
  try {
    const { page = 1, limit = 5, search } = req.query;

    const result = await getCategoriesService({ page, limit, search });

    res.json(result);

  } catch (error) {
    res.status(STATUS_CODES.SERVER_ERROR).json({ message: error.message });
  }
};


/* ===================== CREATE CATEGORY ===================== */
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    const category = await createCategoryService({
      name,
      file: req.file
    });

    res.status(STATUS_CODES.CREATED).json({
      message: "Category created successfully",
      category,
    });

  } catch (error) {
    res.status(error.status || STATUS_CODES.SERVER_ERROR).json({
      message: error.message || "Server error",
    });
  }
};

/* ===================== GET CATEGORY BY ID ===================== */
export const getCategoryById = async (req, res) => {
  try {

    const category = await getCategoryByIdService(req.params.id);

    res.json(category);

  } catch (error) {
    res.status(error.status || STATUS_CODES.SERVER_ERROR).json({
      message: error.message || "Server error"
    });
  }
};


/* ===================== UPDATE CATEGORY ===================== */
export const updateCategory = async (req, res) => {
  try {

    const category = await updateCategoryService({
      id: req.params.id,
      name: req.body.name,
      file: req.file
    });

    res.json({
      message: "Category updated successfully",
      category,
    });

  } catch (error) {
    res.status(error.status || STATUS_CODES.SERVER_ERROR).json({
      message: error.message || "Server error"
    });
  }
};

export const toggleCategoryStatus = async (req, res) => {
  try {

    const category = await toggleCategoryStatusService(req.params.id);

    res.json({
      message: category.isActive
        ? "category activated successfully"
        : "category blocked successfully",
      isActive: category.isActive,
    });

  } catch (error) {
    res.status(error.status || STATUS_CODES.SERVER_ERROR).json({
      message: error.message || "Server error"
    });
  }
};
