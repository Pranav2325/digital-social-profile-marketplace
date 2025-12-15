import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Marketplace from "./pages/Marketplace";
import MyListings from "./pages/MyListings";
import ListingDetails from "./pages/ListingDetails";
import ManageListings from "./pages/ManageListings";
import Messages from "./pages/Messages";
import MyOrders from "./pages/MyOrders";
import Loading from "./pages/Loading";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/my-listings" element={<MyListings />} />
        
        <Route path="/listing/:listingId" element={<ListingDetails />} />
        <Route path="/create-listing" element={<ManageListings />} />
        <Route path="/edit-listing/:id" element={<ManageListings />} />

        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/loading" element={<Loading />} />
      </Routes>
    </div>
  );
};

export default App;
