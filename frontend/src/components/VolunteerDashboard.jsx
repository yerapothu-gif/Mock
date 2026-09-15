import React, { useState, useEffect } from 'react';
import {
  MapPin, Plus, Search, Users, Sprout, Droplets, CheckCircle,
  FileText, Database, HardDrive, RefreshCw, Crosshair, ChevronRight, X
} from 'lucide-react';
import { villageApi, localStore } from '../api';

export default function VolunteerDashboard({ currentUser, onNotify }) {
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVillage, setSelectedVillage] = useState(null);
  const [villageFarmers, setVillageFarmers] = useState([]);
  const [farmersLoading, setFarmersLoading] = useState(false);

  // Modals
  const [showCreateVillage, setShowCreateVillage] = useState(false);
  const [showFarmerModal, setShowFarmerModal] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [isEditingFarmer, setIsEditingFarmer] = useState(false);

  // New Village Form State
  const [newVillage, setNewVillage] = useState({
    name: '',
    district: 'Raisen',
    block: 'Obedullaganj',
    latitude: 22.9834,
    longitude: 77.6214,
    farmerCount: 100,
    majorCrops: 'Wheat, Soybean, Gram',
    waterResources: 'Canal, Borewell',
    acres: 450,
    shgName: 'Ekta Mahila SHG',
    fpoName: 'Bhimbetka FPO',
  });

  // Farmer / Form State
  const [farmerForm, setFarmerForm] = useState({
    name: '',
    phone: '',
    contactInfo: '',
    landSize: 4.0,
    crops: 'Wheat, Soybean',
    education: '12th Pass',
    sourcesOfIncome: 'Farming, Dairy',
    isPotentialVLE: false,
    notes: '',
    // Needs Assessment / Demand
    demandMachine: 'Rotavator',
    demandUrgency: 'high',
    demandNotes: '',
  });

  const loadVillages = async () => {
    setLoading(true);
    try {
      const res = await villageApi.getAll({ search: searchQuery });
      setVillages(res.data?.villages || []);
    } catch (err) {
      onNotify('Failed to fetch villages: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVillages();
  }, [searchQuery]);

  const loadVillageDetails = async (village) => {
    setSelectedVillage(village);
    setFarmersLoading(true);
    try {
      const res = await villageApi.getFarmers(village._id);
      setVillageFarmers(res.data || []);
    } catch (err) {
      onNotify('Failed to fetch farmers: ' + err.message, 'error');
    } finally {
      setFarmersLoading(false);
    }
  };

  // Auto-capture GPS coordinates helper
  const handleCaptureGPS = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setNewVillage((prev) => ({
            ...prev,
            latitude: Number(pos.coords.latitude.toFixed(4)),
            longitude: Number(pos.coords.longitude.toFixed(4)),
          }));
          onNotify('GPS coordinates successfully captured', 'success');
        },
        () => {
          // Fallback Ratapani sanctuary coordinates
          setNewVillage((prev) => ({
            ...prev,
            latitude: 22.9834,
            longitude: 77.6214,
          }));
          onNotify('GPS simulation active: Set to Raisen District center', 'info');
        }
      );
    }
  };

  // Create Village Submit
  const handleCreateVillageSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: newVillage.name.trim(),
        district: newVillage.district.trim(),
        block: newVillage.block.trim(),
        location: {
          type: 'Point',
          coordinates: [Number(newVillage.longitude), Number(newVillage.latitude)],
        },
        farmerCount: Number(newVillage.farmerCount),
        majorCrops: newVillage.majorCrops.split(',').map((s) => s.trim()).filter(Boolean),
        waterResources: newVillage.waterResources.split(',').map((s) => s.trim()).filter(Boolean),
        acres: Number(newVillage.acres),
        communityStructures: [
          ...(newVillage.shgName ? [{ type: 'SHG', name: newVillage.shgName }] : []),
          ...(newVillage.fpoName ? [{ type: 'FPO', name: newVillage.fpoName }] : []),
        ],
        readinessStage: 'identified',
      };

      const res = await villageApi.create(payload);
      onNotify(`Village "${res.data.name}" created and synced to database!`, 'success');
      setShowCreateVillage(false);
      loadVillages();
      loadVillageDetails(res.data);
    } catch (err) {
      onNotify(err.message || 'Error creating village', 'error');
    }
  };

  // Click on Farmer: Display form or allow volunteer to fill
  const handleOpenFarmerForm = (farmer = null) => {
    if (farmer) {
      setSelectedFarmer(farmer);
      setIsEditingFarmer(false);
      setFarmerForm({
        name: farmer.name || '',
        phone: farmer.phone || '',
        contactInfo: farmer.contactInfo || '',
        landSize: farmer.landSize || 0,
        crops: (farmer.crops || []).join(', '),
        education: farmer.education || '10th Pass',
        sourcesOfIncome: (farmer.sourcesOfIncome || []).join(', '),
        isPotentialVLE: !!farmer.isPotentialVLE,
        notes: farmer.notes || '',
        demandMachine: 'Rotavator',
        demandUrgency: 'medium',
        demandNotes: '',
      });
    } else {
      setSelectedFarmer(null);
      setIsEditingFarmer(true);
      setFarmerForm({
        name: '',
        phone: '',
        contactInfo: '',
        landSize: 4.5,
        crops: 'Wheat, Soybean',
        education: '12th Pass',
        sourcesOfIncome: 'Farming, Dairy',
        isPotentialVLE: false,
        notes: '',
        demandMachine: 'Rotavator',
        demandUrgency: 'high',
        demandNotes: 'Urgent machinery requirement before monsoon',
      });
    }
    setShowFarmerModal(true);
  };

  // Save Farmer to DB or Local Cache
  const handleSaveFarmerSubmit = async (saveLocally = false) => {
    if (!farmerForm.name.trim()) {
      onNotify('Farmer name is required', 'error');
      return;
    }
    if (!selectedVillage) {
      onNotify('Please select a village first', 'error');
      return;
    }

    const payload = {
      name: farmerForm.name.trim(),
      phone: farmerForm.phone.trim(),
      contactInfo: farmerForm.contactInfo.trim(),
      landSize: Number(farmerForm.landSize),
      crops: farmerForm.crops.split(',').map((s) => s.trim()).filter(Boolean),
      education: farmerForm.education,
      sourcesOfIncome: farmerForm.sourcesOfIncome.split(',').map((s) => s.trim()).filter(Boolean),
      isPotentialVLE: farmerForm.isPotentialVLE,
      notes: farmerForm.notes,
    };

    if (saveLocally) {
      localStore.saveLocalDraft('farmers', {
        ...payload,
        villageId: selectedVillage._id,
        villageName: selectedVillage.name,
      });
      onNotify(`Farmer form for ${payload.name} saved locally in offline storage!`, 'success');
      setShowFarmerModal(false);
      return;
    }

    try {
      await villageApi.addFarmer(selectedVillage._id, payload);

      // If demand filled, also log Needs Assessment request
      if (farmerForm.demandMachine) {
        await villageApi.submitAssessment(selectedVillage._id, {
          processesEvaluated: [{ stage: 'land_preparation', notes: 'Field volunteer recorded gap' }],
          gapsIdentified: [`${farmerForm.demandMachine} required`],
          farmerRequests: [
            {
              farmerName: payload.name,
              requestType: farmerForm.demandMachine,
              urgency: farmerForm.demandUrgency,
              notes: farmerForm.demandNotes || 'Logged during field survey',
              status: 'open',
            },
          ],
        });
      }

      onNotify(`Farmer ${payload.name} registered and synced to Village Database!`, 'success');
      setShowFarmerModal(false);
      loadVillageDetails(selectedVillage);
      loadVillages();
    } catch (err) {
      onNotify(err.message || 'Error submitting farmer record', 'error');
    }
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 20px' }}>
      {/* Top Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 24
      }}>
        <div>
          <h1 style={{ fontSize: 26, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 10 }}>
            Field Volunteer Portal
            <span className="badge badge-blue">Ground Scouting</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 13.5, marginTop: 4 }}>
            Map villages, survey farmer landholdings, and log localized machinery demand.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            className="btn btn-secondary"
            onClick={loadVillages}
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            Refresh
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateVillage(true)}
          >
            <Plus size={16} />
            Create New Village
          </button>
        </div>
      </div>

      {/* Main Grid: Left = Village Database, Right = Selected Village Details & Farmers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 420px) 1fr', gap: 24 }}>
        {/* Left Column: Village Explorer */}
        <div className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 15 }}>
              <Database size={17} color="#38bdf8" />
              Village Directory ({villages.length})
            </div>
            <span className="badge badge-muted">Raisen District</span>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Search village by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: 38, fontSize: 13 }}
            />
            <Search size={15} color="#64748b" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          {/* Village List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '68vh', overflowY: 'auto', paddingRight: 4 }}>
            {loading && villages.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>Loading villages...</div>
            ) : villages.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>
                No villages found. Click "Create New Village" to add one.
              </div>
            ) : (
              villages.map((v) => {
                const isSelected = selectedVillage?._id === v._id;
                return (
                  <div
                    key={v._id}
                    className="glass-card-interactive"
                    onClick={() => loadVillageDetails(v)}
                    style={{
                      padding: 14,
                      borderRadius: 12,
                      borderColor: isSelected ? 'var(--primary-light)' : 'var(--border-subtle)',
                      background: isSelected ? 'rgba(34, 197, 94, 0.08)' : 'var(--bg-card)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14.5, color: '#f8fafc' }}>
                        {v.name}
                      </div>
                      <div style={{ fontSize: 12, color: '#94a3b8', display: 'flex', gap: 12, marginTop: 4 }}>
                        <span>Block: {v.block || 'Obedullaganj'}</span>
                        <span>Acres: {v.acres || 0}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                        <span className={`badge ${v.readinessStage === 'vle-active' ? 'badge-green' : v.readinessStage === 'assessed' ? 'badge-blue' : 'badge-amber'}`} style={{ fontSize: 10 }}>
                          {v.readinessStage}
                        </span>
                        <span className="badge badge-muted" style={{ fontSize: 10 }}>
                          {v.farmerCount || 0} Farmers
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={18} color={isSelected ? '#4ade80' : '#64748b'} />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Village Deep-Dive & Farmer Database */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {selectedVillage ? (
            <>
              {/* Village Overview Card */}
              <div className="glass-card" style={{ padding: 22 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <h2 style={{ fontSize: 22, color: '#f8fafc' }}>{selectedVillage.name}</h2>
                      <span className="badge badge-green">{selectedVillage.district}</span>
                      <span className="badge badge-muted">GPS: {selectedVillage.location?.coordinates?.join(', ')}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 20, marginTop: 8, fontSize: 13, color: '#94a3b8' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Sprout size={14} color="#4ade80" /> Crops: {(selectedVillage.majorCrops || []).join(', ')}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Droplets size={14} color="#38bdf8" /> Water: {(selectedVillage.waterResources || []).join(', ')}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Users size={14} color="#fbbf24" /> Total Land: {selectedVillage.acres} Acres
                      </span>
                    </div>
                  </div>

                  <button
                    className="btn btn-outline-green btn-sm"
                    onClick={() => handleOpenFarmerForm(null)}
                  >
                    <Plus size={15} />
                    Register / Fill Farmer Form
                  </button>
                </div>
              </div>

              {/* Farmers in this Village */}
              <div className="glass-card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc' }}>
                      Farmers Registered in {selectedVillage.name}
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>
                      Click on any farmer to inspect their filled survey form or update their demands.
                    </div>
                  </div>
                  <span className="badge badge-blue">{villageFarmers.length} Farmers Recorded</span>
                </div>

                {farmersLoading ? (
                  <div style={{ padding: 30, textAlign: 'center', color: '#64748b' }}>Fetching farmers...</div>
                ) : villageFarmers.length === 0 ? (
                  <div style={{
                    padding: 36,
                    textAlign: 'center',
                    border: '1px dashed var(--border-medium)',
                    borderRadius: 12,
                    color: '#94a3b8'
                  }}>
                    <Users size={32} color="#64748b" style={{ margin: '0 auto 10px' }} />
                    <div>No farmers recorded for this village yet.</div>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ marginTop: 12 }}
                      onClick={() => handleOpenFarmerForm(null)}
                    >
                      <Plus size={14} />
                      Fill First Farmer Form
                    </button>
                  </div>
                ) : (
                  <div className="data-table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Farmer Name</th>
                          <th>Contact</th>
                          <th>Landholdings</th>
                          <th>Education</th>
                          <th>Crops</th>
                          <th>Candidacy</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {villageFarmers.map((f) => (
                          <tr key={f._id} style={{ cursor: 'pointer' }} onClick={() => handleOpenFarmerForm(f)}>
                            <td style={{ fontWeight: 600, color: '#f8fafc' }}>{f.name}</td>
                            <td>{f.phone || f.contactInfo || 'N/A'}</td>
                            <td>{f.landSize} Acres</td>
                            <td>{f.education || 'No Formal'}</td>
                            <td>{(f.crops || []).join(', ') || 'N/A'}</td>
                            <td>
                              {f.isPotentialVLE ? (
                                <span className="badge badge-green" style={{ fontSize: 11 }}>
                                  Potential VLE
                                </span>
                              ) : (
                                <span className="badge badge-muted" style={{ fontSize: 11 }}>
                                  Farmer
                                </span>
                              )}
                            </td>
                            <td>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={(e) => { e.stopPropagation(); handleOpenFarmerForm(f); }}
                              >
                                <FileText size={13} />
                                View Form
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="glass-card" style={{ padding: 60, textAlign: 'center' }}>
              <MapPin size={48} color="#22c55e" style={{ margin: '0 auto 16px', opacity: 0.8 }} />
              <h3 style={{ fontSize: 20, color: '#f8fafc' }}>Select a Village to Manage</h3>
              <p style={{ color: '#94a3b8', maxWidth: 420, margin: '8px auto 20px', fontSize: 13.5 }}>
                Choose a village from the directory on the left or create a new village record to start scouting farmers and logging machinery requirements.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => setShowCreateVillage(true)}
              >
                <Plus size={16} />
                Create New Village
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CREATE VILLAGE MODAL */}
      {showCreateVillage && (
        <div className="modal-overlay" onClick={() => setShowCreateVillage(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600, padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 20, color: '#f8fafc' }}>New Village Record</h3>
                <p style={{ fontSize: 12.5, color: '#94a3b8' }}>Geospatial mapping and baseline agricultural profile</p>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowCreateVillage(false)}
                style={{ borderRadius: '50%', width: 30, height: 30, padding: 0 }}
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleCreateVillageSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="input-group">
                  <label className="input-label">Village Name *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Barkheda"
                    value={newVillage.name}
                    onChange={(e) => setNewVillage({ ...newVillage, name: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">District *</label>
                  <input
                    type="text"
                    className="input-field"
                    value={newVillage.district}
                    onChange={(e) => setNewVillage({ ...newVillage, district: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div className="input-group">
                  <label className="input-label">Block / Tehsil</label>
                  <input
                    type="text"
                    className="input-field"
                    value={newVillage.block}
                    onChange={(e) => setNewVillage({ ...newVillage, block: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Farmer Count</label>
                  <input
                    type="number"
                    className="input-field"
                    value={newVillage.farmerCount}
                    onChange={(e) => setNewVillage({ ...newVillage, farmerCount: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Total Acres</label>
                  <input
                    type="number"
                    className="input-field"
                    value={newVillage.acres}
                    onChange={(e) => setNewVillage({ ...newVillage, acres: e.target.value })}
                  />
                </div>
              </div>

              {/* Coordinates with Auto-Capture */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: 12,
                borderRadius: 10,
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#f8fafc' }}>GeoJSON Coordinates</span>
                  <button
                    type="button"
                    className="btn btn-outline-green btn-sm"
                    onClick={handleCaptureGPS}
                  >
                    <Crosshair size={13} />
                    Auto-Capture GPS
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="input-group">
                    <label className="input-label">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      className="input-field"
                      value={newVillage.latitude}
                      onChange={(e) => setNewVillage({ ...newVillage, latitude: e.target.value })}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      className="input-field"
                      value={newVillage.longitude}
                      onChange={(e) => setNewVillage({ ...newVillage, longitude: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Major Crops (comma separated)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Wheat, Soybean, Gram, Paddy"
                  value={newVillage.majorCrops}
                  onChange={(e) => setNewVillage({ ...newVillage, majorCrops: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Water Resources</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Canal, Borewell, River, Rainfed"
                  value={newVillage.waterResources}
                  onChange={(e) => setNewVillage({ ...newVillage, waterResources: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="input-group">
                  <label className="input-label">Local SHG Name</label>
                  <input
                    type="text"
                    className="input-field"
                    value={newVillage.shgName}
                    onChange={(e) => setNewVillage({ ...newVillage, shgName: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Local FPO Name</label>
                  <input
                    type="text"
                    className="input-field"
                    value={newVillage.fpoName}
                    onChange={(e) => setNewVillage({ ...newVillage, fpoName: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateVillage(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <CheckCircle size={15} />
                  Save & Sync Village
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FARMER SURVEY FORM MODAL */}
      {showFarmerModal && (
        <div className="modal-overlay" onClick={() => setShowFarmerModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640, padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 20, color: '#f8fafc' }}>
                  {selectedFarmer ? `Farmer Form: ${selectedFarmer.name}` : `Survey New Farmer (${selectedVillage?.name})`}
                </h3>
                <p style={{ fontSize: 12.5, color: '#94a3b8' }}>
                  {selectedFarmer ? 'Review submitted farmer data or update operational needs' : 'Fill farmer landholding details or store locally in offline storage'}
                </p>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowFarmerModal(false)}
                style={{ borderRadius: '50%', width: 30, height: 30, padding: 0 }}
              >
                <X size={15} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="input-group">
                  <label className="input-label">Farmer Full Name *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Ramdas Patel"
                    value={farmerForm.name}
                    onChange={(e) => setFarmerForm({ ...farmerForm, name: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Phone Number</label>
                  <input
                    type="tel"
                    className="input-field"
                    placeholder="10-digit number"
                    value={farmerForm.phone}
                    onChange={(e) => setFarmerForm({ ...farmerForm, phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="input-group">
                  <label className="input-label">Land Size (Acres) *</label>
                  <input
                    type="number"
                    step="0.1"
                    className="input-field"
                    value={farmerForm.landSize}
                    onChange={(e) => setFarmerForm({ ...farmerForm, landSize: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Education Qualification</label>
                  <select
                    className="select-field"
                    value={farmerForm.education}
                    onChange={(e) => setFarmerForm({ ...farmerForm, education: e.target.value })}
                  >
                    <option value="No Formal Education">No Formal Education</option>
                    <option value="Primary (1-5th)">Primary (1-5th)</option>
                    <option value="Middle (6-8th)">Middle (6-8th)</option>
                    <option value="10th Pass">10th Pass</option>
                    <option value="12th Pass">12th Pass</option>
                    <option value="Diploma / ITI">Diploma / ITI</option>
                    <option value="Graduate">Graduate</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Crops Cultivated</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Wheat, Soybean, Gram"
                  value={farmerForm.crops}
                  onChange={(e) => setFarmerForm({ ...farmerForm, crops: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Sources of Income</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Farming, Dairy, Agri-labor"
                  value={farmerForm.sourcesOfIncome}
                  onChange={(e) => setFarmerForm({ ...farmerForm, sourcesOfIncome: e.target.value })}
                />
              </div>

              {/* VLE Candidate Checkbox */}
              <div style={{
                background: 'rgba(34, 197, 94, 0.08)',
                border: '1px solid rgba(74, 222, 128, 0.25)',
                padding: 12,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 10
              }}>
                <input
                  type="checkbox"
                  id="vleCandidateCheck"
                  checked={farmerForm.isPotentialVLE}
                  onChange={(e) => setFarmerForm({ ...farmerForm, isPotentialVLE: e.target.checked })}
                  style={{ width: 18, height: 18, accentColor: '#22c55e' }}
                />
                <label htmlFor="vleCandidateCheck" style={{ fontSize: 13, color: '#f8fafc', fontWeight: 600, cursor: 'pointer' }}>
                  Tag as Potential VLE Candidate (Entrepreneurial background, machinery experience)
                </label>
              </div>

              {/* Machinery Needs Section */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: 12,
                borderRadius: 10,
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', marginBottom: 8 }}>
                  Conduct Needs Assessment (Machinery Demand)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="input-group">
                    <label className="input-label">Machine Type Needed</label>
                    <select
                      className="select-field"
                      value={farmerForm.demandMachine}
                      onChange={(e) => setFarmerForm({ ...farmerForm, demandMachine: e.target.value })}
                    >
                      <option value="Rotavator">Rotavator (Tillage)</option>
                      <option value="Paddy Transplanter">Paddy Transplanter</option>
                      <option value="Power Sprayer">Power Sprayer</option>
                      <option value="Tractor 45HP">Tractor 45HP</option>
                      <option value="Seed Drill">Seed Drill</option>
                      <option value="Combine Harvester">Combine Harvester</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Urgency Level</label>
                    <select
                      className="select-field"
                      value={farmerForm.demandUrgency}
                      onChange={(e) => setFarmerForm({ ...farmerForm, demandUrgency: e.target.value })}
                    >
                      <option value="low">Low (Next Season)</option>
                      <option value="medium">Medium (Within Month)</option>
                      <option value="high">High (Immediate Tillage)</option>
                      <option value="critical">Critical (Harvest Window)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleSaveFarmerSubmit(true)}
                  title="Store locally in IndexedDB / LocalStorage without connecting to server"
                >
                  <HardDrive size={14} color="#38bdf8" />
                  Store Form Locally (Offline)
                </button>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowFarmerModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => handleSaveFarmerSubmit(false)}
                  >
                    <CheckCircle size={14} />
                    Sync & Save to Village DB
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
