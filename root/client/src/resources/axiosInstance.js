import axios from "axios";

// Create an Axios instance
const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api", // Dynamically set base URL
    withCredentials: true, // Include cookies in requests
});

export default axiosInstance;