import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/userAuth/auth/authSlice";
import addressReducer from "../features/userAuth/adressSlice";
import adminAuthReducer from "../features/adminAuth/adminAuthSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    address: addressReducer, 
      adminAuth: adminAuthReducer,
  },
});
