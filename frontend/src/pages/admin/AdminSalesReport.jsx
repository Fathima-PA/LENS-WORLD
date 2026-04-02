import { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import CustomToast from "../../components/common/CustomToast";
import api from "../../api";
ChartJS.register(ArcElement, Tooltip, Legend);

const AdminSalesReport = () => {

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const [filterType, setFilterType] = useState("yearly");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
const [showToast, setShowToast] = useState(false);
const [toastMsg, setToastMsg] = useState("");
const [toastType, setToastType] = useState("danger");


const showMessage = (msg, type = "danger") => {
  setToastMsg(msg);
  setToastType(type);
  setShowToast(true);
};
  const fetchReport = async (type = filterType) => {

    try {

      setLoading(true);

      const res = await api.get(
        "/api/admin/sales-report",
        {
          params: {
            type,
            startDate,
            endDate
          },
          withCredentials: true
        }
      );

      setReport(res.data);
      setLoading(false);

    } catch (error) {
      console.log(error);
      setLoading(false);
    }

  };

  useEffect(() => {
    fetchReport("yearly");
  }, []);

  const downloadPDF = () => {

  let url = `${import.meta.env.VITE_API_URL}/api/admin/sales-report/pdf?type=${filterType}`;

  if (filterType === "custom") {
    url += `&startDate=${startDate}&endDate=${endDate}`;
  }

  window.open(url, "_blank");
};

const downloadExcel = () => {

  let url = `${import.meta.env.VITE_API_URL}/api/admin/sales-report/excel?type=${filterType}`;

  if (filterType === "custom") {
    url += `&startDate=${startDate}&endDate=${endDate}`;
  }

  window.open(url, "_blank");
};

  const chartData = {
    labels: ["COD", "Online"],
    datasets: [
      {
        data: [
          report?.codTotal || 0,
          report?.onlineTotal || 0
        ],
        backgroundColor: ["#ff7a00", "#4CAF50"]
      }
    ]
  };
const validateCustomDates = () => {
  if (!startDate || !endDate) {
    showMessage("Please select both start and end dates");
    return false;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();

const todayStr = today.toISOString().split("T")[0];

  today.setHours(0, 0, 0, 0);

  if (start > end) {
    showMessage("Start date cannot be after end date");
    return false;
  }

if (startDate > todayStr || endDate > todayStr) {
  showMessage("Future dates are not allowed");
  return false;
}

  return true;
};
  return (

    <div className="d-flex">

      <AdminSidebar />

      <div className="p-4 w-100">

        <h3 className="fw-bold mb-4">Sales Analytics</h3>

        {/* FILTER CARD */}

        <div className="card shadow-sm p-4 mb-4">

          <h5 className="fw-semibold mb-3">Report Filters</h5>

          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">

            {/* FILTER BUTTONS */}

            <div className="btn-group">

              <button
                className={`btn ${filterType === "daily" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => {
                  setFilterType("daily");
                  fetchReport("daily");
                }}
              >
                Daily
              </button>

              <button
                className={`btn ${filterType === "weekly" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => {
                  setFilterType("weekly");
                  fetchReport("weekly");
                }}
              >
                Weekly
              </button>

              <button
                className={`btn ${filterType === "yearly" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => {
                  setFilterType("yearly");
                  fetchReport("yearly");
                }}
              >
                Yearly
              </button>

              <button
                className={`btn ${filterType === "custom" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setFilterType("custom")}
              >
                Custom
              </button>

            </div>

            {/* CUSTOM DATE RANGE */}

            {filterType === "custom" && (

              <div className="d-flex align-items-center gap-2">

                <input
                  type="date"
                  className="form-control"
                  style={{ width: "180px" }}
                  onChange={(e) => setStartDate(e.target.value)}
                />

                <span>to</span>

                <input
                  type="date"
                  className="form-control"
                  style={{ width: "180px" }}
                  onChange={(e) => setEndDate(e.target.value)}
                />

                <button
                  className="btn btn-dark"
                  onClick={() => {
  if (!validateCustomDates()) return;
  fetchReport("custom");
}}
                >
                  Generate
                </button>

              </div>

            )}


            <div className="d-flex gap-2">

              <button
                className="btn btn-danger"
                onClick={downloadPDF}
              >
                Download PDF
              </button>

              <button
                className="btn btn-success"
                onClick={downloadExcel}
              >
                Download Excel
              </button>

            </div>

          </div>

        </div>


        {loading && (
          <p className="text-center">Loading report...</p>
        )}


        {report && (

          <div className="row g-4 mb-4">

            <div className="col-lg-3 col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h6 className="text-muted mb-1">Total Orders</h6>
                  <h3 className="fw-bold">{report.orderCount}</h3>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h6 className="text-muted mb-1">Gross Revenue</h6>
                  <h3 className="fw-bold text-success">
                    ₹{report.totalSales}
                  </h3>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h6 className="text-muted mb-1">Product Discount</h6>
                  <h3 className="fw-bold text-danger">
                    ₹{report.totalDiscount}
                  </h3>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h6 className="text-muted mb-1">Net Revenue</h6>
                  <h3 className="fw-bold text-primary">
                    ₹{report.netRevenue}
                  </h3>
                </div>
              </div>
            </div>

          </div>

        )}


        {report && (

<div className="card shadow-sm mb-4">

  <div className="card-body">

    <h5 className="fw-semibold mb-4">Payment Distribution</h5>

    <div
      style={{
        width: "350px",
        height: "350px",
        margin: "auto"
      }}
    >

      <Doughnut
        data={chartData}
        options={{
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom"
            }
          }
        }}
      />

    </div>

  </div>

</div>

)}


        {report && (

          <div className="card p-4 shadow-sm">

            <h5 className="mb-3">Delivered Orders</h5>

            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead className="table-light">

                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Payment</th>
                    <th>Subtotal</th>
                    <th>Discount</th>
                    <th>Total</th>
                    <th>Date</th>
                  </tr>

                </thead>

                <tbody>

                  {report.orders.map((order) => (

                    <tr key={order._id}>

                      <td className="small">{order._id}</td>

                      <td>{order.user?.username}</td>

                      <td>

                        <span className={`badge 
                        ${order.paymentMethod === "COD"
                          ? "bg-warning text-dark"
                          : order.paymentMethod === "RAZORPAY"
                          ? "bg-success"
                          : "bg-primary"}`}>

                          {order.paymentMethod}

                        </span>

                      </td>

                      <td>₹{order.subtotal}</td>

                      <td className="text-danger fw-semibold">
                        ₹{order.discount}
                      </td>

                      <td className="fw-bold">
                        ₹{order.grandTotal}
                      </td>

                      <td>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

        )}

      </div>
      <CustomToast
  show={showToast}
  setShow={setShowToast}
  message={toastMsg}
  type={toastType}
/>

    </div>

  );

};

export default AdminSalesReport;