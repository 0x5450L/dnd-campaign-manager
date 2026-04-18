import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const NotFoundRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;

    if (idx > 0) {
      navigate(-1);
    } else {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  return null;
};

export default NotFoundRedirect;
