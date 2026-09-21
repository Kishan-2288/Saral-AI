import React, { useState } from 'react';
import { 
  Search, 
  Calendar, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

interface AppointmentRecord {
  id: string;
  patientName: string;
  phone: string;
  doctor: string;
  specialty: string;
  time: string;
  type: 'New Booking' | 'Reschedule' | 'Cancellation';
  status: 'Confirmed' | 'Completed' | 'Pending Staff';
  channel: string;
}

const mockAppointments: AppointmentRecord[] = [
  {
    id: 'APT-9821',
    patientName: 'Rohan Sharma',
    phone: '+91 98201 •••••',
    doctor: 'Dr. Sharma',
    specialty: 'Cardiology',
    time: 'Tomorrow, 05:30 PM',
    type: 'New Booking',
    status: 'Confirmed',
    channel: 'WhatsApp',
  },
  {
    id: 'APT-9820',
    patientName: 'Priya Mukherjee',
    phone: '+91 97112 •••••',
    doctor: 'Dr. Varma',
    specialty: 'General Medicine',
    time: 'Tomorrow, 11:00 AM',
    type: 'Reschedule',
    status: 'Confirmed',
    channel: 'WhatsApp (Voice)',
  },
  {
    id: 'APT-9819',
    patientName: 'Vikramaditya Nair',
    phone: '+91 94451 •••••',
    doctor: 'Dr. Sen',
    specialty: 'Orthopedics',
    time: 'Friday, 04:15 PM',
    type: 'Cancellation',
    status: 'Completed',
    channel: 'WhatsApp',
  },
  {
    id: 'APT-9818',
    patientName: 'Ananya Gupta',
    phone: '+91 99880 •••••',
    doctor: 'Dr. Sharma',
    specialty: 'Cardiology',
    time: 'Thursday, 03:45 PM',
    type: 'New Booking',
    status: 'Confirmed',
    channel: 'WhatsApp',
  },
  {
    id: 'APT-9817',
    patientName: 'Kunal Deshmukh',
    phone: '+91 98224 •••••',
    doctor: 'Dr. Joshi',
    specialty: 'Pediatrics',
    time: 'Tomorrow, 03:00 PM',
    type: 'New Booking',
    status: 'Pending Staff',
    channel: 'WhatsApp (Handoff)',
  },
];

export const HospitalDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'appointments' | 'conversations'>('appointments');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAppointments = mockAppointments.filter(
    (apt) =>
      apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section data-reveal-section className="py-24 md:py-36 bg-white border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Heading - Explicitly relabeled as Future Roadmap */}
        <div className="max-w-3xl mb-12 md:mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-700 text-xs font-mono mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>FUTURE PRODUCT ROADMAP (IN DEVELOPMENT)</span>
          </div>
          <h2 className="motion-title text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-950 tracking-[-0.035em] font-display mt-1">
            Live operations, simplified.
          </h2>
          <p className="motion-copy text-sm sm:text-base text-neutral-500 mt-2 leading-relaxed">
            A focused view of what automation is doing now.
          </p>
        </div>

        {/* Dashboard Browser Mockup */}
        <div data-dashboard className="motion-content bg-white rounded-3xl border border-neutral-200/90 shadow-[0_20px_50px_rgba(0,0,0,0.06)] overflow-hidden">
          {/* Concept Banner */}
          <div className="bg-amber-50/80 border-b border-amber-200/60 px-4 py-2 text-[11px] font-mono text-amber-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>ROADMAP DESIGN PREVIEW — Current production deployment runs directly via WhatsApp & Supabase</span>
            </div>
            <span className="hidden sm:inline text-amber-700/80">Q3 Concept</span>
          </div>

          {/* Browser Window Header */}
          <div className="bg-neutral-50 border-b border-neutral-200/80 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-neutral-300 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-neutral-300 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-neutral-300 inline-block"></span>
            </div>

            {/* URL bar */}
            <div className="bg-white border border-neutral-200/80 rounded-md px-4 py-1 text-[11px] font-mono text-neutral-500 max-w-sm w-full text-center truncate flex items-center justify-center space-x-1.5">
              <ShieldCheck className="w-3 h-3 text-neutral-500" />
              <span>preview-roadmap.saral.ai/hospital-console/concept</span>
            </div>

            <div className="flex items-center space-x-2 text-neutral-400">
              <RefreshCw className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Internal Dashboard View */}
          <div className="p-6 md:p-8 bg-white">
            {/* Top Metric Bar - Honest metrics representing WhatsApp appointment assistant */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div data-dashboard-entry className="p-4 rounded-xl border border-neutral-200/80 bg-neutral-50/40">
                <div className="text-[11px] font-mono text-neutral-400 uppercase">Bookings</div>
                <div className="text-2xl font-bold text-neutral-950 mt-1 font-display">124</div>
                <div className="text-[11px] text-emerald-700 font-medium mt-1">Automated today</div>
              </div>

              <div data-dashboard-entry className="p-4 rounded-xl border border-neutral-200/80 bg-neutral-50/40">
                <div className="text-[11px] font-mono text-neutral-400 uppercase">Reschedules</div>
                <div className="text-2xl font-bold text-neutral-950 mt-1 font-display">18</div>
                <div className="text-[11px] text-neutral-500 mt-1">Resolved in chat</div>
              </div>

              <div data-dashboard-entry className="p-4 rounded-xl border border-neutral-200/80 bg-neutral-50/40">
                <div className="text-[11px] font-mono text-neutral-400 uppercase">Human handoffs</div>
                <div className="text-2xl font-bold text-neutral-950 mt-1 font-display">7</div>
                <div className="text-[11px] text-neutral-600 font-medium mt-1">Routed safely</div>
              </div>

              <div data-dashboard-entry className="p-4 rounded-xl border border-neutral-200/80 bg-neutral-50/40">
                <div className="text-[11px] font-mono text-neutral-400 uppercase">Automated</div>
                <div className="text-2xl font-bold text-neutral-950 mt-1 font-display">98.4%</div>
                <div className="text-[11px] text-neutral-500 mt-1">Verified workflows</div>
              </div>
            </div>

            {/* Dashboard Tabs & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-200 gap-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveTab('appointments')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'appointments'
                      ? 'bg-neutral-950 text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-950'
                  }`}
                >
                  Appointment Logs (Concept)
                </button>
                <button
                  onClick={() => setActiveTab('conversations')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'conversations'
                      ? 'bg-neutral-950 text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-950'
                  }`}
                >
                  Support & Handoff Logs (Concept)
                </button>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search patient or doctor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900 focus:bg-white w-full sm:w-64"
                />
              </div>
            </div>

            {/* Tab 1: Appointments Table */}
            {activeTab === 'appointments' && (
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-xs text-neutral-700">
                  <thead className="bg-neutral-50/70 text-neutral-400 uppercase font-mono text-[10px] border-b border-neutral-200">
                    <tr>
                      <th className="py-2.5 px-3">Booking ID</th>
                      <th className="py-2.5 px-3">Patient</th>
                      <th className="py-2.5 px-3">Doctor & Specialty</th>
                      <th className="py-2.5 px-3">Requested Slot</th>
                      <th className="py-2.5 px-3">Action Type</th>
                      <th className="py-2.5 px-3">Channel</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredAppointments.map((row) => (
                      <tr data-dashboard-entry key={row.id} className="hover:bg-neutral-50/60 transition-colors">
                        <td className="py-3 px-3 font-mono text-neutral-500 font-medium">{row.id}</td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-neutral-900">{row.patientName}</div>
                          <div className="text-[10px] text-neutral-400 font-mono">{row.phone}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-medium text-neutral-900">{row.doctor}</div>
                          <div className="text-[10px] text-neutral-500">{row.specialty}</div>
                        </td>
                        <td className="py-3 px-3 font-mono text-neutral-700">{row.time}</td>
                        <td className="py-3 px-3">
                          <span className="font-medium text-neutral-800">{row.type}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-100 text-neutral-700">
                            {row.channel}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                            row.status === 'Confirmed' ? 'text-emerald-700' :
                            row.status === 'Completed' ? 'text-neutral-700' : 'text-amber-700'
                          }`}>
                            <CheckCircle2 className="w-3 h-3" />
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 2: Conversations & Handoffs Feed */}
            {activeTab === 'conversations' && (
              <div className="mt-4 space-y-3">
                {[
                  {
                    patient: 'Rohan Sharma',
                    type: 'FAQ Support',
                    msg: '“What are the consultation timings for Dr. Sharma on weekdays?”',
                    aiReply: '“Dr. Sharma conducts OPD consultations Monday through Friday, 4:00 PM – 7:00 PM.”',
                    time: '4 mins ago',
                    status: 'Resolved by AI',
                  },
                  {
                    patient: 'Kunal Deshmukh',
                    type: 'Human Handoff',
                    msg: '“My child has a specific allergic reaction to penicillin, can Dr. Joshi review test notes?”',
                    aiReply: '“I have forwarded your inquiry and contact directly to our pediatric front desk coordinator. A staff member will assist you shortly.”',
                    time: '18 mins ago',
                    status: 'Escalated to Staff',
                  },
                  {
                    patient: 'Priya Mukherjee',
                    type: 'Voice Message',
                    msg: '🎤 Audio note: “Kal subah 11 baje ka time change karke parson ho sakta hai?”',
                    aiReply: '“Transcribed voice: Rescheduling request for Dr. Varma. Slot available Thursday 11:00 AM. Updated in system.”',
                    time: '32 mins ago',
                    status: 'Resolved via Voice AI',
                  },
                ].map((item, idx) => (
                  <div data-dashboard-entry key={idx} className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-neutral-900">{item.patient}</span>
                        <span className="text-[10px] text-neutral-400 font-mono">• {item.time}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 bg-neutral-200 text-neutral-700 rounded">{item.type}</span>
                      </div>
                      <div className="text-neutral-700">{item.msg}</div>
                      <div className="text-[11px] text-neutral-500 font-mono">{item.aiReply}</div>
                    </div>
                    <span className={`px-2 py-0.5 border rounded text-[10px] font-mono shrink-0 ${
                      item.status === 'Escalated to Staff' 
                        ? 'bg-amber-50 border-amber-200 text-amber-800' 
                        : 'bg-white border-neutral-200 text-emerald-700'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
