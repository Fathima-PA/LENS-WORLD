import Order from "../../models/OrderModel.js";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";

/* ========================================
   GET SALES REPORT
======================================== */

export const getSalesReport = async (req, res) => {

  try {

    const { type, startDate, endDate } = req.query;

    let filter = { status: "Delivered" };

    const now = new Date();

    if (type === "daily") {

      const today = new Date();
      today.setHours(0,0,0,0);

      filter.createdAt = { $gte: today };

    }

    if (type === "weekly") {

      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);

      filter.createdAt = { $gte: weekAgo };

    }

    if (type === "yearly") {

      const yearStart = new Date(now.getFullYear(), 0, 1);

      filter.createdAt = { $gte: yearStart };

    }

    if (type === "custom") {

      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };

    }

    const orders = await Order.find(filter).populate("user");

    let totalSales = 0;
    let totalDiscount = 0;
    

    let codTotal = 0;
    let onlineTotal = 0;

    orders.forEach(order => {

      totalSales += order.subtotal || 0;

      totalDiscount += order.discount || 0;


      if (order.paymentMethod === "COD") {

        codTotal += order.grandTotal || 0;

      } else {

        onlineTotal += order.grandTotal || 0;

      }

    });

    const netRevenue = orders.reduce(
      (sum, order) => sum + (order.grandTotal || 0),
      0
    );

    res.json({
      success: true,
      orderCount: orders.length,
      totalSales,
      totalDiscount,
      netRevenue,
      codTotal,
      onlineTotal,
      orders
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Report failed"
    });

  }

};


/* ========================================
   DOWNLOAD PDF REPORT
======================================== */

export const downloadSalesPDF = async (req, res) => {

  try {

    const orders = await Order.find({ status: "Delivered" }).populate("user");

    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=sales-report.pdf"
    );

    doc.pipe(res);

    /* TITLE */

    doc
      .fontSize(20)
      .text("Sales Report", { align: "center" });

    doc.moveDown(2);

    /* TABLE HEADER */

    const tableTop = 150;

    doc
      .fontSize(12)
      .text("Order ID", 40, tableTop)
      .text("Customer", 160, tableTop)
      .text("Payment", 300, tableTop)
      .text("Amount", 380, tableTop)
      .text("Date", 450, tableTop);

    doc.moveTo(40, tableTop + 15)
       .lineTo(550, tableTop + 15)
       .stroke();

    let y = tableTop + 25;

    /* TABLE ROWS */

    orders.forEach(order => {

      doc
        .fontSize(10)
        .text(order._id.toString().slice(-8), 40, y)
        .text(order.user?.username || "User", 160, y)
        .text(order.paymentMethod, 300, y)
        .text(`₹${order.grandTotal}`, 380, y)
        .text(new Date(order.createdAt).toLocaleDateString(), 450, y);

      y += 20;

    });

    doc.end();

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "PDF generation failed"
    });

  }

};

/* ========================================
   DOWNLOAD EXCEL REPORT
======================================== */

export const downloadSalesExcel = async (req, res) => {

  try {

    const orders = await Order.find({ status: "Delivered" }).populate("user");

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Sales Report");

    sheet.columns = [

      { header: "Order ID", key: "orderId", width: 25 },
      { header: "Customer", key: "customer", width: 20 },
      { header: "Payment Method", key: "payment", width: 15 },
      { header: "Subtotal", key: "subtotal", width: 15 },
      { header: "Discount", key: "discount", width: 15 },
      { header: "Total Amount", key: "total", width: 15 },
      { header: "Date", key: "date", width: 20 }

    ];

    /* HEADER STYLE */

    sheet.getRow(1).font = { bold: true };

    orders.forEach(order => {

      sheet.addRow({

        orderId: order._id.toString(),

        customer: order.user?.username || "User",

        payment: order.paymentMethod,

        subtotal: order.subtotal,

        discount: order.discount,

        total: order.grandTotal,

        date: new Date(order.createdAt).toLocaleDateString()

      });

    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=sales-report.xlsx"
    );

    await workbook.xlsx.write(res);

    res.end();

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Excel generation failed"
    });

  }

};