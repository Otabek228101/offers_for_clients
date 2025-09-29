import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const CreateHotelPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    city: '',
    group_name: '',
    type: 'hotel',
    stars: 4,
    address: '',
    location_link: '',
    website_link: '',
    breakfast: false
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const onFilesChange = (e) => {
    setFiles(Array.from(e.target.files || []));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.city || !form.address) {
      alert('Name, City, Address are required');
      return;
    }
    if (Number(form.stars) < 1 || Number(form.stars) > 5) {
      alert('Stars must be between 1 and 5');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        city: form.city,
        group_name: form.group_name,
        type: form.type,
        stars: Number(form.stars),
        address: form.address,
        location_link: form.location_link,
        website_link: form.website_link,
        breakfast: Boolean(form.breakfast)
      };
      const res = await fetch('http://localhost:8080/api/hotels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data && data.error ? data.error : 'Create failed');
      }
      if (files.length) {
        const fd = new FormData();
        files.forEach((f) => fd.append('files', f));
        const up = await fetch(`http://localhost:8080/api/hotels/${data.id}/images`, {
          method: 'POST',
          body: fd
        });
        const upj = await up.json();
        if (!up.ok) {
          throw new Error(upj && upj.error ? upj.error : 'Upload failed');
        }
      }
      alert('Hotel created');
      navigate('/');
    } catch (err) {
      alert(String(err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <h3 className="mb-3">Create Hotel</h3>
      <form onSubmit={submit}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Name</label>
            <input className="form-control" name="name" value={form.name} onChange={onChange} />
          </div>
          <div className="col-md-6">
            <label className="form-label">City</label>
            <input className="form-control" name="city" value={form.city} onChange={onChange} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Group</label>
            <input className="form-control" name="group_name" value={form.group_name} onChange={onChange} />
          </div>
          <div className="col-md-3">
            <label className="form-label">Type</label>
            <select className="form-select" name="type" value={form.type} onChange={onChange}>
              <option value="hotel">hotel</option>
              <option value="apartment">apartment</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">Stars</label>
            <input className="form-control" type="number" min="1" max="5" name="stars" value={form.stars} onChange={onChange} />
          </div>
          <div className="col-12">
            <label className="form-label">Address</label>
            <input className="form-control" name="address" value={form.address} onChange={onChange} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Website</label>
            <input className="form-control" name="website_link" value={form.website_link} onChange={onChange} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Location Link</label>
            <input className="form-control" name="location_link" value={form.location_link} onChange={onChange} />
          </div>
          <div className="col-md-3 d-flex align-items-end">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" name="breakfast" checked={form.breakfast} onChange={onChange} id="breakfast" />
              <label className="form-check-label" htmlFor="breakfast">Breakfast</label>
            </div>
          </div>
          <div className="col-md-9">
            <label className="form-label">Upload Images</label>
            <input className="form-control" type="file" accept=".jpg,.jpeg,.png,.webp" multiple onChange={onFilesChange} />
            <div className="form-text">{files.length ? `${files.length} file(s) selected` : ''}</div>
          </div>
        </div>
        <div className="mt-4 d-flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
          <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/')}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default CreateHotelPage;
