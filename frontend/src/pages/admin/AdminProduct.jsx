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
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import "../../styles/adminCategories.css";
import Swal from "sweetalert2";
import CustomToast from "../../components/common/CustomToast";
import api from "../../api";
const AdminProducts = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showToast, setShowToast] = useState(false);
const [toastMsg, setToastMsg] = useState("");
const [toastType, setToastType] = useState("success");


useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search);
  }, 500);

  return () => clearTimeout(timer);
}, [search]);

const showMessage = (msg, type = "success") => {
  setToastMsg(msg);
  setToastType(type);
  setShowToast(true);
};

  const fetchProducts = async () => {
    try {
      const res = await api.get(
        "/api/admin/products",
        {
          params: { search:debouncedSearch, filter, page, limit: 10 },
          withCredentials: true,
        }
      );

      setProducts(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error(error);
    }
  };


const handleToggleStatus = async (product) => {
  const action = product.isActive ? "block" : "unblock";

  const result = await Swal.fire({
  title: "Are you sure?",
  text: `You want to ${action} this product`,
  icon: "warning",
  showCancelButton: true,
  confirmButtonText: "Yes",
  cancelButtonText: "Cancel",
});

if (!result.isConfirmed) return;

  try {
    await api.patch(
      `/api/admin/products/toggle/${product._id}`,
      {},
      { withCredentials: true }
    );

    showMessage(
  product.isActive
    ? "Product blocked successfully"
    : "Product unblocked successfully"
);

    fetchProducts();
  } catch (error) {
    showMessage(
  error.response?.data?.message || "Something went wrong",
  "danger"
);
  }
};


  useEffect(() => {
    fetchProducts();
  }, [debouncedSearch, filter, page]);

  return (
    <div style={{ background: "#f6f6f7", minHeight: "100vh" }}>
      <Container fluid className="py-4">
        <Row className="g-4">
          <Col md={3} lg={2}>
            <AdminSidebar />
          </Col>

          <Col>
            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h3 className="fw-semibold mb-1">Products</h3>
                <div className="text-muted small">
                  Dashboard &nbsp;›&nbsp; Product List
                </div>
              </div>

              <Button
                className="create-category-btn"
                onClick={() => navigate("/admin/products/add")}
              >
                + Add Product
              </Button>
            </div>

            {/* SEARCH */}
            <InputGroup className="mb-3" style={{ maxWidth: 400 }}>
              <Form.Control
                placeholder="Search product..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
                  {search && (
  <Button
    variant="light"
    onClick={() => {
      setSearch("");
     setPage(1);
    }}
  >
    ❌
  </Button>
)}
            </InputGroup>
            

            {/* FILTER */}
            <div className="d-flex gap-2 mb-4">
              <Button
                variant={filter === "all" ? "primary" : "light"}
                onClick={() => setFilter("all")}
              >
                All Products
              </Button>
              <Button
                variant={filter === "instock" ? "primary" : "light"}
                onClick={() => setFilter("instock")}
              >
                In Stock
              </Button>
              <Button
                variant={filter === "outofstock" ? "primary" : "light"}
                onClick={() => setFilter("outofstock")}
              >
                Out of Stock
              </Button>
            </div>

            {/* TABLE */}
            <Card className="admin-card">
              <Table responsive className="mb-0 align-middle">
                <thead className="table-head">
                  <tr>
                    <th className="ps-4">Product</th>
                    <th>Category</th>
                    <th>Stock</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Added</th>
                    <th className="text-end pe-4">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((p) => {
                    const productImage =
                      p.variants?.find(v => v.images?.length > 0)?.images[0];

                    const stock = p.variants?.reduce((total,v)=>total+(v.stock||0),0)??0;
                    const price = p.variants?.[0]?.price ?? 0;

                    return (
                      <tr key={p._id}>
                        <td className="ps-4 d-flex align-items-center gap-3">
                          <img
                            src={productImage || "/images/placeholder.png"}
                            alt={p.name}
                            className="category-img"
                          />
                          {p.name}
                        </td>

                        <td>{p.category?.name}</td>
                        <td>{stock}</td>
                        <td>₹{price}</td>
                        <td>
                          {stock > 0 ? (
                            <span className="badge bg-success">In Stock</span>
                          ) : (
                            <span className="badge bg-danger">Out of Stock</span>
                          )}
                        </td>

                        <td>
                          {new Date(p.createdAt).toLocaleDateString("en-GB")}
                        </td>
                        <td className="text-end pe-4">
                          <span
                            style={{
                              cursor: p.isActive ? "pointer" : "not-allowed",
                              opacity: p.isActive ? 1 : 0.4,
                            }}
                            onClick={() =>
                              p.isActive &&
                              navigate(`/admin/products/edit/${p._id}`)
                            }
                            title={
                              p.isActive
                                ? "Edit Product"
                                : "Blocked product"
                            }
                          >
                            ✏️
                          </span>

                          &nbsp;&nbsp;

                          <span
                            style={{
                              cursor: "pointer",
                              color: p.isActive ? "red" : "green",
                            }}
                            onClick={() => handleToggleStatus(p)}
                            title={
                              p.isActive
                                ? "Block Product"
                                : "Unblock Product"
                            }
                          >
                            {p.isActive ? "BLOCK" : "UNBLOCK"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>

              <div className="table-footer">
                <span className="text-muted small">
                  Showing page {page} of {totalPages}
                </span>

                <div className="d-flex gap-2">
                  <Button
                    className="page-btn"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    ←
                  </Button>

                  <Button className="page-btn active">{page}</Button>

                  <Button
                    className="page-btn"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    →
                  </Button>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>

      <CustomToast
  show={showToast}
  setShow={setShowToast}
  message={toastMsg}
  type={toastType}
/>
    </div>
  );
};

export default AdminProducts;
