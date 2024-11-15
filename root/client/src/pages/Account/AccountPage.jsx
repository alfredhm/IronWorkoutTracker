import { Box, Button, Heading, List, ListItem, Text } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { useAuthUser, useIsAuthenticated, useSignOut } from "react-auth-kit"
import { Link, useNavigate } from "react-router-dom"

const AccountPage = () => {
  const isAuthenticated = useIsAuthenticated()
  const signOut = useSignOut()
  const navigate = useNavigate()
  const auth = useAuthUser()
  const uid = auth()?.uid;

  const [authState, setAuthState] = useState(isAuthenticated)

  // Function for logging users out
  const logOut = () => {
      navigate("/login")
      signOut()
      setAuthState(false)
  }

  useEffect(() => {
      setAuthState(isAuthenticated)
  }, [isAuthenticated, authState])
  
  return (
    <>
        <Heading color="white" fontSize={32}>Profile</Heading>
        <List display="flex" flexDir="column" pt={4} justifyContent="space-between" h='calc(100% - 107px)'>
            <Heading fontSize="x-large" fontWeight="600" color="white">Account</Heading>
            <ListItem>
                <Text fontSize="md" color="white">{auth().name}</Text>
            </ListItem>
            <Heading fontSize="x-large" fontWeight="600" color="white">My Data</Heading>
            <ListItem>
                <Link>
                    <Button w="100%" colorScheme='red' onClick={logOut} size='md'>
                        Logout
                    </Button>
                </Link>
            </ListItem>
        </List>
    </>
  )
}

export default AccountPage