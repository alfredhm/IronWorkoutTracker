import { createBrowserRouter } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard/Dashboard";
import Register from "./pages/Register";
import ForgotPassword from "./pages/PasswordReset/ForgotPassword";
import VerifyReset from "./pages/PasswordReset/ResetPassword";
import NewPassword from "./pages/PasswordReset/NewPassword";
import ProtectedRoute from "./components/ProtectedRoute"; // Import ProtectedRoute

const router = createBrowserRouter([
    {
        path: "/",
        children: [
            { index: true, element: <HomePage /> },
            { 
                path: "login", 
                element: <LoginPage /> 
            },
            {
                path: "register",
                element: <Register />
            },
            {
                path: "reset-password/",
                children: [
                    { index: true, element: <ForgotPassword /> },
                    {
                        path: ":id/:token",
                        element: <VerifyReset />
                    }
                ]
            },
            {
                path: "new-password/:id/:token",
                element: <NewPassword />
            },
            { 
                path: "dashboard", 
                element: (
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                )
            }
        ]
    }
]);

export default router;
