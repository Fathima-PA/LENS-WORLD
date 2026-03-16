import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Modal,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import AdminSidebar from "../../components/admin/AdminSidebar";
import "../../styles/AdminCategories.css";
import { getCroppedImage } from "../../data/cropImage";
import ImageCropModal from "../../components/admin/ImageCropModal";
import CustomToast from "../../components/common/CustomToast";

const AddProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);

  const [variants, setVariants] = useState([]);

  const [showVariantModal, setShowVariantModal] = useState(false);
  const [variantName, setVariantName] = useState("");
  const [color, setColor] = useState("#000000");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [editVariantIndex, setEditVariantIndex] = useState(null);

  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [cropIndex, setCropIndex] = useState(null);

  const [showToast, setShowToast] = useState(false);
const [toastMsg, setToastMsg] = useState("");
const [toastType, setToastType] = useState("success");


const showMessage = (msg, type = "success") => {
  setToastMsg(msg);
  setToastType(type);
  setShowToast(true);
};
  useEffect(() => {
    if (!isEdit) return;

    const fetchProduct = async () => {
      const res = await axios.get(
        `http://localhost:3000/api/admin/products/${id}`,
        { withCredentials: true }
      );

      const product = res.data;

      setName(product.name);
      setBrand(product.brand);
      setDescription(product.description);
      setCategory(product.category?._id);

      setVariants(
        product.variants.map((v) => ({
          id: v._id,
          name: v.name,
          color: v.color || "#000000",
          price: v.price,
          stock: v.stock,
          images: v.images || [],
          isNew: false,
        }))
      );
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await axios.get(
        "http://localhost:3000/api/admin/categories",
        { withCredentials: true }
      );
      setCategories(res.data.data);
    };
    fetchCategories();
  }, []);
const handleAddVariant = () => {

  const validImages = images.filter(img => img);

  if (!variantName || !price || !stock || !color) {
    showMessage("Variant name, color, price & stock required", "danger");
    return;
  }

  
  if (editVariantIndex === null && validImages.length !== 3) {
    showMessage("New variant must have exactly 3 images", "danger");
    return;
  }


  if (editVariantIndex !== null && validImages.length !== 3) {
    showMessage("Variant must contain 3 images", "danger");
    return;
  }

  const newVariant = {
    id:
      editVariantIndex !== null
        ? variants[editVariantIndex].id
        : Date.now(),
    name: variantName,
    color,
    price,
    stock,
    images: validImages,
    isNew: editVariantIndex === null, 
  };

  if (editVariantIndex !== null) {
    const updated = [...variants];
    updated[editVariantIndex] = newVariant;
    setVariants(updated);
  } else {
    setVariants(prev => [...prev, newVariant]);
  }

  setVariantName("");
  setColor("#000000");
  setPrice("");
  setStock("");
  setImages([]);
  setPreviews([]);
  setEditVariantIndex(null);
  setShowVariantModal(false);
};


  const handleEditVariant = (index) => {
    const v = variants[index];
    setVariantName(v.name);
    setColor(v.color);
    setPrice(v.price);
    setStock(v.stock);
    setImages(v.images || []);
    setPreviews(
      (v.images || []).map((img) =>
        typeof img === "string" ? img : URL.createObjectURL(img)
      )
    );
    setEditVariantIndex(index);
    setShowVariantModal(true);
  };


  const closeVariantModal = () => {
    setShowVariantModal(false);
    setImages([]);
    setPreviews([]);
    if (editVariantIndex === null) {
  setColor("#000000");
}
 setEditVariantIndex(null);
  };

  const handleSaveProduct = async () => {
    if (!name || !brand || !description || !category) {
      showMessage("All product fields required", "danger");
      return;
    }

    if (variants.length === 0) {
      showMessage("Add at least one variant", "danger");
      return;
    }

    const formData = new FormData();

    formData.append("name", name);
    formData.append("brand", brand);
    formData.append("description", description);
    formData.append("category", category);

    formData.append(
      "variants",
      JSON.stringify(
       variants.map((v) => ({
  id: v.id,
  name: v.name,
  color: v.color,
  price: v.price,
  stock: v.stock,
  isNew: v.isNew,
}))

      )
    );

    variants.forEach((v) => {
      v.images.forEach((img) => {
        if (img instanceof File) formData.append("images", img);
      });
    });

    try {
      if (isEdit) {
        await axios.put(
          `http://localhost:3000/api/admin/products/${id}`,
          formData,
          { withCredentials: true }
        );
       showMessage("Product updated successfully");
      } else {
        await axios.post(
          "http://localhost:3000/api/admin/products",
          formData,
          { withCredentials: true }
        );
        showMessage("Product created successfully");
      }
     setTimeout(() => {
  navigate("/admin/products");
}, 1200);
    } catch (err) {
      showMessage(err.response?.data?.message || "Save failed", "danger");
    }
  };


const handleRemoveImage = (index) => {
  setImages(prev => {
    const updated = [...prev];
    updated[index] = null;
    return updated;
  });

  setPreviews(prev => {
    const updated = [...prev];
    updated[index] = null;
    return updated;
  });
};


  const handleCropDone = async (croppedArea) => {
    const croppedFile = await getCroppedImage(cropImageSrc, croppedArea);

    setImages((prev) => {
      const updated = [...prev];
      updated[cropIndex] = croppedFile;
      return updated;
    });

    setPreviews((prev) => {
      const updated = [...prev];
      updated[cropIndex] = URL.createObjectURL(croppedFile);
      return updated;
    });

    setShowCropModal(false);
  };

  return (
    <div style={{ background: "#f6f6f7", minHeight: "100vh" }}>
      <Container fluid className="py-4">
        <Row className="g-4">
          <Col md={3} lg={2}>
            <AdminSidebar />
          </Col>

          <Col>
            <div className="d-flex justify-content-between mb-4">
              <h3>{isEdit ? "Edit Product" : "Add Product"}</h3>
              
              <Button onClick={handleSaveProduct}>
                {isEdit ? "UPDATE" : "SAVE"}
              </Button>
            </div>

            <Card className="p-4 mb-4">
              <Form.Control
                className="mb-3"
                placeholder="Product name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Form.Control
                className="mb-3"
                placeholder="Brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Form.Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select category</option>
                {categories.filter((c)=>c.isActive).map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </Form.Select>
            </Card>

            <Card className="p-4">
              <div className="d-flex justify-content-between mb-3">
                <h5>Variants</h5>
                <Button onClick={() => setShowVariantModal(true)}>
                  + Add Variant
                </Button>
              </div>

              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Color</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v, i) => (
                    <tr key={v.id}>
                      <td>{v.name}</td>
                      <td>
                        <div
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            background: v.color,
                          }}
                        />
                      </td>
                      <td>₹{v.price}</td>
                      <td>{v.stock}</td>
                      <td>
                        <Button size="sm" onClick={() => handleEditVariant(i)}>
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* VARIANT MODAL */}
      <Modal show={showVariantModal} onHide={closeVariantModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editVariantIndex !== null ? "Edit Variant" : "Add Variant"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Control
            className="mb-2"
            placeholder="Variant name"
            value={variantName}
            onChange={(e) => setVariantName(e.target.value)}
          />

          <Form.Group className="mb-2">
            <Form.Label>Color</Form.Label>
            <Form.Control
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </Form.Group>

          <Form.Control
            className="mb-2"
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <Form.Control
            className="mb-3"
            type="number"
            placeholder="Stock"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />

          <Form.Group className="mb-3">
            <Form.Label>Upload 3 Images</Form.Label>

            <div className="d-flex gap-3">
              {[0, 1, 2].map((index) => (
                <div key={index}>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;

                      const previewUrl = URL.createObjectURL(file);
                      setCropImageSrc(previewUrl);
                      setCropIndex(index);
                      setShowCropModal(true);
                    }}
                  />
{previews[index] && (
  <div style={{ position: "relative", marginTop: 6 }}>
    <img
      src={previews[index]}
      alt="preview"
      style={{
        width: 90,
        height: 90,
        objectFit: "cover",
        borderRadius: 8,
      }}
    />

    <button
      type="button"
      onClick={() => handleRemoveImage(index)}
      style={{
        position: "absolute",
        top: -8,
        right: -8,
        background: "red",
        color: "white",
        border: "none",
        borderRadius: "50%",
        width: 22,
        height: 22,
        fontSize: 12,
        cursor: "pointer"
      }}
    >
      ✕
    </button>
  </div>
)}

                </div>
              ))}
            </div>

            <small className="text-muted d-block mt-2">
              Exactly 3 images are required
            </small>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={handleAddVariant}>
            {editVariantIndex !== null ? "Update Variant" : "Save Variant"}
          </Button>
        </Modal.Footer>
      </Modal>

      {showCropModal && (
        <ImageCropModal
          image={cropImageSrc}
          onCancel={() => setShowCropModal(false)}
          onDone={handleCropDone}
        />
      )}

      <CustomToast
  show={showToast}
  setShow={setShowToast}
  message={toastMsg}
  type={toastType}
/>
    </div>
  );
};

export default AddProduct;
