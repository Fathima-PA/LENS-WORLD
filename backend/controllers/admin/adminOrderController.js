import { getAllOrdersService, updateOrderStatusService,getOrderDetailsAdminService,approveReturnService,rejectReturnService } from "../../services/admin/orderService.js";

export const getAllOrders = async (req, res) => {
  try {

    const result = await getAllOrdersService(req.query);

    res.json(result);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {

    const { status } = req.body;

    const order = await updateOrderStatusService(req.params.id, status);

    res.json(order);

  } catch (err) {
    res.status(500).json({ message: "Status update failed" });
  }
};


export const getOrderDetailsAdmin = async (req, res) => {
  try {

    const result = await getOrderDetailsAdminService(req.params.id);

    if (!result.success) {
      return res.status(404).json({ message: result.message });
    }

    res.json(result.order);

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch order" });
  }
};


// APPROVE RETURN ITEM

export const approveReturn = async (req, res) => {
  try {

    const { itemId } = req.body;

    const result = await approveReturnService(req.params.id, itemId);

    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    res.json({ message: result.message });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error approving return" });
  }
};

// REJECT RETURN ITEM

export const rejectReturn = async (req, res) => {
  try {

    const { itemId } = req.body;

    const result = await rejectReturnService(req.params.id, itemId);

    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    res.json({ message: result.message });

  } catch {
    res.status(500).json({ message: "Error rejecting return" });
  }
};

