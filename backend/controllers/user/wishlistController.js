import { toggleWishlistService,getWishlistService} from "../../services/user/wishlistService.js";
// TOGGLE WISHLIST


export const toggleWishlist = async (req, res) => {
  try {

    const result = await toggleWishlistService(
      req.user._id,
      req.body
    );

    res.json(result);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

// GET WISHLIST
export const getWishlist = async (req, res) => {
  try {

    const result = await getWishlistService(req.user._id);

    res.json(result);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Fetch wishlist failed"
    });
  }
};