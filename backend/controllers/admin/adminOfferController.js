import { addOfferService,getOffersService,updateOfferService,toggleOfferStatusService } from "../../services/admin/offerService.js";
import { STATUS_CODES } from "../../utils/statusCodes.js";

export const addOffer = async (req, res) => {
  try {

    const result = await addOfferService(req.body);

    if (!result.success) {
      return res.status(STATUS_CODES.BAD_REQUEST).json(result); 
    }

    res.status(STATUS_CODES.CREATED).json(result);

  } catch (error) {
    console.log(error);
   res.status(STATUS_CODES.SERVER_ERROR).json({ success: false, message: "Server error" });
  }
};

export const getOffers = async (req, res) => {
  try {

    const result = await getOffersService(req.query);

    res.json(result);

  } catch (error) {
    console.log(error);
    res.status(STATUS_CODES.SERVER_ERROR).json({ success: false });
  }
};

export const updateOffer = async (req, res) => {
  try {

    const { id } = req.params;

    const result = await updateOfferService(id, req.body);
    if (!result.success) {
      return res.status(STATUS_CODES.BAD_REQUEST).json(result);
    }

    res.status(STATUS_CODES.OK).json(result);

  } catch (error) {
    console.log(error);
     res.status(STATUS_CODES.SERVER_ERROR).json({ success: false });
  }
};


export const toggleOfferStatus = async (req, res) => {
  try {

    const { id } = req.params;

    const result = await toggleOfferStatusService(id);

     if (!result.success) {
      return res.status(STATUS_CODES.NOT_FOUND).json(result);
    }

    res.status(STATUS_CODES.OK).json(result);

  } catch (error) {
    console.log(error);
  res.status(STATUS_CODES.SERVER_ERROR).json({ success: false });
  }
};