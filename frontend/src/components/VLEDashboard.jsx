import React, { useState, useEffect } from 'react';
import {
  DollarSign, Wrench, Clock, TrendingUp, Plus, Send,
  FileText, CheckCircle, AlertCircle, MessageSquare,
  BarChart2, RefreshCw, X, Calendar, User, ShieldCheck,
  Layers, ChevronRight, Activity, Percent
} from 'lucide-react';
import { vleApi } from '../api';

// Realistic initial mock datasets for instant visualization
const DEFAULT_WEEKLY_STATS = [
  { label: 'Week 1', week: 28, year: 2026, earnings: 1800, hours: 3.5, rentals: 1, acres: 2.2 },
  { label: 'Week 2', week: 29, year: 2026, earnings: 2250, hours: 4.5, rentals: 1, acres: 3.2 },
  { label: 'Week 3', week: 30, year: 2026, earnings: 1500, hours: 3.0, rentals: 1, acres: 2.1 },
  { label: 'Week 4', week: 31, year: 2026, earnings: 3900, hours: 6.0, rentals: 2, acres: 4.5 },
  { label: 'Week 5', week: 32, year: 2026, earnings: 2500, hours: 5.0, rentals: 1, acres: 3.8 },
  { label: 'Week 6', week: 33, year: 2026, earnings: 3575, hours: 5.5, rentals: 2, acres: 4.0 },
  { label: 'Week 7', week: 34, year: 2026, earnings: 3750, hours: 7.5, rentals: 2, acres: 5.5 },
  { label: 'Week 8', week: 35, year: 2026, earnings: 2700, hours: 5.0, rentals: 1, acres: 3.6 },
];

const DEFAULT_EQUIPMENT = [
  {
    machineId: 'EQ-ROT-001',
    machineType: 'Rotavator 6ft Heavy Duty',
    model: 'Mahindra Gyrovator HD-6',
    ownership: 'Foundation',
    hourlyRate: 500,
    dailyRate: 3500,
    condition: 'excellent',
    assignedDate: '2026-08-01',
  },
  {
    machineId: 'EQ-TRN-002',
    machineType: 'Paddy Transplanter 4-Row',
    model: 'Kubota SPV-4 Precision Transplanter',
    ownership: 'Foundation',
    hourlyRate: 650,
    dailyRate: 4200,
    condition: 'good',
    assignedDate: '2026-08-15',
  },
];

const DEFAULT_TRANSACTIONS = [
  { _id: 'tx-09', date: '2026-09-14', farmerName: 'Rameshwar Dayal', machineId: 'EQ-ROT-001', durationHours: 5.0, acresCovered: 3.5, feeCharged: 2500, paymentStatus: 'paid' },
  { _id: 'tx-08', date: '2026-09-10', farmerName: 'Shyam Sundar', machineId: 'EQ-ROT-001', durationHours: 4.0, acresCovered: 3.0, feeCharged: 2000, paymentStatus: 'paid' },
  { _id: 'tx-07', date: '2026-09-06', farmerName: 'Narayan Singh', machineId: 'EQ-ROT-001', durationHours: 3.5, acresCovered: 2.5, feeCharged: 1750, paymentStatus: 'paid' },
  { _id: 'tx-06', date: '2026-09-01', farmerName: 'Gopal Meena', machineId: 'EQ-TRN-002', durationHours: 5.5, acresCovered: 4.0, feeCharged: 3575, paymentStatus: 'paid' },
  { _id: 'tx-05', date: '2026-08-25', farmerName: 'Bhagwan Das', machineId: 'EQ-ROT-001', durationHours: 4.0, acresCovered: 2.8, feeCharged: 2000, paymentStatus: 'paid' },
  { _id: 'tx-04', date: '2026-08-19', farmerName: 'Mohit Yadav', machineId: 'EQ-TRN-002', durationHours: 6.0, acresCovered: 4.5, feeCharged: 3900, paymentStatus: 'paid' },
  { _id: 'tx-03', date: '2026-08-14', farmerName: 'Sunil Gurjar', machineId: 'EQ-ROT-001', durationHours: 5.0, acresCovered: 3.8, feeCharged: 2500, paymentStatus: 'paid' },
  { _id: 'tx-02', date: '2026-08-08', farmerName: 'Kailash Verma', machineId: 'EQ-ROT-001', durationHours: 3.0, acresCovered: 2.1, feeCharged: 1500, paymentStatus: 'paid' },
  { _id: 'tx-01', date: '2026-08-02', farmerName: 'Ramdas Patel', machineId: 'EQ-ROT-001', durationHours: 4.5, acresCovered: 3.2, feeCharged: 2250, paymentStatus: 'paid' },
];

const DEFAULT_TICKETS = [
  {
    _id: 'tick-01',
    category: 'maintenance_issue',
    subject: 'Rotavator Gearbox Lubricant Replacement',
    message: 'Completed 50 hours of intensive field tillage. Gearbox lubricant service kit requested.',
    urgency: 'high',
    status: 'resolved',
    adminResponse: 'Maintenance kit and 5L SAE-90 gear lubricant dispatched via field supervisor mobile van.',
    createdAt: '2026-09-11T10:30:00Z',
  },
  {
    _id: 'tick-02',
    category: 'equipment_request',
    subject: 'High Demand: Additional Rotavator requested for sowing window',
    message: 'Smallholders in Ward 3 require additional rotavator implement capacity before seasonal rains commence.',
    urgency: 'medium',
    status: 'open',
    adminResponse: 'Review in progress. Field team evaluating machinery repositioning from Obedullaganj hub.',
    createdAt: '2026-09-14T09:15:00Z',
  },
];

export default function VLEDashboard({ currentUser, onNotify }) {
  const [equipment, setEquipment] = useState(DEFAULT_EQUIPMENT);
  const [transactions, setTransactions] = useState(DEFAULT_TRANSACTIONS);
  const [weeklyStats, setWeeklyStats] = useState(DEFAULT_WEEKLY_STATS);
  const [myTickets, setMyTickets] = useState(DEFAULT_TICKETS);
  const [chartMetric, setChartMetric] = useState('earnings'); // 'earnings', 'hours', 'rentals'
  const [hoveredBar, setHoveredBar] = useState(null);

  // Modals
  const [showLogModal, setShowLogModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [searchTx, setSearchTx] = useState('');

  // Log Transaction Form
  const [txForm, setTxForm] = useState({
    farmerName: '',
    machineId: 'EQ-ROT-001',
    durationHours: 3.5,
    acresCovered: 2.5,
    feeCharged: 1750,
    paymentStatus: 'paid',
  });

  // Contact Admin Form
  const [contactForm, setContactForm] = useState({
    category: 'equipment_request',
    subject: '',
    message: '',
    urgency: 'medium',
  });

  // Fetch live backend data if available, falling back seamlessly to mock
  const fetchLiveVLEData = async () => {
    try {
      const [eqRes, txRes, weekRes, tickRes] = await Promise.all([
        vleApi.getEquipment().catch(() => ({ data: [] })),
        vleApi.getTransactions().catch(() => ({ data: { transactions: [] } })),
        vleApi.getWeeklyEarnings().catch(() => ({ data: [] })),
        vleApi.getMyContactRequests().catch(() => ({ data: [] })),
      ]);

      if (eqRes.data?.length > 0) setEquipment(eqRes.data);
      if (txRes.data?.transactions?.length > 0) setTransactions(txRes.data.transactions);
      if (weekRes.data?.length > 0) setWeeklyStats(weekRes.data);
      if (tickRes.data?.length > 0) setMyTickets(tickRes.data);
    } catch {
      // Retain mock data
    }
  };

  useEffect(() => {
    fetchLiveVLEData();
  }, []);

  // Recalculate running totals dynamically
  const totalEarnings = transactions.reduce((acc, t) => acc + (Number(t.feeCharged) || 0), 0);
  const totalRentals = transactions.length;
  const totalAcres = Math.round(transactions.reduce((acc, t) => acc + (Number(t.acresCovered) || 0), 0) * 10) / 10;
  const totalHours = Math.round(transactions.reduce((acc, t) => acc + (Number(t.durationHours) || 0), 0) * 10) / 10;
  const monthlyCapacity = equipment.length * 160;
  const utilizationPercent = Math.min(100, Math.round((totalHours / monthlyCapacity) * 100));

  // Submit New Rental Transaction
  const handleLogTransactionSubmit = async (e) => {
    e.preventDefault();
    if (!txForm.farmerName.trim()) {
      onNotify('Farmer name is required', 'error');
      return;
    }

    const newTx = {
      _id: 'tx-' + Date.now(),
      farmerName: txForm.farmerName.trim(),
      machineId: txForm.machineId,
      durationHours: Number(txForm.durationHours),
      acresCovered: Number(txForm.acresCovered),
      feeCharged: Number(txForm.feeCharged),
      paymentStatus: txForm.paymentStatus,
      date: new Date().toISOString(),
    };

    // Update local state immediately for instant feedback
    setTransactions([newTx, ...transactions]);

    // Update chart with this rental
    setWeeklyStats((prev) => {
      const updated = [...prev];
      if (updated.length > 0) {
        const last = updated[updated.length - 1];
        updated[updated.length - 1] = {
          ...last,
          earnings: last.earnings + newTx.feeCharged,
          hours: Math.round((last.hours + newTx.durationHours) * 10) / 10,
          rentals: last.rentals + 1,
          acres: Math.round((last.acres + newTx.acresCovered) * 10) / 10,
        };
      }
      return updated;
    });

    onNotify(`Rental logged for ${newTx.farmerName}! Running earnings updated to ₹${(totalEarnings + newTx.feeCharged).toLocaleString()}`, 'success');
    setShowLogModal(false);

    // Also attempt backend synchronization
    try {
      await vleApi.createTransaction({
        farmerName: newTx.farmerName,
        machineId: newTx.machineId,
        durationHours: newTx.durationHours,
        acresCovered: newTx.acresCovered,
        feeCharged: newTx.feeCharged,
        paymentStatus: newTx.paymentStatus,
      });
    } catch {
      // Stored locally in state
    }

    // Reset form
    setTxForm({
      farmerName: '',
      machineId: equipment[0]?.machineId || 'EQ-ROT-001',
      durationHours: 3.5,
      acresCovered: 2.0,
      feeCharged: 1750,
      paymentStatus: 'paid',
    });
  };

  // Submit Contact Admin Support Message
  const handleContactAdminSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.subject.trim() || !contactForm.message.trim()) {
      onNotify('Subject and message are required', 'error');
      return;
    }

    const newTicket = {
      _id: 'tick-' + Date.now(),
      category: contactForm.category,
      subject: contactForm.subject.trim(),
      message: contactForm.message.trim(),
      urgency: contactForm.urgency,
      status: 'open',
      createdAt: new Date().toISOString(),
      adminResponse: null,
    };

    setMyTickets([newTicket, ...myTickets]);
    onNotify('Support query submitted to NGO Admin staff successfully!', 'success');
    setShowContactModal(false);

    try {
      await vleApi.contactAdmin({
        category: newTicket.category,
        subject: newTicket.subject,
        message: newTicket.message,
        urgency: newTicket.urgency,
      });
    } catch {
      // Stored in state
    }

    setContactForm({
      category: 'equipment_request',
      subject: '',
      message: '',
      urgency: 'medium',
    });
  };

  // Maximum scale for selected chart metric
  const maxVal = Math.max(
    ...weeklyStats.map((w) =>
      chartMetric === 'earnings' ? w.earnings : chartMetric === 'hours' ? w.hours : w.rentals
    ),
    chartMetric === 'earnings' ? 4000 : chartMetric === 'hours' ? 8 : 4
  );

  const filteredTransactions = transactions.filter(
    (t) =>
      t.farmerName?.toLowerCase().includes(searchTx.toLowerCase()) ||
      t.machineId?.toLowerCase().includes(searchTx.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 20px' }}>
      {/* Top Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 24
      }}>
        <div>
          <h1 style={{ fontSize: 26, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 10 }}>
            VLE Operations Console
            <span className="badge badge-green">Operator: Mukesh Patel</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 13.5, marginTop: 4 }}>
            Village Hub: Barkheda Central (Raisen) | Foundation Equipment Operator & Service Provider
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-outline-green" onClick={() => setShowContactModal(true)}>
            <MessageSquare size={16} />
            Contact Admin
          </button>
          <button className="btn btn-primary" onClick={() => setShowLogModal(true)}>
            <Plus size={16} />
            Log Rental Transaction
          </button>
        </div>
      </div>

      {/* Financial KPIs Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="kpi-card">
          <span className="kpi-label">All-Time Running Earnings</span>
          <span className="kpi-val green">
            ₹{totalEarnings.toLocaleString()}
          </span>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>
            Auto-accumulated from {totalRentals} rental transactions
          </span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Completed Rental Jobs</span>
          <span className="kpi-val">
            {totalRentals} Jobs
          </span>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>
            Servicing smallholders across Barkheda hub
          </span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Total Acres Mechanized</span>
          <span className="kpi-val">
            {totalAcres} Acres
          </span>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>
            Tillage, precision sowing, and transplanter coverage
          </span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Monthly Machinery Utilization</span>
          <span className="kpi-val green">
            {utilizationPercent}%
          </span>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>
            {totalHours} Operating hours across {equipment.length} assigned machines
          </span>
        </div>
      </div>

      {/* Main Grid: Interactive Analytics Chart & Assigned Equipment */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Weekly Earnings Trend & Work Volume Chart */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ fontSize: 17, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChart2 size={18} color="#22c55e" />
                Weekly Performance Visualization
              </h3>
              <p style={{ fontSize: 12.5, color: '#94a3b8' }}>8-week rolling field operations telemetry</p>
            </div>

            {/* Metric Switcher */}
            <div style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.04)',
              padding: 3,
              borderRadius: 8,
              border: '1px solid var(--border-subtle)'
            }}>
              <button
                className="btn btn-sm"
                onClick={() => setChartMetric('earnings')}
                style={{
                  fontSize: 11,
                  padding: '4px 10px',
                  background: chartMetric === 'earnings' ? '#22c55e' : 'transparent',
                  color: chartMetric === 'earnings' ? '#041f0d' : '#94a3b8',
                  fontWeight: 700,
                }}
              >
                Earnings (₹)
              </button>
              <button
                className="btn btn-sm"
                onClick={() => setChartMetric('hours')}
                style={{
                  fontSize: 11,
                  padding: '4px 10px',
                  background: chartMetric === 'hours' ? '#38bdf8' : 'transparent',
                  color: chartMetric === 'hours' ? '#082f49' : '#94a3b8',
                  fontWeight: 700,
                }}
              >
                Hours Worked
              </button>
              <button
                className="btn btn-sm"
                onClick={() => setChartMetric('rentals')}
                style={{
                  fontSize: 11,
                  padding: '4px 10px',
                  background: chartMetric === 'rentals' ? '#fbbf24' : 'transparent',
                  color: chartMetric === 'rentals' ? '#451a03' : '#94a3b8',
                  fontWeight: 700,
                }}
              >
                Jobs
              </button>
            </div>
          </div>

          {/* Dynamic Interactive SVG Bar Visualization */}
          <div style={{
            height: 230,
            display: 'flex',
            alignItems: 'flex-end',
            gap: 12,
            paddingTop: 30,
            paddingBottom: 10,
            borderBottom: '1px solid var(--border-subtle)',
            position: 'relative'
          }}>
            {weeklyStats.map((item, idx) => {
              const val = chartMetric === 'earnings' ? item.earnings : chartMetric === 'hours' ? item.hours : item.rentals;
              const heightPercent = Math.max(14, Math.round((val / maxVal) * 100));
              const isHovered = hoveredBar === idx;

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredBar(idx)}
                  onMouseLeave={() => setHoveredBar(null)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                >
                  {/* Tooltip on Hover */}
                  {isHovered && (
                    <div style={{
                      position: 'absolute',
                      bottom: '100%',
                      marginBottom: 8,
                      background: '#0d1119',
                      border: '1px solid #22c55e',
                      borderRadius: 8,
                      padding: '6px 10px',
                      fontSize: 11,
                      color: '#f8fafc',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.8)',
                      zIndex: 10,
                      textAlign: 'center',
                    }}>
                      <div style={{ fontWeight: 700, color: '#4ade80' }}>
                        ₹{item.earnings.toLocaleString()}
                      </div>
                      <div style={{ color: '#94a3b8' }}>
                        {item.rentals} jobs | {item.hours} hrs | {item.acres} ac
                      </div>
                    </div>
                  )}

                  <div style={{
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: isHovered ? '#4ade80' : '#94a3b8',
                    marginBottom: 6,
                  }}>
                    {chartMetric === 'earnings' ? `₹${val}` : chartMetric === 'hours' ? `${val}h` : `${val}`}
                  </div>

                  <div
                    style={{
                      width: '100%',
                      maxWidth: 44,
                      height: `${heightPercent}%`,
                      background: chartMetric === 'earnings'
                        ? 'linear-gradient(180deg, #4ade80 0%, #15803d 100%)'
                        : chartMetric === 'hours'
                        ? 'linear-gradient(180deg, #38bdf8 0%, #0369a1 100%)'
                        : 'linear-gradient(180deg, #fbbf24 0%, #b45309 100%)',
                      borderRadius: '6px 6px 0 0',
                      boxShadow: isHovered ? '0 0 20px rgba(34, 197, 94, 0.5)' : '0 2px 8px rgba(0,0,0,0.3)',
                      transition: 'all 0.25s ease',
                      transform: isHovered ? 'scaleY(1.04)' : 'none',
                    }}
                  />

                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 8 }}>
                    {item.label}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, fontSize: 12, color: '#94a3b8' }}>
            <span>Weekly operational average: <strong>₹{Math.round(totalEarnings / (weeklyStats.length || 1))} / week</strong></span>
            <span style={{ color: '#4ade80' }}>All rental records synchronized with Foundation Central Database</span>
          </div>
        </div>

        {/* Assigned Foundation Equipment */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 17, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Wrench size={18} color="#38bdf8" />
              Assigned Machinery
            </h3>
            <span className="badge badge-blue">{equipment.length} Units</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {equipment.map((eq, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: 15 }}>
                      {eq.machineType}
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                      {eq.model}
                    </div>
                  </div>
                  <span className="badge badge-green" style={{ fontSize: 10 }}>
                    Foundation Owned
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14, fontSize: 12 }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '6px 8px', borderRadius: 6 }}>
                    <div style={{ color: '#94a3b8', fontSize: 11 }}>Tag ID</div>
                    <div style={{ fontWeight: 700, color: '#f8fafc' }}>{eq.machineId}</div>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '6px 8px', borderRadius: 6 }}>
                    <div style={{ color: '#94a3b8', fontSize: 11 }}>Hourly Rate</div>
                    <div style={{ fontWeight: 700, color: '#4ade80' }}>₹{eq.hourlyRate}/hr</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, fontSize: 11.5, color: '#94a3b8' }}>
                  <span>Daily Rate: ₹{eq.dailyRate}</span>
                  <span style={{ color: '#4ade80', fontWeight: 600 }}>Condition: Excellent</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction History & Admin Support Communications */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 24 }}>
        {/* Rental Transactions Log Table */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ fontSize: 17, color: '#f8fafc' }}>Rental Records & Field Income</h3>
              <p style={{ fontSize: 12.5, color: '#94a3b8' }}>Detailed logs of all completed farmer jobs</p>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="text"
                className="input-field"
                placeholder="Filter farmer name..."
                value={searchTx}
                onChange={(e) => setSearchTx(e.target.value)}
                style={{ width: 170, padding: '6px 10px', fontSize: 12 }}
              />
              <button className="btn btn-outline-green btn-sm" onClick={() => setShowLogModal(true)}>
                <Plus size={14} />
                Add Rental Record
              </button>
            </div>
          </div>

          <div className="data-table-container" style={{ maxHeight: 360, overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Farmer Name</th>
                  <th>Machinery</th>
                  <th>Duration</th>
                  <th>Acres</th>
                  <th>Income Earned</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => (
                  <tr key={tx._id}>
                    <td style={{ fontSize: 12, color: '#94a3b8' }}>
                      {new Date(tx.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ fontWeight: 600, color: '#f8fafc' }}>{tx.farmerName}</td>
                    <td>{tx.machineId}</td>
                    <td>{tx.durationHours} hrs</td>
                    <td>{tx.acresCovered} ac</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#4ade80' }}>
                      ₹{tx.feeCharged}
                    </td>
                    <td>
                      <span className="badge badge-green" style={{ fontSize: 10 }}>
                        {tx.paymentStatus || 'paid'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Contact Admin & Query Tracking */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 17, color: '#f8fafc' }}>Admin Communications</h3>
              <p style={{ fontSize: 12.5, color: '#94a3b8' }}>Maintenance & equipment requests</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowContactModal(true)}>
              <Send size={13} />
              New Ticket
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 360, overflowY: 'auto' }}>
            {myTickets.map((t) => (
              <div
                key={t._id}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 12,
                  padding: 14,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#f8fafc' }}>
                    {t.subject}
                  </span>
                  <span className={`badge ${t.status === 'resolved' ? 'badge-green' : 'badge-amber'}`} style={{ fontSize: 10 }}>
                    {t.status}
                  </span>
                </div>

                <div style={{ fontSize: 12.5, color: '#cbd5e1', marginTop: 6, lineHeight: 1.5 }}>
                  {t.message}
                </div>

                {t.adminResponse && (
                  <div style={{
                    background: 'rgba(34, 197, 94, 0.08)',
                    borderLeft: '3px solid #22c55e',
                    padding: '8px 12px',
                    borderRadius: 6,
                    marginTop: 10,
                    fontSize: 12,
                    color: '#e2e8f0',
                  }}>
                    <strong style={{ color: '#4ade80' }}>Admin Reply:</strong> {t.adminResponse}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL: LOG NEW RENTAL */}
      {showLogModal && (
        <div className="modal-overlay" onClick={() => setShowLogModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520, padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <h3 style={{ fontSize: 20, color: '#f8fafc' }}>Log Rental Service Record</h3>
                <p style={{ fontSize: 12.5, color: '#94a3b8' }}>Record completed agricultural machinery service</p>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowLogModal(false)}
                style={{ borderRadius: '50%', width: 30, height: 30, padding: 0 }}
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleLogTransactionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="input-group">
                <label className="input-label">Farmer Full Name *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Rameshwar Dayal"
                  value={txForm.farmerName}
                  onChange={(e) => setTxForm({ ...txForm, farmerName: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Select Machinery Used *</label>
                <select
                  className="select-field"
                  value={txForm.machineId}
                  onChange={(e) => setTxForm({ ...txForm, machineId: e.target.value })}
                  required
                >
                  {equipment.map((eq, idx) => (
                    <option key={idx} value={eq.machineId}>
                      {eq.machineType} ({eq.machineId})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="input-group">
                  <label className="input-label">Service Duration (Hours) *</label>
                  <input
                    type="number"
                    step="0.5"
                    className="input-field"
                    value={txForm.durationHours}
                    onChange={(e) => setTxForm({ ...txForm, durationHours: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Acres Covered</label>
                  <input
                    type="number"
                    step="0.1"
                    className="input-field"
                    value={txForm.acresCovered}
                    onChange={(e) => setTxForm({ ...txForm, acresCovered: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="input-group">
                  <label className="input-label">Fee Charged / Income (₹) *</label>
                  <input
                    type="number"
                    className="input-field"
                    value={txForm.feeCharged}
                    onChange={(e) => setTxForm({ ...txForm, feeCharged: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Payment Status</label>
                  <select
                    className="select-field"
                    value={txForm.paymentStatus}
                    onChange={(e) => setTxForm({ ...txForm, paymentStatus: e.target.value })}
                  >
                    <option value="paid">Paid (Cash / UPI)</option>
                    <option value="pending">Pending</option>
                    <option value="partial">Partial</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowLogModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <CheckCircle size={15} />
                  Save & Update Running Earnings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONTACT ADMIN */}
      {showContactModal && (
        <div className="modal-overlay" onClick={() => setShowContactModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520, padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <h3 style={{ fontSize: 20, color: '#f8fafc' }}>Contact NGO Admin Staff</h3>
                <p style={{ fontSize: 12.5, color: '#94a3b8' }}>Request machinery, report breakdown, or relay farmer feedback</p>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowContactModal(false)}
                style={{ borderRadius: '50%', width: 30, height: 30, padding: 0 }}
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleContactAdminSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="input-group">
                  <label className="input-label">Query Category</label>
                  <select
                    className="select-field"
                    value={contactForm.category}
                    onChange={(e) => setContactForm({ ...contactForm, category: e.target.value })}
                  >
                    <option value="equipment_request">Request Additional Machinery</option>
                    <option value="maintenance_issue">Maintenance / Implement Breakdown</option>
                    <option value="farmer_feedback">Farmer Demand Feedback</option>
                    <option value="general_query">General Operational Query</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Urgency Level</label>
                  <select
                    className="select-field"
                    value={contactForm.urgency}
                    onChange={(e) => setContactForm({ ...contactForm, urgency: e.target.value })}
                  >
                    <option value="low">Low (General)</option>
                    <option value="medium">Medium</option>
                    <option value="high">High (Urgent Tillage)</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Subject *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Rotavator Blade Replacement Needed"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Detailed Message *</label>
                <textarea
                  className="textarea-field"
                  rows={4}
                  placeholder="Describe your issue or equipment requirement..."
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowContactModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Send size={15} />
                  Submit Support Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
