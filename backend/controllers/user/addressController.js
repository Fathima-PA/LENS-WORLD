import Address from "../../models/AddressModel.js";

//  ADD ADDRESS
export const addAddress = async (req, res) => {
  try {
    const {name, address, phone, city, pincode, state } = req.body;

    if (!name||!address || !phone || !city || !pincode || !state) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newAddress = await Address.create({
      user: req.user.id,
      name,
      address,
      phone,
      city,
      pincode,
      state,
    });

    res.status(201).json(newAddress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  GET ALL MY ADDRESSES
export const getMyAddress = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  UPDATE ADDRESS
export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const addressDoc = await Address.findById(id);

    if (!addressDoc) {
      return res.status(404).json({ message: "Address not found" });
    }
    if (addressDoc.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const updated = await Address.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  DELETE ADDRESS
export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const addressDoc = await Address.findById(id);

    if (!addressDoc) {
      return res.status(404).json({ message: "Address not found" });
    }
    if (addressDoc.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await Address.findByIdAndDelete(id);

    res.json({ message: "Address deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const setDefaultAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const addressId = req.params.id;

    await Address.updateMany(
      { user: userId },
      { isDefault: false }
    );

    await Address.findByIdAndUpdate(addressId, {
      isDefault: true,
    });

    res.json({ message: "Default address updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
