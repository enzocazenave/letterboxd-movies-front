import axios from "axios"

const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  headers:{
      "Content-Type": "application/json", 
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token.trim()}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

  
//   apiClient.interceptors.response.use(
//     (response) => response,
//     (error) => {
//       if (error.response && error.response.status === 404) {
//          window.location.href = "/login";
//       }
//       return Promise.reject(error);
//     }
//   );

export default apiClient;