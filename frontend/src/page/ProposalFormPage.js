import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const API = 'http://localhost:8080/api';

const ProposalFormPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    clientName: '',
    guests: 1,
    checkIn: '',
    checkOut: '',
    breakfast: false,
    freeCancel: false,
    price: '',
  });

  const [rooms, setRooms] = useState([{ count: 1 }]);

  const [hotels, setHotels] = useState([]);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);

  const [filters, setFilters] = useState({
    city: '',
    stars: '',
    name: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const loadHotels = async () => {
    setLoadingHotels(true);
    try {
      const params = new URLSearchParams();
      if (filters.city) params.append('city', filters.city);
      const res = await fetch(`${API}/hotels?${params.toString()}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      const filtered = list.filter(h => {
        if (filters.stars && String(h.stars) !== String(filters.stars)) return false;
        if (filters.name && !String(h.name || '').toLowerCase().includes(filters.name.toLowerCase())) return false;
        return true;
      });
      setHotels(filtered);
    } catch {
      setHotels([]);
    } finally {
      setLoadingHotels(false);
    }
  };

  useEffect(() => {
    loadHotels();
  }, []); // eslint-disable-line

  useEffect(() => {
    if (location.state && location.state.selectedHotel) {
      setSelectedHotel(location.state.selectedHotel);
    }
  }, [location.state]);

  const totalRooms = useMemo(() => rooms.reduce((s, r) => s + (Number(r.count) || 0), 0), [rooms]);

  const updateForm = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const addRoom = () => setRooms(r => [...r, { count: 1 }]);
  const removeRoom = (idx) => setRooms(r => r.filter((_, i) => i !== idx));
  const changeRoom = (idx, val) => {
    const v = Math.max(1, Math.min(10, Number(val) || 1));
    setRooms(r => r.map((it, i) => i === idx ? { ...it, count: v } : it));
  };

  const applyFilters = (e) => {
    e.preventDefault();
    loadHotels();
  };

  const resetFilters = () => {
    setFilters({ city: '', stars: '', name: '' });
    setTimeout(loadHotels, 0);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!selectedHotel) {
      alert('Select a hotel on the right');
      return;
    }
    if (!form.clientName || !form.checkIn || !form.checkOut) {
      alert('Fill in client name and dates');
      return;
    }
    if (new Date(form.checkIn) >= new Date(form.checkOut)) {
      alert('Check-out must be later than check-in');
      return;
    }
    if (totalRooms < 1) {
      alert('Add at least one room');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        clientName: form.clientName,
        guests: Number(form.guests) || 1,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        breakfast: !!form.breakfast,
        freeCancel: !!form.freeCancel,
        price: Number(form.price) || 0,
        hotelId: selectedHotel.id,
        rooms: rooms.map(r => ({ count: Number(r.count) || 1 })),
      };
      const res = await fetch(`${API}/proposals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data && data.error ? data.error : 'Create failed');
      alert(`Created proposal # ${data.proposalNumber || data.id}`);
      navigate('/proposals');
    } catch (err) {
      alert(String(err.message || err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid py-4" style={{ background: '#0f172a0d', minHeight: '100vh' }}>
      <div className="container">
        <div className="d-flex flex-wrap align-items-center justify-content-between mb-4">
          <h3 className="m-0">Create Proposal</h3>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary" onClick={() => navigate('/')}>Hotels</button>
            <button className="btn btn-outline-primary" onClick={() => navigate('/proposals')}>History</button>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-12 col-lg-7">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h5 className="m-0">Client details</h5>
                  {selectedHotel ? (
                    <span className="badge text-bg-success">Hotel selected</span>
                  ) : (
                    <span className="badge text-bg-warning">Select a hotel on the right</span>
                  )}
                </div>

                <form onSubmit={submit} className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Client name</label>
                    <input name="clientName" value={form.clientName} onChange={updateForm} className="form-control" placeholder="John Doe" />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Guests</label>
                    <input type="number" min="1" max="20" name="guests" value={form.guests} onChange={updateForm} className="form-control" />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Check-in</label>
                    <input type="date" name="checkIn" value={form.checkIn} onChange={updateForm} className="form-control" />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Check-out</label>
                    <input type="date" name="checkOut" value={form.checkOut} onChange={updateForm} className="form-control" />
                  </div>

                  <div className="col-md-6">
                    <div className="form-check">
                      <input id="breakfast" className="form-check-input" type="checkbox" name="breakfast" checked={form.breakfast} onChange={updateForm} />
                      <label htmlFor="breakfast" className="form-check-label">Breakfast included</label>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-check">
                      <input id="freeCancel" className="form-check-input" type="checkbox" name="freeCancel" checked={form.freeCancel} onChange={updateForm} />
                      <label htmlFor="freeCancel" className="form-check-label">Free cancellation</label>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Price</label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input name="price" value={form.price} onChange={updateForm} className="form-control" placeholder="0.00" />
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <label className="form-label m-0">Rooms</label>
                      <button type="button" className="btn btn-sm btn-outline-secondary" onClick={addRoom}>Add room</button>
                    </div>
                    <div className="vstack gap-2">
                      {rooms.map((r, idx) => (
                        <div key={idx} className="d-flex align-items-center gap-2">
                          <div className="input-group" style={{ maxWidth: 220 }}>
                            <span className="input-group-text">Count</span>
                            <input type="number" min="1" max="10" className="form-control" value={r.count} onChange={(e) => changeRoom(idx, e.target.value)} />
                          </div>
                          {rooms.length > 1 && (
                            <button type="button" className="btn btn-outline-danger" onClick={() => removeRoom(idx)}>Remove</button>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="form-text mt-1">Total rooms: {totalRooms}</div>
                  </div>

                  {selectedHotel && (
                    <div className="col-12">
                      <div className="rounded p-3" style={{ background: '#f8fafc' }}>
                        <div className="fw-semibold mb-2">Selected hotel</div>
                        <div className="row">
                          <div className="col-md-8">
                            <div className="mb-1"><span className="text-muted">Name: </span>{selectedHotel.name}</div>
                            <div className="mb-1"><span className="text-muted">City: </span>{selectedHotel.city}</div>
                            <div className="mb-1"><span className="text-muted">Address: </span>{selectedHotel.address}</div>
                            <div className="mb-1"><span className="text-muted">Stars: </span>{selectedHotel.stars || '-'}</div>
                          </div>
                          <div className="col-md-4 d-flex align-items-end justify-content-md-end mt-3 mt-md-0">
                            <button type="button" className="btn btn-outline-secondary" onClick={() => setSelectedHotel(null)}>Clear selection</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="col-12 d-flex gap-2 mt-2">
                    <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving…' : 'Create proposal'}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-5">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h5 className="m-0">Select hotel</h5>
                  <button className="btn btn-sm btn-outline-secondary" onClick={resetFilters}>Reset</button>
                </div>

                <form onSubmit={applyFilters} className="row g-2 mb-3">
                  <div className="col-md-5">
                    <input className="form-control" placeholder="City" value={filters.city} onChange={(e) => setFilters(s => ({ ...s, city: e.target.value }))} />
                  </div>
                  <div className="col-md-4">
                    <select className="form-select" value={filters.stars} onChange={(e) => setFilters(s => ({ ...s, stars: e.target.value }))}>
                      <option value="">Stars</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <button type="submit" className="btn btn-primary w-100">Find</button>
                  </div>
                  <div className="col-12">
                    <input className="form-control" placeholder="Name" value={filters.name} onChange={(e) => setFilters(s => ({ ...s, name: e.target.value }))} />
                  </div>
                </form>

                <div style={{ maxHeight: 520, overflowY: 'auto' }}>
                  {loadingHotels && <div className="py-4 text-center text-muted">Loading…</div>}
                  {!loadingHotels && hotels.length === 0 && <div className="py-4 text-center text-muted">No results</div>}
                  {!loadingHotels && hotels.length > 0 && (
                    <div className="vstack gap-2">
                      {hotels.map(h => (
                        <div
                          key={h.id}
                          className={`border rounded-3 p-3 ${selectedHotel && selectedHotel.id === h.id ? 'border-primary' : 'border-light'}`}
                          style={{ background: '#ffffff' }}
                        >
                          <div className="d-flex align-items-start justify-content-between">
                            <div>
                              <div className="fw-semibold">{h.name}</div>
                              <div className="text-muted">{h.city} • {h.address}</div>
                              <div className="small mt-1">Stars: {h.stars || '-'}</div>
                              <div className="small">Breakfast: {h.breakfast ? 'yes' : 'no'}</div>
                            </div>
                            <div className="d-flex flex-column gap-2">
                              <button className="btn btn-sm btn-outline-primary" onClick={() => setSelectedHotel(h)}>Select</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProposalFormPage;
