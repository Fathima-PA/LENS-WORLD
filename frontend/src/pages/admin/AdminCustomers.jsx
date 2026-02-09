import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Badge,
  Form,
  InputGroup,
  Toast,
  ToastContainer,
  Modal,
} from "react-bootstrap";

import axios from "axios";
import AdminSidebar from "../../components/admin/AdminSidebar";

const AdminCustomers = () => {
  const [filter, setFilter] = useState("all");
  const [users, setUsers] = useState([]);

  const [search, setSearch] = useState("");
  const [totalPages, setTotalPages] = useState(1);


  const [currentPage, setCurrentPage] = useState(1);

  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");

  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); 

  const showMessage = (msg, type = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setShowToast(true);
  };

 const fetchUsers = async () => {
  try {
    const res = await axios.get(
      "http://localhost:3000/api/admin/users",
      {
        params: {
          page: currentPage,
          limit: 5,
          search,
          status: filter, 
        },
        withCredentials: true,
      }
    );

    setUsers(res.data.data);
    setTotalPages(res.data.totalPages);
  } catch (error) {
    console.log(error);
    showMessage("Failed to fetch users", "danger");
  }
};


useEffect(() => {
  fetchUsers();
}, [currentPage, search, filter]);


  const openConfirmModal = (user) => {
    setSelectedUser(user);
    setShowConfirm(true);
  };

  const confirmToggleBlock = async () => {
    if (!selectedUser) return;

    try {
      await axios.put(
        `http://localhost:3000/api/admin/block/${selectedUser._id}`,
        {},
        { withCredentials: true }
      );

      showMessage(
        selectedUser.isBlocked ? "User Unblocked " : "User Blocked ",
        "success"
      );

      setShowConfirm(false);
      setSelectedUser(null);

      fetchUsers();
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Something went wrong",
        "danger"
      );
    }
  };

  

  

  return (
    <div style={{ background: "#f6f6f7", minHeight: "100vh" }}>
      <Container fluid className="py-4">
        <Row className="g-4">
          <Col md={3} lg={2}>
            <AdminSidebar />
          </Col>

          <Col>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h3 className="fw-bold mb-1">Customers</h3>
                <div className="text-muted small">
                  <span className="text-primary" style={{ cursor: "pointer" }}>
                    Dashboard
                  </span>{" "}
                  &nbsp;›&nbsp; <span>Customers List</span>
                </div>
              </div>

              <div style={{ maxWidth: "450px", width: "100%" }}>
                <InputGroup style={{ height: "44px" }}>
                  <InputGroup.Text
                    style={{
                      borderRadius: "12px 0 0 12px",
                      background: "white",
                      borderRight: "0",
                    }}
                  >
                    🔍
                  </InputGroup.Text>

                  <Form.Control
                    placeholder="Search customer..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    style={{
                      height: "44px",
                      borderLeft: "0",
                      borderRight: "0",
                    }}
                  />

                  {search ? (
                    <Button
                      variant="light"
                      style={{
                        height: "44px",
                        borderRadius: "0 12px 12px 0",
                        borderLeft: "0",
                      }}
                      onClick={() => {
                        setSearch("");
                        setCurrentPage(1);
                      }}
                    >
                      ❌
                    </Button>
                  ) : (
                    <InputGroup.Text
                      style={{
                        borderRadius: "0 12px 12px 0",
                        background: "white",
                      }}
                    >
                      &nbsp;
                    </InputGroup.Text>
                  )}
                </InputGroup>
              </div>

            </div>

            <div className="d-flex gap-2 mb-4">
              <Button
                variant={filter === "all" ? "light" : "outline-light"}
                onClick={() => {
                  setFilter("all");
                  setCurrentPage(1);
                }}
                style={{ borderRadius: "12px", border: "1px solid #eee" }}
              >
                All
              </Button>

              <Button
                variant={filter === "active" ? "light" : "outline-light"}
                onClick={() => {
                  setFilter("active");
                  setCurrentPage(1);
                }}
                style={{ borderRadius: "12px", border: "1px solid #eee" }}
              >
                Active
              </Button>

              <Button
                variant={filter === "blocked" ? "light" : "outline-light"}
                onClick={() => {
                  setFilter("blocked");
                  setCurrentPage(1);
                }}
                style={{ borderRadius: "12px", border: "1px solid #eee" }}
              >
                Blocked
              </Button>
            </div>
            <Card className="border-0 shadow-sm rounded-4">
              <Card.Body className="p-0">
                <Table responsive className="mb-0 align-middle">
                  <thead>
                    <tr className="text-muted small">
                      <th style={{ padding: "18px 20px" }}>Name</th>
                      <th>Email</th>
                      <th>Phone No</th>
                      <th>Status</th>
                      <th>Added</th>
                      <th className="text-end" style={{ paddingRight: "20px" }}>
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td style={{ padding: "18px 20px" }}>
                          <div className="d-flex align-items-center gap-3">
                            <div
                              className="rounded-3"
                              style={{
                                width: "44px",
                                height: "44px",
                                background: "#e5e7eb",
                              }}
                            ></div>

                            <div className="fw-semibold text-capitalize">
                              {user.username || user.name || "User"}
                            </div>
                          </div>
                        </td>

                        <td className="text-muted">{user.email}</td>
                        <td className="text-muted">{user.phone || "-"}</td>

                        <td>
                          {user.isBlocked ? (
                            <Badge
                              style={{
                                backgroundColor: "#ffe5e5",
                                color: "#ff2f2f",
                                borderRadius: "10px",
                                padding: "8px 14px",
                                fontWeight: "600",
                              }}
                            >
                              Blocked
                            </Badge>
                          ) : (
                            <Badge
                              style={{
                                backgroundColor: "#e8fbf3",
                                color: "#0aa66c",
                                borderRadius: "10px",
                                padding: "8px 14px",
                                fontWeight: "600",
                              }}
                            >
                              Active
                            </Badge>
                          )}
                        </td>

                        <td className="text-muted">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "-"}
                        </td>

                        <td className="text-end" style={{ paddingRight: "20px" }}>

                          <Button
                            variant="light"
                            size="sm"
                            onClick={() => openConfirmModal(user)}
                            title={user.isBlocked ? "Unblock User" : "Block User"}
                            style={{
                              borderRadius: "10px",
                              fontWeight: "600",
                            }}
                          >
                            {user.isBlocked ? "UNBLOCK" : "BLOCK"}
                          </Button>
                        </td>
                      </tr>
                    ))}

                    {users.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-5 text-muted">
                          No customers found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>

                <div className="d-flex justify-content-between align-items-center px-4 py-3">
                  <div className="text-muted small">
                    Showing page {currentPage} of {totalPages}
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <Button
                      variant="light"
                      className="rounded-circle"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      ←
                    </Button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <Button
                          key={page}
                          variant={
                            currentPage === page ? "light" : "outline-secondary"
                          }
                          className="rounded-circle"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page.toString().padStart(2, "0")}
                        </Button>
                      )
                    )}

                    <Button
                      variant="light"
                      className="rounded-circle"
                      disabled={currentPage === totalPages || totalPages === 0}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      →
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <ToastContainer position="top-end" className="p-3">
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={2000}
          autohide
          bg={toastType}
        >
          <Toast.Body className="text-white fw-semibold">
            {toastMsg}
          </Toast.Body>
        </Toast>
      </ToastContainer>

      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedUser?.isBlocked ? "Unblock User" : "Block User"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Are you sure you want to{" "}
          <b>{selectedUser?.isBlocked ? "UNBLOCK" : "BLOCK"}</b>{" "}
          <span className="text-primary">
            {selectedUser?.username || selectedUser?.email}
          </span>{" "}
          ?
        </Modal.Body>

        <Modal.Footer>
          <Button variant="light" onClick={() => setShowConfirm(false)}>
            Cancel
          </Button>

          <Button
            variant={selectedUser?.isBlocked ? "success" : "danger"}
            onClick={confirmToggleBlock}
          >
            Yes, {selectedUser?.isBlocked ? "Unblock" : "Block"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminCustomers;
