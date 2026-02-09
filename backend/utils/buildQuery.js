export const buildQuery = ({
  search,
  searchFields = [],
  filters = {},
  baseQuery = {},
}) => {
  let query = { ...baseQuery };

  // search
  if (search && searchFields.length > 0) {
    query.$or = searchFields.map((field) => ({
      [field]: { $regex: search, $options: "i" },
    }));
  }

  // filters
  Object.keys(filters).forEach((key) => {
    if (filters[key] !== undefined && filters[key] !== "all") {
      query[key] = filters[key];
    }
  });

  return query;
};
