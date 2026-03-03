import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    } else if (role === "customer") {
      navigate("/customer/create");
    } else {
      navigate("/carrier/orders");
    }
  }, [isAuthenticated, role, navigate]);

  return null;
};

export default Index;
