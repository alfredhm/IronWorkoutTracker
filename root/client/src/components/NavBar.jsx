import { Button, Box, Link, Image } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const NavBar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // State to track authentication status
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState({});

    // Determine current page
    const isLoginPage = location.pathname === "/login" || location.pathname === "/register";
    const isHomePage = location.pathname === "/";

    // Function for logging out
    const logOut = async () => {
        try {
            // Call the backend to clear the session cookie
            await axios.post("http://localhost:5000/api/auth/logout", {}, { withCredentials: true });
            setIsAuthenticated(false);
            navigate("/login", { replace: true });
        } catch (error) {
            console.error("Failed to log out:", error);
        }
    };

    // Function to check authentication status
    const checkAuth = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/auth/verify", { withCredentials: true });
            setIsAuthenticated(response.data.authenticated);
            setUser(response.data.user);
        } catch (error) {
            console.error("Authentication check failed:", error);
            setIsAuthenticated(false);
        }
    };

    // Recheck authentication status on component mount
    useEffect(() => {
        if (!isLoginPage) {
            checkAuth();
        }
    }, []); 

    return (
        <Box display="flex" alignItems="center" justifyContent="space-between" w={isHomePage ? "100%" : ['100%', '100%', '700px']} py={6} px={4}>
            <Link onClick={() => {
                if (isAuthenticated) {
                    navigate("/dashboard", { state: { uid: user._id, name: user.name, email: user.email } })
                } else {
                    navigate("/")
                }
            }}>
                <Box width="70px">
                    <Image w={['50px', '50px', '60px']} h={['50px', '50px', '60px']} src={process.env.PUBLIC_URL + '/assets/dbicon.png'} />
                </Box>
            </Link>

            {!isLoginPage && (
                <>
                    {isAuthenticated ? (
                        <Button colorScheme="blue" onClick={logOut} size="md">
                            Logout
                        </Button>
                    ) : (
                        <Link href="/login">
                            <Button colorScheme="blue" size="md">
                                Login/Register
                            </Button>
                        </Link>
                    )}
                </>
            )}
        </Box>
    );
};

export default NavBar;
