import Header from "./pages/user/Header";
import Footer from "./pages/user/Footer";
import Register from "./pages/user/Register";
import Login from "./pages/user/Login";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Home from "./pages/user/Home";
import VerifyOtp from "./pages/user/VerifyOtp";
import ResetPassword from "./pages/user/ResetPassword";
import Profile from "./pages/user/Profile";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadUserThunk,logoutThunk} from "./features/userAuth/auth/authSlice";
import { loadAdminThunk } from "./features/adminAuth/adminAuthSlice";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminVerifyOtp from "./pages/admin/AdminVerifyOtp";
import AdminResetPassword from "./pages/admin/ResetPassword";
import AdminCategories from "./pages/admin/AdminCategories";
import AddCategory from "./pages/admin/AddCategory";
import AdminProducts from "./pages/admin/AdminProduct";
import AddProduct from "./pages/admin/AddProduct"; 
import AddVariant from "./pages/admin/AddVariant"
import ProductListing from "./components/user/ProductListing";
import ProductDetails from "./components/user/ProductDetails";



function App() {
  const dispatch = useDispatch();
  const location = useLocation();

  const { user } = useSelector((state) => state.auth);
  const { admin } = useSelector((state) => state.adminAuth);

useEffect(() => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  if (!isLoggedIn) return; 

  dispatch(loadUserThunk());
}, [dispatch]);

useEffect(() => {
  if (!user) return;

  const interval = setInterval(() => {
    dispatch(loadUserThunk());
  }, 5000);

  return () => clearInterval(interval);
}, [user, dispatch]);

  useEffect(() => {
    if (
      location.pathname.startsWith("/admin") &&
      location.pathname !== "/admin/login"
    ) {
      dispatch(loadAdminThunk());
    }
  }, [dispatch, location.pathname]);

  return (
    <div className="d-flex flex-column min-vh-100">
    <Header />

      <div className="flex-grow-1">
        <Routes>
          {/* USER ROUTES */}
          <Route path="/" element={ <Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/reset-password" element={<ResetPassword />} />
           <Route path="/product" element={<ProductListing />} />
           <Route path="/product/:id" element={<ProductDetails />} />

          <Route path="/profile" element={user?<Profile /> : <Login />} />

 
          <Route
            path="/admin/login"
            element={admin ? <Navigate to="/admin/dashboard" /> : <AdminLogin />}
          />
          <Route path="/admin/verify-otp" element={<AdminVerifyOtp />} />
             <Route path="/admin/reset-password" element={<AdminResetPassword />} />
          <Route
            path="/admin/dashboard"
            element={admin ? <AdminDashboard /> : <Navigate to="/admin/login" />}
          />
          <Route path="/admin/customers"
  element={admin ? <AdminCustomers /> : <Navigate to="/admin/login" />}
/>
    <Route path="/admin/categories"
  element={admin ?<AdminCategories /> : <Navigate to="/admin/login" />}
/>
<Route path="/admin/categories/add" element={admin?<AddCategory />:<Navigate to="/admin/login" />} />
<Route path="/admin/categories/edit/:id" element={admin?<AddCategory />:<Navigate to="/admin/login" />} />


<Route
  path="/admin/products"
  element={admin ? <AdminProducts /> : <Navigate to="/admin/login" />}
/>

<Route
  path="/admin/products/add"
  element={admin ? <AddProduct /> : <Navigate to="/admin/login" />}
/>

<Route
  path="/admin/products/edit/:id"
  element={admin ? <AddProduct /> : <Navigate to="/admin/login" />}
/>
<Route
  path="/admin/products/:productId/variants/add"
  element={admin ? <AddVariant /> : <Navigate to="/admin/login" />}
/>


        </Routes>

      </div>
    {!location.pathname.startsWith("/admin") && <Footer />}
    </div>
  );
}


export default App;
