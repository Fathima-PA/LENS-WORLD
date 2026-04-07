import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logoutThunk,reset } from "../../features/userAuth/auth/authSlice";
import axios from "axios";
import { adminLogout } from "../../features/adminAuth/adminAuthSlice";
import api from "../../api"

const Header = () => {
  const user = useSelector((state) => state.auth.user);
  const admin = useSelector((state) => state.adminAuth.admin);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminPage = location.pathname.startsWith("/admin");
  const isAdminLoginPage = location.pathname === "/admin/login";


  const handleLogout = () => {
    dispatch(logoutThunk());
    dispatch(reset());
      navigate("/login", { replace: true });
  };

  const handleAdminLogout = async () => {
    try {
      await api.post(
        "/api/admin/logout",
        {},
        { withCredentials: true }
      );

      dispatch(adminLogout()); 
      navigate("/admin/login");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <header className="border-bottom" style={{ backgroundColor: "#f5f3ef" }}>
      <div className="container py-3">
        <div className="row align-items-center">

         
          <div className="col-md-3 fw-semibold fs-5">
            <Link
              to={isAdminPage ? "/admin/dashboard" : "/"}
              className="text-decoration-none text-dark"
            >
              LENS WORLD
            </Link>
          </div>

        {isAdminLoginPage ? (
  <div className="col-md-7 text-center fw-semibold text-uppercase">
    ADMIN LOGIN
  </div>
) : isAdminPage ? (
  <div className="col-md-7"></div> 
) : (
  <>
    <div className="col-md-3 d-flex gap-4 text-uppercase small">
      <Link to="/" className="text-decoration-none text-dark">
        Home
      </Link>
      <Link to="/product" className="text-decoration-none text-dark">
        Shop
      </Link>
    </div>

    <div className="col-md-4">
      {/* <input
        type="text"
        className="form-control form-control-sm"
        placeholder="What are you looking for?"
        style={{ backgroundColor: "#eee", border: "none" }}
      /> */}
    </div>
  </>
)}


          <div className={`col-md-2 d-flex justify-content-end gap-3 align-items-center ${isAdminPage ? "ms-auto" : ""}`}>
         {!isAdminPage && (
  <>
    <Link to="/wishlist" className="text-decoration-none text-dark">
      <span style={{ cursor: "pointer" }}>♡</span>
    </Link>

    <Link to="/cart" className="text-decoration-none text-dark">
      <span style={{ cursor: "pointer" }}>👜</span>
    </Link>
  </>
)}


            {isAdminPage ? (
              admin && (
  <div className="dropdown">
    <button
      className="btn btn-sm d-flex align-items-center gap-2 dropdown-toggle"
      type="button"
      data-bs-toggle="dropdown"
      aria-expanded="false"
      style={{ background: "none", border: "none" }}
    >
      <span
        className="rounded-circle d-flex align-items-center justify-content-center"
        style={{
          width: "28px",
          height: "28px",
          backgroundColor: "#3aa655",
          color: "#fff",
          fontSize: "14px",
        }}
      >
        {(admin.username || admin.name || admin.email)
          ?.charAt(0)
          .toUpperCase()}
      </span>

      <span className="small text-capitalize">
        {admin.username || admin.name || admin.email}
      </span>
    </button>

    <ul className="dropdown-menu dropdown-menu-end">
      <li>
        <Link className="dropdown-item" to="/admin/dashboard">
          Dashboard
        </Link>
      </li>

      <li>
        <hr className="dropdown-divider" />
      </li>

      <li>
        <button
          className="dropdown-item text-danger"
          onClick={handleAdminLogout}
        >
          Logout
        </button>
      </li>
    </ul>
  </div>
)
 ) : (
              <>
                {user ? (
                  <div className="dropdown">
                    <button
                      className="btn btn-sm d-flex align-items-center gap-2 dropdown-toggle"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                      style={{ background: "none", border: "none" }}
                    >
                      <span
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: "28px",
                          height: "28px",
                          backgroundColor: "#3aa655",
                          color: "#fff",
                          fontSize: "14px",
                        }}
                      >
                        {(user.username || user.name || user.email)
                          ?.charAt(0)
                          .toUpperCase()}
                      </span>

                      <span className="small text-capitalize">
                        {user.username || user.name || user.email}
                      </span>
                    </button>

                    <ul className="dropdown-menu dropdown-menu-end">
                      <li>
                        <Link className="dropdown-item" to="/profile">
                          Profile
                        </Link>
                      </li>
                      <li>
                        <hr className="dropdown-divider" />
                      </li>
                      <li>
                        <button
                          className="dropdown-item text-danger"
                          onClick={handleLogout}
                        >
                          Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="small text-decoration-none text-dark"
                  >
                    Sign in
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
