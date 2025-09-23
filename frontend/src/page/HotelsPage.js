import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HotelTable from '../components/HotelTable';
import HotelService from '../services/HotelService';
import 'bootstrap/dist/css/bootstrap.min.css';

const HotelsPage = () => {
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('city');
  const [sortOrder, setSortOrder] = useState('asc');
  
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
    applyFiltersAndSort();
  }, [hotels, filters, sortBy, sortOrder]);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const data = await HotelService.getHotels();
      setHotels(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch hotels');
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...hotels];
    
    // Применяем фильтры
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
    
    filtered = sortHotels(filtered, sortBy, sortOrder);
    
    setFilteredHotels(filtered);
  };

  const sortHotels = (data, by, order) => {
    return [...data].sort((a, b) => {
      let valA = a[by];
      let valB = b[by];
      
      if (by === 'stars') {
        valA = Number(valA);
        valB = Number(valB);
        return order === 'desc' ? valB - valA : valA - valB;
      }
      
      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }
      
      if (order === 'asc') {
        if (valA < valB) return -1;
        if (valA > valB) return 1;
        return 0;
      } else {
        if (valA > valB) return -1;
        if (valA < valB) return 1;
        return 0;
      }
    });
  };

  const handleSort = (column) => {
    const newOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(column);
    setSortOrder(newOrder);
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

  const getAvailableSpots = (hotel) => {
    return hotel.max_guests - hotel.current_guests;
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
                <option value="3">3 Stars</option>
                <option value="4">4 Stars</option>
                <option value="5">5 Stars</option>
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
                  <th 
                    style={{cursor: 'pointer'}} 
                    onClick={() => handleSort('city')}
                  >
                    City {sortBy === 'city' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    style={{cursor: 'pointer'}} 
                    onClick={() => handleSort('group_name')}
                  >
                    Group {sortBy === 'group_name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Type</th>
                  <th 
                    style={{cursor: 'pointer'}} 
                    onClick={() => handleSort('name')}
                  >
                    Hotel Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    style={{cursor: 'pointer'}} 
                    onClick={() => handleSort('stars')}
                  >
                    Stars {sortBy === 'stars' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Address</th>
                  <th>Breakfast</th>
                  <th>Available Spots</th>
                  <th>Price</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredHotels.map(hotel => (
                  <tr key={hotel.id}>
                    <td>{hotel.city}</td>
                    <td>{hotel.group_name || '-'}</td>
                    <td>{hotel.type || '-'}</td>
                    <td>{hotel.name}</td>
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
                    <td>
                      <span className={`badge ${getAvailableSpots(hotel) > 0 ? 'bg-success' : 'bg-danger'}`}>
                        {getAvailableSpots(hotel)}
                      </span>
                    </td>
                    <td>€{hotel.price}</td>
                    <td>
                      <button 
                        className="btn btn-primary btn-sm" 
                        onClick={() => handleSelectHotel(hotel)}
                        disabled={getAvailableSpots(hotel) === 0}
                      >
                        Create Proposal
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
  );
};

export default HotelsPage;
