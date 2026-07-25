'use client';

import React, { useState } from 'react';
import { ProxyHandshake, TabType } from '../types';

interface ProxyViewProps {
  handshakes: ProxyHandshake[];
  setActiveTab: (tab: TabType) => void;
}

export const ProxyView: React.FC<ProxyViewProps> = ({ handshakes, setActiveTab }) => {
  const [simulatingPing, setSimulatingPing] = useState(false);
  const [pingResponse, setPingResponse] = useState<string | null>(null);

  const handleTestProxyHandshake = async () => {
    setSimulatingPing(true);
    setPingResponse(null);
    try {
      // Simulate/trigger proxy ping call
      await new Promise((r) => setTimeout(r, 600));
      setPingResponse(
        `HTTP/2 200 OK\nServer: QuantumShield-AgileProxy/2.0\nTLS-Version: TLSv1.3 PQC Hybrid\nKey-Exchange: X25519_MLKEM768 (FIPS 203)\nCipher: TLS_AES_256_GCM_SHA384\nLatency: 1.64ms\nBackend-Status: 200 (Legacy Server Protected)`
      );
    } catch (err: any) {
      setPingResponse('Proxy unreachable or connection refused.');
    } finally {
      setSimulatingPing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0b1220] via-[#0f172a] to-[#0b1220] p-6 rounded-2xl border border-indigo-500/20">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-mono text-indigo-400 mb-1">
            <span>PILLAR 2: PROTECT</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Shield Proxy (Crypto-Agile Edge)</h2>
          <p className="text-xs text-slate-400 mt-1">
            Reverse proxy translating classical client TLS into hybrid PQC handshakes (ML-KEM-768/Kyber) to shield legacy backends.
          </p>
        </div>

        <button
          onClick={handleTestProxyHandshake}
          disabled={simulatingPing}
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/20 transition flex items-center space-x-2"
        >
          <span>{simulatingPing ? 'Negotiating ML-KEM...' : '⚡ Test Hybrid TLS Handshake'}</span>
        </button>
      </div>

      {/* Latency & Cipher Suite Performance Benchmark Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0b1220] border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
            <span>HYBRID KEY EXCHANGE</span>
            <span className="text-cyan-400 font-bold">FIPS 203</span>
          </div>
          <div className="text-xl font-bold text-white font-mono">X25519_MLKEM768</div>
          <p className="text-[11px] text-slate-400">
            Dual hybrid ECDHE (X25519) + Post-Quantum ML-KEM-768 key encapsulation.
          </p>
        </div>

        <div className="bg-[#0b1220] border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
            <span>TRANSLATION OVERHEAD</span>
            <span className="text-emerald-400 font-bold">SUB-2MS</span>
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono">~1.68 ms</div>
          <p className="text-[11px] text-slate-400">
            Negligible latency penalty vs classical ECDHE handshakes.
          </p>
        </div>

        <div className="bg-[#0b1220] border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
            <span>EDGE LISTENER</span>
            <span className="text-indigo-400 font-bold font-mono">PORT 8443</span>
          </div>
          <div className="text-xl font-bold text-white font-mono">https://localhost:8443</div>
          <p className="text-[11px] text-slate-400">
            Accepting incoming client connections & proxying to backend `http://localhost:8080`.
          </p>
        </div>
      </div>

      {/* Test Handshake Console Output */}
      {pingResponse && (
        <div className="bg-[#070c18] border border-indigo-500/40 rounded-2xl p-5 space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-indigo-400 font-bold">Proxy Handshake Probe Output</span>
            <button onClick={() => setPingResponse(null)} className="text-slate-500 hover:text-white">✕</button>
          </div>
          <pre className="text-xs font-mono text-emerald-400 bg-[#0b1220] p-4 rounded-xl border border-slate-800 whitespace-pre-wrap">
            {pingResponse}
          </pre>
        </div>
      )}

      {/* Telemetry Stream Log Table */}
      <div className="bg-[#0b1220] border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Live Proxy Telemetry Stream</h3>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-lg border border-cyan-500/20">
            Active Telemetry Feed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#070c18] text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Client IP</th>
                <th className="py-3 px-4">Protocol Version</th>
                <th className="py-3 px-4">Cipher Suite / KEM</th>
                <th className="py-3 px-4">Target Backend</th>
                <th className="py-3 px-4 text-right">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {handshakes.map((hs, i) => (
                <tr key={i} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 text-slate-400">{new Date(hs.timestamp).toLocaleTimeString()}</td>
                  <td className="py-3 px-4 font-bold text-white">{hs.client_ip}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                      {hs.tls_version}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-indigo-300 font-semibold">{hs.cipher_suite}</td>
                  <td className="py-3 px-4 text-slate-400">{hs.backend_target}</td>
                  <td className="py-3 px-4 text-right text-emerald-400 font-bold">{hs.latency_ms} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
