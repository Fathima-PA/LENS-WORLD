import { useNavigate, useParams } from "react-router-dom";
import api from "../../api";

const PaymentFailed = () => {

  const navigate = useNavigate();
  const { orderId } = useParams();

  const retryPayment = async ()=>{

    try{

      const res = await api.post(`/api/order/retry-payment/${orderId}`);

      const { razorpayOrder } = res.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: "INR",
        name: "LensWorld Opticals",
        description: "Retry Payment",
        order_id: razorpayOrder.id,

        handler: async function (response) {

          const verify = await api.post("/api/order/verify-payment",{
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            orderId
          });

          if(verify.data.success){
            navigate(`/order-success/${orderId}`);
          }

        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    }catch(err){
      console.log(err);
    }

  };

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
          onClick={retryPayment}
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