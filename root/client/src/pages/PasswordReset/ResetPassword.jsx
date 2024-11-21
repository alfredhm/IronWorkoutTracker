import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axiosInstance from '../../resources/axiosInstance'

const VerifyReset = () => {
    const { id, token } = useParams()
    const navigate = useNavigate()
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const verifyToken = async() => {
            try {
                const response = await axiosInstance.get(`/users/reset-password/${id}/${token}`)
                if (response.data.success) {
                    navigate(response.data.redirectUrl)
                } else {
                    setError(response.data.message)
                    setLoading(false)
                }
            } catch (err) {
                console.error('Error verifying token: ', err)
                setError('Something went wrong')
                setLoading(false)
            }
        }

        verifyToken()
    }, [id, token, navigate])

    if (loading) return <p>Loading...</p>
    if (error) return <p>{error}</p>

    return null
}

export default VerifyReset