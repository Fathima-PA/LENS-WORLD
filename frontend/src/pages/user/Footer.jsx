const Footer = () => {
  return (
    <footer className="border-top mt-5" style={{ backgroundColor: "#f5f3ef" }}>
      <div className="container py-5">
        <div className="row text-muted small">

          <div className="col-md-4">
            <h6 className="fw-semibold mb-3">SITES & STORES</h6>
            <p className="mb-1">About Us</p>
            <p className="mb-1">Contact Us</p>
            <p className="mb-1">Terms and Condition</p>
          </div>

          <div className="col-md-4 text-center">
            <h5 className="fw-semibold">LENS WORLD</h5>
            <p className="mb-2">Sunglasses & Eyewear Store</p>
           <div className="d-flex justify-content-center gap-4 fs-5 mt-3">
              <i className="bi bi-facebook"></i>
              <i className="bi bi-instagram"></i>
              <i className="bi bi-youtube"></i>
              <i className="bi bi-twitter"></i>
            </div>
          </div>

          <div className="col-md-4 text-end">
            <h6 className="fw-semibold mb-3">SHOP</h6>
            <p className="mb-1">Sunglass</p>
            <p className="mb-1">Woman</p>
            <p className="mb-1">Man</p>
            <p className="mb-1">Home</p>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
