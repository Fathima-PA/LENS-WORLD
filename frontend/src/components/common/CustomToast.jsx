import { Toast, ToastContainer } from "react-bootstrap";

const CustomToast = ({ show, setShow, message, type }) => {
  return (
    <ToastContainer position="top-center">
      <Toast
        show={show}
        onClose={() => setShow(false)}
        delay={2000}
        autohide
        bg={type}
      >
        <Toast.Body className="text-white text-center fw-semibold">
          {message}
        </Toast.Body>
      </Toast>
    </ToastContainer>
  );
};

export default CustomToast;