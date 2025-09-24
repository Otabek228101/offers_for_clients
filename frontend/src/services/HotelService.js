import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const getHotels = async (city = '') => {
  const response = await axios.get(`${API_URL}/hotels`, {
    params: { city },
  });
  return response.data;
};

const createHotel = async (hotelData) => {
  const response = await axios.post(`${API_URL}/hotels`, hotelData);
  return response.data;
};

const updateHotel = async (id, hotelData) => {
  const response = await axios.put(`${API_URL}/hotels/${id}`, hotelData);
  return response.data;
};

const deleteHotel = async (id) => {
  const response = await axios.delete(`${API_URL}/hotels/${id}`);
  return response.data;
};

export default {
  getHotels,
  createHotel,
  updateHotel,
  deleteHotel
};
