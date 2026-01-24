import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "./authService";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../../firebase";
import axios from "axios";

const initialState = {
  user: null, // ✅ no localStorage
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: "",
};

// ✅ REGISTER
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, thunkAPI) => {
    try {
      return await authService.register(userData);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// ✅ LOGIN (COOKIE BASED)
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

// ✅ LOAD USER FROM COOKIE (/me)
export const loadUserThunk = createAsyncThunk(
  "auth/loadUser",
  async (_, thunkAPI) => {
    try {
      return await authService.getMe();
    } catch (error) {
      return thunkAPI.rejectWithValue("Not logged in");
    }
  }
);

// ✅ GOOGLE LOGIN (COOKIE BASED)
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
        { withCredentials: true } // ✅ IMPORTANT
      );

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// ✅ UPDATE PROFILE (NO TOKEN)
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

// ✅ CHANGE PASSWORD (NO TOKEN)
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

// ✅ LOGOUT (COOKIE CLEAR)
export const logoutThunk = createAsyncThunk(
  "auth/logout",
  async (_, thunkAPI) => {
    try {
      await authService.logout();
      return true;
    } catch (error) {
      return thunkAPI.rejectWithValue("Logout failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },

    // ✅ manual set user (used in App.jsx if needed)
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      // REGISTER
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.userId = action.payload.userId;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user; // ✅ no localStorage
          localStorage.setItem("isLoggedIn", "true");
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // LOAD USER
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

      // GOOGLE LOGIN
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user;
      })

      // UPDATE PROFILE
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
      })

      // LOGOUT
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        localStorage.removeItem("isLoggedIn");

      });
  },
});

export const { reset, setUser } = authSlice.actions;
export default authSlice.reducer;
