const axios = require('axios');

const backendAPI = axios.create({
  baseURL: 'http://localhost:3001/api',
});

backendAPI.interceptors.response.use(
  res => res,
  error => {
    console.log("originalRequest.url:", error.config.url);
    console.log("baseURL:", error.config.baseURL);
    return Promise.reject(error);
  }
);

backendAPI.post('/patient-login').catch(() => console.log("Done"));
