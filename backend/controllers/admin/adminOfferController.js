import Offer from "../../models/OfferModel.js";

export const addOffer = async (req, res) => {
  try {

    const {
      title,
      type,
      product,
      category,
      discountType,
      discountValue,
      startDate,
      endDate
    } = req.body;

    if(discountType === "percentage" && discountValue > 100){
  return res.json({
    success:false,
    message:"Percentage cannot exceed 100"
  })
}

const existingOffer = await Offer.findOne({
  type,
  ...(type === "product" ? { product } : { category }),
  isActive: true,
  endDate: { $gte: new Date() }
});

if (existingOffer) {
  return res.json({
    success: false,
    message: "An active offer already exists. Create a new one after it expires."
  });
}

    const offer = new Offer({
      title,
      type,
      product: type === "product" ? product : null,
      category: type === "category" ? category : null,
      discountType,
      discountValue,
      startDate,
      endDate
    });

    await offer.save();

    res.json({
      success: true,
      message: "Offer created successfully"
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false });
  }
};

export const getOffers = async (req, res) => {
  try {

    const { type } = req.query;

    const filter = type ? { type } : {};

    const offers = await Offer.find(filter)
      .populate("product")
      .populate("category")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      offers
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false });
  }
};

export const updateOffer = async (req, res) => {
  try {

    const { id } = req.params;

    const {
      title,
      type,
      product,
      category,
      discountType,
      discountValue,
      startDate,
      endDate,
      isActive
    } = req.body;

    const offer = await Offer.findById(id);

    if (!offer) {
      return res.json({
        success: false,
        message: "Offer not found"
      });
    }

    if (discountType === "percentage" && discountValue > 100) {
      return res.json({
        success: false,
        message: "Percentage cannot exceed 100"
      });
    }

    const existingOffer = await Offer.findOne({
      _id: { $ne: id }, 
      type,
      ...(type === "product" ? { product } : { category }),
      isActive: true,
      endDate: { $gte: new Date() }
    });

    if (existingOffer) {
      return res.json({
        success: false,
        message: "Another active offer already exists"
      });
    }

    offer.title = title;
    offer.discountType = discountType;
    offer.discountValue = discountValue;
    offer.startDate = startDate;
    offer.endDate = endDate;
    offer.isActive = isActive;

    await offer.save();

    res.json({
      success: true,
      message: "Offer updated successfully",
      offer
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false });
  }
};


export const toggleOfferStatus = async (req, res) => {
  try {

    const { id } = req.params;

    const offer = await Offer.findById(id);

    if (!offer) {
      return res.json({ success: false, message: "Offer not found" });
    }

    offer.isActive = !offer.isActive;

    await offer.save();

    res.json({
      success: true,
      message: offer.isActive ? "Offer Unblocked" : "Offer Blocked"
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false });
  }
};