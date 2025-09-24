import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const CreateHotelPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    group_name: '',
    type: 'hotel',
    stars: 4,
    address: '',
    location_link: '',
    website_link: '',
    breakfast: true,
    image_url: '' 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.name.trim() || !formData.city.trim() || !formData.address.trim()) {
      setError('Name, Address, and City are required');
      setLoading(false);
      return;
    }

    if (formData.stars < 1 || formData.stars > 5) {
      setError('Stars must be between 1 and 5');
      setLoading(false);
      return;
    }

    try {
      const requestData = {
        name: formData.name.trim(),
        city: formData.city.trim(),
        group_name: formData.group_name.trim(),
        type: formData.type,
        stars: parseInt(formData.stars),
        address: formData.address.trim(),
        location_link: formData.location_link.trim(),
        website_link: formData.website_link.trim(),
        breakfast: formData.breakfast,
        image_url: formData.image_url.trim() 
      };

      console.log('Sending data to backend:', requestData);

      const response = await fetch('http://localhost:8080/api/hotels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();

      if (response.ok) {
        alert('Hotel created successfully!');
        navigate('/');
      } else {
        setError(result.error || result.details || 'Failed to create hotel');
        console.error('Backend error:', result);
      }
    } catch (err) {
      setError('Network error: ' + err.message);
      console.error('Network error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      city: '',
      group_name: '',
      type: 'hotel',
      stars: 4,
      address: '',
      location_link: '',
      website_link: '',
      breakfast: true,
      image_url: ''
    });
    setError('');
  };

  return (
    <div className="container-fluid mt-3">
      <div className="row mb-4">
        <div className="col-12">
          <button
            className="btn btn-secondary me-2"
            onClick={() => navigate('/')}
          >
            ← Back to Hotels
          </button>
          <h2 className="d-inline-block align-middle">Add New Hotel</h2>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      className="form-control"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Group Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="group_name"
                      value={formData.group_name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Type</label>
                    <select
                      className="form-control"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                    >
                      <option value="hotel">Hotel</option>
                      <option value="apartment">Apartment</option>
                    </select>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Stars</label>
                    <input
                      type="number"
                      className="form-control"
                      name="stars"
                      value={formData.stars}
                      onChange={handleChange}
                      min="1"
                      max="5"
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      className="form-control"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Website Link</label>
                    <input
                      type="url"
                      className="form-control"
                      name="website_link"
                      value={formData.website_link}
                      onChange={handleChange}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Location Link (Google Maps)</label>
                    <input
                      type="url"
                      className="form-control"
                      name="location_link"
                      value={formData.location_link}
                      onChange={handleChange}
                      placeholder="https://goo.gl/maps/..."
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Image URL</label>
                    <input
                      type="url"
                      className="form-control"
                      name="image_url"
                      value={formData.image_url}
                      onChange={handleChange}
                      placeholder="https://example.com/hotel.jpg"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="form-check mb-4">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        name="breakfast"
                        checked={formData.breakfast}
                        onChange={handleChange}
                      />
                      <label className="form-check-label">
                        Breakfast Included
                      </label>
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Creating...
                      </>
                    ) : (
                      'Create Hotel'
                    )}
                  </button>
                  
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={resetForm}
                    disabled={loading}
                  >
                    Reset Form
                  </button>
                  
                  <button
                    type="button"
                    className="btn btn-outline-danger ms-auto"
                    onClick={() => navigate('/')}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="card mt-4">
            <div className="card-header bg-light">
              <h6>Backend Requirements</h6>
            </div>
            <div className="card-body">
              <ul className="list-unstyled mb-0">
                <li>• <strong>Required fields:</strong> Name, City, Address</li>
                <li>• <strong>Stars validation:</strong> Must be between 1 and 5</li>
                <li>• <strong>Request format:</strong> JSON matching CreateHotelRequest struct</li>
                <li>• <strong>Field names:</strong> name, city, group_name, type, stars, address, location_link, website_link, breakfast, image_url</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateHotelPage;