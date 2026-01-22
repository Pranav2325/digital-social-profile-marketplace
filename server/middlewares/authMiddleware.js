import { clerkClient } from "@clerk/express";
import prisma from "../configs/prisma.js";

export const protect = async (req, res, next) => {
  try {
    const { userId, has } = await req.auth();
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get Clerk user info
    const clerkUser = await clerkClient.users.getUser(userId);

    // Sync Clerk user into Prisma (fixes empty owner name/email/image)
    await prisma.user.upsert({
      where: { id: userId },
      update: {
        name: clerkUser.fullName || "",
        email: clerkUser.primaryEmailAddress?.emailAddress || "",
        image: clerkUser.imageUrl || "",
      },
      create: {
        id: userId,
        name: clerkUser.fullName || "",
        email: clerkUser.primaryEmailAddress?.emailAddress || "",
        image: clerkUser.imageUrl || "",
      },
    });



    req.user = { id: userId };

    const hasPremiumPlan = await has({ plan: "premium" });
    req.plan = hasPremiumPlan ? "premium" : "free";
    return next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: error.code || error.message });
  }
};

export const protectAdmin = async (req, res, next) => {
  try {
    const  user  = await clerkClient.users.getUser(await req.auth().userId);

    const isAdmin = process.env.ADMIN_EMAILS.split(",").includes(
      user.emailAddresses[0].emailAddress
    );

    if (!isAdmin) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    return next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: error.code || error.message });
  }
};
