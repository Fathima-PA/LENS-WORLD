import { getDashboardStatsService,getDashboardChartService  } from "../../services/admin/dashboardService.js";

export const getDashboardStats = async (req, res) => {
  try {

    const result = await getDashboardStatsService();

    res.json(result);

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

    const sales = await getDashboardChartService(type);

    res.json(sales);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Chart data failed"
    });

  }
};