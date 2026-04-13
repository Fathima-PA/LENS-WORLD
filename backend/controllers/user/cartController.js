
import { addToCartService ,getCartService, 
  removeCartItemService,updateCartQuantityService,
  validateCheckoutService } from "../../services/user/cartService.js";

  import { STATUS_CODES } from "../../utils/statusCodes.js";
// ADD TO CART


export const addToCart = async (req, res) => {
  try {

    const result = await addToCartService(
      req.user._id,
      req.body
    );

    res.json(result);

  } catch (err) {

    console.error(err);

    res.status(err.statusCode || STATUS_CODES.SERVER_ERROR).json({
      message: err.message || "Add to cart failed"
    });
  }
};

// GET CART

export const getCart = async (req, res) => {
  try {

    const { removed, items } =
      await getCartService(req.user._id);

    if (removed) {
      return res.status(STATUS_CODES.OK).json({
        warning: "Some items were removed because they no longer exist",
        items
      });
    }

    res.json(items);

  } catch (err) {

    console.error(err);

    res.status(STATUS_CODES.SERVER_ERROR).json({
      message: "Fetch cart failed"
    });
  }
};

// REMOVE ITEM

export const removeCartItem = async (req, res) => {
  try {

    const result = await removeCartItemService(
      req.user._id,
      req.params.itemId
    );

    res.json(result);

  } catch (err) {

    res.status(err.statusCode || STATUS_CODES.SERVER_ERROR).json({
      message: err.message || "Remove failed"
    });

  }
};

// UPDATE QUANTITY

export const updateCartQuantity = async (req, res) => {
  try {

    const result = await updateCartQuantityService(
      req.user._id,
      req.body
    );

    res.json(result);

  } catch (err) {

    res.status(err.statusCode || STATUS_CODES.SERVER_ERROR).json({
      message: err.message || "Update failed"
    });

  }
};

// CHECKOUT VALIDATION


export const validateCheckout = async (req, res) => {
  try {

    const result = await validateCheckoutService(req.user._id);

    res.json(result);

  } catch (err) {

    res.status(err.statusCode || STATUS_CODES.SERVER_ERROR).json({
      message: err.message || "Checkout failed"
    });

  }
};
