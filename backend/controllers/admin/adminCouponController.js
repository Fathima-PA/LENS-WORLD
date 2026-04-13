import { createCouponService,getCouponsService,toggleCouponStatusService,updateCouponService} from "../../services/admin/couponService.js";
import { STATUS_CODES } from "../../utils/statusCodes.js";


export const createCoupon = async (req, res) => {
  try {

    const result = await createCouponService(req.body);

      if (!result.success) {
      return res.status(STATUS_CODES.BAD_REQUEST).json(result); 
    }

    return res.status(STATUS_CODES.CREATED).json(result);

  } catch (error) {
    console.log(error);
      return res.status(STATUS_CODES.SERVER_ERROR).json({
      success: false,
      message: "Server error"
    });
  }
};


export const getCoupons = async (req, res) => {
  try {

    const result = await getCouponsService(req.query);

    return res.status(STATUS_CODES.OK).json(result);

  } catch (error) {
    console.log(error);

    res.status(STATUS_CODES.SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch coupons"
    });
  }
};

export const toggleCouponStatus = async (req, res) => {
  try {

    const result = await toggleCouponStatusService(req.params.id);

    if (!result.success) {
      return res.status(STATUS_CODES.NOT_FOUND).json(result); 
    }

    return res.status(STATUS_CODES.OK).json(result);

  } catch (error) {
    console.log(error);
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      success: false,
      message: "Server error"
    });
  }
};


export const updateCoupon = async (req, res) => {
  try {

    const result = await updateCouponService(
      req.params.id,
      req.body
    );

    if (!result.success) {
      return res.status(STATUS_CODES.BAD_REQUEST).json(result); 
    }

    return res.status(STATUS_CODES.OK).json(result);

  } catch (error) {
    console.log(error);
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      success: false,
      message: "Server error"
    });
  }
};