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

  const [rooms, setRooms] = useState([{ count: 1 }]);

  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

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
        data.sort((a, b) => b.stars - a.stars);
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

  const handleRoomChange = (index, field, value) => {
    const newRooms = [...rooms];
    newRooms[index][field] = value;
    setRooms(newRooms);
  };

  const addRoom = () => {
    setRooms([...rooms, { count: 1 }]);
  };

  const removeRoom = (index) => {
    if (rooms.length > 1) {
      const newRooms = rooms.filter((_, i) => i !== index);
      setRooms(newRooms);
    }
  };

  const handleHotelSelect = (hotel) => {
    setSelectedHotel(hotel);
    setFormData(prev => ({
      ...prev,
      hotelId: hotel.id,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedHotel) {
      alert('Please select a hotel');
      return;
    }
    if (!formData.clientName.trim()) {
      alert('Client Name is required');
      return;
    }
    if (!formData.guests || formData.guests < 1) {
      alert('Guests must be at least 1');
      return;
    }
    if (!formData.checkIn || !formData.checkOut) {
      alert('Check-in and Check-out dates are required');
      return;
    }
    if (new Date(formData.checkOut) <= new Date(formData.checkIn)) {
      alert('Check-out must be after check-in');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      alert('Price must be greater than 0');
      return;
    }
    if (rooms.length === 0) {
      alert('At least one room is required');
      return;
    }
    for (let room of rooms) {
      if (!room.count || room.count <= 0) {
        alert('Room count must be greater than 0');
        return;
      }
    }

    const payload = {
      ClientName: formData.clientName,
      Guests: parseInt(formData.guests),
      CheckIn: formData.checkIn,
      CheckOut: formData.checkOut,
      Price: parseFloat(formData.price),
      Breakfast: formData.breakfast,
      FreeCancel: formData.freeCancel,
      HotelID: selectedHotel.id,
      Rooms: rooms.map(r => ({ Count: parseInt(r.count) })),
    };

    console.log('Submitting payload:', payload);
    setSubmitLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (response.ok) {
        alert('Proposal created successfully');
        navigate('/proposals');
      } else {
        console.error('Server response:', result);
        alert(result.error || 'Failed to create proposal');
      }
    } catch (err) {
      console.error('Error submitting proposal:', err);
      alert('Error submitting proposal');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="container-fluid mt-3">
      <div className="row">
        <div className="col-md-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Client Name</label>
              <input
                type="text"
                className="form-control"
                name="clientName"
                value={formData.clientName}
                onChange={handleFormChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Guests</label>
              <input
                type="number"
                className="form-control"
                name="guests"
                value={formData.guests}
                onChange={handleFormChange}
                min="1"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Check-in</label>
              <input
                type="date"
                className="form-control"
                name="checkIn"
                value={formData.checkIn}
                onChange={handleFormChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Check-out</label>
              <input
                type="date"
                className="form-control"
                name="checkOut"
                value={formData.checkOut}
                onChange={handleFormChange}
                required
              />
            </div>

            <div className="mb-3">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  name="breakfast"
                  checked={formData.breakfast}
                  onChange={handleFormChange}
                />
                <label className="form-check-label">Breakfast</label>
              </div>
            </div>

            <div className="mb-3">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  name="freeCancel"
                  checked={formData.freeCancel}
                  onChange={handleFormChange}
                />
                <label className="form-check-label">Free Cancel</label>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Price</label>
              <input
                type="number"
                className="form-control"
                name="price"
                value={formData.price}
                onChange={handleFormChange}
                step="0.01"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Rooms</label>
              {rooms.map((room, index) => (
                <div key={index} className="row mb-2 align-items-center">
                  <div className="col-8">
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      value={room.count}
                      onChange={(e) => handleRoomChange(index, 'count', e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-2">
                    {index > 0 && (
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => removeRoom(index)}>-</button>
                    )}
                  </div>
                </div>
              ))}
              <button type="button" className="btn btn-success btn-sm" onClick={addRoom}>+</button>
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitLoading}>
              {submitLoading ? 'Submitting...' : 'Submit Proposal'}
            </button>
          </form>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <div className="mb-3">
                <div className="row g-2">
                  <div className="col-md-4">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      className="form-control"
                      name="city"
                      placeholder="Filter by City"
                      value={filters.city}
                      onChange={handleFilterChange}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Stars</label>
                    <select
                      className="form-control"
                      name="stars"
                      value={filters.stars}
                      onChange={handleFilterChange}
                    >
                      <option value="">All</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Group</label>
                    <input
                      type="text"
                      className="form-control"
                      name="groupName"
                      placeholder="Filter by Group"
                      value={filters.groupName}
                      onChange={handleFilterChange}
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">&nbsp;</label>
                    <button
                      className="btn btn-outline-secondary btn-sm w-100"
                      onClick={resetFilters}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              <div className="table-responsive" style={{maxHeight: '500px', overflowY: 'auto'}}>
                <table className="table table-sm table-hover">
                  <thead className="table-dark sticky-top">
                    <tr>
                      <th>Hotel Name</th>
                      <th>City</th>
                      <th>Type</th>
                      <th>Stars</th>
                      <th>Breakfast</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHotels.map(hotel => (
                      <tr
                        key={hotel.id}
                        className={selectedHotel?.id === hotel.id ? 'table-success' : ''}
                      >
                        <td>
                          {hotel.name}
                          {selectedHotel?.id === hotel.id && (
                            <span className="ms-1">✅</span>
                          )}
                        </td>
                        <td>{hotel.city}</td>
                        <td>{hotel.type}</td>
                        <td>
                          {'★'.repeat(hotel.stars)}
                          <span className="text-muted">{'☆'.repeat(5-hotel.stars)}</span>
                        </td>
                        <td>
                          <span className={`badge ${hotel.breakfast ? 'bg-success' : 'bg-secondary'}`}>
                            {hotel.breakfast ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td>
                          <button
                            className={`btn btn-sm ${selectedHotel?.id === hotel.id ? 'btn-success' : 'btn-outline-primary'}`}
                            onClick={() => handleHotelSelect(hotel)}
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