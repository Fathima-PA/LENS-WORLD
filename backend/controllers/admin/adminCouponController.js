import Coupon from "../../models/couponModel.js";

export const createCoupon = async (req, res) => {
  try {

    const {
      code,
      discountType,
      discountValue,
      minPurchase,
      maxDiscount,
      expiryDate
    } = req.body;

    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) {
      return res.json({
        success: false,
        message: "Coupon already exists"
      });
    }

    if (discountType === "percentage" && discountValue > 100) {
      return res.json({
        success: false,
        message: "Percentage cannot exceed 100"
      });
    }

    const coupon = new Coupon({
      code,
      discountType,
      discountValue,
      minPurchase,
      maxDiscount,
      expiryDate
    });

    await coupon.save();

    res.json({
      success: true,
      message: "Coupon created successfully"
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false });
  }
};
export const getCoupons = async (req, res) => {
  try {

    let { page = 1, limit = 5, search = "" } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const query = {};

    // Search by coupon code
    if (search) {
      query.code = { $regex: search, $options: "i" };
    }

    const totalCoupons = await Coupon.countDocuments(query);

    const coupons = await Coupon.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      coupons,
      totalPages: Math.ceil(totalCoupons / limit),
      currentPage: page
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch coupons"
    });
  }
};

export const toggleCouponStatus = async (req, res) => {
  try {

    const { id } = req.params;

    const coupon = await Coupon.findById(id);

    if(!coupon){
      return res.json({ success: false, message: "Coupon not found" });
    }

   coupon.isActive = !coupon.isActive;
   await coupon.save();

    res.json({
      success: true,
      message: coupon.isActive ? "Coupon Unblocked" : "Coupon Blocked"
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false });
  }
};


export const updateCoupon = async (req, res) => {
  try {

    const { id } = req.params;

    const {
      code,
      discountType,
      discountValue,
      minPurchase,
      maxDiscount,
      expiryDate
    } = req.body;

    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return res.json({
        success: false,
        message: "Coupon not found"
      });
    }

    const existingCoupon = await Coupon.findOne({
      code,
      _id: { $ne: id }
    });

    if (existingCoupon) {
      return res.json({
        success: false,
        message: "Coupon code already exists"
      });
    }

    if (discountType === "percentage" && discountValue > 100) {
      return res.json({
        success: false,
        message: "Percentage cannot exceed 100"
      });
    }

    coupon.code = code;
    coupon.discountType = discountType;
    coupon.discountValue = discountValue;
    coupon.minPurchase = minPurchase;
    coupon.maxDiscount = maxDiscount;
    coupon.expiryDate = expiryDate;

    await coupon.save();

    res.json({
      success: true,
      message: "Coupon updated successfully",
      coupon
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false });
  }
};
