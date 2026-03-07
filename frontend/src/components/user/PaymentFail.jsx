import { useNavigate } from "react-router-dom";

const PaymentFailed = () => {

  const navigate = useNavigate();

  return (
    <div className="container text-center py-5">

      <div style={{fontSize:"70px", color:"red"}}>❌</div>

      <h2 className="mt-3">Payment Failed</h2>

      <p className="text-muted">
        Something went wrong while processing your payment.
      </p>

      <div className="mt-4">

        <button
          className="btn btn-dark me-3"
          onClick={()=>navigate("/checkout")}
        >
          Retry Payment
        </button>

        <button
          className="btn btn-outline-secondary"
          onClick={()=>navigate("/profile?tab=orders")}
        >
          Go to Orders
        </button>

      </div>

    </div>
  );
};

export default PaymentFailed;