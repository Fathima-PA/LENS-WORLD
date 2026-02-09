import Category from "../../models/CategoryModel.js";
import { buildQuery } from "../../utils/buildQuery.js";
import { paginate } from "../../utils/paginate.js";

/* ===================== GET CATEGORIES ===================== */
export const getCategories = async (req, res) => {
  try {
    const { page = 1, limit = 5, search } = req.query;

    const query = buildQuery({
      search,
      searchFields: ["name"],
    });

    const result = await paginate({
      model: Category,
      query,
      page,
      limit,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===================== CREATE CATEGORY ===================== */
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name)
      return res.status(400).json({ message: "Category name is required" });

    if (!req.file)
      return res.status(400).json({ message: "Category image is required" });

    const exists = await Category.findOne({ name: name.trim() });
    if (exists)
      return res.status(400).json({ message: "Category already exists" });

    const category = await Category.create({
      name: name.trim(),
      image: req.file.path,
    });

    res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===================== GET CATEGORY BY ID ===================== */
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category)
      return res.status(404).json({ message: "Category not found" });

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===================== UPDATE CATEGORY ===================== */
export const updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category)
      return res.status(404).json({ message: "Category not found" });
    if (name) {
      const exists = await Category.findOne({
        name: name.trim(),
        _id: { $ne: category._id },
      });

      if (exists) {
        return res.status(400).json({ message: "Category already exists" });
      }

      category.name = name.trim();
    }

    if (req.file) {
      category.image = req.file.path;
    }

    await category.save();

    res.json({
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===================== DELETE CATEGORY ===================== */
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category)
      return res.status(404).json({ message: "Category not found" });

    await category.deleteOne();

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
