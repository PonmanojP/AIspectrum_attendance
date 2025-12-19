import axios from 'axios'

const api = axios.create({
  baseURL: 'https://aicattendancebackend.onrender.com/api',
  timeout: 30000 // Increased timeout for Render.com which may have cold starts
})

export default api