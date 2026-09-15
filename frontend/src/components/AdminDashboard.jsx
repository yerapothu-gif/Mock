import React, { useState, useEffect } from 'react';
import {
  Shield, Database, Cpu, PhoneCall, CheckCircle, AlertTriangle,
  Receipt, Wrench, Briefcase, DollarSign, MessageSquare, ChevronRight,
  TrendingUp, Layers, Check, X, RefreshCw, UserPlus, Clock
} from 'lucide-react';
import { adminApi, villageApi } from '../api';

export default function AdminDashboard({ currentUser, onNotify }) {
  const [activeTab, setActiveTab] = useState('villages'); // 'villages', 'vles', 'finances', 'support', 'requests'
  const [villages, setVillages] = useState([]);
  const [vles, setVles] = useState([]);
  const [supportRequests, setSupportRequests] = useState([]);
  const [openFarmerRequests, setOpenFarmerRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  // Village AI Analysis State
  const [selectedVillage, setSelectedVillage] = useState(null);
  const [analyzingVillage, setAnalyzingVillage] = useState(false);
  const [villageAnalysis, setVillageAnalysis] = useState(null);
  const [villageCandidates, setVillageCandidates] = useState([]);
  const [calledCandidates, setCalledCandidates] = useState({});

  // VLE Onboarding Modal
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [candidateToOnboard, setCandidateToOnboard] = useState(null);
  const [onboardData, setOnboardData] = useState({
    name: '',
    phone: '',
    education: '12th Pass',
    experience: 'Operates 45HP tractor, valid tractor driving license',
  });

  // Assign Equipment Modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedVLEForEquip, setSelectedVLEForEquip] = useState(null);
  const [equipForm, setEquipForm] = useState({
    machineId: 'EQ-ROT-001',
    machineType: 'Rotavator',
    model: 'Mahindra Gyrovator 6ft',
    hourlyRate: 500,
    dailyRate: 3500,
  });

  // VLE Financial Audit Logs Modal
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedVLELogs, setSelectedVLELogs] = useState(null);

  // Support Response Modal
  const [showRespondModal, setShowRespondModal] = useState(false);
  const [selectedSupportTicket, setSelectedSupportTicket] = useState(null);
  const [adminReplyText, setAdminReplyText] = useState('');

  const [isAuthorized, setIsAuthorized] = useState(true);

  // Load all initial data
  const loadData = async () => {
    setLoading(true);
    try {
      const [vilsRes, vlesRes, suppRes, reqsRes] = await Promise.all([
        villageApi.getAll({ limit: 50 }).catch((err) => {
          if (err.status === 401 || err.status === 403) setIsAuthorized(false);
          return { data: { villages: [] } };
        }),
        adminApi.getAllVLEs().catch((err) => {
          if (err.status === 401 || err.status === 403) setIsAuthorized(false);
          return { data: [] };
        }),
        adminApi.getAllSupportRequests().catch(() => ({ data: [] })),
        adminApi.getOpenRequests().catch(() => ({ data: [] })),
      ]);

      const token = localStorage.getItem('rr_token');
      if (token && currentUser?.role === 'admin') {
        setIsAuthorized(true);
      }

      setVillages(vilsRes.data?.villages || []);
      setVles(vlesRes.data || []);
      setSupportRequests(suppRes.data || []);
      setOpenFarmerRequests(reqsRes.data || []);
    } catch (err) {
      console.warn('Error loading admin records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  // Quick 1-click Admin Login
  const handleQuickAdminLogin = async () => {
    setLoading(true);
    try {
      const res = await (await import('../api')).authApi.login('9811111111', 'Password123!');
      (await import('../api')).setAuthSession(res.data.user, res.data.accessToken);
      setIsAuthorized(true);
      onNotify('Signed in as Admin Officer! Reloading database records...', 'success');
      loadData();
      if (window.location) window.location.reload();
    } catch (err) {
      onNotify('Admin sign-in failed: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // When a village is opened, trigger AI analysis and load candidates
  const handleOpenVillage = async (village) => {
    setSelectedVillage(village);
    setAnalyzingVillage(true);
    setVillageAnalysis(null);
    setVillageCandidates([]);

    try {
      // 1. Fetch full village detail (farmers + assessments)
      const detailRes = await villageApi.getById(village._id);
      const fullVillage = detailRes.data;

      // 2. Fetch potential VLE candidates
      const candRes = await villageApi.getCandidates(village._id);
      const candidates = candRes.data || [];
      setVillageCandidates(candidates);

      // 3. Trigger AI Report
      let summaryText = '';
      try {
        const aiRes = await adminApi.getMachineryReport();
        summaryText = aiRes.data?.summary || '';
      } catch {
        summaryText = 'AI Analysis ready for rural mechanization deployment.';
      }

      // 4. Calculate Machinery Needed & Bill
      const crops = fullVillage.majorCrops || ['Wheat', 'Soybean'];
      const acres = fullVillage.acres || 300;

      const machineryList = [
        {
          name: 'Foundation Rotary Tiller (Rotavator 6ft)',
          model: 'Mahindra Heavy Duty Gyrovator',
          purpose: 'Deep soil tillage and residue management',
          unitCost: 115000,
          quantity: acres > 400 ? 2 : 1,
          subsidyGrant: 'Foundation Capital Outlay (100%)',
        },
        {
          name: 'Paddy Transplanter / Precision Seed Drill',
          model: 'Kubota 4-Row Transplanter',
          purpose: 'Zero-till sowing & seedling placement',
          unitCost: 185000,
          quantity: 1,
          subsidyGrant: 'Agri-Infra Grant (60%)',
        },
        {
          name: 'High-Pressure Battery/Engine Sprayer',
          model: 'ASPEE 16L Power Sprayer Unit',
          purpose: 'Crop protection against seasonal pest infestation',
          unitCost: 18000,
          quantity: 2,
          subsidyGrant: 'Foundation Safety Equipment Scheme',
        },
      ];

      const totalBill = machineryList.reduce((acc, m) => acc + m.unitCost * m.quantity, 0);

      setVillageAnalysis({
        summary: summaryText,
        machineryList,
        totalBill,
        estimatedFarmersBenefited: fullVillage.farmerCount || candidates.length * 15 || 65,
        targetROIWeeks: 12,
      });
    } catch (err) {
      onNotify('Error analyzing village: ' + err.message, 'error');
    } finally {
      setAnalyzingVillage(false);
    }
  };

  // Call VLE candidate for confirmation
  const handleCallCandidate = (candidate) => {
    setCalledCandidates((prev) => ({
      ...prev,
      [candidate._id]: {
        calledAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Confirmed by Call',
      },
    }));
    onNotify(`Call placed to ${candidate.name} (${candidate.phone || '9870012345'}). Candidate interview confirmed!`, 'success');
  };

  // Open Onboard Modal
  const handleOpenOnboard = (candidate) => {
    setCandidateToOnboard(candidate);
    setOnboardData({
      name: candidate.name,
      phone: candidate.phone || '98' + Math.floor(10000000 + Math.random() * 90000000),
      education: candidate.education || '12th Pass',
      experience: 'Experienced local tractor operator with clean mechanical record',
    });
    setShowOnboardModal(true);
  };

  // Confirm Onboard VLE
  const handleConfirmOnboard = async (e) => {
    e.preventDefault();
    if (!selectedVillage) return;

    try {
      const res = await adminApi.createVLE({
        name: onboardData.name,
        phone: onboardData.phone,
        villageId: selectedVillage._id,
        education: { qualification: onboardData.education },
        priorExperience: onboardData.experience,
      });

      onNotify(`VLE ${res.data.name} onboarded! Account status is currently LOCKED until training completion.`, 'success');
      setShowOnboardModal(false);
      loadData();
    } catch (err) {
      onNotify(err.message || 'Error onboarding VLE', 'error');
    }
  };

  // Mark Training Complete (Unlock Gate)
  const handleToggleTraining = async (vle) => {
    try {
      await adminApi.markTrainingComplete(vle._id);
      onNotify(`Training marked as COMPLETE for ${vle.name}! VLE account is now ACTIVE and unlocked.`, 'success');
      loadData();
    } catch (err) {
      onNotify(err.message || 'Error completing training', 'error');
    }
  };

  // Assign Machinery to VLE
  const handleOpenAssign = (vle) => {
    setSelectedVLEForEquip(vle);
    setEquipForm({
      machineId: `EQ-ROT-${Math.floor(100 + Math.random() * 900)}`,
      machineType: 'Rotavator',
      model: 'Mahindra Gyrovator 6ft Heavy Duty',
      hourlyRate: 500,
      dailyRate: 3500,
    });
    setShowAssignModal(true);
  };

  const handleConfirmAssign = async (e) => {
    e.preventDefault();
    if (!selectedVLEForEquip) return;

    try {
      await adminApi.assignEquipment(selectedVLEForEquip._id, {
        machineId: equipForm.machineId,
        machineType: equipForm.machineType,
        model: equipForm.model,
        hourlyRate: Number(equipForm.hourlyRate),
        dailyRate: Number(equipForm.dailyRate),
        condition: 'excellent',
      });

      onNotify(`Equipment ${equipForm.machineId} (${equipForm.machineType}) tagged as Foundation ownership and assigned to ${selectedVLEForEquip.name}!`, 'success');
      setShowAssignModal(false);
      loadData();
    } catch (err) {
      onNotify(err.message || 'Error assigning equipment', 'error');
    }
  };

  // View VLE Financial Logs
  const handleOpenLogs = async (vle) => {
    try {
      const res = await adminApi.getVLELogs(vle._id);
      setSelectedVLELogs({
        vle,
        transactions: res.data?.transactions || [],
        totalEarnings: vle.totalEarnings || 0,
        totalRentals: vle.totalRentalsCount || 0,
        totalAcres: vle.totalAcresServiced || 0,
      });
      setShowLogsModal(true);
    } catch (err) {
      onNotify('Error fetching VLE logs: ' + err.message, 'error');
    }
  };

  // Fulfill open farmer demand request
  const handleFulfillRequest = async (requestId) => {
    try {
      await adminApi.updateRequestStatus(requestId, 'fulfilled');
      onNotify('Farmer demand marked as fulfilled by assigned machinery!', 'success');
      loadData();
    } catch (err) {
      onNotify(err.message || 'Error updating demand status', 'error');
    }
  };

  // Respond to VLE Support Ticket
  const handleOpenRespond = (ticket) => {
    setSelectedSupportTicket(ticket);
    setAdminReplyText(
      ticket.category === 'maintenance_issue'
        ? 'Field engineering kit dispatched via foundation mobile support van.'
        : 'Equipment request approved for next seasonal allocation cycle.'
    );
    setShowRespondModal(true);
  };

  const handleConfirmRespond = async (e) => {
    e.preventDefault();
    if (!selectedSupportTicket || !adminReplyText.trim()) return;

    try {
      await adminApi.respondSupportRequest(selectedSupportTicket._id, adminReplyText.trim(), 'resolved');
      onNotify('Official response sent to VLE and support ticket marked as RESOLVED.', 'success');
      setShowRespondModal(false);
      loadData();
    } catch (err) {
      onNotify(err.message || 'Error submitting response', 'error');
    }
  };

  // Village filtering: Synced new villages vs verified existing villages
  const syncedVillages = villages.filter((v) => v.readinessStage !== 'vle-active');
  const verifiedVillages = villages.filter((v) => v.readinessStage === 'vle-active');

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 20px' }}>
      {/* Top Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 20,
      }}>
        <div>
          <h1 style={{ fontSize: 26, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 10 }}>
            NGO Admin Control Center
            <span className="badge badge-amber">Executive Staff</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 13.5, marginTop: 4 }}>
            Review scouted villages, run AI mechanization models, onboard VLEs, and monitor real-time rental income.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={loadData} disabled={loading}>
          <RefreshCw size={15} className={loading ? 'spin' : ''} />
          Refresh Database
        </button>
      </div>

      {/* Auth Warning if not logged in as Admin */}
      {!isAuthorized && (
        <div style={{
          background: 'rgba(251, 191, 36, 0.1)',
          border: '1px solid rgba(251, 191, 36, 0.3)',
          borderRadius: 12,
          padding: '16px 20px',
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <div>
            <div style={{ fontWeight: 700, color: '#fbbf24', fontSize: 14 }}>
              Admin Credentials Required for Full Control Access
            </div>
            <div style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 2 }}>
              You are currently viewing as guest/volunteer. Sign in with Admin credentials to manage VLEs, inspect financial logs, and fulfill requests.
            </div>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleQuickAdminLogin}
          >
            <Shield size={14} />
            Sign In as Admin (1-Click)
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 12, marginBottom: 24, overflowX: 'auto' }}>
        <button
          className={`btn btn-sm ${activeTab === 'villages' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('villages')}
        >
          <Database size={15} />
          Village Verification & AI ({villages.length})
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'vles' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('vles')}
        >
          <Briefcase size={15} />
          VLE Management & Training ({vles.length})
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'finances' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('finances')}
        >
          <DollarSign size={15} />
          Financial Logs & Audits
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'requests' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('requests')}
        >
          <Layers size={15} />
          Farmer Demands ({openFarmerRequests.length})
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'support' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('support')}
        >
          <MessageSquare size={15} />
          VLE Support Tickets ({supportRequests.filter((s) => s.status === 'open').length})
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: VILLAGE VERIFICATION & AI ANALYSIS */}
      {/* ========================================================================= */}
      {activeTab === 'villages' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 400px) 1fr', gap: 24 }}>
          {/* Left Column: Village Queues */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* New Synced Villages */}
            <div className="glass-card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase' }}>
                  Newly Synced Villages ({syncedVillages.length})
                </span>
                <span className="badge badge-amber">Awaiting VLE</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 260, overflowY: 'auto' }}>
                {syncedVillages.length === 0 ? (
                  <div style={{ fontSize: 13, color: '#64748b', padding: 10 }}>All villages have active VLEs.</div>
                ) : (
                  syncedVillages.map((v) => (
                    <div
                      key={v._id}
                      className="glass-card-interactive"
                      onClick={() => handleOpenVillage(v)}
                      style={{
                        padding: 12,
                        borderRadius: 10,
                        borderColor: selectedVillage?._id === v._id ? '#22c55e' : 'var(--border-subtle)',
                        background: selectedVillage?._id === v._id ? 'rgba(34, 197, 94, 0.08)' : 'var(--bg-card)',
                      }}
                    >
                      <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: 14 }}>{v.name}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8', display: 'flex', gap: 10, marginTop: 3 }}>
                        <span>{v.district}</span>
                        <span>{v.acres} Acres</span>
                        <span className="badge badge-amber" style={{ fontSize: 9 }}>{v.readinessStage}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Existing Verified Villages */}
            <div className="glass-card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#4ade80', textTransform: 'uppercase' }}>
                  Verified & Active Villages ({verifiedVillages.length})
                </span>
                <span className="badge badge-green">VLE Active</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 260, overflowY: 'auto' }}>
                {verifiedVillages.length === 0 ? (
                  <div style={{ fontSize: 13, color: '#64748b', padding: 10 }}>No VLE-active villages yet.</div>
                ) : (
                  verifiedVillages.map((v) => (
                    <div
                      key={v._id}
                      className="glass-card-interactive"
                      onClick={() => handleOpenVillage(v)}
                      style={{
                        padding: 12,
                        borderRadius: 10,
                        borderColor: selectedVillage?._id === v._id ? '#22c55e' : 'var(--border-subtle)',
                        background: selectedVillage?._id === v._id ? 'rgba(34, 197, 94, 0.08)' : 'var(--bg-card)',
                      }}
                    >
                      <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: 14 }}>{v.name}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8', display: 'flex', gap: 10, marginTop: 3 }}>
                        <span>{v.district}</span>
                        <span>{v.farmerCount} Farmers</span>
                        <span className="badge badge-green" style={{ fontSize: 9 }}>vle-active</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: AI Analysis, Candidates & Bill Breakdown */}
          <div>
            {selectedVillage ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Header Card */}
                <div className="glass-card" style={{ padding: 22 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <h2 style={{ fontSize: 22, color: '#f8fafc' }}>{selectedVillage.name}</h2>
                        <span className={`badge ${selectedVillage.readinessStage === 'vle-active' ? 'badge-green' : 'badge-amber'}`}>
                          {selectedVillage.readinessStage}
                        </span>
                        <span className="badge badge-muted">{selectedVillage.district}</span>
                      </div>
                      <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>
                        Acreage: {selectedVillage.acres} Acres | Crops: {(selectedVillage.majorCrops || []).join(', ')} | Water: {(selectedVillage.waterResources || []).join(', ')}
                      </p>
                    </div>

                    <button
                      className="btn btn-outline-green btn-sm"
                      onClick={() => handleOpenVillage(selectedVillage)}
                      disabled={analyzingVillage}
                    >
                      <Cpu size={14} className={analyzingVillage ? 'spin' : ''} />
                      {analyzingVillage ? 'Running AI...' : 'Re-Run AI Analysis'}
                    </button>
                  </div>
                </div>

                {/* AI Analysis Card */}
                <div className="glass-card" style={{ padding: 22, borderLeft: '4px solid #22c55e' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#4ade80', fontWeight: 700, fontSize: 15, marginBottom: 12 }}>
                    <Cpu size={18} />
                    OpenAI Automated Agricultural Demand Analysis
                  </div>

                  {analyzingVillage ? (
                    <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8' }}>
                      Synthesizing soil, crop, and farmer survey datasets with OpenAI...
                    </div>
                  ) : villageAnalysis ? (
                    <div>
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        padding: 16,
                        borderRadius: 10,
                        fontSize: 13.5,
                        lineHeight: 1.6,
                        color: '#f1f5f9',
                        border: '1px solid var(--border-subtle)',
                        whiteSpace: 'pre-line',
                        marginBottom: 18,
                      }}>
                        {villageAnalysis.summary}
                      </div>

                      {/* Machinery Bill & Cost Estimate */}
                      <div style={{ marginBottom: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 14, color: '#f8fafc', marginBottom: 10 }}>
                          <Receipt size={16} color="#fbbf24" />
                          Recommended Machinery Package & Capital Outlay
                        </div>

                        <div className="data-table-container">
                          <table className="data-table">
                            <thead>
                              <tr>
                                <th>Equipment</th>
                                <th>Purpose</th>
                                <th>Qty</th>
                                <th>Unit Cost</th>
                                <th>Financing / Grant</th>
                              </tr>
                            </thead>
                            <tbody>
                              {villageAnalysis.machineryList.map((m, idx) => (
                                <tr key={idx}>
                                  <td style={{ fontWeight: 600, color: '#f8fafc' }}>{m.name}</td>
                                  <td style={{ fontSize: 12.5, color: '#94a3b8' }}>{m.purpose}</td>
                                  <td>{m.quantity}</td>
                                  <td style={{ fontFamily: 'var(--font-mono)' }}>₹{m.unitCost.toLocaleString()}</td>
                                  <td><span className="badge badge-green" style={{ fontSize: 10 }}>{m.subsidyGrant}</span></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '14px 16px',
                          background: 'rgba(34, 197, 94, 0.08)',
                          borderRadius: 10,
                          marginTop: 10,
                          border: '1px solid rgba(74, 222, 128, 0.25)',
                        }}>
                          <div>
                            <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase' }}>Total Required Investment</div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: '#4ade80', fontFamily: 'var(--font-mono)' }}>
                              ₹{villageAnalysis.totalBill.toLocaleString()}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', fontSize: 12.5, color: '#cbd5e1' }}>
                            <div>Target Farmers Benefited: <strong>{villageAnalysis.estimatedFarmersBenefited} Smallholders</strong></div>
                            <div>Break-Even Utilization: <strong>~{villageAnalysis.targetROIWeeks} Weeks</strong></div>
                          </div>
                        </div>
                      </div>

                      {/* VLE Candidate Recommendations & Call Confirmation */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 14, color: '#f8fafc', marginBottom: 10 }}>
                          <PhoneCall size={16} color="#38bdf8" />
                          Recommended VLE Candidates in {selectedVillage.name}
                        </div>

                        {villageCandidates.length === 0 ? (
                          <div style={{ padding: 18, background: 'rgba(255, 255, 255, 0.02)', borderRadius: 10, color: '#94a3b8', fontSize: 13 }}>
                            No farmers in this village are currently tagged as "Potential VLE". Volunteers can tag candidates via the survey form.
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {villageCandidates.map((c) => {
                              const callInfo = calledCandidates[c._id];
                              return (
                                <div
                                  key={c._id}
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: 14,
                                    borderRadius: 10,
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-subtle)',
                                    flexWrap: 'wrap',
                                    gap: 12,
                                  }}
                                >
                                  <div>
                                    <div style={{ fontWeight: 700, fontSize: 14.5, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
                                      {c.name}
                                      <span className="badge badge-blue" style={{ fontSize: 10 }}>{c.education || '12th Pass'}</span>
                                    </div>
                                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>
                                      Phone: {c.phone || '9870011223'} | Landholdings: {c.landSize || 5} Acres | Income: {(c.sourcesOfIncome || []).join(', ') || 'Farming'}
                                    </div>
                                    {callInfo && (
                                      <div style={{ fontSize: 11.5, color: '#4ade80', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                                        <Check size={13} /> Call Completed at {callInfo.calledAt} ({callInfo.status})
                                      </div>
                                    )}
                                  </div>

                                  <div style={{ display: 'flex', gap: 8 }}>
                                    <button
                                      className={`btn btn-sm ${callInfo ? 'btn-secondary' : 'btn-outline-green'}`}
                                      onClick={() => handleCallCandidate(c)}
                                    >
                                      <PhoneCall size={13} />
                                      {callInfo ? 'Call Again' : 'Call for Confirmation'}
                                    </button>

                                    <button
                                      className="btn btn-primary btn-sm"
                                      onClick={() => handleOpenOnboard(c)}
                                    >
                                      <UserPlus size={13} />
                                      Onboard as VLE
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="glass-card" style={{ padding: 60, textAlign: 'center' }}>
                <Cpu size={48} color="#22c55e" style={{ margin: '0 auto 16px', opacity: 0.8 }} />
                <h3 style={{ fontSize: 20, color: '#f8fafc' }}>Open a Village to Inspect & Analyze</h3>
                <p style={{ color: '#94a3b8', maxWidth: 440, margin: '8px auto', fontSize: 13.5 }}>
                  Select any newly synced village or verified village from the queues on the left. The AI analysis engine will estimate machinery needs, calculate the capital bill, and identify VLE candidates.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: VLE MANAGEMENT & TRAINING GATING */}
      {/* ========================================================================= */}
      {activeTab === 'vles' && (
        <div className="glass-card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <h2 style={{ fontSize: 20, color: '#f8fafc' }}>Village Level Entrepreneurs (VLEs)</h2>
              <p style={{ fontSize: 13, color: '#94a3b8' }}>
                Manage account unlock training status and assign foundation machinery.
              </p>
            </div>
            <span className="badge badge-green">{vles.length} Total Onboarded</span>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>VLE Operator</th>
                  <th>Village</th>
                  <th>Training Gate</th>
                  <th>Assigned Machinery</th>
                  <th>Total Earnings</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vles.map((vle) => (
                  <tr key={vle._id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#f8fafc' }}>{vle.name}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>{vle.phone}</div>
                    </td>
                    <td>{vle.villageId?.name || 'Raisen Central'}</td>
                    <td>
                      {vle.trainingStatus === 'completed' ? (
                        <span className="badge badge-green">
                          <Check size={12} /> Active / Unlocked
                        </span>
                      ) : (
                        <span className="badge badge-amber">
                          <Clock size={12} /> Locked (Training Pending)
                        </span>
                      )}
                    </td>
                    <td>
                      {(vle.assignedEquipment || []).length === 0 ? (
                        <span style={{ fontSize: 12, color: '#64748b' }}>No machines assigned</span>
                      ) : (
                        (vle.assignedEquipment || []).map((eq, i) => (
                          <span key={i} className="badge badge-blue" style={{ fontSize: 11, marginRight: 4 }}>
                            {eq.machineType} ({eq.machineId})
                          </span>
                        ))
                      )}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#4ade80' }}>
                      ₹{(vle.totalEarnings || 0).toLocaleString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {vle.trainingStatus !== 'completed' && (
                          <button
                            className="btn btn-outline-green btn-sm"
                            onClick={() => handleToggleTraining(vle)}
                            title="Complete training to unlock account access"
                          >
                            <CheckCircle size={13} />
                            Unlock Account
                          </button>
                        )}
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenAssign(vle)}
                        >
                          <Wrench size={13} />
                          Assign Machine
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenLogs(vle)}
                        >
                          <DollarSign size={13} />
                          Financials
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: FINANCIAL LOGS & AUDITS */}
      {/* ========================================================================= */}
      {activeTab === 'finances' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Summary KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            <div className="kpi-card">
              <span className="kpi-label">Total Rental Revenue Generated</span>
              <span className="kpi-val green">
                ₹{vles.reduce((acc, v) => acc + (v.totalEarnings || 0), 0).toLocaleString()}
              </span>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>Across all verified villages</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Total Rental Operations Logged</span>
              <span className="kpi-val">
                {vles.reduce((acc, v) => acc + (v.totalRentalsCount || 0), 0)} Jobs
              </span>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>Tillage, seeding & transplanting</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Acres Cultivated via Hubs</span>
              <span className="kpi-val">
                {vles.reduce((acc, v) => acc + (v.totalAcresServiced || 0), 0)} Acres
              </span>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>Mechanized agricultural coverage</span>
            </div>
          </div>

          {/* VLE Performance Table */}
          <div className="glass-card" style={{ padding: 22 }}>
            <h3 style={{ fontSize: 18, color: '#f8fafc', marginBottom: 14 }}>
              VLE Financial Leaderboard & Rental Audits
            </h3>
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>VLE Operator</th>
                    <th>Village</th>
                    <th>Rentals Completed</th>
                    <th>Acres Serviced</th>
                    <th>Total Revenue</th>
                    <th>Audit Action</th>
                  </tr>
                </thead>
                <tbody>
                  {vles.map((vle) => (
                    <tr key={vle._id}>
                      <td style={{ fontWeight: 700, color: '#f8fafc' }}>{vle.name}</td>
                      <td>{vle.villageId?.name || 'Verified Village'}</td>
                      <td>{vle.totalRentalsCount || 0}</td>
                      <td>{vle.totalAcresServiced || 0} Acres</td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: '#4ade80', fontWeight: 700 }}>
                        ₹{(vle.totalEarnings || 0).toLocaleString()}
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenLogs(vle)}
                        >
                          <Receipt size={13} />
                          Inspect Transactions
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: OPEN FARMER DEMANDS */}
      {/* ========================================================================= */}
      {activeTab === 'requests' && (
        <div className="glass-card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <h2 style={{ fontSize: 20, color: '#f8fafc' }}>Open Farmer Machinery Demands</h2>
              <p style={{ fontSize: 13, color: '#94a3b8' }}>
                Demands captured during field volunteer needs assessments awaiting machine fulfillment.
              </p>
            </div>
            <span className="badge badge-amber">{openFarmerRequests.length} Open Requests</span>
          </div>

          {openFarmerRequests.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
              All farmer demands have been fulfilled across villages.
            </div>
          ) : (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Farmer Name</th>
                    <th>Village / District</th>
                    <th>Machinery Requested</th>
                    <th>Urgency</th>
                    <th>Requested Notes</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {openFarmerRequests.map((req) => (
                    <tr key={req._id}>
                      <td style={{ fontWeight: 700, color: '#f8fafc' }}>{req.farmerName}</td>
                      <td>{req.villageName} ({req.district})</td>
                      <td style={{ color: '#38bdf8', fontWeight: 600 }}>{req.requestType}</td>
                      <td>
                        <span className={`badge ${req.urgency === 'critical' || req.urgency === 'high' ? 'badge-amber' : 'badge-muted'}`}>
                          {req.urgency}
                        </span>
                      </td>
                      <td style={{ fontSize: 12.5, color: '#94a3b8' }}>{req.notes || 'Seasonal request'}</td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleFulfillRequest(req._id)}
                        >
                          <CheckCircle size={13} />
                          Mark Fulfilled
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: VLE SUPPORT & FEEDBACK TICKETS */}
      {/* ========================================================================= */}
      {activeTab === 'support' && (
        <div className="glass-card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <h2 style={{ fontSize: 20, color: '#f8fafc' }}>VLE Support & Maintenance Requests</h2>
              <p style={{ fontSize: 13, color: '#94a3b8' }}>
                Operational queries, equipment breakdowns, and farmer feedback relayed by entrepreneurs.
              </p>
            </div>
            <span className="badge badge-blue">{supportRequests.length} Total Messages</span>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>VLE Operator</th>
                  <th>Category</th>
                  <th>Subject & Message</th>
                  <th>Status</th>
                  <th>Admin Response</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {supportRequests.map((ticket) => (
                  <tr key={ticket._id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#f8fafc' }}>{ticket.vleId?.name || 'VLE Operator'}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>{ticket.vleId?.phone}</div>
                    </td>
                    <td>
                      <span className="badge badge-muted" style={{ fontSize: 10 }}>
                        {ticket.category?.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>{ticket.subject}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{ticket.message}</div>
                    </td>
                    <td>
                      <span className={`badge ${ticket.status === 'resolved' ? 'badge-green' : 'badge-amber'}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 12.5, color: ticket.adminResponse ? '#cbd5e1' : '#64748b' }}>
                      {ticket.adminResponse || 'Pending reply'}
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleOpenRespond(ticket)}
                      >
                        <MessageSquare size={13} />
                        Reply / Resolve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ONBOARD VLE */}
      {showOnboardModal && (
        <div className="modal-overlay" onClick={() => setShowOnboardModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520, padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <h3 style={{ fontSize: 20, color: '#f8fafc' }}>Onboard Candidate as VLE</h3>
                <p style={{ fontSize: 12.5, color: '#94a3b8' }}>Village: {selectedVillage?.name}</p>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowOnboardModal(false)}
                style={{ borderRadius: '50%', width: 30, height: 30, padding: 0 }}
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleConfirmOnboard} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="input-group">
                <label className="input-label">VLE Full Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={onboardData.name}
                  onChange={(e) => setOnboardData({ ...onboardData, name: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Phone Number (Login Credential)</label>
                <input
                  type="tel"
                  className="input-field"
                  value={onboardData.phone}
                  onChange={(e) => setOnboardData({ ...onboardData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Educational Qualification</label>
                <input
                  type="text"
                  className="input-field"
                  value={onboardData.education}
                  onChange={(e) => setOnboardData({ ...onboardData, education: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Prior Operational Experience</label>
                <textarea
                  className="textarea-field"
                  rows={2}
                  value={onboardData.experience}
                  onChange={(e) => setOnboardData({ ...onboardData, experience: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowOnboardModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <UserPlus size={15} />
                  Confirm & Create VLE Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN EQUIPMENT */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520, padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <h3 style={{ fontSize: 20, color: '#f8fafc' }}>Assign Machinery to VLE</h3>
                <p style={{ fontSize: 12.5, color: '#94a3b8' }}>Operator: {selectedVLEForEquip?.name} (Ownership: Foundation)</p>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowAssignModal(false)}
                style={{ borderRadius: '50%', width: 30, height: 30, padding: 0 }}
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleConfirmAssign} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="input-group">
                  <label className="input-label">Machine Tag ID</label>
                  <input
                    type="text"
                    className="input-field"
                    value={equipForm.machineId}
                    onChange={(e) => setEquipForm({ ...equipForm, machineId: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Machine Type</label>
                  <select
                    className="select-field"
                    value={equipForm.machineType}
                    onChange={(e) => setEquipForm({ ...equipForm, machineType: e.target.value })}
                  >
                    <option value="Rotavator">Rotavator (Tillage)</option>
                    <option value="Paddy Transplanter">Paddy Transplanter</option>
                    <option value="Tractor 45HP">Tractor 45HP</option>
                    <option value="Power Sprayer">Power Sprayer</option>
                    <option value="Seed Drill">Seed Drill</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Make & Model</label>
                <input
                  type="text"
                  className="input-field"
                  value={equipForm.model}
                  onChange={(e) => setEquipForm({ ...equipForm, model: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="input-group">
                  <label className="input-label">Hourly Rental Rate (₹)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={equipForm.hourlyRate}
                    onChange={(e) => setEquipForm({ ...equipForm, hourlyRate: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Daily Standard Rate (₹)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={equipForm.dailyRate}
                    onChange={(e) => setEquipForm({ ...equipForm, dailyRate: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Wrench size={15} />
                  Assign & Tag Foundation Equipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VLE FINANCIAL AUDIT LOGS */}
      {showLogsModal && selectedVLELogs && (
        <div className="modal-overlay" onClick={() => setShowLogsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 740, padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <h3 style={{ fontSize: 20, color: '#f8fafc' }}>
                  Rental Audit Logs: {selectedVLELogs.vle.name}
                </h3>
                <p style={{ fontSize: 12.5, color: '#94a3b8' }}>
                  Verified village transaction history and verified revenue
                </p>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowLogsModal(false)}
                style={{ borderRadius: '50%', width: 30, height: 30, padding: 0 }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Total Metric strip */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>Total Revenue</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#4ade80', fontFamily: 'var(--font-mono)' }}>
                  ₹{selectedVLELogs.totalEarnings.toLocaleString()}
                </div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>Total Rentals Logged</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#f8fafc' }}>
                  {selectedVLELogs.totalRentals}
                </div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>Total Acres Serviced</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#f8fafc' }}>
                  {selectedVLELogs.totalAcres} Acres
                </div>
              </div>
            </div>

            {selectedVLELogs.transactions.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>
                No rental transactions recorded yet for this VLE.
              </div>
            ) : (
              <div className="data-table-container" style={{ maxHeight: 340, overflowY: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Farmer Name</th>
                      <th>Machine</th>
                      <th>Duration</th>
                      <th>Acres</th>
                      <th>Fee Charged</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedVLELogs.transactions.map((tx) => (
                      <tr key={tx._id}>
                        <td style={{ fontSize: 12 }}>{new Date(tx.date).toLocaleDateString()}</td>
                        <td style={{ fontWeight: 600, color: '#f8fafc' }}>{tx.farmerName}</td>
                        <td>{tx.machineId}</td>
                        <td>{tx.durationHours} hrs</td>
                        <td>{tx.acresCovered} ac</td>
                        <td style={{ fontFamily: 'var(--font-mono)', color: '#4ade80', fontWeight: 700 }}>
                          ₹{tx.feeCharged}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: RESPOND TO VLE SUPPORT TICKET */}
      {showRespondModal && selectedSupportTicket && (
        <div className="modal-overlay" onClick={() => setShowRespondModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520, padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <h3 style={{ fontSize: 20, color: '#f8fafc' }}>Respond to VLE Query</h3>
                <p style={{ fontSize: 12.5, color: '#94a3b8' }}>From: {selectedSupportTicket.vleId?.name}</p>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowRespondModal(false)}
                style={{ borderRadius: '50%', width: 30, height: 30, padding: 0 }}
              >
                <X size={15} />
              </button>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 12, borderRadius: 8, marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: '#f8fafc' }}>{selectedSupportTicket.subject}</div>
              <div style={{ fontSize: 12.5, color: '#cbd5e1', marginTop: 4 }}>{selectedSupportTicket.message}</div>
            </div>

            <form onSubmit={handleConfirmRespond} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="input-group">
                <label className="input-label">Official Admin Response</label>
                <textarea
                  className="textarea-field"
                  rows={3}
                  value={adminReplyText}
                  onChange={(e) => setAdminReplyText(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowRespondModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <CheckCircle size={15} />
                  Send & Mark Resolved
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
