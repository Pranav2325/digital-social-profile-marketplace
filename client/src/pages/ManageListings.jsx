import { Loader2Icon } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

const ManageListings = () => {
  const { userListings, balance } = useSelector((state) => state.listing);

  const { id } = useParams();
  const navigate = useNavigate();

  const [loadingListing, setLoadingListing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formaData, setFormData] = useState({
    title: "",
    platform: "",
    username: "",
    followers_count: "",
    engagement_rate: "",
    monthly_views: "",
    niche: "",
    price: "",
    description: "",
    verified: false,
    monetized: false,
    country: "",
    age_range: "",
    images: [],
  });

  const platforms = [
    "youtube",
    "instagram",
    "tiktok",
    "facebook",
    "twitter",
    "linkedin",
    "pinterest",
    "snapchat",
    "twitch",
    "discord",
  ];
  const niches = [
    "finance",
    "business",
    "entrepreneurship",
    "marketing",
    "tech",
    "programming",
    "fitness",
    "health",
    "self_improvement",
    "education",
    "lifestyle",
    "travel",
    "fashion",
    "gaming",
    "entertainment",
    "other",
  ];

  const ageRange = [
    "13-17 years",
    "18-24 years",
    "25-34 years",
    "35-44 years",
    "45-54 years",
    "55-64 years",
    "65+ years",
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    if (files.length + FormData.images.length > 5)
      return toast.error("You can add up to 5 images");
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }));
  };
  const removeImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== indexToRemove),
    }));
  };

  //get listing data for edit if id is provided
  useEffect(() => {
    if (!id) return;
    setIsEditing(true);
    setLoadingListing(true);
    const listing = userListings.find((listing) => listing.id === id);
    if (listing) {
      setFormData(listing);
      setLoadingListing(false);
    } else {
      toast.error("Listing not found");
      navigate("/my-listings");
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
  };
  if (loadingListing) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2Icon className="size-7 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            {isEditing ? "Edit Listing" : "List Your Account"}
          </h1>
          <p className="text-gray-600 mt-2">
            {isEditing
              ? "Update your existing account listing"
              : "Create a mock listing to display your account info"}
          </p>
        </div>
        <form
          onSubmit={handleSubmit} className="space-y-8"
        >
          {/* Basic info */}
          
        </form>
      </div>
    </div>
  );
};

export default ManageListings;
