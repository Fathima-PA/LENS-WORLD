import { addAddressService,getMyAddressService,updateAddressService,deleteAddressService,setDefaultAddressService } from "../../services/user/addressService.js";
import { STATUS_CODES } from "../../utils/statusCodes.js";
//  ADD ADDRESS

export const addAddress = async (req, res) => {
  try {

    const newAddress = await addAddressService(req.body, req.user.id);

    res.status(STATUS_CODES.CREATED).json(newAddress);

  } catch (error) {
    res.status(STATUS_CODES.SERVER_ERROR).json({ message: error.message });
  }
};
//  GET ALL MY ADDRESSES

export const getMyAddress = async (req, res) => {
  try {

    const addresses = await getMyAddressService(req.user.id);

     res.status(STATUS_CODES.OK).json({
      success: true,
      addresses
    });

  } catch (error) {
    res.status(STATUS_CODES.SERVER_ERROR).json({ message: error.message });
  }
};

//  UPDATE ADDRESS


export const updateAddress = async (req, res) => {
  try {

    const updated = await updateAddressService(
      req.params.id,
      req.user.id,
      req.body
    );

   res.status(STATUS_CODES.OK).json({
      success: true,
      message: "Address updated successfully",
      address: updated
    });

  } catch (error) {
    res.status(error.statusCode || STATUS_CODES.SERVER_ERROR).json({ message: error.message });
  }
};

//  DELETE ADDRESS

export const deleteAddress = async (req, res) => {
  try {

    const result = await deleteAddressService(
      req.params.id,
      req.user.id
    );

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: result.message || "Address deleted"
    });

  } catch (error) {
    res.status(error.statusCode || STATUS_CODES.SERVER_ERROR).json({ message: error.message });
  }
};

export const setDefaultAddress = async (req, res) => {
  try {

    const result = await setDefaultAddressService(
      req.user._id,
      req.params.id
    );

     res.status(STATUS_CODES.OK).json({
      success: true,
      message: result.message || "Default address set"
    });

  } catch (error) {
    res.status(error.statusCode || STATUS_CODES.SERVER_ERROR).json({ message: error.message });
  }
};
