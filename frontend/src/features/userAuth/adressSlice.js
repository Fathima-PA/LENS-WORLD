import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api"; 

export const getMyAddress = createAsyncThunk(
  "address/getMyAddress",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/api/address/my");
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

const addressSlice = createSlice({
  name: "address",
  initialState: {
    address: null,
    isLoading: false,
    isError: false,
    message: "",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getMyAddress.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getMyAddress.fulfilled, (state, action) => {
        state.address = action.payload;
        state.isLoading = false;
      })
      .addCase(getMyAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export default addressSlice.reducer;
