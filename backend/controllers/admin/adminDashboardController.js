import Order from "../../models/OrderModel.js";
import User from "../../models/userModel.js";
import Product from "../../models/ProductModel.js";


export const getDashboardStats = async (req, res) => {

  try {

    const today = new Date();
    today.setHours(0,0,0,0);

    const todayOrders = await Order.find({
      status: "Delivered",
      createdAt: { $gte: today }
    }).select("items grandTotal subtotal");

    const orders = await Order.find({ status: "Delivered" })
      .select("items grandTotal subtotal");

    const todaySales = todayOrders.reduce(
      (sum, order) => sum + (order.subtotal || 0),
      0
    );

    const todayRevenue = todayOrders.reduce(
      (sum, order) => sum + (order.grandTotal || 0),
      0
    );

    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.grandTotal || 0),
      0
    );

    const usersCount = await User.countDocuments();

    const productMap = {};

    orders.forEach(order => {

  if (!order.items) return;

  order.items.forEach(item => {

    if (!item) return;

    if (item.status === "Returned" || item.status === "Cancelled") return;

    if (!productMap[item.name]) {
      productMap[item.name] = 0;
    }

    productMap[item.name] += item.quantity || 0;

  });

});

    const mostSold = Object.entries(productMap)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a,b) => b.qty - a.qty)
      .slice(0,5);

    res.json({
      todaySales,
      todayRevenue,
      totalRevenue,
      usersCount,
      mostSold
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Dashboard fetch failed"
    });

  }

};


export const getDashboardChart = async (req, res) => {
  try {

    const { type } = req.query;

    let groupFormat;
    let labels;

    if (type === "daily") {
      groupFormat = "%H:00"; 
    }

    if (type === "weekly") {
      groupFormat = "%Y-%m-%d";
    }

    if (type === "monthly") {
      groupFormat = "%Y-%m-%d"; 
    }

    if (type === "yearly") {
      groupFormat = "%Y-%m"; 
    }

    const sales = await Order.aggregate([
      { $match: { status: "Delivered" } },

      {
        $group: {
          _id: {
            $dateToString: {
              format: groupFormat,
              date: "$createdAt"
            }
          },
          revenue: { $sum: "$grandTotal" }
        }
      },

      { $sort: { _id: 1 } }
    ]);

    res.json(sales);

  } catch (error) {

    console.log(error);
    res.status(500).json({ message: "Chart data failed" });

  }
};