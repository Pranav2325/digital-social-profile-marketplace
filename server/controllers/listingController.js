//controller for adding listing to database

import imagekit from "../configs/imageKit.js";
import prisma from "../configs/prisma.js";
import fs, { access } from "fs";
import Stripe from "stripe";

export const addListing = async (req, res) => {
  try {
    const { userId } = await req.auth();
    if (req.plan != "premium") {
      const listingCount = await prisma.listing.count({
        where: { ownerId: userId },
      });
      if (listingCount >= 5) {
        return res
          .status(400)
          .json({ message: "you have reached the free listing limit" });
      }
    }
    const accountDetails = JSON.parse(req.body.accountDetails);

    accountDetails.followers_count = parseFloat(accountDetails.followers_count);
    accountDetails.engagement_rate = parseFloat(accountDetails.engagement_rate);
    accountDetails.monthly_views = parseFloat(accountDetails.monthly_views);
    accountDetails.price = parseFloat(accountDetails.price);
    accountDetails.platform = accountDetails.platform.toLowerCase();
    accountDetails.niche = accountDetails.niche.toLowerCase();

    accountDetails.username.startsWith("@")
      ? (accountDetails.username = accountDetails.username.slice(1))
      : null;

    const uploadImages = req.files.map(async (file) => {
      const response = await imagekit.files.upload({
        file: fs.createReadStream(file.path),
        fileName: `${Date.now()}.png`,
        folder: "flip-earn",
        transformation: { pre: "w-1280,h-auto" },
      });
      return response.url;
    });
    //wait for all uploads to complete
    const images = await Promise.all(uploadImages);
    const listing = await prisma.listing.create({
      data: {
        ownerId: userId,
        images,
        ...accountDetails,
      },
    });
    return res
      .status(201)
      .json({ message: "Account Listed successfully", listing });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.code || error.message });
  }
};

//controller for getting all public listing

export const getAllPublicListing = async (req, res) => {
  try {
    const listings = await prisma.listing.findMany({
      where: { status: "active" },
      include: { owner: true },
      orderBy: { createdAt: "desc" },
    });

    if (!listings || listings.length === 0) {
      return res.json({ listings: [] });
    }
    return res.json({ listings });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.code || error.message });
  }
};
//controller for getting all user listings
export const getAllUserListing = async (req, res) => {
  try {
    const { userId } = await req.auth();

    // 1. Find user in DB
    let user = await prisma.user.findUnique({
      where: { id: userId },
    });

    // 2. If not found, create user in DB
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          email: "", // optional, fill from Clerk if needed
          name: "",
          image: "",
          earned: 0,
          withdrawn: 0,
        },
      });
    }

    // 3. Fetch listings
    const listings = await prisma.listing.findMany({
      where: { ownerId: userId, status: { not: "deleted" } },
      orderBy: { createdAt: "desc" },
    });

    // 4. Prepare safe balance
    const balance = {
      earned: user.earned,
      withdrawn: user.withdrawn,
      available: user.earned - user.withdrawn,
    };

    return res.json({ listings, balance });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.code || error.message });
  }
};

//controller for updating listings in DB

export const updateListing = async (req, res) => {
  try {
    const { userId } = await req.auth();

    const accountDetails = JSON.parse(req.body.accountDetails);
    if (req.files.length + accountDetails.images.length > 5) {
      return res
        .status(400)
        .json({ message: "You can only upload up to 5 images" });
    }
    accountDetails.followers_count = parseFloat(accountDetails.followers_count);
    accountDetails.engagement_rate = parseFloat(accountDetails.engagement_rate);
    accountDetails.monthly_views = parseFloat(accountDetails.monthly_views);
    accountDetails.price = parseFloat(accountDetails.price);
    accountDetails.platform = accountDetails.platform.toLowerCase();
    accountDetails.niche = accountDetails.niche.toLowerCase();
    accountDetails.username.startsWith("@")
      ? (accountDetails.username = accountDetails.username.slice(1))
      : null;

    const listing = await prisma.listing.update({
      where: { id: accountDetails.id, ownerId: userId },
      data: accountDetails,
    });
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }
    if (listing.status === "sold") {
      return res.status(404).json({ message: "you cant update sold listing" });
    }
    if (req.files.length > 0) {
      const uploadImages = req.files.map(async (file) => {
        const response = await imagekit.files.upload({
          file: fs.createReadStream(file.path),
          fileName: `${Date.now()}.png`,
          folder: "flip-earn",
          transformation: { pre: "w-1280,h-auto" },
        });
        return response.url;
      });
      //wait for all uploads to complete
      const images = await Promise.all(uploadImages);

      const listing = await prisma.listing.update({
        where: { id: accountDetails.id, ownerId: userId },
        data: {
          ownerId: userId,
          ...accountDetails,
          images: [...accountDetails.images, ...images],
        },
      });
      return res.json({ message: "Account Updated successfully", listing });
    }
    return res.json({ message: "Account Updated successfully", listing });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.code || error.message });
  }
};

//controller for toggle status
export const toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = await req.auth();

    const listing = await prisma.listing.findUnique({
      where: { id, ownerId: userId },
    });
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }
    if (listing.status === "active" || listing.status === "inactive") {
      await prisma.listing.update({
        where: { id, ownerId: userId },
        data: { status: listing.status === "active" ? "inactive" : "active" },
      });
    } else if (listing.status === "ban") {
      return res.status(400).json({ message: "your listing is banned" });
    } else if (listing.status === "sold") {
      return res.status(404).json({ message: "you cant update sold listing" });
    }
    return res.json({
      message: "Listing status updated successfully",
      listing,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.code || error.message });
  }
};

//controller for delete listing
export const deleteUserListing = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { listingId } = req.params;

    const listing = await prisma.listing.findFirst({
      where: { id: listingId, ownerId: userId },
      include: { owner: true },
    });
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }
    if (listing.status === "sold") {
      return res.status(404).json({ message: "sold listing cant be deleted" });
    }
    //if passward has been changes send the new pass tot the owner
    if (listing.isCredentialChanged) {
      //send email to owner
    }
    await prisma.listing.update({
      where: { id: listingId },
      data: { status: "deleted" },
    });
    return res.json({ message: "Listing deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.code || error.message });
  }
};

export const addCredential = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { listingId, credential } = req.body;
    if (credential.length === 0 || !listingId) {
      return res.status(400).json({ message: "Missing Fields" });
    }
    const listing = await prisma.listing.findFirst({
      where: { id: listingId, ownerId: userId },
    });
    if (!listing) {
      return res
        .status(404)
        .json({ message: "Listing not found or you are not the owner" });
    }

    await prisma.credential.create({
      data: {
        listingId,
        originalCredential: credential,
      },
    });
    await prisma.listing.update({
      where: { id: listingId },
      data: { isCredentialSubmitted: true },
    });
    return res.json({ message: "credential added successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.code || error.message });
  }
};

export const markFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = await req.auth();
    if (req.plan !== "premium") {
      return res.status(400).json({ message: "Premium plan required" });
    }
    //unset all other featured listings
    await prisma.listing.updateMany({
      where: { ownerId: userId },
      data: { featured: false },
    });
    //mark the listing as featured
    await prisma.listing.update({
      where: { id },
      data: { featured: true },
    });
    return res.json({ message: "Listing marked as featured" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.code || error.message });
  }
};
export const getAllUserOrders = async (req, res) => {
  try {
    const { userId } = await req.auth();
    let orders = await prisma.transaction.findMany({
      where: { userId, isPaid: true },
      include: { listing: true },
    });

    if (!orders || orders.length === 0) {
      return res.json({ orders: [] });
    }

    //Attach the credential to each other
    const credentials = await prisma.credential.findMany({
      where: { listingId: { in: orders.map((order) => order.listingId) } },
    });
    const ordersWithCredentials = orders.map((order) => {
      const credential = credentials.find(
        (cred) => cred.listingId === order.listingId,
      );
      return { ...order, credential };
    });

    return res.json({ orders: ordersWithCredentials });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.code || error.message });
  }
};

export const withdrawAmount = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { amount, account } = req.body;
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    const balance = user.earned - user.withdrawn;
    if (amount > balance) {
      return res.status(400).json({ message: "Insufficient balance" });
    }
    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId,
        amount,
        account,
      },
    });
    await prisma.user.update({
      where: { id: userId },
      data: {
        withdrawn: { increment: amount },
      },
    });
    return res.json({ message: "Applied for withdrawal", withdrawal });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.code || error.message });
  }
};

export const purchaseAccount = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { listingId } = req.params;
    const { origin } = req.headers;
    const listing = await prisma.listing.findFirst({
      where: { id: listingId, status: "active" },
    });
    if (!listing)
      return res
        .status(404)
        .json({ message: "listing not found or not active" });
    if (listing.ownerId === userId)
      return res
        .status(400)
        .json({ message: "you can't purchase your own listing" });

    const transaction = await prisma.transaction.create({
      data: {
        listingId,
        ownerId: listing.ownerId,
        userId,
        amount: listing.price,
      },
    });
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${origin}/loading/my-orders`,
      cancel_url:`${origin}/marketplace`,
      line_items: [
        {
          price_data:{
            currency:"usd",
            product_data:{
              name:`Purchasing Account @${listing.username} of ${listing.platform}`
            },
            unit_amount:Math.floor(transaction.amount)*100,
          },
          quantity:1
        },
      ],
      mode: "payment",
      metadata:{
        transactionId:transaction.id,
        appId:"flipearn",
        
      },
      expires_at:Math.floor(Date.now()/1000)+30*60 //30 min expiry

    });
    return res.json({paymentLink:session.url})
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.code || error.message });
  }
};
