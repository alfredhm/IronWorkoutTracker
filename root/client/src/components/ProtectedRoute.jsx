import React, { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import axios from "axios";

const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/auth/verify", {
                    withCredentials: true,
                });
                setIsAuthenticated(true);

                if (window.location.pathname === "/login") {
                    const user = response.data.user;
                    navigate("/dashboard", { state: { uid: user._id, name: user.name, email: user.email } })
                }
            } catch {
                setIsAuthenticated(false);
                window.location.reload()
            }
        };

        checkAuth();
    });

    if (isAuthenticated === null) {
        return <div>Loading...</div>; // Optional loading state
    } else {
        return isAuthenticated ? children : <Navigate to="/login" replace />;
    }

};

export default ProtectedRoute;
