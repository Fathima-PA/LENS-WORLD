import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../../../services/user/authService";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../../firebase";
import axios from "axios";

const initialState = {
  user: null,

  tempRegister: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: "",
};

/* ================= OTP FLOW ================= */

export const sendOtp = createAsyncThunk(
  "auth/sendOtp",
  async ({ email }, thunkAPI) => {
    try {
      return await authService.sendOtp(email);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// FINAL REGISTER (AFTER OTP VERIFIED)
export const completeRegister = createAsyncThunk(
  "auth/completeRegister",
  async (data, thunkAPI) => {
    try {
      return await authService.completeRegister(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

/* ================= LOGIN ================= */

export const loginUser = createAsyncThunk(
  "auth/login",
  async (userData, thunkAPI) => {
    try {
      return await authService.login(userData);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

/* ================= LOAD USER ================= */

export const loadUserThunk = createAsyncThunk(
  "auth/loadUser",
  async (_, thunkAPI) => {
    try {
      const data = await authService.getMe();
      console.log("✅ loadUserThunk success:", data); // debug

      return data;
    } catch {
      return thunkAPI.rejectWithValue("Not logged in");
    }
  }
);

/* ================= GOOGLE LOGIN ================= */

export const googleLogin = createAsyncThunk(
  "auth/googleLogin",
  async (_, thunkAPI) => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      const response = await axios.post(
        "http://localhost:3000/api/auth/google",
        {
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          photo: firebaseUser.photoURL,
          googleId: firebaseUser.uid,
        },
        { withCredentials: true }
      );

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

/* ================= PROFILE ================= */

export const updateProfileThunk = createAsyncThunk(
  "auth/updateProfile",
  async (data, thunkAPI) => {
    try {
      return await authService.updateProfile(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

/* ================= PASSWORD ================= */

export const changePasswordThunk = createAsyncThunk(
  "auth/changePassword",
  async (data, thunkAPI) => {
    try {
      return await authService.changePassword(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

/* ================= LOGOUT ================= */

export const logoutThunk = createAsyncThunk(
  "auth/logout",
  async (_, thunkAPI) => {
    try {
      await authService.logout();
      return true;
    } catch {
      return thunkAPI.rejectWithValue("Logout failed");
    }
  }
);

/* ================= SLICE ================= */

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
   
    setTempRegister: (state, action) => {
      state.tempRegister = action.payload;
    },
    clearTempRegister: (state) => {
      state.tempRegister = null;
    },
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },

  },

  extraReducers: (builder) => {
    builder

      /* ===== SEND OTP ===== */
      .addCase(sendOtp.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(sendOtp.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      /* ===== COMPLETE REGISTER ===== */
      .addCase(completeRegister.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(completeRegister.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // state.user = action.payload.user;
        state.tempRegister = null;
      })
      .addCase(completeRegister.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      /* ===== LOGIN ===== */
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user;
        localStorage.setItem("isLoggedIn", "true");
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      /* ===== LOAD USER ===== */
  
.addCase(loadUserThunk.pending, (state) => {
  state.isLoading = true;
})
.addCase(loadUserThunk.fulfilled, (state, action) => {
  state.isLoading = false;
  state.user = action.payload;
})
.addCase(loadUserThunk.rejected, (state) => {
  state.isLoading = false;
  state.user = null;
})

      /* ===== GOOGLE LOGIN ===== */
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.isSuccess = true;
        state.user = action.payload.user;
      })

      /* ===== UPDATE PROFILE ===== */
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
      })

      /* ===== LOGOUT ===== */
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.tempRegister = null;
        localStorage.removeItem("isLoggedIn");
      });
  },
});

export const {
  reset,
  setUser,
  setTempRegister,
  clearTempRegister,
} = authSlice.actions;

export default authSlice.reducer;
