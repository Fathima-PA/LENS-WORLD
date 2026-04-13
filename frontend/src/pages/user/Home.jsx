import React, { useState, useEffect } from "react";
import "../../styles/home.css";
import api from "../../api";
import { useNavigate } from "react-router-dom";

const Home = () => {

  const [products, setProducts] = useState([]);
  const [search, _setSearch] = useState("");
  const [loading, setLoading] = useState(true);
const navigate = useNavigate();
  /* ======================
     FETCH PRODUCTS
  ====================== */


  const fetchProducts = async () => {
    try {
      const res = await api.get("/api/products");

      setProducts(res.data.products || []); // ✅ FIX

      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };
    useEffect(() => {
    fetchProducts();
  }, []);

  /* ======================
     FILTER PRODUCTS
  ====================== */
  const filteredProducts = Array.isArray(products)
    ? products.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  if (loading) {
    return <div className="text-center py-5">Loading...</div>;
  }

  /* ======================
     HELPER FUNCTION
  ====================== */
  const getVariant = (product) => {
    return (
      product.variants?.find(v => v.isActive) ||
      product.variants?.[0]
    );
  };

  return (
    <div className="home">

      {/* HERO */}
      <section className="hero">
        <img src="/images/img.png.png" alt="Hero" />

        <div className="hero-text">
          <h1>NEW SUNGLASSES COLLECTION</h1>
          <button    onClick={() => navigate("/product")}>SHOP NEW ARRIVALS</button>
        </div>

        <div className="hero-right">
          <img src="/images/image.png" alt="Side 1" />
          <img src="/images/img1.png.png" alt="Side 2" />
        </div>
      </section>

      {/* BEST PICKS */}
      <section className="container my-5 text-center">
        <p className="text-uppercase text-muted small mb-1">Discover</p>
        <h2 className="mb-5">BEST PICKS</h2>

        <div className="row g-4">
          {filteredProducts.slice(0, 4).map(product => {
            const variant = getVariant(product);

            return (
              <div className="col-md-3" key={product._id}>
                <div className="card border-0 h-100 shadow-sm">
                  <img
                    src={variant?.images?.[0]}
                    className="card-img-top p-4"
                    alt={product.name}
                  />
                  <div className="card-body text-center">
                    <p className="small text-uppercase">
                      {product.name}
                    </p>
                    <p className="fw-bold">
                      ₹{variant?.price}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* LATEST */}
      <section className="container my-5 text-center">
        <p className="text-uppercase text-muted small mb-1">
          Glasses and More
        </p>
        <h2 className="mb-5">LATEST SELECTION</h2>

        <div className="row g-4">
          {filteredProducts.slice(4, 8).map(product => {
            const variant = getVariant(product);

            return (
              <div className="col-md-3" key={product._id}>
                <div className="card border-0 h-100 shadow-sm">
                  <img
                    src={variant?.images?.[0]}
                    className="card-img-top p-4"
                    alt={product.name}
                  />
                  <div className="card-body">
                    <p className="small text-uppercase">
                      {product.name}
                    </p>
                    <p className="fw-bold">
                      ₹{variant?.price}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* WOMEN */}
      <section className="container my-5">
        <div className="row align-items-center">

          <div className="col-md-6 position-relative">
            <img src="/images/img.png.png" className="img-fluid" alt="" />
            <button className="btn btn-outline-light women-btn"   onClick={() => navigate("/product")}>
              SHOP ALL WOMEN
            </button>
          </div>

          <div className="col-md-6 text-center">
            <h3 className="mb-4">WOMEN</h3>

            {filteredProducts[2] && (() => {
              const v = getVariant(filteredProducts[2]);
              return (
                <div className="card border-0 mx-auto shadow-sm">
                  <img
                    src={v?.images?.[0]}
                    className="card-img-top p-4"
                    alt=""
                  />
                  <div className="card-body">
                    <p>{filteredProducts[0].name}</p>
                    <p className="fw-bold">₹{v?.price}</p>
                  </div>
                </div>
              );
            })()}
          </div>

        </div>
      </section>

      {/* MEN */}
      <section className="container my-5">
  <div className="row">

    {/* LEFT IMAGE */}
    <div className="col-md-6 men-image-box">
      <img
        src="/images/image.png"
        alt="Men"
        className="men-img"
      />

      <button
        className="women-btn"
        onClick={() => navigate("/product")}
      >
        SHOP ALL MEN
      </button>
    </div>

    {/* RIGHT CONTENT */}
    <div className="col-md-6 text-center d-flex flex-column justify-content-center">
      <h3 className="mb-4">MEN</h3>

      {filteredProducts[1] && (() => {
        const v = getVariant(filteredProducts[1]);

        return (
          <div
            className="card border-0 mx-auto shadow-sm"
            style={{ maxWidth: "320px" }}
          >
            <img
              src={v?.images?.[0]}
              className="card-img-top p-4"
              alt=""
            />

            <div className="card-body">
              <p>{filteredProducts[1].name}</p>
              <p className="fw-bold">₹{v?.price}</p>
            </div>
          </div>
        );
      })()}
    </div>

  </div>
</section>
        <section className="container my-5 whyus-section">
           <div className="row align-items-center"> 
            {/* LEFT IMAGE */} 
            <div className="col-md-6 text-center"> 
              <p className="text-uppercase small text-muted mb-3">Why Us?</p>
               <img src="/images/image.png" className="img-fluid whyus-left-img" alt="Why Us" />
                </div> 
                {/* RIGHT CONTENT */}
                 <div className="col-md-6"> 
                  <div className="whyus-top-images mb-4"> 
                    <img src="/images/img.png.png" alt="style 1" /> 
                    <img src="/images/img1.png.png" alt="style 2" /> 
                    </div> <h3 className="mb-3 whyus-title">
                       SEE THE WORLD </h3> 
                       <p className="text-muted small mb-4 whyus-text"> 
                        Designed to cater to various tastes and preferences. Whether you prefer classic, trendy, or minimalist styles, our frames are made to complement your face and personal style. </p>
                         <button className="btn btn-outline-dark whyus-btn"> LEARN MORE </button>
                          </div> 
                          </div> 
                          </section>
                           {/* LET'S STAY IN TOUCH */} 
                           <section className="stay-section">
                             <div className="container"> 
                              <div className="row align-items-center"> 
                                {/* LEFT */} 
                                <div className="col-md-3 text-center stay-left"> 
                                  <p className="stay-label">OUR SOCIAL MEDIA</p> 
                                  <img src="/images/image.png" alt="Social Left" className="stay-left-img" /> 
                                  </div> {/* CENTER */} <div className="col-md-6 text-center">
                                     <img src="/images/img.png.png" alt="Main Model" className="stay-center-img" /> 
                                     </div> {/* RIGHT */}
                                      <div className="col-md-3 stay-right"> <h2 className="stay-title"> LET’S <br /> STAY IN <br /> TOUCH </h2> 
                                      <div className="stay-links"> 
                                        <p>INSTAGRAM</p> <p>FACEBOOK</p> <p>TWITTER</p>
                                         </div> 
                                         <img src="/images/img1.png.png" alt="Social Right" className="stay-right-img" /> 
                                         </div> 
                                         </div> 
                                         </div> 
                                         </section>

    </div>
  );
};

export default Home;