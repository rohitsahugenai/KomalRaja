import React, { useState } from 'react';
import {
  X,
  Printer,
  Share2,
  CheckCircle2,
  FileText,
  Building2,
  Phone,
  Mail,
  Receipt,
  Download,
} from 'lucide-react';
import type { Invoice } from '../../types.ts';
import { api } from '../../services/api.ts';

interface AdminInvoiceModalProps {
  invoice: Invoice | null;
  onClose: () => void;
}

export const AdminInvoiceModal: React.FC<AdminInvoiceModalProps> = ({
  invoice,
  onClose,
}) => {
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const [waSentSuccess, setWaSentSuccess] = useState(false);

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsApp = async () => {
    setIsSendingWhatsApp(true);
    try {
      const res = await api.shareInvoiceWhatsApp(invoice.id);
      setWaSentSuccess(true);
      // Open WhatsApp web/app in a new tab
      window.open(res.whatsapp_url, '_blank');
      setTimeout(() => setWaSentSuccess(false), 4000);
    } catch (err) {
      console.error('WhatsApp share error:', err);
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  return (
    <div
      id="invoice-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4"
    >
      <div
        id="invoice-modal-dialog"
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[95vh]"
      >
        {/* Modal Toolbar (hidden during print) */}
        <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Tax Invoice / Bill</h3>
              <p className="text-xs text-zinc-500">{invoice.invoice_number}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* WhatsApp Share Button (SRS #28) */}
            <button
              id="btn-send-whatsapp-bill"
              onClick={handleSendWhatsApp}
              disabled={isSendingWhatsApp}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isSendingWhatsApp ? 'Preparing...' : 'SEND BILL ON WHATSAPP'}</span>
            </button>

            {/* Print Button */}
            <button
              id="btn-print-bill"
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-900 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {waSentSuccess && (
          <div className="p-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs flex items-center justify-center gap-2 print:hidden">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>WhatsApp message generated and dispatch logged!</span>
          </div>
        )}

        {/* Printable Invoice Container */}
        <div id="printable-invoice" className="p-6 sm:p-8 overflow-y-auto space-y-6 text-zinc-800">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-zinc-200 pb-6">
            <div>
              <div className="text-xl font-black tracking-tight text-zinc-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center text-sm font-extrabold">
                  DS
                </span>
                <span>{invoice.dealer_name}</span>
              </div>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm leading-relaxed">
                {invoice.dealer_address}
              </p>
              <div className="mt-2 text-xs text-zinc-600 space-y-0.5">
                <div>GSTIN: <span className="font-mono font-bold text-zinc-900">{invoice.dealer_gstin}</span></div>
                <div>Phone: {invoice.dealer_phone} • Email: {invoice.dealer_email}</div>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block px-3 py-1 bg-zinc-900 text-white font-bold text-xs rounded-md uppercase tracking-wider mb-2">
                TAX INVOICE
              </span>
              <div className="text-xs text-zinc-500">Invoice Number</div>
              <div className="font-mono font-bold text-sm text-zinc-900">{invoice.invoice_number}</div>
              <div className="mt-1 text-xs text-zinc-500">
                Date: <span className="font-semibold text-zinc-800">{invoice.invoice_date}</span>
              </div>
              <div className="text-xs text-zinc-500">
                Order Ref: <span className="font-mono font-semibold text-zinc-800">{invoice.order_number}</span>
              </div>
            </div>
          </div>

          {/* Bill To & Dispatch Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-50 p-4 rounded-xl border border-zinc-200 text-xs">
            <div>
              <div className="font-bold text-zinc-500 uppercase tracking-wider text-[10px] mb-1">
                Billed To / Buyer:
              </div>
              <div className="font-bold text-sm text-zinc-900">{invoice.shop_name}</div>
              <div className="text-zinc-600 mt-0.5">Proprietor: {invoice.customer_name}</div>
              <div className="text-zinc-600 mt-0.5">Phone: {invoice.customer_phone}</div>
              {invoice.customer_gstin && (
                <div className="text-zinc-600 mt-0.5">
                  GSTIN: <span className="font-mono font-semibold">{invoice.customer_gstin}</span>
                </div>
              )}
            </div>

            <div>
              <div className="font-bold text-zinc-500 uppercase tracking-wider text-[10px] mb-1">
                Delivery Location:
              </div>
              <p className="text-zinc-700 leading-relaxed">{invoice.customer_address}</p>
              <div className="mt-2 text-zinc-500">
                Payment Terms: <span className="font-semibold text-zinc-800">{invoice.payment_terms}</span>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-zinc-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-100 border-b border-zinc-200 text-zinc-600 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Snack Description</th>
                  <th className="py-2.5 px-3 text-center">Pack / Unit</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Rate (₹)</th>
                  <th className="py-2.5 px-3 text-right">Taxable (₹)</th>
                  <th className="py-2.5 px-3 text-right">GST</th>
                  <th className="py-2.5 px-3 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {invoice.items.map((it, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50/60">
                    <td className="py-2.5 px-3 text-zinc-400">{idx + 1}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-zinc-900">{it.product_name}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">{it.sku}</div>
                    </td>
                    <td className="py-2.5 px-3 text-center text-zinc-600">{it.pack_size}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-zinc-900">{it.quantity}</td>
                    <td className="py-2.5 px-3 text-right font-mono">₹{it.rate.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-mono">₹{it.amount.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right text-zinc-600 font-mono">
                      {it.gst_rate}% (₹{it.gst_amount.toFixed(2)})
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold font-mono text-zinc-900">
                      ₹{it.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tax Breakdown & Grand Total */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="text-xs text-zinc-500 max-w-sm space-y-1">
              <div className="font-bold text-zinc-700">Bank Details for Settlement:</div>
              <div>Bank: HDFC Bank, Ring Road Branch</div>
              <div>A/C Name: Shree Ganesh Snack Distributors</div>
              <div>A/C No: 50200098765432 • IFSC: HDFC0001234</div>
              <div>UPI: dealersnack@hdfcbank</div>
            </div>

            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal:</span>
                <span className="font-mono">₹{invoice.subtotal.toFixed(2)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Special Dealer Discount:</span>
                  <span className="font-mono">-₹{invoice.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-600">
                <span>Taxable Amount:</span>
                <span className="font-mono">₹{invoice.taxable_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-500 text-[11px]">
                <span>CGST (Central):</span>
                <span className="font-mono">₹{invoice.cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-500 text-[11px]">
                <span>SGST (State):</span>
                <span className="font-mono">₹{invoice.sgst.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-zinc-300 flex justify-between items-center text-sm font-black text-zinc-900">
                <span>Grand Total:</span>
                <span className="font-mono text-base text-amber-900">
                  ₹{invoice.grand_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-8 border-t border-zinc-200 flex justify-between items-end text-xs text-zinc-500">
            <div>
              <p>Customer Seal & Signature</p>
              <div className="h-10"></div>
              <div className="border-t border-zinc-300 w-36"></div>
            </div>
            <div className="text-right">
              <p>For {invoice.dealer_name}</p>
              <div className="h-10"></div>
              <div className="border-t border-zinc-300 w-44 ml-auto"></div>
              <p className="text-[10px] text-zinc-400 mt-1">Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
