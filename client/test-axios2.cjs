const axios = require('axios');

const backendAPI = axios.create({
  baseURL: 'http://localhost:3001/api', // No server running here
});

backendAPI.interceptors.response.use(
  res => res,
  error => {
    console.log("config defined:", !!error.config);
    return Promise.reject(error);
  }
);

backendAPI.post('/patient-register', {}).catch(() => console.log("Done"));
