//controller for adding listing to database

import imagekit from "../configs/imageKit.js";
import prisma from "../configs/prisma.js";
import fs from "fs";

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

      const uploadImages=req.files.map(async (file)=>{
        const response = await imagekit.files.upload({
        file: fs.createReadStream(file.path),
        fileName: `${Date.now()}.png`,
        folder:"flip-earn",
        transformation:{pre:"w-1280,h-auto"}
         });
         return response.url



      })
  } catch (error) {}
};
