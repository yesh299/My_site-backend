import axios from 'axios';

const baseURL = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});
