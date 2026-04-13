import { getAllOrdersService, updateOrderStatusService,getOrderDetailsAdminService,approveReturnService,rejectReturnService } from "../../services/admin/orderService.js";
import { STATUS_CODES } from "../../utils/statusCodes.js";


export const getAllOrders = async (req, res) => {
  try {

    const result = await getAllOrdersService(req.query);

    res.status(STATUS_CODES.OK).json(result);

  } catch (err) {
    console.log(err);
    res.status(STATUS_CODES.SERVER_ERROR).json({ message: "Failed to fetch orders" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {

    const { status } = req.body;

    const order = await updateOrderStatusService(req.params.id, status);

   if (!order.success) {
      return res.status(STATUS_CODES.BAD_REQUEST).json(order);
    }

    res.status(STATUS_CODES.OK).json(order);


  } catch (err) {
    res.status(STATUS_CODES.SERVER_ERROR).json({ message: "Status update failed" });
  }
};


export const getOrderDetailsAdmin = async (req, res) => {
  try {

    const result = await getOrderDetailsAdminService(req.params.id);

    if (!result.success) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: result.message });
    }

     res.status(STATUS_CODES.OK).json(result.order);


  } catch (err) {
    res.status(STATUS_CODES.SERVER_ERROR).json({ message: "Failed to fetch order" });
  }
};


// APPROVE RETURN ITEM

export const approveReturn = async (req, res) => {
  try {

    const { itemId } = req.body;

    const result = await approveReturnService(req.params.id, itemId);

    if (!result.success) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: result.message });
    }

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: result.message
    });

  } catch (err) {
    console.error(err);
    res.status(STATUS_CODES.SERVER_ERROR).json({ message: "Error approving return" });
  }
};

// REJECT RETURN ITEM

export const rejectReturn = async (req, res) => {
  try {

    const { itemId } = req.body;

    const result = await rejectReturnService(req.params.id, itemId);

    if (!result.success) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: result.message });
    }

   res.status(STATUS_CODES.OK).json({
      success: true,
      message: result.message
    });


  } catch {
    res.status(STATUS_CODES.SERVER_ERROR).json({ message: "Error rejecting return" });
  }
};

