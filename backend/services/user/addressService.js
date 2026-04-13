import Address from "../../models/AddressModel.js";

export const addAddressService = async (data, userId) => {

  const { name, address, phone, city, pincode, state } = data;

  if (!name || !address || !phone || !city || !pincode || !state) {
    throw new Error("All fields are required");
  }

  const newAddress = await Address.create({
    user: userId,
    name,
    address,
    phone,
    city,
    pincode,
    state,
  });

  return newAddress;
};




export const getMyAddressService = async (userId) => {

  const addresses = await Address.find({ user: userId })
    .sort({ createdAt: -1 });

  return addresses;
};

export const updateAddressService = async (id, userId, data) => {

  const addressDoc = await Address.findById(id);

  if (!addressDoc) {
    const error = new Error("Address not found");
    error.statusCode = 404;
    throw error;
  }

  if (addressDoc.user.toString() !== userId) {
    const error = new Error("Not authorized");
    error.statusCode = 401;
    throw error;
  }

  const updated = await Address.findByIdAndUpdate(id, data, {
    new: true,
  });

  return updated;
};


export const deleteAddressService = async (id, userId) => {

  const addressDoc = await Address.findById(id);

  if (!addressDoc) {
    const error = new Error("Address not found");
    error.statusCode = 404;
    throw error;
  }

  if (addressDoc.user.toString() !== userId) {
    const error = new Error("Not authorized");
    error.statusCode = 403; 
    throw error;
  }

  await Address.findByIdAndDelete(id);

  return { message: "Address deleted successfully" };
};


export const setDefaultAddressService = async (userId, addressId) => {

  const address = await Address.findById(addressId);

  if (!address) {
    const error = new Error("Address not found");
    error.statusCode = 404;
    throw error;
  }

  if (address.user.toString() !== userId.toString()) {
    const error = new Error("Not authorized");
    error.statusCode = 403;
    throw error;
  }

  // 🔥 remove old default
  await Address.updateMany(
    { user: userId },
    { isDefault: false }
  );

  // 🔥 set new default
  await Address.findByIdAndUpdate(addressId, {
    isDefault: true,
  });

  return { message: "Default address updated" };
};