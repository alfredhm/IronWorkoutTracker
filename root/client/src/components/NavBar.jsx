import { Button, Box, Link, Image } from "@chakra-ui/react";
import { useState } from "react";
import { useSignOut } from "react-auth-kit"
import useIsAuthenticated from 'react-auth-kit/dist/hooks/useIsAuthenticated'
import { useNavigate } from "react-router-dom";

const NavBar = () => {

    const isAuthenticated = useIsAuthenticated()
    const signOut = useSignOut()
    const navigate = useNavigate()

    const [authState, setAuthState] = useState(isAuthenticated)

    const isLoginPage = window.location.pathname === "/login" || window.location.pathname === "/register"

    const logOut = () => {
        navigate("/login")
        signOut()
        setAuthState(false)
    }

    let logoHref = authState ? "/dashboard" : "/"

    return (
        <Box display="flex" justifyContent="space-between" w="100%" p={8} >
            <Link href={logoHref}>
                <Box width='70px'>
                    <Image src={process.env.PUBLIC_URL + '/assets/dbicon.png'} />
                </Box>
            </Link>

            {
                isLoginPage ? (
                    <>
                    </>
                ) : 
                (
                    <>
                    { authState ? (
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
                    )}
                    </>

                )
            }


            
        </Box>

    )
}
 
export default NavBar