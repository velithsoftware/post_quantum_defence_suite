'use client';

import React, { useState } from 'react';
import { Certificate, IssuedCertificate, TabType } from '../types';

interface CAViewProps {
  certs: Certificate[];
  issuedCerts: IssuedCertificate[];
  onIssueCert: (commonName: string, signatureAlg: string) => Promise<void>;
  setActiveTab: (tab: TabType) => void;
}

export const CAView: React.FC<CAViewProps> = ({
  certs,
  issuedCerts,
  onIssueCert,
  setActiveTab,
}) => {
  const [commonName, setCommonName] = useState('');
  const [signatureAlg, setSignatureAlg] = useState('ML-DSA-87');
  const [isIssuing, setIsIssuing] = useState(false);
  const [issueError, setIssueError] = useState<string | null>(null);

  const [selectedPem, setSelectedPem] = useState<IssuedCertificate | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsIssuing(true);
    setIssueError(null);
    try {
      await onIssueCert(commonName, signatureAlg);
      setCommonName('');
    } catch (err: any) {
      setIssueError(err.message || 'Failed to issue certificate');
    } finally {
      setIsIssuing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Certificate PEM block copied to clipboard!');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0b1220] via-[#0f172a] to-[#0b1220] p-6 rounded-2xl border border-emerald-500/20">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-mono text-emerald-400 mb-1">
            <span>PILLAR 3: TRUST</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Shield CA (Hybrid Certificate Authority)</h2>
          <p className="text-xs text-slate-400 mt-1">
            Issues standard X.509 certificates containing embedded post-quantum NIST ML-DSA-87 signatures inside ASN.1 extension <code className="text-emerald-300 font-mono">1.3.6.1.4.1.58888.1</code>.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono bg-[#070c18] px-3.5 py-2 rounded-xl border border-slate-800">
          <span className="text-slate-400">Root CA Standard:</span>
          <span className="text-emerald-400 font-bold">NIST FIPS 204 (ML-DSA-87)</span>
        </div>
      </div>

      {issueError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-mono">
          🚨 {issueError}
        </div>
      )}

      {/* Form: Issue PQC Certificate */}
      <form onSubmit={handleSubmit} className="bg-[#0b1220] border border-slate-800 p-6 rounded-2xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center justify-between">
          <span>🔑 Issue Post-Quantum Certificate</span>
          <span className="text-xs font-mono text-emerald-400">NIST ML-DSA-87</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 space-y-2">
            <label className="text-xs font-mono text-slate-300 block">Common Name (CN)</label>
            <input
              type="text"
              required
              value={commonName}
              onChange={(e) => setCommonName(e.target.value)}
              placeholder="e.g. gateway.internal or auth.enterprise.com"
              className="w-full bg-[#070c18] border border-slate-700 focus:border-emerald-400 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-300 block">Signature Primitive</label>
            <select
              value={signatureAlg}
              onChange={(e) => setSignatureAlg(e.target.value)}
              className="w-full bg-[#070c18] border border-slate-700 focus:border-emerald-400 rounded-xl px-3 py-2.5 text-xs text-emerald-300 font-mono outline-none transition"
            >
              <option value="ML-DSA-87">ML-DSA-87 (Dilithium5)</option>
              <option value="ML-DSA-87+ECDSA-P384">Hybrid ML-DSA-87 + ECDSA P-384</option>
              <option value="LMS-H10">LMS Stateful Signature (H10)</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isIssuing}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center space-x-2"
          >
            <span>{isIssuing ? 'Generating ML-DSA Keypair...' : 'Issue X.509 PQC Certificate →'}</span>
          </button>
        </div>
      </form>

      {/* ASN.1 Extension Inspector Banner */}
      <div className="bg-[#070c18] border border-slate-800 rounded-2xl p-5 space-y-3">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center justify-between">
          <span>ASN.1 Dual Signature Extension Structure</span>
          <span className="text-emerald-400 font-mono text-[10px]">OID 1.3.6.1.4.1.58888.1</span>
        </h4>
        <pre className="text-[11px] font-mono text-slate-300 bg-[#0b1220] p-4 rounded-xl border border-slate-800 overflow-x-auto">
{`SEQUENCE {
  OBJECT IDENTIFIER : 1.3.6.1.4.1.58888.1 (QuantumShield ML-DSA Signature Extension)
  OCTET STRING : 
    SEQUENCE {
      AlgorithmIdentifier : ML-DSA-87 (2.16.840.1.101.3.4.3.19)
      BIT STRING : [2592 bytes ML-DSA-87 Post-Quantum Signature]
    }
}`}
        </pre>
      </div>

      {/* Issued Certificates Registry Table */}
      <div className="bg-[#0b1220] border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Active Issued Certificates Registry</h3>
          <span className="text-xs font-mono text-slate-400">{issuedCerts.length} certificates</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#070c18] text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Common Name</th>
                <th className="py-3 px-4">Serial Number</th>
                <th className="py-3 px-4">Signature Alg</th>
                <th className="py-3 px-4">Issuer</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">PEM Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {issuedCerts.map((cert) => (
                <tr key={cert.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-bold text-white">{cert.common_name}</td>
                  <td className="py-3 px-4 text-slate-400 font-mono">{cert.serial_number}</td>
                  <td className="py-3 px-4 text-emerald-300 font-bold">{cert.signature_algorithm}</td>
                  <td className="py-3 px-4 text-slate-400 max-w-xs truncate">{cert.issuer}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                      ACTIVE
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => setSelectedPem(cert)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition"
                    >
                      View PEM
                    </button>
                    <button
                      onClick={() => copyToClipboard(cert.pem_block)}
                      className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30 text-xs transition"
                    >
                      Copy
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PEM Modal Viewer */}
      {selectedPem && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1220] border border-emerald-500/40 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">X.509 Certificate PEM Block</h3>
                <p className="text-xs font-mono text-emerald-400">{selectedPem.common_name}</p>
              </div>
              <button
                onClick={() => setSelectedPem(null)}
                className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800/50"
              >
                ✕
              </button>
            </div>

            <pre className="text-xs font-mono text-slate-300 bg-[#070c18] p-4 rounded-xl border border-slate-800 overflow-x-auto whitespace-pre-wrap">
              {selectedPem.pem_block}
            </pre>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => copyToClipboard(selectedPem.pem_block)}
                className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/30 text-xs font-bold"
              >
                Copy PEM Block
              </button>
              <button
                onClick={() => setSelectedPem(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
