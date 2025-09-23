import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ProposalForm = () => {
  const { state } = useLocation();
  const [formData, setFormData] = useState({
    hotelName: '',
    city: '',
    guests: '',
    level: '',
    checkIn: '',
    checkOut: '',
    breakfast: false,
    freeCancel: false,
    price: '',
    location: '',
    hotelId: '',
    clientName: '',
    website: '',
 });

  useEffect(() => {
    if (state?.selectedHotel) {
      setFormData(prev => ({
        ...prev,
        hotelId: state.selectedHotel.id,
        hotelName: state.selectedHotel.name,
        city: state.selectedHotel.city,
        guests: '',
        level: state.selectedHotel.level || '',
        checkIn: '',
        checkOut: '',
        breakfast: state.selectedHotel.breakfast,
        freeCancel: false,
        price: '',
        location: state.selectedHotel.address,
        clientName: '',
        website: state.selectedHotel.website_link,
      }));
    }
  }, [state]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      hotelId: Number(formData.hotelId),
    };
    try {
      const response = await fetch('http://localhost:8080/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        alert('Proposal created successfully');
        setFormData({
          hotelName: '',
          city: '',
          guests: '',
          level: '',
          checkIn: '',
          checkOut: '',
          breakfast: false,
          freeCancel: false,
          price: '',
          location: '',
          hotelId: '',
          clientName: '',
          website: '',
        });
      } else {
        alert('Failed to create proposal');
      }
    } catch (err) {
      console.error('Error submitting proposal:', err);
      alert('Error submitting proposal');
    }
  };

  return (
    <div className="row">
      <div className="col-md-12">
        <form onSubmit={handleSubmit} className="p-4 border rounded">
          <h3>Данные отеля</h3>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Название отеля</label>
              <input
                type="text"
                className="form-control"
                name="hotelName"
                value={formData.hotelName}
                readOnly
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Город</label>
              <input
                type="text"
                className="form-control"
                name="city"
                value={formData.city}
                readOnly
              />
            </div>
          </div>
          
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Количество гостей</label>
              <input
                type="number"
                className="form-control"
                name="guests"
                value={formData.guests}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Уровень</label>
              <select
                className="form-control"
                name="level"
                value={formData.level}
                onChange={handleChange}
              >
                <option value="">Select Level</option>
                <option value="Standard">Standard</option>
                <option value="Premium">Premium</option>
              </select>
            </div>
          </div>
          
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Въезд</label>
              <input
                type="date"
                className="form-control"
                name="checkIn"
                value={formData.checkIn}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Выезд</label>
              <input
                type="date"
                className="form-control"
                name="checkOut"
                value={formData.checkOut}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="row">
            <div className="col-md-6 mb-3">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  name="breakfast"
                  checked={formData.breakfast}
                  onChange={handleChange}
                />
                <label className="form-check-label">Завтрак</label>
              </div>
            </div>
            <div className="col-md-6 mb-3">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  name="freeCancel"
                  checked={formData.freeCancel}
                  onChange={handleChange}
                />
                <label className="form-check-label">Бесплатная отмена</label>
              </div>
            </div>
          </div>
          
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Цена</label>
              <input
                type="number"
                className="form-control"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Локация</label>
              <input
                type="text"
                className="form-control"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="mb-3">
            <label className="form-label">Website</label>
            <input
              type="text"
              className="form-control"
              name="website"
              value={formData.website}
              readOnly
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label">Client Name</label>
            <input
              type="text"
              className="form-control"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              required
            />
          </div>
          
          <button type="submit" className="btn btn-primary">Submit Proposal</button>
        </form>
      </div>
    </div>
  );
};

export default ProposalForm;