import { useEffect, useState, } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toggleWishlist, getWishlist } from "../../services/user/wishlistService";


const ProductListing = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showFilter, setShowFilter] = useState(false);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState("");

  const [wishlist, setWishlist] = useState([]);

  let navigate = useNavigate();

  /* ======================
     FETCH CATEGORIES
  ====================== */
  const fetchCategories = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/api/products/categories"
      );
      setCategories(res.data);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  /* ======================
     FETCH PRODUCTS
  ====================== */
  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/products", {
        params: {
          search,
          sort,
          category: selectedCategory,
          page,
          limit: 12,
          minPrice:
            priceRange === "under999" ? 0 :
            priceRange === "1000-1999" ? 1000 :
            priceRange === "2000-5000" ? 2000 : "",
          maxPrice:
            priceRange === "under999" ? 999 :
            priceRange === "1000-1999" ? 1999 :
            priceRange === "2000-5000" ? 5000 : "",
        },
      });

      setProducts(res.data.products);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error("Failed to fetch products", error);
    }
  };

  const handleWishlist = async (productId, variantId, e) => {
  e.stopPropagation();

  try {
    await toggleWishlist(productId, variantId);

    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );

  } catch {
    alert("Please login first");
  }
};


  /* ======================
     EFFECTS
  ====================== */
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, sort, selectedCategory, priceRange, page]);

  useEffect(() => {
  const loadWishlist = async () => {
    try {
      const data = await getWishlist();
      setWishlist(data.map(i => i.productId));
    } catch {}
  };
  loadWishlist();
}, []);


  /* ======================
     RESET FILTERS
  ====================== */
  const resetFilters = () => {
    setSearch("");
    setSort("");
    setSelectedCategory("");
    setPriceRange("");
    setPage(1);
  };

  return (
    <div className="container-fluid bg-light min-vh-100 py-4">
  
      <div className="d-flex justify-content-between align-items-center mb-3 px-3">
        <span className="fw-semibold">
          {products.length} PRODUCTS FOUND
        </span>

     <div className="px-3 mb-4" style={{ minWidth: 500 }}>
  <div className="position-relative">
    <input
      type="text"
      className="form-control pe-5"
      placeholder="Search by product or brand..."
      value={search}
      onChange={(e) => {
        setSearch(e.target.value);
        setPage(1);
      }}
    />

    {search && (
      <span
        onClick={() => {
          setSearch("");
          setPage(1);
        }}
        style={{
          position: "absolute",
          right: 10,
          top: "50%",
          transform: "translateY(-50%)",
          cursor: "pointer",
          fontSize: 18,
        }}
      >
        ✕
      </span>
    )}
  </div>
</div>
        <button
          className="btn btn-outline-dark btn-sm"
          onClick={() => setShowFilter(true)}
        >
          ☰ Filter
        </button>
      </div>

      <div className="row g-4 px-3">
        {products.length === 0 && (
          <div className="text-center text-muted mt-5">
            No products found
          </div>
        )}

        {products.map((p) => {
          const v = p.variants?.[0];
          if (!v) return null;

          return (
            <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={p._id}>
              <div className="card h-100 border-0 shadow-sm" onClick={() => navigate(`/product/${p._id}`)}>
                <div
                  className="bg-secondary-subtle d-flex justify-content-center align-items-center position-relative"
                  style={{ height: 200 }}
                >
                  <img
                    src={v.images?.[0]}
                    alt={p.name}
                    className="img-fluid"
                    style={{ maxHeight: "80%" }}

                  />
               <span
  className="position-absolute top-0 end-0 m-2"
  style={{ fontSize: "18px", cursor: "pointer" }}
  onClick={(e) => handleWishlist(p._id, v._id, e)}
>
  {wishlist.includes(p._id) ? "❤️" : "♡"}
</span>

                </div>

                <div className="card-body p-2">
                  <h6 className="text-uppercase small fw-semibold mb-1">
                    {p.brand}
                  </h6>
                  <p className="small text-muted mb-1">{p.name}</p>
                  <p className="fw-semibold text-warning mb-1">
                    ₹{p.displayPrice}
                  </p>
                  <p className="small text-muted mb-0">
                    ★ 4.8 Ratings
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FILTER DRAWER */}
      {showFilter && (
        <div
          className="position-fixed top-0 end-0 bg-white h-100 shadow-lg p-4"
          style={{ width: 350, zIndex: 1050 }}
        >
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Filter</h5>
            <button className="btn-close" onClick={() => setShowFilter(false)} />
          </div>

          <div className="mb-4">
            <h6 className="fw-semibold">Sort By</h6>
            {[
              ["price_low", "Low → High"],
              ["price_high", "High → Low"],
              ["az", "A – Z"],
              ["za", "Z – A"],
            ].map(([value, label]) => (
              <div className="form-check" key={value}>
                <input
                  className="form-check-input"
                  type="radio"
                  checked={sort === value}
                  onChange={() => {
                    setSort(value);
                    setPage(1);
                  }}
                />
                <label className="form-check-label">{label}</label>
              </div>
            ))}
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                checked={!sort}
                onChange={() => setSort("")}
              />
              <label className="form-check-label">Newest</label>
            </div>
          </div>

          {/* CATEGORY */}
          <div className="mb-4">
            <h6 className="fw-semibold">Category</h6>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                checked={!selectedCategory}
                onChange={() => {
                  setSelectedCategory("");
                  setPage(1);
                }}
              />
              <label className="form-check-label">All</label>
            </div>

            {categories.map((cat) => (
              <div className="form-check" key={cat._id}>
                <input
                  className="form-check-input"
                  type="radio"
                  checked={selectedCategory === cat._id}
                  onChange={() => {
                    setSelectedCategory(cat._id);
                    setPage(1);
                  }}
                />
                <label className="form-check-label">{cat.name}</label>
              </div>
            ))}
          </div>

          {/* PRICE */}
          <div className="mb-4">
            <h6 className="fw-semibold">Price Range</h6>
            {[
              ["under999", "Under ₹999"],
              ["1000-1999", "₹1000 – ₹1999"],
              ["2000-5000", "₹2000 – ₹5000"],
            ].map(([value, label]) => (
              <div className="form-check" key={value}>
                <input
                  className="form-check-input"
                  type="radio"
                  checked={priceRange === value}
                  onChange={() => {
                    setPriceRange(value);
                    setPage(1);
                  }}
                />
                <label className="form-check-label">{label}</label>
              </div>
            ))}
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                checked={!priceRange}
                onChange={() => setPriceRange("")}
              />
              <label className="form-check-label">All</label>
            </div>
          </div>

          <button
            className="btn btn-outline-secondary w-100"
            onClick={resetFilters}
          >
            RESET
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductListing;
