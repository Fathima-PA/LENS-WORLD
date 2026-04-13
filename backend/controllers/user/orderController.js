import { placeOrderCODService ,getMyOrdersService,
  getOrderDetailsService, cancelOrderService,
  cancelOrderItemService,returnOrderService,
  returnSingleItemService,downloadInvoiceService,
  verifyRazorpayPaymentService, retryRazorpayPaymentService,
   markPaymentFailedService} from "../../services/user/orderService.js";

import User from "../../models/userModel.js";

export const placeOrderCOD = async (req, res) => {
  try {

    const result = await placeOrderCODService(
      req.user._id,
      req.body
    );

    res.json(result);

  } catch (err) {

    console.error(err);

    res.status(err.statusCode || 500).json({
      message: err.message || "Order failed"
    });

  }
};




export const getMyOrders = async (req, res) => {
  try {

    const result = await getMyOrdersService(
      req.user._id,
      req.query
    );

    res.json(result);

  } catch (err) {

    res.status(500).json({
      message: "Failed to fetch orders"
    });

  }
};


// GET SINGLE ORDER


export const getOrderDetails = async (req, res) => {
  try {

    const result = await getOrderDetailsService(
      req.user._id,
      req.params.id
    );

    res.json(result);

  } catch (error) {

    res.status(error.statusCode || 500).json({
      message: error.message || "Failed to fetch order"
    });

  }
};





// CANCEL ORDER


export const cancelOrder = async (req, res) => {
  try {

    const result = await cancelOrderService(
      req.user._id,
      req.params.id
    );

    res.json(result);

  } catch (err) {

    console.log(err);

    res.status(err.statusCode || 500).json({
      message: err.message || "Cancel failed"
    });

  }
};


export const cancelOrderItem = async (req, res) => {
  try {

    const { itemId } = req.body;

    const result = await cancelOrderItemService(
      req.user._id,
      req.params.id,
      itemId
    );

    res.json(result);

  } catch (err) {

    console.log(err);

    res.status(err.statusCode || 500).json({
      message: err.message || "Cancel failed"
    });

  }
};

// RETURN ORDER


export const returnOrder = async (req, res) => {
  try {

    const { reason } = req.body;

    const result = await returnOrderService(
      req.user._id,
      req.params.id,
      reason
    );

    res.json(result);

  } catch (err) {

    res.status(err.statusCode || 500).json({
      message: err.message || "Return failed"
    });

  }
};

export const returnSingleItem = async (req, res) => {
  try {

    const result = await returnSingleItemService(
      req.user._id,
      req.params.id,
      req.body
    );

    res.json(result);

  } catch (error) {

    console.error("RETURN ITEM ERROR:", error);

    res.status(error.statusCode || 500).json({
      message: error.message || "Return failed"
    });

  }
};


export const downloadInvoice = async (req, res) => {
  try {

    await downloadInvoiceService(
      req.user._id,
      req.params.id,
      res
    );

  } catch (err) {

    console.error(err);

    res.status(err.statusCode || 500).json({
      message: err.message || "Invoice failed"
    });

  }
};

export const verifyRazorpayPayment = async (req, res) => {
  try {

    const result = await verifyRazorpayPaymentService(req.body);

    res.json(result);

  } catch (err) {

    console.error("VERIFY ERROR:", err);

    res.status(err.statusCode || 500).json({
      message: err.message || "Verification failed"
    });

  }
};

export const getWallet = async (req,res)=>{

 const user = await User.findById(req.user._id)
   .select("wallet walletHistory");

 res.json(user);

};


export const retryRazorpayPayment = async (req, res) => {
  try {

    const result = await retryRazorpayPaymentService(
      req.params.orderId
    );

    res.json(result);

  } catch (err) {

    console.error(err);

    res.status(err.statusCode || 500).json({
      message: err.message || "Retry payment failed"
    });

  }
};

export const markPaymentFailed = async (req, res) => {
  try {

    const { orderId } = req.body;

    const result = await markPaymentFailedService(orderId);

    res.json(result);

  } catch (err) {

    console.error(err);

    res.status(err.statusCode || 500).json({
      message: err.message || "Failed to update payment"
    });

  }
};