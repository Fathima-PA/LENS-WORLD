import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api";

export const loadAdminThunk = createAsyncThunk(
  "adminAuth/loadAdmin",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/api/admin/me", {
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

const adminAuthSlice = createSlice({
  name: "adminAuth",
  initialState: {
    admin: null,
    isLoading: true,
  },
  reducers: {
    adminLogout: (state) => {
      state.admin = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadAdminThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadAdminThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.admin = action.payload;
      })
      .addCase(loadAdminThunk.rejected, (state) => {
        state.isLoading = false;
        state.admin = null;
      });
  },
});

export const { adminLogout } = adminAuthSlice.actions;

export default adminAuthSlice.reducer;
