import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 text-center">
      <h1 className="display-3 fw-bold">404</h1>
      <p className="text-muted">Page not found</p>

      <button
        className="btn btn-dark mt-3"
        onClick={() => navigate("/")}
      >
        Go Home
      </button>
    </div>
  );
};

export default NotFound;