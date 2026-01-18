import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../configs/axios.js";

//get all public listings
export const getAllPublicListing = createAsyncThunk(
  "litsing/getAllPublicListing",
  async () => {
    try {
      const { data } = await api.get("/api/listings/public");
      return data;
    } catch (error) {
      console.log(error);
      return { listings: [] };
    }
  }
);

//get all user listing
export const getAllUserListing = createAsyncThunk(
  "litsing/getAllUserListing",
  async ({ getToken }) => {
    try {
      const token = await getToken();
      const { data } = await api.get("/api/listings/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    } catch (error) {
      console.log(error);
      return { listings: [] };
    }
  }
);
const listingSlice = createSlice({
  name: "listing",
  initialState: {
    listings: [],
    userListings: [],
    balance: {
      earned: 0,
      withdrawn: 0,
      available: 0,
    },
  },
  reducers: {
    setListings: (state, action) => {
      state.listings = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getAllPublicListing.fulfilled, (state, action) => {
      state.listings = action.payload?.listings||[];
    });
    builder.addCase(getAllUserListing.fulfilled, (state, action) => {
      state.userListings = action.payload?.listings||[];
      state.balance = action.payload?.balance||state.balance;
    });
  },
});

export const { setListings } = listingSlice.actions;
export default listingSlice.reducer;
