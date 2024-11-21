import React, { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import axiosInstance from "../resources/axiosInstance";
import { Box } from "@chakra-ui/react";
import { SpinnerIcon } from "@chakra-ui/icons";

const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axiosInstance.get(`/auth/verify`, {
                    withCredentials: true,
                });
                setIsAuthenticated(true);

                if (window.location.pathname === "/login") {
                    const user = response.data.user;
                    navigate("/dashboard", { state: { uid: user._id, name: user.name, email: user.email } })
                }
            } catch {
                setIsAuthenticated(false);
            }
        };

        checkAuth();
    });

    if (isAuthenticated === null) {
        return <Box>
            <SpinnerIcon />
        </Box>; // Optional loading state
    } else {
        return isAuthenticated ? children : <Navigate to="/login" replace />;
    }

};

export default ProtectedRoute;
