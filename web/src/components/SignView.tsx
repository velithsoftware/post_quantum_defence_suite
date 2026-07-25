'use client';

import React, { useState } from 'react';
import { SignedArtifact, TabType } from '../types';

interface SignViewProps {
  signatures: SignedArtifact[];
  onSignArtifact: (artifactName: string, payload: string) => Promise<void>;
  onVerifySignature: (payload: string, signature: string, publicKey: string) => Promise<boolean>;
  setActiveTab: (tab: TabType) => void;
}

export const SignView: React.FC<SignViewProps> = ({
  signatures,
  onSignArtifact,
  onVerifySignature,
  setActiveTab,
}) => {
  // Sign form states
  const [artifactName, setArtifactName] = useState('');
  const [payload, setPayload] = useState('');
  const [isSigning, setIsSigning] = useState(false);
  const [signError, setSignError] = useState<string | null>(null);

  // Verify form states
  const [verifyPayload, setVerifyPayload] = useState('');
  const [verifySignature, setVerifySignature] = useState('');
  const [verifyPublicKey, setVerifyPublicKey] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const handleSignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigning(true);
    setSignError(null);
    try {
      await onSignArtifact(artifactName, payload);
      setArtifactName('');
      setPayload('');
    } catch (err: any) {
      setSignError(err.message || 'Failed to sign artifact');
    } finally {
      setIsSigning(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setVerifyResult(null);
    setVerifyError(null);
    try {
      const valid = await onVerifySignature(verifyPayload, verifySignature, verifyPublicKey);
      setVerifyResult(valid);
    } catch (err: any) {
      setVerifyError(err.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  // Populate test verification preset
  const handleLoadTestPreset = () => {
    if (signatures.length > 0) {
      const sig = signatures[0];
      setVerifyPayload('sample_payload_data_v1.0');
      setVerifySignature(sig.signature);
      setVerifyPublicKey(sig.public_key);
    } else {
      setVerifyPayload('firmware_hex_payload_data');
      setVerifySignature('lms_sig_00000001_8a91c0e3f4b5a6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1');
      setVerifyPublicKey('lms_pubkey_h10_w4_99201f8273b45c6d');
    }
  };

  const currentTreeIndex = signatures.length > 0 ? Math.max(...signatures.map((s) => s.lms_tree_index || 1)) : 1;
  const maxTreeCapacity = 1024; // H=10 -> 2^10 = 1024 signatures
  const remainingKeys = maxTreeCapacity - currentTreeIndex;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0b1220] via-[#0f172a] to-[#0b1220] p-6 rounded-2xl border border-amber-500/20">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-mono text-amber-400 mb-1">
            <span>PILLAR 4: DEPLOY</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Shield Sign (Stateful LMS Code Signer)</h2>
          <p className="text-xs text-slate-400 mt-1">
            Stateful Leighton-Micali Signature (LMS RFC 8554) state guard preventing index key-reuse in software & firmware updates.
          </p>
        </div>

        {/* State Tracker Pill */}
        <div className="bg-[#070c18] p-3 rounded-xl border border-slate-800 flex items-center space-x-3 text-xs font-mono">
          <div className="text-right">
            <span className="text-slate-400 block text-[10px]">LMS TREE H10 INDEX</span>
            <span className="text-amber-400 font-bold text-sm">#{currentTreeIndex} / {maxTreeCapacity}</span>
          </div>
          <div className="w-12 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-amber-400" style={{ width: `${(currentTreeIndex / maxTreeCapacity) * 100}%` }}></div>
          </div>
        </div>
      </div>

      {signError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-mono">
          🚨 {signError}
        </div>
      )}

      {/* Grid: Sign Artifact & Verify Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sign Artifact Form */}
        <form onSubmit={handleSignSubmit} className="bg-[#0b1220] border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <span>✍️ Sign Binary / Software Artifact</span>
            </h3>
            <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-mono">
              RFC 8554 LMS
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-300 block">Artifact / Firmware Name</label>
            <input
              type="text"
              required
              value={artifactName}
              onChange={(e) => setArtifactName(e.target.value)}
              placeholder="firmware-v4.2.1-arm64.bin"
              className="w-full bg-[#070c18] border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-300 block">Payload / SHA-256 Digest</label>
            <textarea
              required
              rows={3}
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              placeholder="e4d909c290d0fb1ca068ffaddf22cbd0..."
              className="w-full bg-[#070c18] border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={isSigning}
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center justify-center space-x-2"
          >
            <span>{isSigning ? 'Atomically Advancing State Counter...' : 'Sign with Stateful LMS →'}</span>
          </button>
        </form>

        {/* Verification Sandbox Form */}
        <form onSubmit={handleVerifySubmit} className="bg-[#0b1220] border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <span>🛡️ Signature Verification Sandbox</span>
            </h3>
            <button
              type="button"
              onClick={handleLoadTestPreset}
              className="text-[10px] bg-slate-800 hover:bg-slate-700 text-cyan-300 px-2 py-0.5 rounded font-mono"
            >
              Load Preset Payload
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-300 block">Payload</label>
            <input
              type="text"
              required
              value={verifyPayload}
              onChange={(e) => setVerifyPayload(e.target.value)}
              placeholder="sample_payload_data_v1.0"
              className="w-full bg-[#070c18] border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-300 block">LMS Signature</label>
            <input
              type="text"
              required
              value={verifySignature}
              onChange={(e) => setVerifySignature(e.target.value)}
              placeholder="lms_sig_00000001_8a91..."
              className="w-full bg-[#070c18] border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-300 block">LMS Public Key</label>
            <input
              type="text"
              required
              value={verifyPublicKey}
              onChange={(e) => setVerifyPublicKey(e.target.value)}
              placeholder="lms_pubkey_h10_w4_99201f82..."
              className="w-full bg-[#070c18] border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none transition"
            />
          </div>

          {verifyResult !== null && (
            <div
              className={`p-3 rounded-xl border text-xs font-mono font-bold flex items-center justify-between ${
                verifyResult
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-red-500/10 text-red-400 border-red-500/30'
              }`}
            >
              <span>{verifyResult ? 'VALID SIGNATURE ✓' : 'INVALID OR TAMPERED SIGNATURE ✕'}</span>
              <span>{verifyResult ? 'RFC 8554 Verified' : 'Check digest'}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full py-2.5 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2"
          >
            <span>{isVerifying ? 'Verifying LMS Hash Chain...' : 'Verify Cryptographic Signature →'}</span>
          </button>
        </form>
      </div>

      {/* Signed Artifacts Audit Trail Table */}
      <div className="bg-[#0b1220] border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Signed Artifacts Audit Trail</h3>
          <span className="text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded">
            DB State Counter Tracked
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#070c18] text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Artifact Name</th>
                <th className="py-3 px-4">LMS Tree Index</th>
                <th className="py-3 px-4">LMS Signature Prefix</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Signed Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {signatures.map((sig) => (
                <tr key={sig.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-bold text-white">{sig.artifact_name}</td>
                  <td className="py-3 px-4 text-amber-400 font-bold">#{sig.lms_tree_index || 1}</td>
                  <td className="py-3 px-4 text-slate-400 max-w-xs truncate">{sig.signature}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                      VALID
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-400">
                    {new Date(sig.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
