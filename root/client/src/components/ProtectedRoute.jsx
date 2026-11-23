import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import axios from "axios";

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/auth/verify",
          {
            withCredentials: true,
          },
        );
        setIsAuthenticated(true);

        const user = response.data.user;
        if (
          !location.state?.uid ||
          !location.state?.name ||
          !location.state?.email
        ) {
          navigate(location.pathname, {
            replace: true,
            state: {
              ...location.state,
              uid: user.id,
              name: user.name,
              email: user.email,
            },
          });
        }
      } catch {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [location.pathname, location.state, navigate]);

  if (isAuthenticated === null) {
    // Wait for verification before rendering protected content or redirecting.
    return <div>Loading...</div>;
  } else {
    return isAuthenticated ? children : <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
