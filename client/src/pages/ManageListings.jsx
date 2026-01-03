import { Loader2Icon, Upload, X } from "lucide-react";
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
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic info */}
          <Section title="Basic Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Listing Title *"
                value={formaData.title}
                placeholder="e.g., Premium Travel Instagram Account"
                onChange={(e) => handleInputChange("title", e)}
                required={true}
              />
              <SelectField
                label="Platform *"
                options={platforms}
                value={formaData.platform}
                onChange={(v) => handleInputChange("platform", v)}
                required={true}
              />

              <InputField
                label="Username/Handle *"
                value={formaData.username}
                placeholder="@username"
                onChange={(e) => handleInputChange("username", e)}
                required={true}
              />

              <SelectField
                label="Niche/Category *"
                options={niches}
                value={formaData.niche}
                onChange={(v) => handleInputChange("niche", v)}
                required={true}
              />
            </div>
          </Section>
          {/* Metrics */}
          <Section title="Account Metrics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Followers Count *"
                type="number"
                min={0}
                value={formaData.followers_count}
                placeholder="10000"
                onChange={(e) => handleInputChange("followers_count", e)}
                required={true}
              />
              <InputField
                label="Engagement Rate (%)"
                type="number"
                min={0}
                max={100}
                value={formaData.engagement_rate}
                placeholder="4"
                onChange={(e) => handleInputChange("engagement_rate", e)}
              />
              <InputField
                label="Monthly Views/Impressions"
                type="number"
                min={0}
                value={formaData.monthly_views}
                placeholder="100000"
                onChange={(e) => handleInputChange("monthly_views", e)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <InputField
                label="Primary Audience Country"
                value={formaData.country}
                placeholder="United States"
                onChange={(e) => handleInputChange("country", e)}
              />
              <SelectField
                label="Primary Audience Age Range"
                options={ageRange}
                value={formaData.age_range}
                onChange={(v) => handleInputChange("age_range", v)}
              />
            </div>
            <div className="space-y-3">
              <CheckboxField
                label="Account is verified on the platform"
                checked={FormData.verified}
                onChange={(v) => handleInputChange("verified", v)}
              />

              <CheckboxField
                label="Account is monetized on the platform"
                checked={FormData.monetized}
                onChange={(v) => handleInputChange("monetized", v)}
              />
            </div>
          </Section>
          {/* pricing and description */}
          <Section title="Pricing & Description">
            <InputField
              label="Asking Price (USD) *"
              type="number"
              min={0}
              value={formaData.price}
              placeholder="500"
              onChange={(e) => handleInputChange("price", e)}
              required={true}
            />
            <TextareaField
              label="Descrption *"
              value={formaData.description}
              onChange={(v) => handleInputChange("description", v)}
              required={true}
            />
          </Section>
          {/* screenshots and proofs */}
          <Section title="Screenshots & Proof">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                id="images"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <label
                htmlFor="images"
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                Choose Files
              </label>
              <p className="text-sm text-gray-500 mt-2">
                Upload screenshots or proofs of account analytics
              </p>
            </div>
            {formaData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {formaData.images.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={
                        typeof img === "string" ? img : URL.createObjectURL(img)
                      }
                      alt={`image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button type="button" onClick={() => removeImage(index)}>
                      <X className="absolute -top-2 -right-2 size-6 bg-red-600 text-white rounded-full hover:bg-red-700" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Section>
          <div className="flex justify-end gap-3 text-sm">
            <button onClick={()=>navigate(-1)} type="button" className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              {isEditing?'Update Listing':'Create Listing'}

            </button>

          </div>
        </form>
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
    <h2>{title}</h2>
    {children}
  </div>
);

const InputField = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  min = null,
  max = null,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <input
      type={type}
      min={min}
      max={max}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-1.5 text-gray-600 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300"
      required={required}
    />
  </div>
);

const SelectField = ({ label, options, value, onChange, required = false }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-1.5 text-gray-600 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300"
      required={required}
    >
      <option value="">Select...</option>
      {options.map((option, index) => (
        <option value={option}>{option}</option>
      ))}
    </select>
  </div>
);

const CheckboxField = ({ label, checked, onChange, required = false }) => (
  <label className="flex items-center space-x-2 cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.value)}
      className="size-4"
      required={required}
    />
    <span className="text-sm text-gray-700">{label}</span>
  </label>
);

const TextareaField = ({ label, value, onChange, required = false }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <textarea
      rows={5}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-1.5 text-gray-600 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300"
      required={required}
    />
  </div>
);

export default ManageListings;
