
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const getHotels = async (city = '') => {
  const response = await axios.get(`${API_URL}/hotels`, {
    params: { city },
  });
  return response.data;
};

export default { getHotels };
