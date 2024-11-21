import axios from "axios";

// Create an Axios instance
const axiosInstance = axios.create({
    baseURL:  process.env.NODE_ENV === "production"
    ? "https://ironworkoutapp-fcc22fe202a5.herokuapp.com/api"
    : "http://localhost:5000/api", // Dynamically set base URL
    withCredentials: true, // Include cookies in requests
});

export default axiosInstance;