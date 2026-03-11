import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "react-inner-image-zoom/lib/styles.min.css";
import InnerImageZoom from 'react-inner-image-zoom'
import { toggleWishlist, getWishlist } from "../../services/user/wishlistService";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImage, setActiveImage] = useState("");
  const [activeVariant, setActiveVariant] = useState(null);
  const [wishlist, setWishlist] = useState([]);

  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");

  const showMessage = (msg, type = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  /* ======================
     FETCH PRODUCT
  ====================== */
  const fetchProduct = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/products/${id}`
      );

      const data = res.data;
      setProduct(data);
      setActiveVariant(data.variants[0]);
      setActiveImage(data.variants[0].images[0]);

      fetchRelated(data.category._id, data._id);
    } catch (error) {
      if (error.response?.status === 403) {
        showMessage("This product is currently unavailable or blocked", "danger");
      }
      navigate("/product");
    }
  };

  /* ======================
     FETCH RELATED PRODUCTS
  ====================== */
  const fetchRelated = async (categoryId, productId) => {
    try {
      const res = await axios.get(
        "http://localhost:3000/api/products/related/items",
        {
          params: { categoryId, productId },
        }
      );
      setRelated(res.data);
    } catch (error) {
      console.error("Failed to fetch related products");
    }
  };

  const handleAddToCart = async () => {
    try {
      const res = await axios.post(
        "http://localhost:3000/api/cart/add",
        {
          productId: product._id,
          variantId: activeVariant._id,
          quantity: 1,
        },
        {
          withCredentials: true
        }
      );

      showMessage(res.data.message || "Added to cart", "success");

    } catch (error) {
      if (error.response?.status === 401) {
        showMessage("Please login first", "warning");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        showMessage(error.response?.data?.message || "Failed to add", "danger");
      }
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
      showMessage("Please login first", "warning");
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const data = await getWishlist();
        setWishlist(data.map(i => i.productId));
      } catch {}
    };
    loadWishlist();
  }, []);

  if (!product || !activeVariant) return null;

  return (
    <div className="container py-5">
      {showToast && (
        <div
          className={`position-fixed top-0 start-50 translate-middle-x mt-3 alert alert-${toastType} shadow`}
          style={{ zIndex: 3000, minWidth: "300px" }}
        >
          {toastType === "success" && "✔ "}
          {toastType === "danger" && "✖ "}
          {toastType === "warning" && "⚠ "}
          {toastMsg}
        </div>
      )}

      <div className="row g-5">

        {/* LEFT SIDE */}
        <div className="col-md-6 text-center">
          <div className="border p-4 bg-light position-relative">

            <InnerImageZoom
              src={activeImage}
              zoomSrc={activeImage}
              zoomType="hover"
              zoomScale={1.5}
              className="img-fluid"
            />

            <span
              className="position-absolute top-0 end-0 m-2"
              style={{ fontSize: "18px", cursor: "pointer" }}
              onClick={(e) => handleWishlist(product._id, activeVariant._id, e)}
            >
              {wishlist.includes(product._id) ? "❤️" : "♡"}
            </span>

          </div>

          <div className="d-flex justify-content-center gap-3 mt-3">
            {activeVariant.images.map((img) => (
              <img
                key={img}
                src={img}
                alt=""
                onClick={() => setActiveImage(img)}
                style={{
                  width: 60,
                  cursor: "pointer",
                  border:
                    activeImage === img
                      ? "2px solid black"
                      : "1px solid #ccc",
                }}
              />
            ))}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="col-md-6">
          <h6 className="text-uppercase text-muted">
            {product.brand}
          </h6>

          <h3>{product.name}</h3>

           <p className="fw-semibold text-warning mb-1">

{activeVariant.finalPrice < activeVariant.price ? (

<>
<span style={{ textDecoration: "line-through", color: "#888", marginRight: 6 }}>
₹{activeVariant.price}
</span>

<span style={{ color: "red" }}>
₹{activeVariant.finalPrice}
</span>
</>

) : (
<>₹{activeVariant.price}</>
)}

</p>

          <p className="text-muted">★ 4.8 Ratings</p>

          {activeVariant.stock > 0 ? (
            <p className="text-success">
              In Stock ({activeVariant.stock} available)
            </p>
          ) : (
            <p className="text-danger">Out of Stock</p>
          )}

          <div className="my-4">
            <h6 className="text-uppercase text-muted">COLOUR</h6>

            <div className="d-flex gap-3">
              {product.variants.map((variant) => (
                <div
                  key={variant._id}
                  title={variant.name}
                  onClick={() => {
                    setActiveVariant(variant);
                    setActiveImage(variant.images[0]);
                  }}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    backgroundColor: variant.color,
                    cursor: "pointer",
                    border:
                      activeVariant._id === variant._id
                        ? "2px solid black"
                        : "1px solid #ccc",
                  }}
                />
              ))}
            </div>
          </div>

          <button
            className="btn btn-dark w-100 py-2"
            disabled={activeVariant.stock === 0}
            onClick={handleAddToCart}
          >
            + ADD TO BASKET
          </button>

          <div className="mt-5">
            <h5>Specifications</h5>
            <p className="text-muted">
              Transparent acetate, lightweight design,
              durable materials, and premium finish.
            </p>
          </div>
        </div>
      </div>
      {/* RELATED PRODUCTS */}
<div className="mt-5">
  <h4 className="text-center mb-4">
    RELATED PRODUCTS
  </h4>

  <div className="row g-4">
    {related.map((p) => (
      <div
        className="col-md-3 text-center"
        key={p._id}
        style={{ cursor: "pointer" }}
        onClick={() => navigate(`/product/${p._id}`)}
      >
        <div className="border p-3 h-100">

          <img
            src={p.variants[0]?.images[0]}
            alt={p.name}
            className="img-fluid mb-2"
            style={{ height: 150, objectFit: "contain" }}
          />

          <p className="fw-semibold mb-1">
            {p.name}
          </p>

          <p className="text-muted">
            ₹{p.variants[0]?.price}
          </p>

        </div>
      </div>
    ))}
  </div>
</div>
    </div>
  );
};

export default ProductDetails;