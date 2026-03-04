import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  InputGroup,
  Form,
  Card,
} from "react-bootstrap";
import axios from "axios";
import "../../styles/AdminCategories.css";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";


const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/api/admin/categories",
        {
          params: { page: currentPage, limit: 5, search },
          withCredentials: true,
        }
      );

      setCategories(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error("Fetch categories error:", error);
    }
  };



const handleEdit = (id) => {
  navigate(`/admin/categories/edit/${id}`);
};

const handleToggleStatus = async (categorie) => {
  const action = categorie.isActive ? "block" : "unblock";

  const confirmed = window.confirm(
    `Are you sure you want to ${action} this product?`
  );

  if (!confirmed) return;

  try {
    await axios.patch(
      `http://localhost:3000/api/admin/categories/toggle/${categorie._id}`,
      {},
      { withCredentials: true }
    );

    toast.success(
      categorie.isActive
        ? "Categorie blocked successfully "
        : "Categorie unblocked successfully "
    );

     fetchCategories();
  } catch (error) {
    toast.error(
      error.response?.data?.message || "Something went wrong"
    );
  }
};

const navigate = useNavigate();
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    fetchCategories();
  }, [currentPage, search]);

  return (
    <div style={{ background: "#f6f6f7", minHeight: "100vh" }}>
      <Container fluid className="py-4">
        <Row className="g-4">
          <Col md={3} lg={2}>
            <AdminSidebar />
          </Col>

          <Col>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h3 className="fw-semibold mb-1">Categories</h3>
                <div className="text-muted small">
                  Dashboard &nbsp;›&nbsp; Categories
                </div>
              </div>

              <Button
  className="create-category-btn"
  onClick={() => navigate("/admin/categories/add")}
>
  + Create Category
</Button>

            </div>

            <InputGroup className="mb-4" style={{ maxWidth: 360 }}>
              <Form.Control
                placeholder="Search category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
  <Button
    variant="light"
    onClick={() => {
      setSearch("");
      setCurrentPage(1);
    }}
  >
    ❌
  </Button>
)}

            </InputGroup>
            

            <Card className="admin-card">
              <Table responsive className="mb-0 align-middle">
                <thead>
                  <tr className="table-head">
                    <th className="ps-4">Category Name</th>
                    <th>Sold</th>
                    <th>Stock</th>
                    <th>Added</th>
                    <th className="text-end pe-4">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat._id}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={cat.image || "/images/placeholder.png"}
                            alt={cat.name}
                            className="category-img"
                          />
                          <span className="fw-medium">{cat.name}</span>
                        </div>
                      </td>

                      <td className="text-muted">{cat.sold}</td>
                      <td className="text-muted">{cat.stock}</td>
                      <td className="text-muted">
                        {new Date(cat.createdAt).toLocaleDateString("en-GB")}
                      </td>

<td className="text-end pe-4">
                          <span
                            style={{
                              cursor: cat.isActive ? "pointer" : "not-allowed",
                              opacity: cat.isActive ? 1 : 0.4,
                            }}
                            onClick={() =>
                              cat.isActive &&
                              handleEdit(cat._id)
                            }
                            title={
                              cat.isActive
                                ? "Edit Categorie"
                                : "Blocked Categorie"
                            }
                          >
                            ✏️
                          </span>

                          &nbsp;&nbsp;

                          <span
                            style={{
                              cursor: "pointer",
                              color: cat.isActive ? "red" : "green",
                            }}
                            onClick={() => handleToggleStatus(cat)}
                            title={
                              cat.isActive
                                ? "Block Product"
                                : "Unblock Product"
                            }
                          >
                            {cat.isActive ? "BLOCK" : "UNBLOCK"}
                          </span>
                        </td>

                    </tr>
                  ))}

                  {categories.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-5 text-muted">
                        No categories found
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>

              <div className="table-footer">
                <span className="text-muted small">
                  Showing page {currentPage} of {totalPages}
                </span>

                <div className="d-flex gap-2">
                  <Button
                    className="page-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    ←
                  </Button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        className={`page-btn ${
                          currentPage === page ? "active" : ""
                        }`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page.toString().padStart(2, "0")}
                      </Button>
                    )
                  )}

                  <Button
                    className="page-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    →
                  </Button>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminCategories;
