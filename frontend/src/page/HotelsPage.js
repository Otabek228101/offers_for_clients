import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateHotelPDF } from '../utils/pdfGenerator';
import HotelService from '../services/HotelService';
import 'bootstrap/dist/css/bootstrap.min.css';

const HotelsPage = () => {
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    city: '',
    stars: '',
    groupName: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchHotels();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [hotels, filters]);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const data = await HotelService.getHotels();
      const sortedHotels = data.sort((a, b) => b.stars - a.stars);
      setHotels(sortedHotels);
      setFilteredHotels(sortedHotels);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch hotels');
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

  const handleHotelNameDoubleClick = (hotel) => {
    generateHotelPDF(hotel);
  };

  const handleSelectHotel = (hotel) => {
    navigate('/form', {
      state: {
        selectedHotel: hotel,
        filters: {
          city: hotel.city,
          stars: filters.stars,
          groupName: filters.groupName
        }
      }
    });
  };

  if (loading) return <div className="container mt-5"><div className="alert alert-info">Loading hotels...</div></div>;
  if (error) return <div className="container mt-5"><div className="alert alert-danger">{error}</div></div>;

  return (
    <div className="container-fluid mt-3">
      <div className="row mb-4">
        <div className="col-md-8">
          <h1>Hotels Management</h1>
        </div>
          <div className="col-md-4 text-end">
            <button
              className="btn btn-primary me-2"
              onClick={() => navigate('/create-hotel')}
            >
              Add New Hotel
            </button>
            <button
              className="btn btn-success me-2"
              onClick={() => navigate('/form')}
            >
              Create Proposal
            </button>
            <button
              className="btn btn-outline-primary"
              onClick={() => navigate('/proposals')}
            >
              View Proposals
            </button>
          </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-3">
              <label className="form-label">City</label>
              <input
                className="form-control"
                type="text"
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
                <option value="">All Stars</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Group</label>
              <input
                className="form-control"
                type="text"
                name="groupName"
                placeholder="Filter by Group"
                value={filters.groupName}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">&nbsp;</label>
              <div className="d-grid">
                <button
                  className="btn btn-outline-secondary"
                  onClick={resetFilters}
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover table-bordered">
              <thead className="table-dark">
                <tr>
                  <th>Hotel Name</th>
                  <th>City</th>
                  <th>Group</th>
                  <th>Type</th>
                  <th>Stars</th>
                  <th>Address</th>
                  <th>Breakfast</th>
                </tr>
              </thead>
              <tbody>
                {filteredHotels.map(hotel => (
                  <tr key={hotel.id}>
                    <td
                      onDoubleClick={() => handleHotelNameDoubleClick(hotel)}
                      style={{
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                      title="Double click to download PDF"
                    >
                      {hotel.name}
                    </td>
                    <td>{hotel.city}</td>
                    <td>{hotel.group_name || '-'}</td>
                    <td>{hotel.type || '-'}</td>
                    <td>
                      {'★'.repeat(hotel.stars)}
                      <span className="text-muted">{'☆'.repeat(5-hotel.stars)}</span>
                    </td>
                    <td>{hotel.address}</td>
                    <td>
                      <span className={`badge ${hotel.breakfast ? 'bg-success' : 'bg-secondary'}`}>
                        {hotel.breakfast ? 'Yes' : 'No'}
                      </span>
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
  );
};

export default HotelsPage;
