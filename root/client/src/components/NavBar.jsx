import { Button, Box, Link, Image } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useSignOut } from "react-auth-kit"
import useIsAuthenticated from 'react-auth-kit/dist/hooks/useIsAuthenticated'
import { useNavigate } from "react-router-dom";

const NavBar = () => {

    const isAuthenticated = useIsAuthenticated()
    const signOut = useSignOut()
    const navigate = useNavigate()

    const [authState, setAuthState] = useState(isAuthenticated)

    // Variables that check if the user is on a login/register page or the home page
    const isLoginPage = window.location.pathname === "/login" || window.location.pathname === "/register"
    const isHomePage = window.location.pathname === "/"

    // Function for logging users out
    const logOut = () => {
        navigate("/login")
        signOut()
        setAuthState(false)
    }

    // Logo brings user to dashboard if they are logged in and to the home page if they are not
    let logoHref = authState ? "/dashboard" : "/"

    useEffect(() => {
        setAuthState(isAuthenticated)
    }, [isAuthenticated])

    return (
        <Box display="flex" alignItems="center" justifyContent="space-between" w={isHomePage ? "100%" : ['100%', '100%', '700px']} py={6} px={4}>
            <Link href={logoHref}>
                <Box width='70px'>
                    <Image w={['50px', '50px', '60px']} h={['50px', '50px', '60px']} src={process.env.PUBLIC_URL + '/assets/dbicon.png'} />
                </Box>
            </Link>

            {
                // If the user is on the loginpage, there is no log in button
                isLoginPage ? (
                    <>
                    </>
                ) : 
                (
                    <>
                    { 
                        // If the user is logged in, show the logout button, otherwise show the login/register button
                        authState ? (
                            <Link>
                                <Button colorScheme='blue' onClick={logOut} size='md'>
                                    Logout
                                </Button>
                            </Link>
                        ) : (
                            <Link href="/login">
                                <Button colorScheme='blue' size='md'>
                                    Login/Register
                                </Button>
                            </Link>
                        )
                    }
                    </>

                )
            }
        </Box>

    )
}
 
export default NavBar