import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const CreateHotelPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    group_name: '',
    type: 'Business',
    stars: 4,
    address: '',
    location_link: '',
    website_link: '',
    breakfast: true
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

    // Валидация
    if (!formData.name.trim() || !formData.city.trim() || !formData.address.trim()) {
      setError('Name, City, and Address are required fields');
      setLoading(false);
      return;
    }

    if (formData.stars < 1 || formData.stars > 5) {
      setError('Stars must be between 1 and 5');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/hotels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        alert('Hotel created successfully!');
        navigate('/');
      } else {
        setError(result.error || 'Failed to create hotel');
      }
    } catch (err) {
      setError('Error creating hotel: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      city: '',
      group_name: '',
      type: 'Business',
      stars: 4,
      address: '',
      location_link: '',
      website_link: '',
      breakfast: true
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
            <div className="card-header bg-primary text-white">
              <h5>Hotel Information</h5>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Hotel Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Enter hotel name"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">City *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        placeholder="Enter city"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Group Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="group_name"
                        value={formData.group_name}
                        onChange={handleChange}
                        placeholder="e.g., UNA Hotels, Barriere Group"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Hotel Type</label>
                      <select
                        className="form-control"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                      >
                        <option value="Business">Business</option>
                        <option value="Luxury">Luxury</option>
                        <option value="Boutique">Boutique</option>
                        <option value="Resort">Resort</option>
                        <option value="Standard">Standard</option>
                      </select>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Star Rating *</label>
                      <select
                        className="form-control"
                        name="stars"
                        value={formData.stars}
                        onChange={handleChange}
                        required
                      >
                        <option value={1}>1 Star</option>
                        <option value={2}>2 Stars</option>
                        <option value={3}>3 Stars</option>
                        <option value={4}>4 Stars</option>
                        <option value={5}>5 Stars</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Address *</label>
                      <textarea
                        className="form-control"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        rows="3"
                        placeholder="Full hotel address"
                      />
                    </div>

                    <div className="mb-3">
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

                    <div className="mb-3">
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
                </div>

                <div className="row">
                  <div className="col-12">
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
              <h6>Quick Tips</h6>
            </div>
            <div className="card-body">
              <ul className="list-unstyled mb-0">
                <li>• Required fields are marked with *</li>
                <li>• Star rating affects hotel sorting</li>
                <li>• Use full addresses for better location accuracy</li>
                <li>• Website and map links will be clickable in PDF exports</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateHotelPage;
