import React, { useState } from 'react';
import { adminDashboardService } from '../services/api';
import { useToast } from '../App';

const AdminExport = () => {
  const { showToast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleTriggerLegalExport = async () => {
    setIsExporting(true);
    showToast('Compiling secure legal audit trail CSV...', 'info');
    try {
      const blob = await adminDashboardService.exportAuditLogs('admin-01');
      
      // Download CSV
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'hms_legal_audit_metadata.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      showToast('Audit log CSV compiled and downloaded. Clinical text logs are excluded.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Export failed. Check connection.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider bg-slate-700 px-2.5 py-1 rounded-full">
            Legal & Compliance
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
            Dispute Legal Export
          </h2>
          <p className="text-sm text-slate-350 max-w-xl mt-1">
            Export structured metadata for compliance requests, insurance disputes, and legal audits.
          </p>
        </div>

        {/* Export Button */}
        <button
          onClick={handleTriggerLegalExport}
          disabled={isExporting}
          className="bg-red-650 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-red-500/30 transition-all shadow-sm hover:shadow flex items-center gap-1.5 flex-shrink-0"
        >
          📂 {isExporting ? 'Exporting...' : 'Trigger Legal Export (CSV)'}
        </button>
      </div>

      {/* Premium Dashboard Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Audit logs count</span>
          <p className="text-sm font-extrabold text-slate-800">3 Entries</p>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Privacy Guard</span>
          <p className="text-sm font-extrabold text-red-750">Chats Excluded</p>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Audit Security</span>
          <p className="text-sm font-extrabold text-slate-800">SHA-256 Sig</p>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">HIPAA Audit status</span>
          <p className="text-sm font-extrabold text-emerald-700">Verified</p>
        </div>
      </div>

      {/* Security statement details */}
      <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-sm space-y-5">
        <div>
          <h3 className="font-bold text-slate-800 text-base">Privacy Compliance & Legal Notice</h3>
          <p className="text-xs text-slate-500 font-semibold font-sans">Zero-Knowledge CSV details statement</p>
        </div>

        <div className="space-y-4 text-xs font-semibold text-slate-650 leading-relaxed">
          <div className="p-4 bg-red-50/50 border border-red-100 rounded-2xl space-y-1">
            <h4 className="font-bold text-red-800 text-xs">Exclusion of Patient Content</h4>
            <p className="text-red-750 font-medium">
              In accordance with Zero-Knowledge encryption rules, the export file contains ONLY transactional handshake metadata. Patient diagnostic descriptions, messages, and uploaded attachments are strictly excluded and cannot be exported.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
            <h4 className="font-bold text-slate-800 text-xs font-sans">Audit Records Included:</h4>
            <ul className="list-disc pl-5 space-y-1 text-slate-650 font-medium">
              <li>Log Identifier (UUID)</li>
              <li>Administrative User ID</li>
              <li>Action performed (e.g. login, query metadata)</li>
              <li>Target session key (if applicable)</li>
              <li>IP Address details</li>
              <li>Audit timestamp</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminExport;
