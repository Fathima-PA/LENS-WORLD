export const paginate = async ({
  model,
  query,
  page = 1,
  limit = 5,
  sort = { createdAt: -1 },
}) => {
  const skip = (page - 1) * limit;

  const total = await model.countDocuments(query);
  const data = await model
    .find(query)
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  return {
    data,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: Number(page),
  };
};
