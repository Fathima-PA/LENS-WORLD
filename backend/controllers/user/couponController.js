import Coupon from "../../models/couponModel.js";

export const applyCoupon = async (req,res)=>{
    
  const { code, subtotal } = req.body;

  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true
  });

  if(!coupon){
    return res.status(400).json({message:"Invalid coupon"});
  }

  if(coupon.expiryDate < new Date()){
    return res.status(400).json({message:"Coupon expired"});
  }

  if(subtotal < coupon.minPurchase){
    return res.status(400).json({message:"Minimum purchase not reached"});
  }

  let discount = 0;

  if(coupon.discountType === "percentage"){
    discount = subtotal * coupon.discountValue / 100;

    if(coupon.maxDiscount){
      discount = Math.min(discount, coupon.maxDiscount);
    }
  }else{
    discount = coupon.discountValue;
  }

  res.json({
    success:true,
    discount,
    couponCode: coupon.code
  });

};
export const getAvailableCoupons = async (req, res) => {
  try {
const coupons = await Coupon.find({
  isActive: true,
  $or: [
    { expiryDate: { $gte: new Date() } },
    { expiryDate: { $exists: false } }
  ]
}).select("code discountType discountValue minPurchase maxDiscount expiryDate");

    console.log("Coupons found:", coupons);

    res.json(coupons);

  } catch (err) {
    console.error("Coupon fetch error:", err);
    res.status(500).json({ message: "Failed to fetch coupons" });
  }
};

