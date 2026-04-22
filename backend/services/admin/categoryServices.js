import Category from "../../models/CategoryModel.js";
import { buildQuery } from "../../utils/buildQuery.js";
import { paginate } from "../../utils/paginate.js";
import { STATUS_CODES } from "../../utils/statusCodes.js";

export const getCategoriesService = async ({ page, limit, search }) => {
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

  return result;
};


export const createCategoryService = async ({ name, file }) => {

  if (!name) {
    throw { status: 400, message: "Category name is required" };
  }

  if (!file) {
    throw { status: 400, message: "Category image is required" };
  }

  const exists = await Category.findOne({
    name: { $regex: `^${name.trim()}$`, $options: "i" }
  });

  if (exists) {
    throw { status: 400, message: "Category already exists" };
  }

  const category = await Category.create({
    name: name.trim(),
    image: file.path,
  });

  return category;
};


export const getCategoryByIdService = async (id) => {

  const category = await Category.findById(id);

  if (!category) {
    throw {
      status: STATUS_CODES.NOT_FOUND,
      message: "Category not found"
    };
  }

  return category;
};



export const updateCategoryService = async ({ id, name, file }) => {

  const category = await Category.findById(id);

  if (!category) {
    throw {
      status: STATUS_CODES.NOT_FOUND,
      message: "Category not found"
    };
  }

  // ✅ NAME UPDATE
  if (name) {
    const exists = await Category.findOne({
      name: { $regex: `^${name.trim()}$`, $options: "i" },
      _id: { $ne: category._id },
    });

    if (exists) {
      throw {
        status: STATUS_CODES.BAD_REQUEST,
        message: "Category already exists"
      };
    }

    category.name = name.trim();
  }

  // ✅ IMAGE UPDATE
  if (file) {
    category.image = file.path;
  }

  await category.save();

  return category;
};


export const toggleCategoryStatusService = async (id) => {

  const category = await Category.findById(id);

  if (!category) {
    throw {
      status: STATUS_CODES.NOT_FOUND,
      message: "Category not found"
    };
  }

  category.isActive = !category.isActive;
  await category.save();

  return category;
};