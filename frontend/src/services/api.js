import axios from 'axios'

const BASE_URL = `${import.meta.env.VITE_API_URL}/api`

export const analyzeFromForm = async (data) => {
  const response = await axios.post(`${BASE_URL}/analyze/form`, data)
  return response.data
}

export const uploadCV = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await axios.post(`${BASE_URL}/upload-cv`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

export const analyzeFromCV = async (data) => {
  const response = await axios.post(`${BASE_URL}/analyze/cv`, data)
  return response.data
}