import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const ProposalsViewPage = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/proposals');
      if (response.ok) {
        const data = await response.json();
        setProposals(data);
      } else {
        setError('Failed to fetch proposals');
      }
      setLoading(false);
    } catch (err) {
      setError('Error fetching proposals');
      setLoading(false);
    }
  };

  const deleteProposal = async (id) => {
    if (window.confirm('Are you sure you want to delete this proposal?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/proposals/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          setProposals(proposals.filter(p => p.id !== id));
          alert('Proposal deleted successfully');
        } else {
          alert('Failed to delete proposal');
        }
      } catch (err) {
        alert('Error deleting proposal');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) return <div className="container mt-5"><div className="alert alert-info">Loading proposals...</div></div>;
  if (error) return <div className="container mt-5"><div className="alert alert-danger">{error}</div></div>;

  return (
    <div className="container-fluid mt-3">
      <div className="row mb-4">
        <div className="col-md-8">
          <h1>Proposals Management</h1>
          <p className="text-muted">Total proposals: {proposals.length}</p>
        </div>
        <div className="col-md-4 text-end">
          <button 
            className="btn btn-success me-2"
            onClick={() => navigate('/form')}
          >
            Create New Proposal
          </button>
          <button 
            className="btn btn-outline-secondary"
            onClick={() => navigate('/')}
          >
            Back to Hotels
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover table-bordered">
              <thead className="table-dark">
                <tr>
                  <th>Proposal #</th>
                  <th>Client Name</th>
                  <th>Hotel</th>
                  <th>City</th>
                  <th>Guests</th>
                  <th>Rooms</th>
                  <th>Room Type</th>
                  <th>Nights</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Price</th>
                  <th>Breakfast</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {proposals.map(proposal => (
                  <tr key={proposal.id}>
                    <td>
                      <strong className="text-primary">{proposal.proposalNumber}</strong>
                    </td>
                    <td>{proposal.clientName}</td>
                    <td>{proposal.hotel?.name}</td>
                    <td>{proposal.hotel?.city}</td>
                    <td>
                      <span className="badge bg-info">{proposal.guests}</span>
                    </td>
                    <td>
                      <span className="badge bg-warning">{proposal.numberOfRooms}</span>
                    </td>
                    <td>
                      <span className="badge bg-secondary">{proposal.roomType}</span>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark">{proposal.nights}</span>
                    </td>
                    <td>{formatDate(proposal.checkIn)}</td>
                    <td>{formatDate(proposal.checkOut)}</td>
                    <td>
                      <strong>€{proposal.price}</strong>
                    </td>
                    <td>
                      <span className={`badge ${proposal.breakfast ? 'bg-success' : 'bg-secondary'}`}>
                        {proposal.breakfast ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button 
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => deleteProposal(proposal.id)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {proposals.length === 0 && (
            <div className="text-center py-5">
              <div className="mb-3">
                <i className="bi bi-file-text" style={{fontSize: '3rem', color: '#ccc'}}></i>
              </div>
              <h5 className="text-muted">No proposals found</h5>
              <p className="text-muted">Create your first proposal by clicking the button above.</p>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/form')}
              >
                Create First Proposal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProposalsViewPage;