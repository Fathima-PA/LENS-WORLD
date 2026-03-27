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
import api from "../../api";
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

const [errors, setErrors] = useState({});
const [variantErrors, setVariantErrors] = useState({});


const showMessage = (msg, type = "success") => {
  setToastMsg(msg);
  setToastType(type);
  setShowToast(true);
};
  useEffect(() => {
    if (!isEdit) return;

    const fetchProduct = async () => {
      const res = await api.get(
        `/api/admin/products/${id}`,
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
      const res = await api.get(
        "/api/admin/categories",
        { withCredentials: true }
      );
      setCategories(res.data.data);
    };
    fetchCategories();
  }, []);
const handleAddVariant = () => {
let newErrors = {};
  const validImages = images.filter(img => img);

  
  if (!variantName.trim()) {
    newErrors.variantName = "Variant name is required";
  } else if (!/[a-zA-Z0-9]/.test(variantName)) {
    newErrors.variantName = "Invalid characters";
  } else if (variantName.trim().length < 2) {
    newErrors.variantName = "At least 2 characters required";
  }

 if (!price) {
    newErrors.price = "Price is required";
  } else if (isNaN(price) || Number(price) <= 0) {
    newErrors.price = "Must be greater than 0";
  }

 if (!stock) {
    newErrors.stock = "Stock is required";
  } else if (isNaN(stock) || Number(stock) < 0) {
    newErrors.stock = "Cannot be negative";
  }

  
 if (validImages.length !== 3) {
    newErrors.images = "Exactly 3 images required";
  }

  setVariantErrors(newErrors);

  if (Object.keys(newErrors).length > 0) return;
 
  if (editVariantIndex === null && validImages.length !== 3) {
    showMessage("New variant must have exactly 3 images", "danger");
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
    let newErrors = {};
  //   if (!name.trim() || !brand.trim() || !description.trim() || !category) {
  //   showMessage("All product fields are required", "danger");
  //   return;
  // }

 
  if (!name.trim()) {
    newErrors.name = "Product name is required";
  } else if (name.trim().length < 3) {
    newErrors.name = "Product name must be at least 3 characters";
  } else if (!/^[a-zA-Z0-9\s]+$/.test(name)) {
    newErrors.name = "Only letters and numbers allowed";
  }

    if (!brand.trim()) {
    newErrors.brand = "Brand is required";
  } else if (brand.trim().length < 2) {
    newErrors.brand = "Brand must be at least 2 characters";
  } else if (!/^[a-zA-Z0-9\s]+$/.test(brand)) {
    newErrors.brand = "Only letters and numbers allowed";
  }
  if (!description.trim()) {
    newErrors.description = "Description is required";
  } else if (description.trim().length < 5) {
    newErrors.description = "Description too short";
  }

  if (!category) {
    newErrors.category = "Category is required";
  }

  if (variants.length === 0) {
    showMessage("Add at least one variant", "danger");
    return;
  }
 setErrors(newErrors);

  if (Object.keys(newErrors).length > 0) return;

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

  variants.forEach((v, index) => {
  v.images.forEach((img) => {
    if (img instanceof File) {
      formData.append("images", img);
      formData.append("variantIndex", index); 
    }
  });
});

    try {
      if (isEdit) {
        await api.put(
          `/api/admin/products/${id}`,
          formData,
          { withCredentials: true }
        );
       showMessage("Product updated successfully");
      } else {
        await api.post(
          "/api/admin/products",
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
              {errors.name && <small className="text-danger">{errors.name}</small>}
              <Form.Control
                className="mb-3"
                placeholder="Brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
              {errors.brand && <small className="text-danger">{errors.brand}</small>}
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              {errors.description && <small className="text-danger">{errors.description}</small>}
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
              {errors.category && (
  <small className="text-danger">{errors.category}</small>
)}
            </Card>

            <Card className="p-4">
              <div className="d-flex justify-content-between mb-3">
                <h5>Variants</h5>
                <Button onClick={() => {
                  setVariantErrors({});
                  setShowVariantModal(true)
                }}>
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
          {variantErrors.variantName && (
  <small className="text-danger">{variantErrors.variantName}</small>
)}

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
    {variantErrors.price && (
  <small className="text-danger">{variantErrors.price}</small>
)}
          <Form.Control
            className="mb-3"
            type="number"
            placeholder="Stock"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
        {variantErrors.stock && (
  <small className="text-danger">{variantErrors.stock}</small>
)}
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
          {variantErrors.images && (
  <small className="text-danger">{variantErrors.images}</small>
)}
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
