import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import HotelsPage from './page/HotelsPage';
import ProposalFormPage from './page/ProposalFormPage';
import ProposalsViewPage from './page/ProposalsViewPage';
import CreateHotelPage from './page/CreateHotelPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HotelsPage />} />
        <Route path="/form" element={<ProposalFormPage />} />
        <Route path="/proposals" element={<ProposalsViewPage />} />
        <Route path="/create-hotel" element={<CreateHotelPage />} />
      </Routes>
    </Router>
  );
}

export default App;
