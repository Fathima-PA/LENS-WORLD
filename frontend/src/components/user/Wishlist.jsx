import { useEffect, useState } from "react";
import api from "../../api";

const Wishlist = () => {
  const [items, setItems] = useState([]);

  /* ================= FETCH ================= */
const fetchWishlist = async () => {
  try {
    const res = await api.get("/api/wishlist");

    if (!Array.isArray(res.data)) {
      if (res.data.warning) alert(res.data.warning);
      setItems(res.data.items || []);
      return;
    }

    setItems(res.data);

  } catch (error) {
    if (error.response?.status === 401) {
      alert("Please login again");
      navigate("/login");
      return;
    }

    alert(error.response?.data?.message || "Something went wrong");
  }
};



  useEffect(() => {
    fetchWishlist();
  }, []);

  /* ================= REMOVE ================= */
  const removeItem = async (item) => {
    await api.post("/api/wishlist/toggle", {
      productId: item.productId,
      variantId: item.variantId
    });
    fetchWishlist();
  };

  /* ================= ADD TO CART ================= */
  const addToCart = async (item) => {
    await api.post("/api/cart/add", {
      productId: item.productId,
      variantId: item.variantId,
      quantity: 1
    });

    fetchWishlist(); 
  };

  return (
    <div className="container py-5" style={{ maxWidth: "1000px" }}>

      <h4 className="mb-4">Wishlist</h4>

      {/* HEADER */}
      <div className="row text-muted border-bottom pb-2 mb-3 small fw-semibold">
        <div className="col-5">Products</div>
        <div className="col-2">Price</div>
        <div className="col-2">Status</div>
        <div className="col-3">Action</div>
      </div>

      {/* ITEMS */}
      {items.length === 0 ? (
        <p className="text-muted text-center">Your wishlist is empty</p>
      ) : (
        items.map(item => (
          <div key={item.productId} className="row align-items-center mb-4 border-bottom pb-3">

            {/* PRODUCT */}
            <div className="col-5 d-flex align-items-center gap-3">
              <img
                src={item.image}
                alt=""
                style={{
                  width: 70,
                  height: 70,
                  objectFit: "cover",
                  background: "#eee"
                }}
              />

              <div>
                <div className="fw-semibold">{item.brand}</div>
                <div className="text-muted small">{item.name}</div>
              </div>
            </div>

            <div className="col-2 fw-semibold">
              ₹{item.price}
            </div>

           <div className="col-2">

  {!item.isActive && (
    <span className="text-danger fw-semibold">
      Unavailable
    </span>
  )}

  {item.isActive && item.isOutOfStock && (
    <span className="text-warning fw-semibold">
      Out of Stock
    </span>
  )}

  {item.isAvailable && (
    <span className="text-success fw-semibold">
      In Stock
    </span>
  )}

</div>


            <div className="col-3 d-flex align-items-center gap-3">

              <button
                className="btn px-3"
                style={{
                  background: "#b7a9a9",
                  color: "white",
                  border: "none"
                }}
                disabled={!item.isAvailable}

                onClick={() => addToCart(item)}
              >
                Add to Cart
              </button>

              <button
                    className="btn btn-sm text-danger p-0 mt-2"
                onClick={() => removeItem(item)}
              >
                remove
              </button>

            </div>

          </div>
        ))
      )}

    </div>
  );
};

export default Wishlist;
