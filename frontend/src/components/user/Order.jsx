import { useParams,Link } from "react-router-dom";

const OrderSuccess=()=>{
  const {id}=useParams();

  return(
    <div className="container text-center py-5">

      <h2>🎉 Thank you for your order!</h2>

      <p className="mt-3">Your order has been placed successfully.</p>

      <h5 className="mt-3">Order ID: {id}</h5>

      <div className="mt-4">
        <Link to="/orders" className="btn btn-outline-dark me-3">
          View Orders
        </Link>

        <Link to="/product" className="btn btn-dark">
          Continue Shopping
        </Link>
      </div>

    </div>
  );
};

export default OrderSuccess;
