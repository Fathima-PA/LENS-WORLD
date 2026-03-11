
import { Container, Row, Col, Card, ProgressBar } from "react-bootstrap";
import { useSelector } from "react-redux";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { useEffect, useState } from "react";
import axios from "axios";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const AdminDashboard = () => {

  const admin = useSelector((state) => state.adminAuth.admin);

  const [stats, setStats] = useState({
    todaySales: 0,
    todayRevenue: 0,
    totalRevenue: 0,
    usersCount: 0,
    mostSold: []
  });
  const [chartData, setChartData] = useState([]);
  const [chartFilter, setChartFilter] = useState("monthly");

  useEffect(() => {

    const fetchDashboard = async () => {

      try {

        const res = await axios.get(
          "http://localhost:3000/api/admin/dashboard",
          { withCredentials: true }
        );

        setStats(res.data || {});

      } catch (error) {
        console.log(error);
      }

    };

    fetchDashboard();

  }, []);


  useEffect(() => {

    const fetchChart = async () => {

      try {

        const res = await axios.get(
          `http://localhost:3000/api/admin/dashboard-chart?type=${chartFilter}`,
          { withCredentials: true }
        );

        setChartData(res.data || []);

      } catch (error) {
        console.log(error);
      }

    };

    fetchChart();

  }, [chartFilter]);


  const labels = chartData.map((item) => {

    if (!item?._id) return "";

    const date = new Date(item._id);

    if (chartFilter === "yearly") {
      return date.toLocaleString("default", { month: "short" });
    }

    if (chartFilter === "monthly") {
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short"
      });
    }

    if (chartFilter === "weekly") {
      return date.toLocaleDateString("en-IN", {
        weekday: "short"
      });
    }

    if (chartFilter === "daily") {
      return item._id;
    }

    return item._id;

  });


  const data = {
    labels: labels,
    datasets: [
      {
        label: "Revenue",
        data: chartData.map((item) => item?.revenue || 0),
        backgroundColor: "#0d6efd",
        borderRadius: 6
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };


  return (
    <Container fluid className="py-4" style={{ background: "#f6f6f7", minHeight: "100vh" }}>

      <Row className="g-4">


        <Col md={3} lg={2}>
          <AdminSidebar />
        </Col>

        <Col md={9} lg={10}>

          <h3 className="fw-bold mb-4">Dashboard</h3>


          <Row className="g-4 mb-4">

            <Col md={4}>
              <Card className="border-0 shadow-sm rounded-4">
                <Card.Body className="p-4">
                  <div className="text-muted small">Today's Sales</div>
                  <div className="fs-3 fw-bold">
                    ₹{stats?.todaySales?.toLocaleString() || 0}
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="border-0 shadow-sm rounded-4">
                <Card.Body className="p-4">
                  <div className="text-muted small">Today's Revenue</div>
                  <div className="fs-3 fw-bold mt-2">
                    ₹{stats?.todayRevenue?.toLocaleString() || 0}
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="border-0 shadow-sm rounded-4">
                <Card.Body className="p-4">
                  <div className="text-muted small">Users Count</div>
                  <div className="fs-3 fw-bold">
                    {stats?.usersCount || 0}
                  </div>
                </Card.Body>
              </Card>
            </Col>

          </Row>


          <Row className="g-4 mb-4">

            <Col md={8}>

              <Card className="border-0 shadow-sm rounded-4">

                <Card.Body className="p-4">

                  <div className="d-flex justify-content-between mb-3">

                    <h5 className="fw-semibold">Revenue Analytics</h5>

                    <div className="btn-group">

                      <button
                        className={`btn btn-sm ${chartFilter==="daily" ? "btn-primary":"btn-outline-primary"}`}
                        onClick={()=>setChartFilter("daily")}
                      >
                        Daily
                      </button>

                      <button
                        className={`btn btn-sm ${chartFilter==="weekly" ? "btn-primary":"btn-outline-primary"}`}
                        onClick={()=>setChartFilter("weekly")}
                      >
                        Weekly
                      </button>

                      <button
                        className={`btn btn-sm ${chartFilter==="monthly" ? "btn-primary":"btn-outline-primary"}`}
                        onClick={()=>setChartFilter("monthly")}
                      >
                        Monthly
                      </button>

                      <button
                        className={`btn btn-sm ${chartFilter==="yearly" ? "btn-primary":"btn-outline-primary"}`}
                        onClick={()=>setChartFilter("yearly")}
                      >
                        Yearly
                      </button>

                    </div>

                  </div>

                  <Bar data={data} options={options} />

                </Card.Body>

              </Card>

            </Col>


            <Col md={4}>

              <Card className="border-0 shadow-sm rounded-4">

                <Card.Body className="p-4">

                  <h5 className="fw-semibold mb-3">
                    Most Sold Items
                  </h5>

                  {stats?.mostSold?.length > 0 ? (

                    stats.mostSold.map((item) => (

                      <div key={item.name} className="mb-3">

                        <div className="d-flex justify-content-between small mb-1">
                          <span className="fw-semibold">
                            {item.name}
                          </span>

                          <span className="text-muted">
                            {item.qty}
                          </span>
                        </div>

                        <ProgressBar
                          now={item.qty}
                          style={{ height: "8px" }}
                        />

                      </div>

                    ))

                  ) : (

                    <div className="text-muted small">
                      No sales yet
                    </div>

                  )}

                </Card.Body>

              </Card>

            </Col>

          </Row>

        </Col>

      </Row>

    </Container>
  );

};

export default AdminDashboard;
