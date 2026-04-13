
import Order from "../../models/OrderModel.js";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";


export const getSalesReportService = async (query) => {

  const { type, startDate, endDate } = query;

  let filter = { status: "Delivered" };

  const now = new Date();

  if (type === "daily") {
    const today = new Date();
    today.setHours(0,0,0,0);
    filter.createdAt = { $gte: today };
  }

  if (type === "weekly") {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);
    filter.createdAt = { $gte: weekAgo };
  }

  if (type === "yearly") {
    const yearStart = new Date(now.getFullYear(), 0, 1);
    filter.createdAt = { $gte: yearStart };
  }

  if (type === "custom") {
    const start = new Date(startDate);
    const end = new Date(endDate);

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    filter.createdAt = {
      $gte: start,
      $lte: end
    };
  }

  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .populate("user");

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

  return {
    success: true,
    orderCount: orders.length,
    totalSales,
    totalDiscount,
    netRevenue,
    codTotal,
    onlineTotal,
    orders
  };
};




export const generateSalesPDFService = async (query, res) => {

  const { type, startDate, endDate } = query;

  let filter = { status: "Delivered" };

  const now = new Date();

  if (type === "daily") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    filter.createdAt = { $gte: today, $lte: end };
  }

  else if (type === "weekly") {
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    filter.createdAt = { $gte: weekAgo, $lte: now };
  }

  else if (type === "yearly") {
    const yearStart = new Date(now.getFullYear(), 0, 1);
    filter.createdAt = { $gte: yearStart, $lte: now };
  }

  else if (type === "custom") {
    const start = new Date(startDate);
    const end = new Date(endDate);

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    filter.createdAt = { $gte: start, $lte: end };
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

  const doc = new PDFDocument({ margin: 40 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=sales-report.pdf"
  );

  doc.pipe(res);

  /* TITLE */
  doc.fontSize(20).text("Sales Report", { align: "center" });
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

  /* SUMMARY */
  doc.moveDown(2);

  doc
    .fontSize(14)
    .text("Summary", 40, y + 20, { underline: true });

  doc.moveDown();

  doc
    .fontSize(11)
    .text(`Total Orders: ${orders.length}`, 40)
    .text(`Total Sales (Subtotal): ₹${totalSales}`, 40)
    .text(`Total Discount: ₹${totalDiscount}`, 40)
    .text(`Net Revenue: ₹${netRevenue}`, 40)
    .text(`COD Sales: ₹${codTotal}`, 40)
    .text(`Online Sales: ₹${onlineTotal}`, 40);

  doc.end();
};




export const generateSalesExcelService = async (query, res) => {

  const { type, startDate, endDate } = query;

  let filter = { status: "Delivered" };

  const now = new Date();

  if (type === "daily") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    filter.createdAt = { $gte: today, $lte: end };
  }

  else if (type === "weekly") {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    filter.createdAt = { $gte: weekAgo, $lte: now };
  }

  else if (type === "yearly") {
    const yearStart = new Date(now.getFullYear(), 0, 1);
    filter.createdAt = { $gte: yearStart, $lte: now };
  }

  else if (type === "custom") {
    const start = new Date(startDate);
    const end = new Date(endDate);

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    filter.createdAt = { $gte: start, $lte: end };
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

  /* SUMMARY */
  sheet.addRow([]);
  sheet.addRow([]);

  const summaryTitle = sheet.addRow(["SUMMARY"]);
  summaryTitle.font = { bold: true };

  const rows = [
    ["Total Orders", orders.length],
    ["Total Sales", `₹${totalSales}`],
    ["Total Discount", `₹${totalDiscount}`],
    ["Net Revenue", `₹${netRevenue}`],
    ["COD Sales", `₹${codTotal}`],
    ["Online Sales", `₹${onlineTotal}`]
  ];

  rows.forEach(r => {
    const row = sheet.addRow(r);
    row.font = { bold: true };
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
};