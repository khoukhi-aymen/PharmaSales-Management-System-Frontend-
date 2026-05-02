import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true
});

// INTERCEPTOR
instance.interceptors.response.use(
  (response) => {

    const url = response.config.url;

    // ignorer login + logout
    if (url.includes("/login") || url.includes("/logout")) {
      return response;
    }

    if (response.data && response.data.redirectUrl) {
      window.location.href = response.data.redirectUrl;
    }

    return response;
  },

  (error) => {
    if (error.response && error.response.status === 401) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default instance;