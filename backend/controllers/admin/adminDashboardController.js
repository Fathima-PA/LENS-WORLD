import { getDashboardStatsService,getDashboardChartService  } from "../../services/admin/dashboardService.js";
import { STATUS_CODES } from "../../utils/statusCodes.js";


export const getDashboardStats = async (req, res) => {
  try {

    const result = await getDashboardStatsService();

    return res.status(STATUS_CODES.OK).json(result);

  } catch (error) {

    console.log(error);

    res.status(STATUS_CODES.SERVER_ERROR).json({
       success: false,
      message: "Dashboard fetch failed"
    });

  }
};


export const getDashboardChart = async (req, res) => {
  try {

    const { type } = req.query;
    if (!type) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: "Type is required"
      });
    }
    const sales = await getDashboardChartService(type);
 return res.status(STATUS_CODES.OK).json({
      success: true,
      data: sales
    });

  } catch (error) {

    console.log(error);

    res.status(STATUS_CODES.SERVER_ERROR).json({
      success: false,
      message: "Chart data failed"
    });

  }
};