import React from 'react';

const HotelTable = ({ hotels, onSort, sortBy, sortOrder, onSelect }) => {
  const columns = [
    { key: 'city', label: 'City' },
    { key: 'group_name', label: 'Group' },
    { key: 'type', label: 'Type' },
    { key: 'name', label: 'Hotel Name' },
    { key: 'stars', label: 'Stars' },
    { key: 'address', label: 'Address' },
    { key: 'location_link', label: 'Location Link' },
    { key: 'breakfast', label: 'Breakfast' },
    { key: 'website_link', label: 'Website Link' },
    { key: 'available_spots', label: 'Available Spots' },
  ];

  const getAvailableSpots = (hotel) => {
    return hotel.max_guests - hotel.current_guests;
  };

  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover table-bordered">
        <thead className="table-dark">
          <tr>
            {columns.map(col => (
              <th key={col.key}>{col.label}</th>
            ))}
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {hotels.map(hotel => (
            <tr key={hotel.id}>
              {columns.map(col => (
                <td key={col.key}>
                  {col.key === 'breakfast' ? (hotel[col.key] ? 'Yes' : 'No') :
                   col.key === 'available_spots' ? getAvailableSpots(hotel) : hotel[col.key]}
                </td>
              ))}
              <td>
                <button className="btn btn-primary btn-sm" onClick={() => onSelect(hotel)}>Select</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HotelTable;
