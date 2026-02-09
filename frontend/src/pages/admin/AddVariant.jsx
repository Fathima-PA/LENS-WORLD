import { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import AdminSidebar from "../../components/admin/AdminSidebar";
import "../../styles/AdminCategories.css";

const AddVariant = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [stock, setStock] = useState(0);
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("active");

  const [images, setImages] = useState([null, null, null]);
  const [previews, setPreviews] = useState([null, null, null]);

  const handleImageChange = (index, file) => {
    const newImages = [...images];
    const newPreviews = [...previews];

    newImages[index] = file;
    newPreviews[index] = URL.createObjectURL(file);

    setImages(newImages);
    setPreviews(newPreviews);
  };

  const handleSaveVariant = async () => {
    if (!name || !sku || !price || images.some(img => !img)) {
      alert("All fields & 3 images are required");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("sku", sku);
      formData.append("stock", stock);
      formData.append("price", price);
      formData.append("status", status);

      images.forEach((img) => {
        formData.append("images", img);
      });

      await axios.post(
        `http://localhost:3000/api/admin/products/${productId}/variants`,
        formData,
        { withCredentials: true }
      );

      alert("Variant added successfully ");
      navigate(-1);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add variant");
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
            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-semibold">Add New Variant</h4>

              <div className="d-flex gap-2">
                <Button variant="outline-secondary" onClick={() => navigate(-1)}>
                  ✕ Cancel
                </Button>
                <Button className="create-category-btn" onClick={handleSaveVariant}>
                  Save Variant
                </Button>
              </div>
            </div>

            {/* VARIANT DETAILS */}
            <Card className="admin-card p-4 mb-4">
              <h6 className="fw-semibold mb-3">Variant Details</h6>

              <Row className="g-3">
                <Col md={6}>
                  <Form.Control
                    placeholder="Variant name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Col>

                <Col md={6}>
                  <Form.Control
                    placeholder="SKU"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                  />
                </Col>

                <Col md={6}>
                  <Form.Control
                    type="number"
                    placeholder="Initial stock"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                  />
                </Col>

                <Col md={6}>
                  <Form.Control
                    type="number"
                    placeholder="Price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </Col>

                <Col md={12}>
                  <Form.Select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Form.Select>
                </Col>
              </Row>
            </Card>

            <Card className="admin-card p-4">
              <h6 className="fw-semibold mb-3">Visuals</h6>

              <Row className="g-4">
                {[0, 1, 2].map((i) => (
                  <Col md={4} key={i}>
                    <div className="border rounded-3 p-3 text-center">
                      <p className="fw-medium mb-2">Variant Image {i + 1}</p>

                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleImageChange(i, e.target.files[0])
                        }
                      />

                      {previews[i] && (
                        <img
                          src={previews[i]}
                          alt="preview"
                          className="mt-3 rounded"
                          style={{
                            width: "100%",
                            height: 160,
                            objectFit: "cover",
                          }}
                        />
                      )}
                    </div>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AddVariant;
