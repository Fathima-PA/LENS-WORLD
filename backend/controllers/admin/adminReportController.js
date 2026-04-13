

import { getSalesReportService,generateSalesPDFService, generateSalesExcelService} from "../../services/admin/reportService.js";
import { STATUS_CODES } from "../../utils/statusCodes.js";

/* ========================================
   GET SALES REPORT
======================================== */


export const getSalesReport = async (req, res) => {
  try {

    res.set("Cache-Control", "no-store");

    const result = await getSalesReportService(req.query);

      res.status(STATUS_CODES.OK).json(result);

  } catch (error) {
    console.log(error);
    res.status(STATUS_CODES.SERVER_ERROR).json({ message: "Report failed" });
  }
};

/* ========================================
   DOWNLOAD PDF REPORT
======================================== */



export const downloadSalesPDF = async (req, res) => {
  try {
    await generateSalesPDFService(req.query, res);
  } catch (error) {
    console.log(error);
    res.status(STATUS_CODES.SERVER_ERROR).json({
      message: "PDF generation failed"
    });
  }
};

/* ========================================
   DOWNLOAD EXCEL REPORT
======================================== */



export const downloadSalesExcel = async (req, res) => {
  try {

    await generateSalesExcelService(req.query, res);

  } catch (error) {
    console.log(error);

    res.status(STATUS_CODES.SERVER_ERROR).json({
      message: "Excel generation failed"
    });
  }
};