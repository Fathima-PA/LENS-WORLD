import { useEffect, useState } from "react";
import { Container, Table, Button, Form, Modal, Pagination } from "react-bootstrap";
import AdminSidebar from "../../components/admin/AdminSidebar";
import CustomToast from "../../components/common/CustomToast";
import api from "../../api";
const AdminCoupons = () => {

  const [coupons, setCoupons] = useState([]);
  const [showModal, setShowModal] = useState(false);
const [editId, setEditId] = useState(null);
const [isEdit, setIsEdit] = useState(false);
const [search, setSearch] = useState("");
const [debouncedSearch, setDebouncedSearch] = useState("");
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [showToast, setShowToast] = useState(false);
const [toastMsg, setToastMsg] = useState("");
const [toastType, setToastType] = useState("success");
const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minPurchase: "",
    maxDiscount: "",
    expiryDate: ""
  });



  const showMessage = (msg, type = "success") => {
  setToastMsg(msg);
  setToastType(type);
  setShowToast(true);
};
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search);
  }, 500);

  return () => clearTimeout(timer);
}, [search]);

const validateForm = () => {
  let newErrors = {};

  
  const code = formData.code.trim();

  if (!code) {
    newErrors.code = "Coupon code is required";
  } else if (!/^[A-Z0-9]+$/.test(code.toUpperCase())) {
    newErrors.code = "Only uppercase letters & numbers allowed";
  } else if (code.length < 4) {
    newErrors.code = "Minimum 4 characters required";
  }


  const discount = Number(formData.discountValue);

  if (!discount) {
    newErrors.discountValue = "Discount value is required";
  } else if (discount <= 0) {
    newErrors.discountValue = "Must be greater than 0";
  } else if (
    formData.discountType === "percentage" &&
    discount > 100
  ) {
    newErrors.discountValue = "Percentage cannot exceed 100";
  }

 
  const minPurchase = Number(formData.minPurchase);

  if (!minPurchase) {
    newErrors.minPurchase = "Minimum purchase is required";
  } else if (minPurchase <= 0) {
    newErrors.minPurchase = "Must be greater than 0";
  }

  const maxDiscount = Number(formData.maxDiscount);

  if (formData.discountType === "percentage") {
    if (!maxDiscount) {
      newErrors.maxDiscount = "Maximum discount is required";
    } else if (maxDiscount <= 0) {
      newErrors.maxDiscount = "Must be greater than 0";
    }
  }

  if (
    formData.discountType === "flat" &&
    discount >= minPurchase
  ) {
    newErrors.discountValue =
      "Flat discount must be less than minimum purchase";
  }

  if (!formData.expiryDate) {
    newErrors.expiryDate = "Expiry date is required";
  } else {
    const today = new Date();
    const selectedDate = new Date(formData.expiryDate);

    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      newErrors.expiryDate = "Expiry date cannot be in the past";
    }
  }

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0;
};


  // FETCH COUPONS
  const fetchCoupons = async () => {
  try {

    const res = await api.get(
      "/api/admin/coupons",
      {
        params: {
          page: currentPage,
          limit: 5,
          search: debouncedSearch
        },
        withCredentials: true
      }
    );

    if (res.data.success) {
      setCoupons(res.data.coupons);
      setTotalPages(res.data.totalPages);
    }

  } catch (error) {
    console.log(error);
  }
};

 useEffect(() => {
  fetchCoupons();
}, [currentPage, debouncedSearch]);

  // CREATE COUPON
  const createCoupon = async () => {

    try {

      const res = await api.post(
        "/api/admin/create-coupon",
        formData,
        { withCredentials: true }
      );

      if (res.data.success) {

        showMessage("Coupon created successfully");

        setShowModal(false);

        fetchCoupons();

        setFormData({
          code: "",
          discountType: "percentage",
          discountValue: "",
          minPurchase: "",
          maxDiscount: "",
          expiryDate: ""
        });

      } else {
       showMessage(res.data.message, "danger");
      }

    } catch (error) {
      console.log(error);
    }

  };

  // DELETE COUPON
  const toggleCoupon = async (id) => {

    try {

      const res = await api.patch(
        `/api/admin/toggle-coupon/${id}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        showMessage("Coupon status updated successfully");
        fetchCoupons();
      }

    } catch (error) {
       showMessage("Something went wrong", "danger");
        console.log(error);
    }

  };

  const updateCoupon = async () => {

  try {

    const res = await api.put(
      `/api/admin/update-coupon/${editId}`,
      formData,
      { withCredentials: true }
    );

    if (res.data.success) {

      showMessage("Coupon updated successfully");

      setShowModal(false);
      setIsEdit(false);

      fetchCoupons();

      setFormData({
        code: "",
        discountType: "percentage",
        discountValue: "",
        minPurchase: "",
        maxDiscount: "",
        expiryDate: ""
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

        <h3 className="fw-bold">Coupons</h3>
        <p className="text-muted">Dashboard › Coupons</p>

       <div className="d-flex justify-content-between mb-3">

  <Form.Control
  type="search"
  placeholder="Search coupon..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  style={{ width: "320px" }}
/>

  <Button
    variant="primary"
    onClick={() => setShowModal(true)}
  >
    + Create Coupon
  </Button>

</div>

        {/* COUPON TABLE */}
        <div className="bg-white p-3 rounded shadow-sm">

          <Table hover>

            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Min Purchase</th>
                <th>Max Discount</th>
                <th>Expiry</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {coupons.length === 0 ? (

                <tr>
                  <td colSpan="6" className="text-center">
                    No Coupons Found
                  </td>
                </tr>

              ) : (

                coupons.map((coupon) => (

                  <tr key={coupon._id}>

                    <td>{coupon.code}</td>

                    <td>
                      {coupon.discountType === "percentage"
                        ? `${coupon.discountValue}%`
                        : `₹${coupon.discountValue}`}
                    </td>

                    <td>₹{coupon.minPurchase}</td>

                    <td>₹{coupon.maxDiscount}</td>

                    <td>
                      {new Date(coupon.expiryDate).toLocaleDateString()}
                    </td>
                  <td>
{coupon.isActive ? (
<span className="text-success fw-semibold">Active</span>
) : (
<span className="text-danger fw-semibold">Blocked</span>
)}
</td>

                   <td>

<Button
size="sm"
variant="warning"
className="me-2"
onClick={() => {
  setIsEdit(true);
  setEditId(coupon._id);
  setShowModal(true);

  setFormData({
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    minPurchase: coupon.minPurchase,
    maxDiscount: coupon.maxDiscount,
    expiryDate: coupon.expiryDate.split("T")[0]
  });
}}
>
Edit
</Button>

<Button
size="sm"
variant={coupon.isActive ? "danger" : "success"}
onClick={() => toggleCoupon(coupon._id)}
>
{coupon.isActive ? "Block" : "Unblock"}
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

        </div>

      </Container>

      {/* CREATE COUPON MODAL */}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>

        <Modal.Header closeButton>
          <Modal.Title>
{isEdit ? "Edit Coupon" : "Create Coupon"}
</Modal.Title>
        </Modal.Header>

        <Modal.Body>

          <Form.Group className="mb-3">
            <Form.Label>Coupon Code</Form.Label>

            <Form.Control
              type="text"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
            />
            {errors.code && (
  <small className="text-danger">{errors.code}</small>
)}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Discount Type</Form.Label>

            <Form.Select
              value={formData.discountType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  discountType: e.target.value,
                    maxDiscount:
      e.target.value === "flat" ? "" : formData.maxDiscount
                })
              }
            >
              <option value="percentage">Percentage (%)</option>
              <option value="flat">Flat (₹)</option>
            </Form.Select>
                 {errors.code && (
  <small className="text-danger">{errors.code}</small>
)}

          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Discount Value</Form.Label>

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
            <Form.Label>Minimum Purchase</Form.Label>

            <Form.Control
              type="number"
              value={formData.minPurchase}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  minPurchase: e.target.value
                })
              }
            />
      {errors.minPurchase && (
  <small className="text-danger">{errors.minPurchase}</small>
)}
          </Form.Group>

          {formData.discountType === "percentage" && (
  <Form.Group className="mb-3">
    <Form.Label>Maximum Discount</Form.Label>

    <Form.Control
      type="number"
      value={formData.maxDiscount}
      onChange={(e) =>
        setFormData({
          ...formData,
          maxDiscount: e.target.value
        })
      }
    />

    {errors.maxDiscount && (
      <small className="text-danger">{errors.maxDiscount}</small>
    )}
  </Form.Group>
)}

          <Form.Group className="mb-3">
            <Form.Label>Expiry Date</Form.Label>

            <Form.Control
              type="date"
              value={formData.expiryDate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  expiryDate: e.target.value
                })
              }
            />
       {errors.expiryDate && (
  <small className="text-danger">{errors.expiryDate}</small>
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
  if (!validateForm()) return;

  if (isEdit) {
    updateCoupon();
  } else {
    createCoupon();
  }
}}
>
{isEdit ? "Update" : "Create"}
</Button>

        </Modal.Footer>

      </Modal>
      <CustomToast
  show={showToast}
  setShow={setShowToast}
  message={toastMsg}
  type={toastType}
/>

    </div>
  );
};

export default AdminCoupons;