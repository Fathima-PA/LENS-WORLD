import Otp from "../models/Otp.js";
import { generateOtp } from "../utils/generateOtp.js";

export const setOtp = async (email, purpose) => {
  const otp = generateOtp();

  await Otp.deleteMany({ email, purpose });

  await Otp.create({
    email,
    otp,
    purpose,
   expiresAt: new Date(Date.now() + 60 * 1000),
 
  });

  return otp;
};
