import prisma from "../configs/prisma.js";

//Controller for checking if user is admin
export const isAdmin = async (req, res) => {
  try {
    return res.json({ isAdmin: true });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.code || error.message });
  }
};

//Controller for getting dashboard data
export const getDashboard = async (req, res) => {
  try {
    const totalListings = await prisma.listing.count({});
    const transactions = await prisma.transaction.findMany({
      where: { isPaid: true },
      select: { amount: true },
    });
    const totalRevenue = transactions.reduce(
      (total, transaction) => total + transaction.amount,
      0
    );
    const activeListings = await prisma.listing.count({
      where: { status: "active" },
    });

    const totalUser = await prisma.user.count({});
    const recentListings = await prisma.listing.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { owner: true },
    });
    return res.json({
      dashboardData: {
        totalListings,
        totalRevenue,
        activeListings,
        totalUser,
        recentListings,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.code || error.message });
  }
};

//controller for getting all litsings
export const getAllListings = async (req, res) => {
  try {
    const listings = await prisma.listing.findMany({
      include: { owner: true },
      orderBy: { createdAt: "desc" },
    });
    if (!listings || listings.length === 0) {
      return res.json({ listings: [] });
    }
    return res.json({ listings });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.code || error.message });
  }
};
//controller for change the status
export const changeStatus = async (req, res) => {
  try {
    const { listingId } = req.params;
    const { status } = req.body;
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });
    if(!listing) return res.status(404).json({message:"Listing not found"})
    
    await prisma.listing.update({
        where:{id:listingId},
        data:{status}
    })
    return res.json({message:"Listing status updated"})
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.code || error.message });
  }
};
//Controller for getting all unverified listings with cred submitted
export const getAllUnverifiedListings = async (req, res) => {
  try {
    const listings = await prisma.listing.findMany({
      where:{
        isCredentialSubmitted:true,
        isCredentialVerified:false,
        status:{not:"deleted"}
      },
      orderBy: { createdAt: "desc" },
    });
    if (!listings || listings.length === 0) {
      return res.json({ listings: [] });
    }
    return res.json({ listings });
    
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.code || error.message });
  }
};
//Controller for getting credential
export const getCredential = async (req, res) => {
  try {
    const { listingId } = req.params;
    const credential=await prisma.credential.findFirst({
        where:{listingId}
    })
    if(!credential) return  res.status(404).json({message:"Credential not found"})

    return res.json({credential});
    
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.code || error.message });
  }
};
//Controller for mark credential as verified
export const markCredentialVerified = async (req, res) => {
  try {
    const { listingId } = req.params;
     await prisma.listing.update({
        where:{id:listingId},
        data:{isCredentialVerified:true}
    })
    return res.json({message:"Credential marked as verified"})

  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.code || error.message });
  }
};

//get all unchanged listings
export const getAllUnchangedListings = async (req, res) => {
  try {
    const listings = await prisma.listing.findMany({
      where:{
        isCredentialChanged:false,
        isCredentialVerified:true,
        status:{not:"deleted"}
      },
      orderBy: { createdAt: "desc" },
    });
    if (!listings || listings.length === 0) {
      return res.json({ listings: [] });
    }
    return res.json({ listings });
    
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.code || error.message });
  }
};

//change cred for verified listing

export const changeCredential = async (req, res) => {
  try {
    const {listingId}=req.params;
    const {newCredential,credentialId}=req.body;
    await prisma.credential.update({
        where:{id:credentialId,listingId},
        data:{updatedCredential:newCredential}
    })
    await prisma.listing.update({
        where:{id:listingId},
        data:{isCredentialChanged:true}
    })
    return res.json({message:"Credential changed successfully"})
    
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.code || error.message });
  }
};