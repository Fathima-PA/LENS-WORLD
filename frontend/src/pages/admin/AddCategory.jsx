import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { Toast, ToastContainer } from "react-bootstrap";

const AddCategory = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const isEdit = Boolean(id);

  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");

  useEffect(() => {
    if (!isEdit) return;

    const fetchCategory = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/admin/categories/${id}`,
          { withCredentials: true }
        );

        setName(res.data.name);
        setPreview(res.data.image);
      } catch (error) {
        setToastMsg("Failed to load category");
        setToastType("danger");
        setShowToast(true);
      }
    };

    fetchCategory();
  }, [id, isEdit]);


  const handleSubmit = async () => {

     const nameRegex = /[a-zA-Z0-9]/;

if (!nameRegex.test(name)) {
  setToastMsg("Category name must contain valid characters");
      setToastType("danger");
      setShowToast(true);
  return;
}
    if (!name) {
      setToastMsg("Category name is required");
      setToastType("danger");
      setShowToast(true);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      if (image) formData.append("image", image);

      if (isEdit) {
        await axios.put(
          `http://localhost:3000/api/admin/categories/${id}`,
          formData,
          { withCredentials: true }
        );
        setToastMsg("Category updated successfully ");
      } else {
        await axios.post(
          "http://localhost:3000/api/admin/categories",
          formData,
          { withCredentials: true }
        );
        setToastMsg("Category added successfully ");
      }

      setToastType("success");
      setShowToast(true);

      setTimeout(() => navigate("/admin/categories"), 1200);
    } catch (error) {
      setToastMsg(error.response?.data?.message || "Something went wrong");
      setToastType("danger");
      setShowToast(true);
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
              <div>
                <h3 className="fw-semibold mb-1">
                  {isEdit ? "Edit Category" : "Add Category"}
                </h3>
                <div className="text-muted small">
                  Dashboard › Categories › {isEdit ? "Edit" : "Add"} Category
                </div>
              </div>

              <div className="d-flex gap-2">
                <Button variant="outline-secondary" onClick={() => navigate(-1)}>
                  ✕ Cancel
                </Button>
                <Button className="create-category-btn" onClick={handleSubmit}>
                  {isEdit ? "Update Category" : "+ Add Category"}
                </Button>
              </div>
            </div>

            <Row className="g-4">
              {/* IMAGE */}
              <Col md={4}>
                <Card className="admin-card p-3">
                  <h6 className="fw-semibold mb-3">Thumbnail</h6>

                  <div
                    className="d-flex flex-column align-items-center justify-content-center border rounded-3 p-4"
                    style={{ minHeight: 220 }}
                  >
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        setImage(file);
                        setPreview(URL.createObjectURL(file));
                      }}
                    />

                    {preview && (
                      <img
                        src={preview}
                        alt="preview"
                        className="mt-3 rounded"
                        style={{ width: 120, height: 120, objectFit: "cover" }}
                      />
                    )}
                  </div>
                </Card>
              </Col>

              {/* NAME */}
              <Col md={8}>
                <Card className="admin-card p-4">
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      Category Name
                    </Form.Label>
                    <Form.Control
                      placeholder="Type category name here..."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </Form.Group>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>

      {/* TOAST */}
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
    </div>
  );
};

export default AddCategory;
