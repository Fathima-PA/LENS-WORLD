import React, { useState } from "react";
import "../../styles/home.css";
import CategoryBanner from "../../components/user/CategoryBanner";
import ProductCard from "../../components/user/ProductCard";
import products from "../../data/products";

const Home = () => {
  const [search, setSearch] = useState("");

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="home">

      {/* HERO SECTION */}
      <section className="hero">
  <img src="/images/img.png.png" alt="Hero" />

  <div className="hero-text">
    <h1>NEW SUNGLASSES COLLECTION</h1>
    <button>SHOP NEW ARRIVALS</button>
  </div>
   <div className="hero-right">
    <img src="/images/image.png" alt="Side 1" />
    <img src="/images/img1.png.png" alt="Side 2" />
  </div>
</section>


      {/* BEST PICKS */}
     <section className="container my-5 text-center">
  <p className="text-uppercase text-muted small mb-1">Discover</p>
  <h2 className="mb-5" style={{ letterSpacing: "2px" }}>
    BEST PICKS
  </h2>

  <div className="row g-4">
    {filteredProducts.slice(0, 4).map(product => (
      <div className="col-md-3" key={product.id}>
        <div className="card border-0 best-pick-card h-100">
          <img
            src={product.image}
            className="card-img-top p-4"
            alt={product.name}
          />
          <div className="card-body text-center">
            <p className="small text-uppercase mb-1">
              {product.name}
            </p>
            <p className="fw-bold small">
              ${product.price}
            </p>
          </div>
        </div>
      </div>
    ))}
  </div>
</section>


      {/* WOMEN */}
    {/* WOMEN SECTION */}
<section className="container my-5">
  <div className="row align-items-center">

    {/* LEFT BIG IMAGE */}
    <div className="col-md-6 position-relative">
      <img
        src="/images/img.png.png"
        className="img-fluid"
        alt="Women Collection"
      />
      <button className="btn btn-outline-light  women-btn">
        SHOP ALL WOMEN
      </button>
    </div>

    {/* RIGHT PRODUCT */}
    <div className="col-md-6 text-center">
      <h3 className="mb-4" style={{ letterSpacing: "2px" }}>WOMEN</h3>
      <div className="card border-0 women-card mx-auto">
        <img
          src="/images/img1.png.png"
          className="card-img-top p-4"
          alt="Eclipse Vision"
        />
        <div className="card-body">
          <p className="small text-uppercase mb-1">Eclipse Vision</p>
          <p className="fw-bold small">$46.00</p>
        </div>
      </div>
    </div>

  </div>
</section>

{/* LATEST SELECTION */}
<section className="container my-5 text-center">
  <p className="text-uppercase text-muted small mb-1">
    Glasses and More
  </p>
  <h2 className="mb-5">LATEST SELECTION</h2>

  <div className="row g-4">
    {filteredProducts.slice(0, 4).map(product => (
      <div className="col-md-3" key={product.id}>
        <div className="card border-0 latest-card h-100">
          <img
            src={product.image}
            className="card-img-top p-4"
            alt={product.name}
          />
          <div className="card-body">
            <p className="small text-uppercase mb-1">
              {product.name}
            </p>
            <p className="fw-bold small">
              ${product.price}
            </p>
          </div>
        </div>
      </div>
    ))}
  </div>
</section>


      {/* MEN */}
 <section className="container my-5">
  <div className="row align-items-center">

    {/* LEFT BIG IMAGE */}
    <div className="col-md-6 position-relative">
      <img
        src="/images/img.png.png"
        className="img-fluid"
        alt="Women Collection"
      />
      <button className="btn btn-outline-light  women-btn">
        SHOP ALL MEN
      </button>
    </div>

    {/* RIGHT PRODUCT */}
    <div className="col-md-6 text-center">
      <h3 className="mb-4" style={{ letterSpacing: "2px" }}>MEN</h3>
      <div className="card border-0 women-card mx-auto">
        <img
          src="/images/img1.png.png"
          className="card-img-top p-4"
          alt="Eclipse Vision"
        />
        <div className="card-body">
          <p className="small text-uppercase mb-1">Eclipse Vision</p>
          <p className="fw-bold small">$46.00</p>
        </div>
      </div>
    </div>

  </div>
</section>
{/* WHY US / SEE THE WORLD */}
<section className="container my-5 whyus-section">
  <div className="row align-items-center">

    {/* LEFT IMAGE */}
    <div className="col-md-6 text-center">
      <p className="text-uppercase small text-muted mb-3">Why Us?</p>
      <img
        src="/images/image.png"
        className="img-fluid whyus-left-img"
        alt="Why Us"
      />
    </div>

    {/* RIGHT CONTENT */}
    <div className="col-md-6">
      <div className="whyus-top-images mb-4">
        <img src="/images/img.png.png" alt="style 1" />
        <img src="/images/img1.png.png" alt="style 2" />
      </div>

      <h3 className="mb-3 whyus-title">
        SEE THE WORLD
      </h3>

      <p className="text-muted small mb-4 whyus-text">
        Designed to cater to various tastes and preferences.
        Whether you prefer classic, trendy, or minimalist styles,
        our frames are made to complement your face and personal style.
      </p>

      <button className="btn btn-outline-dark whyus-btn">
        LEARN MORE
      </button>
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
        <img
          src="/images/image.png"
          alt="Social Left"
          className="stay-left-img"
        />
      </div>

      {/* CENTER */}
      <div className="col-md-6 text-center">
        <img
          src="/images/img.png.png"
          alt="Main Model"
          className="stay-center-img"
        />
      </div>

      {/* RIGHT */}
      <div className="col-md-3 stay-right">
        <h2 className="stay-title">
          LET’S <br />
          STAY IN <br />
          TOUCH
        </h2>

        <div className="stay-links">
          <p>INSTAGRAM</p>
          <p>FACEBOOK</p>
          <p>TWITTER</p>
        </div>

        <img
          src="/images/img1.png.png"
          alt="Social Right"
          className="stay-right-img"
        />
      </div>

    </div>
  </div>
</section>



    </div>
  );
};

export default Home;
