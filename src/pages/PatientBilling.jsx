import React, { useState } from 'react';
import { useToast } from '../App';

const PatientBilling = () => {
  const { showToast } = useToast();
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [invoices] = useState([
    { id: 'inv-101', date: '2026-07-12', description: 'General Consultation (Dr. Sarah Jenkins)', amount: 150.00, status: 'Paid', paymentMethod: 'Credit Card' },
    { id: 'inv-102', date: '2026-07-12', description: 'Pharmacy Prescription (Amoxicillin & Ibuprofen)', amount: 45.50, status: 'Paid', paymentMethod: 'Insurance Co-Pay' },
    { id: 'inv-103', date: '2026-07-14', description: 'Specialist Consultation (Dr. David Kim)', amount: 200.00, status: 'Pending', paymentMethod: '-' }
  ]);

  const totalBilled = invoices.reduce((acc, curr) => acc + curr.amount, 0);
  const pendingAmount = invoices.filter(inv => inv.status === 'Pending').reduce((acc, curr) => acc + curr.amount, 0);
  const paidCount = invoices.filter(inv => inv.status === 'Paid').length;

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden flex justify-between items-center">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full">
            Financial Ledger
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
            Billing & Invoices
          </h2>
          <p className="text-sm text-primary-100 max-w-xl mt-1">
            Track payments, consult invoices, and download itemized clinical receipts.
          </p>
        </div>
      </div>

      {/* Premium Dashboard Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Total Invoiced</span>
          <p className="text-sm font-extrabold text-slate-800">${totalBilled.toFixed(2)}</p>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Outstanding Balance</span>
          <p className={`text-sm font-extrabold ${pendingAmount > 0 ? 'text-amber-750' : 'text-slate-800'}`}>
            ${pendingAmount.toFixed(2)}
          </p>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Settled Accounts</span>
          <p className="text-sm font-extrabold text-emerald-700">{paidCount} Paid Invoices</p>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
          <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Payment Status</span>
          <p className="text-sm font-extrabold text-slate-800">Clear</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Invoices List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Invoices Overview</h3>
              <p className="text-xs text-slate-500 font-semibold font-sans">Click on any invoice row to view the receipt drawer</p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Invoice ID</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Item Description</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {invoices.map((inv) => (
                    <tr
                      key={inv.id}
                      onClick={() => setSelectedInvoice(inv)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-bold text-primary-700">{inv.id}</td>
                      <td className="py-3 px-4">{inv.date}</td>
                      <td className="py-3 px-4">{inv.description}</td>
                      <td className="py-3 px-4">${inv.amount.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                          inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Invoice Detail Receipt Card */}
        <div className="lg:col-span-1">
          {selectedInvoice ? (
            <div className="bg-white border border-slate-250 p-6 rounded-3xl shadow-lg space-y-6 relative overflow-hidden">
              {/* Receipt Visual Top */}
              <div className="border-b border-slate-150 pb-4 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Clinical Receipt Details</span>
                <h4 className="font-extrabold text-slate-800 text-lg">{selectedInvoice.id}</h4>
                <p className="text-xs text-slate-500 font-medium">Issued: {selectedInvoice.date}</p>
              </div>

              <div className="space-y-4 text-xs font-semibold text-slate-650">
                <div className="flex justify-between">
                  <span>Description</span>
                  <span className="text-slate-800 text-right max-w-[150px]">{selectedInvoice.description}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment status</span>
                  <span className={`font-bold ${selectedInvoice.status === 'Paid' ? 'text-emerald-700' : 'text-amber-750'}`}>
                    {selectedInvoice.status}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-3">
                  <span>Payment Method</span>
                  <span className="text-slate-800">{selectedInvoice.paymentMethod}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-3 text-sm font-bold text-slate-800">
                  <span>Total Amount</span>
                  <span>${selectedInvoice.amount.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex gap-2">
                <button
                  onClick={() => showToast('Compiling invoice PDF. Download will begin shortly.', 'info')}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-950 text-white text-xs font-bold rounded-xl shadow transition-colors"
                >
                  Download PDF
                </button>
                {selectedInvoice.status === 'Pending' && (
                  <button
                    onClick={() => {
                      showToast('Processing secure gateway payment transaction...', 'info');
                      setTimeout(() => {
                        selectedInvoice.status = 'Paid';
                        selectedInvoice.paymentMethod = 'Credit Card';
                        setSelectedInvoice({ ...selectedInvoice });
                        showToast(`Invoice ${selectedInvoice.id} successfully settled.`, 'success');
                      }, 1200);
                    }}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition-colors"
                  >
                    Pay Bill
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-100 border border-dashed border-slate-350 rounded-3xl h-[260px] flex items-center justify-center p-6 text-center text-xs text-slate-400 font-semibold shadow-inner">
              Select an invoice from the overview list to render the detailed clinical receipt panel.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default PatientBilling;
