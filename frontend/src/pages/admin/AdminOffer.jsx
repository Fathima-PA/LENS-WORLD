import { useState, useEffect } from "react";
import { Container, Table, Button, Form, Badge, Modal, Pagination } from "react-bootstrap";
import AdminSidebar from "../../components/admin/AdminSidebar";
import axios from "axios";
import CustomToast from "../../components/common/CustomToast";
import api from "../../api";


const AdminOffers = () => {
const [isEdit, setIsEdit] = useState(false);
const [editId, setEditId] = useState(null);
  const [activeTab, setActiveTab] = useState("product");
  const [offers, setOffers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState([]);
const [categories, setCategories] = useState([]);
const [search, setSearch] = useState("");
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [formData, setFormData] = useState({
  title: "",
  product: "",
  category: "",
  discountType: "percentage",
  discountValue: "",
  startDate: "",
  endDate: ""
});
const [showToast, setShowToast] = useState(false);
const [toastMsg, setToastMsg] = useState("");
const [toastType, setToastType] = useState("success");
const [errors, setErrors] = useState({});

useEffect(() => {
  fetchProducts();
  fetchCategories();
}, []);


const showMessage = (msg, type = "success") => {
  setToastMsg(msg);
  setToastType(type);
  setShowToast(true);
};

const validateForm = () => {
  
  let newErrors = {};

  const title = formData.title.trim();

  if (!title) {
    newErrors.title = "Offer title is required";
  } else if (!/[a-zA-Z0-9]/.test(title)) {
    newErrors.title = "Title must contain valid characters";
  } else if (title.length < 3) {
    newErrors.title = "Title must be at least 3 characters";
  }

  
  if (activeTab === "product" && !formData.product) {
    newErrors.product = "Please select a product";
  }

  if (activeTab === "category" && !formData.category) {
    newErrors.category = "Please select a category";
  }

  
  const discount = Number(formData.discountValue);

if (!discount) {
  newErrors.discountValue = "Discount is required";
} 
else if (discount <= 0) {
  newErrors.discountValue = "Must be greater than 0";
} 


if (formData.discountType === "percentage") {
  if (discount > 50) {
    newErrors.discountValue = "Percentage cannot exceed 50%";
  }
}


if (formData.discountType === "flat") {
  if (discount < 1) {
    newErrors.discountValue = "Flat discount must be at least ₹1";
  }

  if (activeTab === "product") {
  const selectedProduct = products.find(
    (p) => p._id === formData.product
  );

  if (selectedProduct) {
    const price = selectedProduct?.variants?.[0]?.price;
    if (!price) {
      newErrors.discountValue = "Invalid product price";
    } else {
      if (discount >= price) {
        newErrors.discountValue =
          "Flat discount must be less than product price";
      }

      const finalPrice = price - discount;

      if (finalPrice < 100) {
        newErrors.discountValue =
          "Final price cannot be less than ₹100";
      }
  }
}
  }
}
  
  if (!formData.startDate) {
    newErrors.startDate = "Start date required";
  }

  if (!formData.endDate) {
    newErrors.endDate = "End date required";
  }

  if (formData.startDate && formData.endDate) {
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (start < today) {
      newErrors.startDate = "Start date cannot be in the past";
    }

    if (end < today) {
      newErrors.endDate = "End date cannot be in the past";
    }

    if (start > end) {
      newErrors.endDate = "End date must be after start date";
    }
  }

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0;
};

const fetchProducts = async () => {
  try {

    const res = await api.get("/api/admin/products",{
          withCredentials: true,
    }); 
      setProducts(res.data.data);

  } catch (error) {
    console.log(error);
  }
};

const fetchCategories = async () => {
  try {

    const res = await api.get("/api/admin/categories",{
          withCredentials: true,
    });

    
      setCategories(res.data.data);
    

  } catch (error) {
    console.log(error);
  }
};
  // Fetch offers
 const fetchOffers = async () => {
  try {

    const res = await api.get(
      `/api/admin/offers`,
      { withCredentials: true,params:{
        type: activeTab,
            page: currentPage,
          limit: 5,
          search: search
          } }
    );

      setOffers(res.data.offers);
    

  } catch (error) {
    console.log(error);
  }
};

  useEffect(() => {
    fetchOffers();
  }, [activeTab, currentPage, search]);


  const toggleOffer = async (id) => {

    try {

      const res = await api.patch(
  `/api/admin/toggle-offer/${id}`,
  {},
  { withCredentials: true }
);

      if (res.data.success) {
        showMessage("Offer status updated successfully");
        fetchOffers();
      }

    } catch (error) {
      showMessage("Something went wrong", "danger");
    }

  };

  const createOffer = async () => {
  try {

   const payload = {
  title: formData.title,
  type: activeTab,   
  discountType: formData.discountType,
  discountValue: formData.discountValue,
  startDate: formData.startDate,
  endDate: formData.endDate
};

if (activeTab === "product") {
  payload.product = formData.product;
} else {
  payload.category = formData.category;
}

    const res = await api.post(
      "/api/admin/add-offer",
      payload,
      { withCredentials: true }
    );

if (!res.data.success) {
     showMessage(res.data.message, "danger");
      return;
    }

    showMessage("Offer created successfully");

      setShowModal(false);

      fetchOffers();

      setFormData({
        title: "",
        product: "",
        category: "",
        discountValue: "",
        discountType: "percentage",
        startDate: "",
        endDate: ""
      });

    

  } catch (error) {
    console.log(error);
  }
};

  const updateOffer = async () => {
  try {

    const payload = {
      title: formData.title,
      type: activeTab,   
      discountType: formData.discountType,
      discountValue: formData.discountValue,
      startDate: formData.startDate,
      endDate: formData.endDate
    };

    if (activeTab === "product") {
      payload.product = formData.product;
    } else {
      payload.category = formData.category;
    }

    const res = await api.put(
      `/api/admin/update-offer/${editId}`,
      payload,
      { withCredentials: true }
    );

    if (res.data.success) {

      showMessage("Offer updated successfully");

      setShowModal(false);
      setIsEdit(false);

      fetchOffers();

      setFormData({
        title: "",
        product: "",
        category: "",
        discountType: "percentage",
        discountValue: "",
        startDate: "",
        endDate: ""
      });

    }

  } catch (error) {
    console.log(error);
  }
};
  return (
    <div className="d-flex">

      <AdminSidebar />

      <Container fluid className="p-4">

        <h3 className="fw-bold">Offers</h3>
        <p className="text-muted">Dashboard › Offers</p>

        {/* Search + Add */}
        <div className="d-flex justify-content-between align-items-center mb-3">

          <Form.Control
            type="search"
            placeholder="Search offer..."
            value={search}
  onChange={(e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  }}
            style={{ width: "350px" }}
          />

          {activeTab === "product" ? (
            <Button
variant="primary"
onClick={() => {
  setIsEdit(false);
  setErrors({});
  setFormData({
    title: "",
    product: "",
    category: "",
    discountType: "percentage",
    discountValue: "",
    startDate: "",
    endDate: ""
  });
  setShowModal(true);
}}
>+ Add Product Offer</Button>
          ) : (
            <Button variant="primary"  onClick={() => setShowModal(true)}>+ Add Category Offer</Button>
          )}

        </div>


        <div className="mb-3">

          <Button
            className="me-2"
            variant={activeTab === "product" ? "primary" : "light"}
            onClick={() => setActiveTab("product")}
          >
            Product Offers
          </Button>

          <Button
            variant={activeTab === "category" ? "primary" : "light"}
            onClick={() => setActiveTab("category")}
          >
            Category Offers
          </Button>

        </div>

        <div className="bg-white p-3 rounded shadow-sm">

          <Table hover>

            <thead>
              <tr>
                <th>Offer Name</th>
                <th>{activeTab === "product" ? "Product" : "Category"}</th>
                <th>Discount</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {offers.length === 0 ? (

                <tr>
                  <td colSpan="6" className="text-center">
                    No Offers Found
                  </td>
                </tr>

              ) : (

                offers.map((offer) => (

                  <tr key={offer._id}>

                    <td>{offer.title}</td>

                    <td>
                      {activeTab === "product"
                        ? offer.product?.name
                        : offer.category?.name}
                    </td>

                   <td>
  {offer.discountType === "percentage"
    ? `${offer.discountValue}%`
    : `₹${offer.discountValue}`}
</td>

                    <td>
                      {new Date(offer.startDate).toLocaleDateString()} -{" "}
                      {new Date(offer.endDate).toLocaleDateString()}
                    </td>

                    <td>
                      {offer.isActive ? (
                        <Badge bg="success">Active</Badge>
                      ) : (
                        <Badge bg="secondary">Blocked</Badge>
                      )}
                    </td>

                    <td>

                      <Button
size="sm"
variant="warning"
className="me-2"
onClick={() => {

  setIsEdit(true);
  setEditId(offer._id);
  setShowModal(true);

  setFormData({
    title: offer.title,
    product: offer.product?._id || "",
    category: offer.category?._id || "",
    discountType: offer.discountType,
    discountValue: offer.discountValue,
    startDate: offer.startDate.split("T")[0],
    endDate: offer.endDate.split("T")[0]
  });

}}
>
Edit
</Button>

<Button
size="sm"
variant={offer.isActive ? "danger" : "success"}
onClick={() => toggleOffer(offer._id)}
>
{offer.isActive ? "Block" : "Unblock"}
</Button>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </Table>
          <div className="d-flex justify-content-end mt-3">
          <Pagination>

    <Pagination.Prev
      disabled={currentPage === 1}
      onClick={() => setCurrentPage(currentPage - 1)}
    />

    {[...Array(totalPages)].map((_, index) => (

      <Pagination.Item
        key={index}
        active={currentPage === index + 1}
        onClick={() => setCurrentPage(index + 1)}
      >
        {index + 1}
      </Pagination.Item>

    ))}

    <Pagination.Next
      disabled={currentPage === totalPages}
      onClick={() => setCurrentPage(currentPage + 1)}
    />

  </Pagination>
  </div>
          <Modal show={showModal} onHide={() => setShowModal(false)} centered>

  <Modal.Header closeButton>
    <Modal.Title>
{isEdit ? "Edit Offer" : "Add Offer"}
</Modal.Title>
  </Modal.Header>

  <Modal.Body>

    <Form.Group className="mb-3">
      <Form.Label>Title</Form.Label>
      <Form.Control
        type="text"
        value={formData.title}
        onChange={(e) =>
          setFormData({ ...formData, title: e.target.value })
        }
      />
      {errors.title && <small className="text-danger">{errors.title}</small>}
    </Form.Group>

    {activeTab === "product" ? (

      <Form.Group className="mb-3">
        <Form.Label>Product</Form.Label>
        <Form.Select
        value={formData.product}
  onChange={(e) =>
    setFormData({ ...formData, product: e.target.value })
  }
>

<option>Select Product</option>

{products.map((product) => (

<option key={product._id} value={product._id}>
{product.name}
</option>

))}

</Form.Select>
{errors.product && <small className="text-danger">{errors.product}</small>}
      </Form.Group>

    ) : (

      <Form.Group className="mb-3">
        <Form.Label>Category</Form.Label>
        <Form.Select
        value={formData.category}
  onChange={(e) =>
    setFormData({ ...formData, category: e.target.value })
  }
>

<option>Select Category</option>

{categories.map((cat) => (

<option key={cat._id} value={cat._id}>
{cat.name}
</option>

))}

</Form.Select>
{errors.category && (
  <small className="text-danger">{errors.category}</small>
)}
      </Form.Group>

    )}

<Form.Group className="mb-3">
  <Form.Label>Discount Type</Form.Label>

  <Form.Select
    value={formData.discountType}
    onChange={(e) =>
      setFormData({ ...formData, discountType: e.target.value })
    }
  >
    <option value="percentage">Percentage (%)</option>
    <option value="flat">Flat Amount (₹)</option>
  </Form.Select>

</Form.Group>
    {/* Discount */}
   <Form.Group className="mb-3">
  <Form.Label>
    Discount Value {formData.discountType === "percentage" ? "(%)" : "(₹)"}
  </Form.Label>

  <Form.Control
    type="number"
    value={formData.discountValue}
    onChange={(e) =>
      setFormData({
        ...formData,
        discountValue: e.target.value
      })
    }
  />
  {errors.discountValue && (
  <small className="text-danger">{errors.discountValue}</small>
)}
</Form.Group>

    <Form.Group className="mb-3">
      <Form.Label>Start Date</Form.Label>
      <Form.Control
        type="date"
        value={formData.startDate}
        onChange={(e) =>
          setFormData({ ...formData, startDate: e.target.value })
        }
      />
      {errors.startDate && (
  <small className="text-danger">{errors.startDate}</small>
)}
    </Form.Group>

   
    <Form.Group className="mb-3">
      <Form.Label>End Date</Form.Label>
      <Form.Control
        type="date"
        value={formData.endDate}
        onChange={(e) =>
          setFormData({ ...formData, endDate: e.target.value })
        }
      />
      {errors.endDate && (
  <small className="text-danger">{errors.endDate}</small>
)}
    </Form.Group>

  </Modal.Body>

  <Modal.Footer>

    <Button
      variant="secondary"
      onClick={() => setShowModal(false)}
    >
      Cancel
    </Button>

    <Button
variant="primary"
onClick={() => {
 const isValid = validateForm();  
    console.log(isValid);

    if (!isValid) return;

  if (isEdit) {
    updateOffer();
  } else {
    createOffer();
  }
}}
>
{isEdit ? "Update" : "Create"}
</Button>

  </Modal.Footer>

</Modal>

        </div>

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

export default AdminOffers;