import axios from "axios";
const api = axios.create({
  baseURL: "https://team-task-manager-ngkg.onrender.com",
});
export default api;
