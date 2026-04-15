import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const authenticateCandidate = async (email, testId) => {
  try {
    const response = await api.post('/auth/candidate/', {
      email,
      test_id: testId,
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || 'Authentication failed. Please try again.';
    throw new Error(message);
  }
};

export default api;
