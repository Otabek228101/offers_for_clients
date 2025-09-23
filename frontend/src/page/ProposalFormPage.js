import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const ProposalFormPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    clientName: '',
    guests: 1,
    checkIn: '',
    checkOut: '',
    breakfast: false,
    freeCancel: false,
    price: '',
    hotelId: '',
  });

  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState(null);
  
  const [filters, setFilters] = useState({
    city: '',
    stars: '',
    groupName: ''
  });

  useEffect(() => {
    if (location.state?.selectedHotel) {
      const hotel = location.state.selectedHotel;
      setSelectedHotel(hotel);
      setFormData(prev => ({
        ...prev,
        hotelId: hotel.id,
        price: hotel.price || '',
        breakfast: hotel.breakfast || false
      }));
      
      if (location.state.filters) {
        setFilters(location.state.filters);
      } else {
        setFilters(prev => ({
          ...prev,
          city: hotel.city
        }));
      }
    }
  }, [location.state]);

  useEffect(() => {
    fetchHotels();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [hotels, filters]);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/hotels');
      if (response.ok) {
        const data = await response.json();
        setHotels(data);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching hotels:', err);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...hotels];
    
    if (filters.city) {
      filtered = filtered.filter(hotel => 
        hotel.city.toLowerCase().includes(filters.city.toLowerCase())
      );
    }
    
    if (filters.stars) {
      filtered = filtered.filter(hotel => 
        hotel.stars === parseInt(filters.stars)
      );
    }
    
    if (filters.groupName) {
      filtered = filtered.filter(hotel => 
        hotel.group_name && hotel.group_name.toLowerCase().includes(filters.groupName.toLowerCase())
      );
    }
    
    setFilteredHotels(filtered);

    if (selectedHotel && !filtered.find(h => h.id === selectedHotel.id)) {
      setFilteredHotels([selectedHotel, ...filtered]);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      city: '',
      stars: '',
      groupName: ''
    });
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleHotelSelect = (hotel) => {
    setSelectedHotel(hotel);
    setFormData(prev => ({
      ...prev,
      hotelId: hotel.id,
      price: hotel.price || '',
      breakfast: hotel.breakfast || false
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedHotel) {
      alert('Please select a hotel first');
      return;
    }

    if (!formData.checkIn || !formData.checkOut) {
      alert('Please select check-in and check-out dates');
      return;
    }

    if (new Date(formData.checkOut) <= new Date(formData.checkIn)) {
      alert('Check-out date must be after check-in date');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/proposals', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          clientName: formData.clientName,
          guests: parseInt(formData.guests),
          checkIn: formData.checkIn,
          checkOut: formData.checkOut,
          breakfast: formData.breakfast,
          freeCancel: formData.freeCancel,
          price: parseFloat(formData.price),
          hotelId: parseInt(formData.hotelId),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Proposal created successfully! Proposal Number: ${result.proposalNumber}`);
        navigate('/proposals');
      } else {
        const errorData = await response.json();
        alert(`Failed to create proposal: ${errorData.error}`);
      }
    } catch (err) {
      console.error('Error submitting proposal:', err);
      alert('Error submitting proposal');
    }
  };

  const getAvailableSpots = (hotel) => {
    return hotel.max_guests - hotel.current_guests;
  };

  const isHotelAvailable = (hotel) => {
    return getAvailableSpots(hotel) >= parseInt(formData.guests || 1);
  };

  if (loading) return <div className="container mt-5"><div className="alert alert-info">Loading...</div></div>;

  return (
    <div className="container-fluid mt-3">
      <div className="row mb-3">
        <div className="col-12">
          <button 
            className="btn btn-secondary me-2" 
            onClick={() => navigate('/')}
          >
            ← Back to Hotels
          </button>
          <h2 className="d-inline-block align-middle">Create Proposal</h2>
          {selectedHotel && (
            <span className="ms-3 badge bg-success align-middle">
              Selected: {selectedHotel.name}
            </span>
          )}
        </div>
      </div>

      <div className="row">
        {/* Левая часть - форма */}
        <div className="col-md-5">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5>Proposal Details</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Client Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Number of Guests *</label>
                    <input
                      type="number"
                      className="form-control"
                      name="guests"
                      value={formData.guests}
                      onChange={handleFormChange}
                      min="1"
                      max={selectedHotel ? selectedHotel.max_guests : 10}
                      required
                    />
                    <small className="text-muted">
                      Max: {selectedHotel ? selectedHotel.max_guests : 'N/A'}
                    </small>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Price (€) *</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      name="price"
                      value={formData.price}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Check-in Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      name="checkIn"
                      value={formData.checkIn}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Check-out Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      name="checkOut"
                      value={formData.checkOut}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        name="breakfast"
                        checked={formData.breakfast}
                        onChange={handleFormChange}
                      />
                      <label className="form-check-label">Breakfast Included</label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        name="freeCancel"
                        checked={formData.freeCancel}
                        onChange={handleFormChange}
                      />
                      <label className="form-check-label">Free Cancellation</label>
                    </div>
                  </div>
                </div>

                {selectedHotel && (
                  <div className="alert alert-info">
                    <h6>Selected Hotel:</h6>
                    <strong>{selectedHotel.name}</strong><br />
                    <small>
                      {selectedHotel.city} • {selectedHotel.stars} stars • 
                      Available spots: {getAvailableSpots(selectedHotel)}
                    </small>
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn btn-success w-100"
                  disabled={!selectedHotel}
                >
                  Create Proposal
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-7">
          <div className="card">
            <div className="card-header bg-secondary text-white">
              <h5>Select Hotel</h5>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-4">
                  <input
                    className="form-control form-control-sm"
                    type="text"
                    name="city"
                    placeholder="Filter by City"
                    value={filters.city}
                    onChange={handleFilterChange}
                  />
                </div>
                <div className="col-md-3">
                  <select
                    className="form-control form-control-sm"
                    name="stars"
                    value={filters.stars}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="5">5 Stars</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <input
                    className="form-control form-control-sm"
                    type="text"
                    name="groupName"
                    placeholder="Filter by Group"
                    value={filters.groupName}
                    onChange={handleFilterChange}
                  />
                </div>
                <div className="col-md-2">
                  <button 
                    className="btn btn-outline-secondary btn-sm w-100" 
                    onClick={resetFilters}
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="table-responsive" style={{maxHeight: '500px', overflowY: 'auto'}}>
                <table className="table table-sm table-hover">
                  <thead className="table-dark sticky-top">
                    <tr>
                      <th>Hotel Name</th>
                      <th>City</th>
                      <th>Stars</th>
                      <th>Available</th>
                      <th>Price</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHotels.map(hotel => (
                      <tr 
                        key={hotel.id}
                        className={selectedHotel?.id === hotel.id ? 'table-success' : ''}
                        style={selectedHotel?.id === hotel.id ? {fontWeight: 'bold'} : {}}
                      >
                        <td>
                          {hotel.name}
                          {selectedHotel?.id === hotel.id && (
                            <span className="ms-1">✅</span>
                          )}
                        </td>
                        <td>{hotel.city}</td>
                        <td>
                          {'★'.repeat(hotel.stars)}
                          <span className="text-muted">{'☆'.repeat(5-hotel.stars)}</span>
                        </td>
                        <td>
                          <span className={`badge ${isHotelAvailable(hotel) ? 'bg-success' : 'bg-warning'}`}>
                            {getAvailableSpots(hotel)}
                          </span>
                        </td>
                        <td>€{hotel.price}</td>
                        <td>
                          <button 
                            className={`btn btn-sm ${
                              selectedHotel?.id === hotel.id ? 'btn-success' : 'btn-outline-primary'
                            }`}
                            onClick={() => handleHotelSelect(hotel)}
                            disabled={!isHotelAvailable(hotel)}
                            title={!isHotelAvailable(hotel) ? `Not enough spots for ${formData.guests} guests` : ''}
                          >
                            {selectedHotel?.id === hotel.id ? 'Selected' : 'Select'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredHotels.length === 0 && (
                <div className="text-center text-muted py-4">
                  No hotels found matching your filters.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalFormPage;