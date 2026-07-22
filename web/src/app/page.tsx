'use client';

import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:8080/api';

interface ScanJob {
  id: string;
  target_type: string;
  target_url: string;
  status: string;
  created_at: string;
  completed_at?: string;
}

interface Finding {
  id: string;
  scan_id: string;
  severity: string;
  rule_id: string;
  file_path: string;
  line_no: number;
  algorithm: string;
  description: string;
  remediation: string;
}

interface CBOMComponent {
  name: string;
  version: string;
  crypto_asset_type: string;
  algorithm: string;
  key_length: string;
  quantum_safe: boolean;
}

interface Certificate {
  id: string;
  scan_id: string;
  endpoint: string;
  subject: string;
  issuer: string;
  algorithm: string;
  key_bits: number;
  expiry: string;
  pq_hybrid: boolean;
  cnsa_compliant: boolean;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'scan_new' | 'scan_detail' | 'certs' | 'proxy' | 'ca' | 'sign'>('dashboard');
  const [scans, setScans] = useState<ScanJob[]>([]);
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [handshakes, setHandshakes] = useState<any[]>([]);
  const [issuedCerts, setIssuedCerts] = useState<any[]>([]);
  const [signatures, setSignatures] = useState<any[]>([]);
  
  // New scan form states
  const [scanPath, setScanPath] = useState('');
  const [scanHost, setScanHost] = useState('');
  const [scanPort, setScanPort] = useState('443');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // New CA cert form states
  const [newCertCommonName, setNewCertCommonName] = useState('');
  const [newCertAlg, setNewCertAlg] = useState('ML-DSA-87');
  const [isIssuingCert, setIsIssuingCert] = useState(false);
  const [issueError, setIssueError] = useState<string | null>(null);

  // New Artifact Sign form states
  const [signArtifactName, setSignArtifactName] = useState('');
  const [signPayload, setSignPayload] = useState('');
  const [isSigningArtifact, setIsSigningArtifact] = useState(false);
  const [signError, setSignError] = useState<string | null>(null);

  // New Signature Verify form states
  const [verifyPayload, setVerifyPayload] = useState('');
  const [verifySignature, setVerifySignature] = useState('');
  const [verifyPublicKey, setVerifyPublicKey] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // Scan details states
  const [selectedScan, setSelectedScan] = useState<ScanJob | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [components, setComponents] = useState<CBOMComponent[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Periodic polling for scans and proxy telemetry
  useEffect(() => {
    fetchScans();
    fetchCerts();
    fetchHandshakes();
    fetchIssuedCerts();
    fetchSignatures();
    const interval = setInterval(() => {
      fetchScans();
      fetchCerts();
      fetchHandshakes();
      fetchIssuedCerts();
      fetchSignatures();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchScans = async () => {
    try {
      const res = await fetch(`${API_BASE}/scans`);
      if (res.ok) {
        const data = await res.json();
        setScans(data || []);
      }
    } catch (err) {
      console.error('Error fetching scans:', err);
    }
  };

  const fetchCerts = async () => {
    try {
      const res = await fetch(`${API_BASE}/certs`);
      if (res.ok) {
        const data = await res.json();
        setCerts(data || []);
      }
    } catch (err) {
      console.error('Error fetching certificates:', err);
    }
  };

  const fetchHandshakes = async () => {
    try {
      const res = await fetch(`${API_BASE}/proxy/telemetry`);
      if (res.ok) {
        const data = await res.json();
        setHandshakes(data || []);
      }
    } catch (err) {
      console.error('Error fetching handshakes:', err);
    }
  };

  const fetchIssuedCerts = async () => {
    try {
      const res = await fetch(`${API_BASE}/ca/certs`);
      if (res.ok) {
        const data = await res.json();
        setIssuedCerts(data || []);
      }
    } catch (err) {
      console.error('Error fetching issued certificates:', err);
    }
  };

  const fetchSignatures = async () => {
    try {
      const res = await fetch(`${API_BASE}/signatures`);
      if (res.ok) {
        const data = await res.json();
        setSignatures(data || []);
      }
    } catch (err) {
      console.error('Error fetching signatures:', err);
    }
  };

  const handleIssueCert = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsIssuingCert(true);
    setIssueError(null);
    try {
      const res = await fetch(`${API_BASE}/ca/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          common_name: newCertCommonName,
          signature_algorithm: newCertAlg,
        }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Failed to issue certificate');
      }
      setNewCertCommonName('');
      fetchIssuedCerts();
      alert('Certificate issued successfully!');
    } catch (err: any) {
      setIssueError(err.message || 'An error occurred');
    } finally {
      setIsIssuingCert(false);
    }
  };

  const handleSignArtifact = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningArtifact(true);
    setSignError(null);
    try {
      const res = await fetch(`${API_BASE}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artifact_name: signArtifactName,
          payload: signPayload,
        }),
      });
      if (!res.ok) {
        throw new Error(await res.text() || 'Failed to sign artifact');
      }
      setSignArtifactName('');
      setSignPayload('');
      fetchSignatures();
      alert('Artifact signed successfully using stateful LMS!');
    } catch (err: any) {
      setSignError(err.message || 'An error occurred');
    } finally {
      setIsSigningArtifact(false);
    }
  };

  const handleVerifySignature = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setVerifyResult(null);
    setVerifyError(null);
    try {
      const res = await fetch(`${API_BASE}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload: verifyPayload,
          signature: verifySignature,
          public_key: verifyPublicKey,
        }),
      });
      if (!res.ok) {
        throw new Error(await res.text() || 'Failed to verify signature');
      }
      const data = await res.json();
      setVerifyResult(data.valid);
    } catch (err: any) {
      setVerifyError(err.message || 'An error occurred');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleStartScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`${API_BASE}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: scanPath }),
      });

      if (!res.ok) {
        throw new Error(await res.text() || 'Failed to start scan');
      }

      const newJob = await res.json();
      setScanPath('');
      fetchScans();
      handleViewDetails(newJob.id);
    } catch (err: any) {
      setSubmitError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartCertScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`${API_BASE}/scan/endpoint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host: scanHost, port: parseInt(scanPort) }),
      });

      if (!res.ok) {
        throw new Error(await res.text() || 'Failed to start certificate inspection');
      }

      const newJob = await res.json();
      setScanHost('');
      setScanPort('443');
      fetchScans();
      handleViewDetails(newJob.id);
    } catch (err: any) {
      setSubmitError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = async (id: string) => {
    setActiveTab('scan_detail');
    setLoadingDetails(true);
    setSelectedScan(null);
    setFindings([]);
    setComponents([]);

    try {
      const res = await fetch(`${API_BASE}/scan/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedScan(data.scan);
        setFindings(data.findings || []);
        setComponents(data.components || []);
      }
    } catch (err) {
      console.error('Error fetching scan details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Compute global stats
  const totalScans = scans.length;
  const completedScans = scans.filter(s => s.status === 'completed').length;
  const totalCodeFindings = findings.length; // From current detail or fallback globally
  
  // Calculate compliance rates
  const totalCheckedAssets = components.length + certs.length;
  const safeCheckedAssets = components.filter(c => c.quantum_safe).length + certs.filter(c => c.pq_hybrid).length;
  const complianceRate = totalCheckedAssets > 0 ? Math.round((safeCheckedAssets / totalCheckedAssets) * 100) : 100;

  return (
    <div className="min-h-screen bg-[#030712] text-gray-100 font-sans">
      {/* Banner / Navigation */}
      <nav className="border-b border-gray-800 bg-[#0b0f19] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center">
              QuantumShield <span className="ml-2 text-xs bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30">Phase 4 Suite</span>
            </h1>
            <p className="text-[10px] text-gray-400">Post-Quantum Security & Code Signing Suite</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${activeTab === 'dashboard' ? 'bg-[#1e293b] text-cyan-400 border border-cyan-500/30' : 'text-gray-400 hover:text-gray-200'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('scan_new')} 
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${activeTab === 'scan_new' ? 'bg-[#1e293b] text-cyan-400 border border-cyan-500/30' : 'text-gray-400 hover:text-gray-200'}`}
          >
            Start Scan
          </button>
          <button 
            onClick={() => setActiveTab('certs')} 
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${activeTab === 'certs' ? 'bg-[#1e293b] text-cyan-400 border border-cyan-500/30' : 'text-gray-400 hover:text-gray-200'}`}
          >
            Certificates ({certs.length})
          </button>
          <button 
            onClick={() => setActiveTab('proxy')} 
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${activeTab === 'proxy' ? 'bg-[#1e293b] text-cyan-400 border border-cyan-500/30' : 'text-gray-400 hover:text-gray-200'}`}
          >
            Shield Proxy
          </button>
          <button 
            onClick={() => setActiveTab('ca')} 
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${activeTab === 'ca' ? 'bg-[#1e293b] text-cyan-400 border border-cyan-500/30' : 'text-gray-400 hover:text-gray-200'}`}
          >
            Shield CA
          </button>
          <button 
            onClick={() => setActiveTab('sign')} 
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${activeTab === 'sign' ? 'bg-[#1e293b] text-cyan-400 border border-cyan-500/30' : 'text-gray-400 hover:text-gray-200'}`}
          >
            Shield Sign
          </button>
        </div>
      </nav>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto p-6">

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-[#0b0f19] border border-gray-800 rounded-xl p-5 shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 h-24 w-24 bg-cyan-500/5 rounded-full blur-xl"></div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">PQ Compliance Rate</p>
                <div className="flex items-baseline space-x-2 mt-2">
                  <h3 className="text-3xl font-extrabold text-white">{complianceRate}%</h3>
                  <span className="text-xs text-cyan-400">CNSA 2.0 Target</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1.5 mt-4">
                  <div className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-1.5 rounded-full" style={{ width: `${complianceRate}%` }}></div>
                </div>
              </div>

              <div className="bg-[#0b0f19] border border-gray-800 rounded-xl p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Scans Executed</p>
                <h3 className="text-3xl font-extrabold text-white mt-2">{totalScans}</h3>
                <p className="text-xs text-gray-400 mt-2">{completedScans} completed successfully</p>
              </div>

              <div className="bg-[#0b0f19] border border-gray-800 rounded-xl p-5 shadow-sm relative">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Certificates Monitored</p>
                <h3 className="text-3xl font-extrabold text-white mt-2">{certs.length}</h3>
                <p className="text-xs text-gray-400 mt-2">
                  {certs.filter(c => c.pq_hybrid).length} using Post-Quantum hybrid suites
                </p>
              </div>

              <div className="bg-[#0b0f19] border border-gray-800 rounded-xl p-5 shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 h-24 w-24 bg-rose-500/5 rounded-full blur-xl"></div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Active Vulnerable Certs</p>
                <h3 className="text-3xl font-extrabold text-rose-400 mt-2">
                  {certs.filter(c => !c.cnsa_compliant).length}
                </h3>
                <p className="text-xs text-rose-500/80 mt-2">Factoring/Discrete-log risk</p>
              </div>
            </div>

            {/* List of Recent Scans */}
            <div className="bg-[#0b0f19] border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">Codebase & Endpoint Scan History</h2>
              
              {scans.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-800 rounded-lg">
                  <p className="text-gray-400 text-sm">No scans run yet.</p>
                  <button 
                    onClick={() => setActiveTab('scan_new')}
                    className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow transition"
                  >
                    Start First Scan
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-800 text-xs font-semibold uppercase text-gray-400">
                        <th className="py-3 px-4">Target Type</th>
                        <th className="py-3 px-4">Scan Target</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 text-sm">
                      {scans.map(scan => (
                        <tr key={scan.id} className="hover:bg-gray-900/50 transition">
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold capitalize ${
                              scan.target_type === 'endpoint' 
                                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {scan.target_type}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs text-gray-300 max-w-xs truncate">{scan.target_url}</td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              scan.status === 'completed' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : scan.status === 'failed' 
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 animate-pulse'
                            }`}>
                              {scan.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-gray-400">
                            {new Date(scan.created_at).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleViewDetails(scan.id)}
                              className="px-3 py-1 bg-cyan-950 text-cyan-400 border border-cyan-500/30 rounded text-xs font-semibold hover:bg-cyan-900 hover:text-cyan-300 transition"
                            >
                              View Report
                            </button>
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

        {/* Start Scan Tab */}
        {activeTab === 'scan_new' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Form 1: Scan Directory */}
            <div className="bg-[#0b0f19] border border-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Source Code & Dependency Scan</h2>
                  <p className="text-xs text-gray-400">Scan codebase folders for weak crypto padding, APIs, and classical libraries.</p>
                </div>
              </div>

              <form onSubmit={handleStartScan} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Local Directory Path</label>
                  <input
                    type="text"
                    required
                    placeholder="/Users/x/Personal/vscode/quantum_pqc"
                    value={scanPath}
                    onChange={(e) => setScanPath(e.target.value)}
                    className="w-full bg-[#1e293b] border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-cyan-500 transition font-mono placeholder:text-gray-600"
                  />
                </div>

                {submitError && (
                  <div className="p-3 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-medium">
                    {submitError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-lg shadow-lg hover:shadow-cyan-500/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Starting Scan...' : 'Trigger Scan Engine'}
                </button>
              </form>
            </div>

            {/* Form 2: Scan Certificate */}
            <div className="bg-[#0b0f19] border border-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11V5a2 2 0 00-2-2H5a2 2 0 00-2 2v6a9 9 0 001.077 4.287M12 11c0 3.517 1.009 6.799 2.753 9.571m3.44-2.04l-.054-.09A13.916 13.916 0 0015 11V5a2 2 0 012-2h2a2 2 0 012 2v6a9 9 0 01-1.077 4.287" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">TLS Endpoint Cert Prober</h2>
                  <p className="text-xs text-gray-400">Connect to public or internal TLS servers to audit signature and cipher algorithms.</p>
                </div>
              </div>

              <form onSubmit={handleStartCertScan} className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Host Name</label>
                    <input
                      type="text"
                      required
                      placeholder="google.com"
                      value={scanHost}
                      onChange={(e) => setScanHost(e.target.value)}
                      className="w-full bg-[#1e293b] border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-cyan-500 transition font-mono placeholder:text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Port</label>
                    <input
                      type="number"
                      required
                      placeholder="443"
                      value={scanPort}
                      onChange={(e) => setScanPort(e.target.value)}
                      className="w-full bg-[#1e293b] border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-cyan-500 transition font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-sm font-semibold rounded-lg shadow-lg hover:shadow-indigo-500/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Starting Prober...' : 'Trigger Cert Prober'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Scan Details Report Tab */}
        {activeTab === 'scan_detail' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center space-x-2 text-xs text-gray-400 hover:text-gray-200 transition"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to dashboard</span>
              </button>

              {selectedScan && (
                <a
                  href={`${API_BASE}/scan/${selectedScan.id}/cbom`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-3 py-1.5 bg-[#1e293b] text-xs font-semibold text-cyan-400 border border-cyan-500/20 rounded hover:bg-cyan-950 transition"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Export CycloneDX v1.7 CBOM</span>
                </a>
              )}
            </div>

            {loadingDetails ? (
              <div className="text-center py-24">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-400 mx-auto"></div>
                <p className="text-gray-400 text-xs mt-4">Loading report details...</p>
              </div>
            ) : selectedScan ? (
              <div className="space-y-6">
                {/* Meta details */}
                <div className="bg-[#0b0f19] border border-gray-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center">
                      Report for {selectedScan.target_url}
                    </h2>
                    <p className="text-xs text-gray-400 font-mono mt-1">ID: {selectedScan.id}</p>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <div>
                      <span className="font-semibold text-gray-300">Started:</span> {new Date(selectedScan.created_at).toLocaleString()}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-300">Status:</span> 
                      <span className="ml-1 text-emerald-400">{selectedScan.status}</span>
                    </div>
                  </div>
                </div>

                {/* Sub-Layout: Findings vs CBOM Tree */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left 2 Cols: Findings list */}
                  <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-md font-bold text-white">Cryptographic Vulnerability Findings ({findings.length})</h3>
                    
                    {findings.length === 0 ? (
                      <div className="bg-[#0b0f19] border border-gray-800 rounded-xl p-8 text-center text-gray-400 text-sm">
                        No cryptographic vulnerabilities detected in this codebase.
                      </div>
                    ) : (
                      findings.map(finding => (
                        <div key={finding.id} className="bg-[#0b0f19] border border-gray-800 rounded-xl p-5 space-y-3 relative overflow-hidden">
                          <div className={`absolute top-0 left-0 bottom-0 w-1 ${
                            finding.severity === 'Critical' || finding.severity === 'High' ? 'bg-rose-500' : 'bg-amber-500'
                          }`}></div>
                          
                          <div className="flex items-center justify-between pl-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              finding.severity === 'Critical' || finding.severity === 'High' 
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {finding.severity} Severity
                            </span>
                            <span className="text-xs font-mono text-gray-400">
                              {finding.file_path}:{finding.line_no}
                            </span>
                          </div>

                          <div className="pl-2">
                            <h4 className="text-sm font-semibold text-white">Rule Checked: {finding.algorithm} Use</h4>
                            <p className="text-xs text-gray-300 mt-1">{finding.description}</p>
                          </div>

                          <div className="pl-2 bg-gray-900/40 p-3 rounded-lg border border-gray-800 text-xs">
                            <span className="font-bold text-cyan-400">Remediation:</span> {finding.remediation}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Right 1 Col: Interactive CycloneDX CBOM Tree */}
                  <div className="space-y-4">
                    <h3 className="text-md font-bold text-white">CycloneDX CBOM Tree</h3>
                    
                    <div className="bg-[#0b0f19] border border-gray-800 rounded-xl p-4 space-y-3 max-h-[500px] overflow-y-auto">
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Discovered Cryptographic Assets</p>
                      
                      {components.length === 0 ? (
                        <p className="text-xs text-gray-500 text-center py-6">No components mapped to CBOM.</p>
                      ) : (
                        <div className="space-y-2">
                          {components.map((comp, idx) => (
                            <div key={idx} className="p-3 bg-gray-900/40 border border-gray-800 rounded-lg hover:border-cyan-500/30 transition">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-white truncate max-w-[120px]">{comp.name}</span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                  comp.quantum_safe 
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                }`}>
                                  {comp.quantum_safe ? 'Quantum Safe' : 'Classical (Risk)'}
                                </span>
                              </div>
                              <div className="mt-2 grid grid-cols-2 gap-1 text-[10px] text-gray-400">
                                <div><span className="text-gray-500">Asset Type:</span> {comp.crypto_asset_type}</div>
                                <div><span className="text-gray-500">Params:</span> {comp.key_length || 'N/A'}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#0b0f19] border border-gray-800 rounded-xl p-12 text-center text-gray-400">
                Failed to load scan details.
              </div>
            )}
          </div>
        )}

        {/* Certificates Tab */}
        {activeTab === 'certs' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white">Post-Quantum TLS Certificate Inventory</h2>
            <p className="text-xs text-gray-400 -mt-4">
              Real-time audit log of external endpoint keys. CNSA 2.0 requires replacement of ECC/RSA signatures with ML-DSA or LMS.
            </p>

            {certs.length === 0 ? (
              <div className="bg-[#0b0f19] border border-gray-800 rounded-xl p-12 text-center text-gray-400">
                No certificates probed yet. Go to &quot;Start Scan&quot; to probe your first server.
              </div>
            ) : (
              <div className="bg-[#0b0f19] border border-gray-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-800 text-xs font-semibold uppercase text-gray-400">
                        <th className="py-3 px-4">Endpoint</th>
                        <th className="py-3 px-4">Subject Name</th>
                        <th className="py-3 px-4">Algorithm / Size</th>
                        <th className="py-3 px-4">CNSA 2.0 Status</th>
                        <th className="py-3 px-4">Expiry</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 text-sm">
                      {certs.map(cert => (
                        <tr key={cert.id} className="hover:bg-gray-900/50 transition">
                          <td className="py-3.5 px-4 font-mono text-xs text-cyan-400">{cert.endpoint}</td>
                          <td className="py-3.5 px-4 text-xs max-w-xs truncate text-gray-300">{cert.subject}</td>
                          <td className="py-3.5 px-4 text-xs font-mono text-gray-400">
                            {cert.algorithm} ({cert.key_bits} bit)
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col space-y-1">
                              <span className={`inline-flex items-center w-max px-2 py-0.5 rounded text-[10px] font-semibold ${
                                cert.cnsa_compliant 
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}>
                                {cert.cnsa_compliant ? 'CNSA Compliant (Interim)' : 'Vulnerable (Factoring)'}
                              </span>
                              {cert.pq_hybrid && (
                                <span className="inline-flex items-center w-max px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                  PQ Hybrid Handshake Supported
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-gray-400">
                            {cert.expiry ? new Date(cert.expiry).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Shield Proxy Tab */}
        {activeTab === 'proxy' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white">Shield Proxy — Crypto-Agile Gateway Management</h2>
            <p className="text-xs text-gray-400 -mt-4">
              Monitor active connections, curve distributions, and dynamic cipher agility settings for edge TLS endpoints.
            </p>

            {/* KPI Cards for Proxy */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#0b0f19] border border-gray-800 rounded-xl p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Proxy Handshakes</p>
                <h3 className="text-3xl font-extrabold text-white mt-2">{handshakes.length}</h3>
                <p className="text-xs text-gray-400 mt-2">Active logging session</p>
              </div>

              <div className="bg-[#0b0f19] border border-gray-800 rounded-xl p-5 shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 h-24 w-24 bg-cyan-500/5 rounded-full blur-xl"></div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">PQ Hybrid split</p>
                {(() => {
                  const total = handshakes.length;
                  const pq = handshakes.filter(h => h.key_exchange === 'X25519MLKEM768').length;
                  const pct = total > 0 ? Math.round((pq / total) * 100) : 0;
                  return (
                    <>
                      <h3 className="text-3xl font-extrabold text-cyan-400 mt-2">{pct}%</h3>
                      <p className="text-xs text-gray-400 mt-2">{pq} of {total} handshakes secured by ML-KEM</p>
                    </>
                  );
                })()}
              </div>

              <div className="bg-[#0b0f19] border border-gray-800 rounded-xl p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Avg Handshake Time</p>
                {(() => {
                  const total = handshakes.length;
                  const avg = total > 0 ? Math.round(handshakes.reduce((acc, h) => acc + h.handshake_ms, 0) / total) : 0;
                  return (
                    <>
                      <h3 className="text-3xl font-extrabold text-white mt-2">{avg} ms</h3>
                      <p className="text-xs text-cyan-400 mt-2">ECDHE+MLKEM network baseline</p>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Layout: Agile cipher settings + Telemetry logs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Telemetry logs table */}
              <div className="lg:col-span-2 bg-[#0b0f19] border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-bold text-white mb-4">Live Handshake Logs</h3>
                {handshakes.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-sm">
                    No connections logged through the proxy yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-800 text-[11px] font-semibold uppercase text-gray-400">
                          <th className="py-2.5 px-3">Client IP</th>
                          <th className="py-2.5 px-3">Negotiated Curve</th>
                          <th className="py-2.5 px-3">Handshake (ms)</th>
                          <th className="py-2.5 px-3">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800 text-xs font-mono">
                        {handshakes.map((h, idx) => (
                          <tr key={idx} className="hover:bg-gray-900/50 transition">
                            <td className="py-2.5 px-3 text-gray-300">{h.client_ip}</td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                h.key_exchange === 'X25519MLKEM768' 
                                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                                  : 'bg-gray-800 text-gray-400'
                              }`}>
                                {h.key_exchange}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-gray-400">{h.handshake_ms} ms</td>
                            <td className="py-2.5 px-3 text-[10px] text-gray-500">
                              {new Date(h.created_at).toLocaleTimeString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Dynamic cipher settings */}
              <div className="bg-[#0b0f19] border border-gray-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white">Agility Cipher Controls</h3>
                <p className="text-xs text-gray-400">
                  Select key exchange algorithms enabled at the TLS 1.3 gateway. Upstream dynamically reloads configurations without restarts.
                </p>

                <div className="space-y-3 pt-2">
                  <label className="flex items-center space-x-3 text-xs text-gray-300">
                    <input type="checkbox" defaultChecked disabled className="rounded text-cyan-500 bg-gray-900 border-gray-800 focus:ring-0" />
                    <span className="font-semibold text-white">X25519MLKEM768 (Recommended)</span>
                  </label>
                  <label className="flex items-center space-x-3 text-xs text-gray-300">
                    <input type="checkbox" defaultChecked disabled className="rounded text-cyan-500 bg-gray-900 border-gray-800 focus:ring-0" />
                    <span>X25519 (ECDHE Classical)</span>
                  </label>
                  <label className="flex items-center space-x-3 text-xs text-gray-300">
                    <input type="checkbox" defaultChecked disabled className="rounded text-cyan-500 bg-gray-900 border-gray-800 focus:ring-0" />
                    <span>P-256 (NIST Classical)</span>
                  </label>
                </div>

                <div className="pt-4 border-t border-gray-800">
                  <div className="text-[10px] text-gray-500">Upstream Endpoint</div>
                  <div className="text-xs font-mono text-cyan-400 mt-1 select-all">https://localhost:8443</div>
                </div>

                <button 
                  onClick={() => alert('Agile configurations reloaded successfully!')}
                  className="w-full py-2 bg-cyan-950 text-cyan-400 border border-cyan-500/30 rounded text-xs font-semibold hover:bg-cyan-900 hover:text-cyan-300 transition"
                >
                  Reload Cipher Configurations
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Shield CA Tab */}
        {activeTab === 'ca' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white">Shield CA — Post-Quantum Certificate Authority</h2>
            <p className="text-xs text-gray-400 -mt-4">
              Issue hybrid post-quantum certificates signed with ML-DSA-87 or LMS. Monitor PKI status and view generated key packages.
            </p>

            {/* CA Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#0b0f19] border border-gray-800 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Classical CA Status</p>
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                </div>
                <h3 className="text-xl font-bold text-white mt-2">ECDSA-P256 Root</h3>
                <p className="text-xs text-cyan-400 mt-2">10-year lifetime (Active)</p>
              </div>

              <div className="bg-[#0b0f19] border border-gray-800 rounded-xl p-5 shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 h-24 w-24 bg-cyan-500/5 rounded-full blur-xl"></div>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">PQ General CA Status</p>
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                </div>
                <h3 className="text-xl font-bold text-cyan-400 mt-2">ML-DSA-87 Root</h3>
                <p className="text-xs text-gray-400 mt-2">FIPS 204 Standard compliant</p>
              </div>

              <div className="bg-[#0b0f19] border border-gray-800 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Code Signing CA Status</p>
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                </div>
                <h3 className="text-xl font-bold text-white mt-2">LMS-H5 Root</h3>
                <p className="text-xs text-cyan-400 mt-2">NIST SP 800-208 Stateful Hash</p>
              </div>
            </div>

            {/* Layout: Cert Issuance + Active Certs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Manual Cert Issuance Form */}
              <div className="bg-[#0b0f19] border border-gray-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white">Request Post-Quantum Certificate</h3>
                <p className="text-xs text-gray-400">
                  Enter a Common Name (CN) and choose your preferred post-quantum signing algorithm to sign client credentials.
                </p>

                <form onSubmit={handleIssueCert} className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Common Name (CN)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., mail.internal.shield"
                      value={newCertCommonName}
                      onChange={(e) => setNewCertCommonName(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Post-Quantum Signature Algorithm</label>
                    <select
                      value={newCertAlg}
                      onChange={(e) => setNewCertAlg(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500 transition"
                    >
                      <option value="ML-DSA-87">ML-DSA-87 (General Purpose TLS)</option>
                      <option value="LMS">LMS (Code / Firmware Signing)</option>
                    </select>
                  </div>

                  {issueError && (
                    <div className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded border border-rose-500/20">
                      {issueError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isIssuingCert}
                    className="w-full py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-indigo-500 transition disabled:opacity-50"
                  >
                    {isIssuingCert ? 'Signing Hybrid X.509...' : 'Issue Certificate'}
                  </button>
                </form>
              </div>

              {/* Active Certificates Inventory Grid */}
              <div className="lg:col-span-2 bg-[#0b0f19] border border-gray-800 rounded-xl p-5">
                <h3 className="text-sm font-bold text-white mb-4">Active Issued Certificates</h3>
                {issuedCerts.length === 0 ? (
                  <div className="text-center py-16 text-gray-400 text-sm">
                    No post-quantum certificates issued yet.
                  </div>
                ) : (
                  <div className="overflow-y-auto max-h-[380px]">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-800 text-[10px] font-semibold uppercase text-gray-400">
                          <th className="py-2 px-3">Common Name</th>
                          <th className="py-2 px-3">Serial Number</th>
                          <th className="py-2 px-3">PQ Signature Algorithm</th>
                          <th className="py-2 px-3">Status</th>
                          <th className="py-2 px-3">PEM Certificate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800 text-xs font-mono">
                        {issuedCerts.map((c) => (
                          <tr key={c.id} className="hover:bg-gray-900/50 transition">
                            <td className="py-2.5 px-3 text-white font-semibold">{c.common_name}</td>
                            <td className="py-2.5 px-3 text-gray-400 truncate max-w-[120px]" title={c.serial_number}>
                              {c.serial_number.slice(0, 15)}...
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                {c.signature_algorithm}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                Active
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <button
                                onClick={() => {
                                  alert(c.pem_block);
                                }}
                                className="text-[10px] text-cyan-400 hover:underline"
                              >
                                View PEM Block
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Shield Sign Tab */}
        {activeTab === 'sign' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white">Shield Sign — Stateful PQ Code Signer</h2>
            <p className="text-xs text-gray-400 -mt-4">
              Generate Leighton-Micali Signatures (LMS) for release artifacts and verify code packages against CA public keys.
            </p>

            {/* Layout: Code Signer + Signature Verifier */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sign Artifact Panel */}
              <div className="bg-[#0b0f19] border border-gray-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white">Sign Artifact Payload</h3>
                <p className="text-xs text-gray-400">
                  Input artifact label and payload content. The server will sign using the stateful LMS private key.
                </p>

                <form onSubmit={handleSignArtifact} className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Artifact Label</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., firmware_v1.0.bin"
                      value={signArtifactName}
                      onChange={(e) => setSignArtifactName(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Payload Content (Hex or Text)</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Enter raw release payload bytes or manifest..."
                      value={signPayload}
                      onChange={(e) => setSignPayload(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm font-mono text-white focus:outline-none focus:border-cyan-500 transition"
                    />
                  </div>

                  {signError && (
                    <div className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded border border-rose-500/20">
                      {signError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSigningArtifact}
                    className="w-full py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-indigo-500 transition disabled:opacity-50"
                  >
                    {isSigningArtifact ? 'Generating LMS Signature...' : 'Sign Payload'}
                  </button>
                </form>
              </div>

              {/* Verify Artifact Panel */}
              <div className="bg-[#0b0f19] border border-gray-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white">Verify Artifact Signature</h3>
                <p className="text-xs text-gray-400">
                  Input the payload content, signature, and public key to verify artifact integrity using the LMS algorithm.
                </p>

                <form onSubmit={handleVerifySignature} className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Payload Content</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Payload bytes..."
                      value={verifyPayload}
                      onChange={(e) => setVerifyPayload(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-cyan-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">LMS Signature (Hex)</label>
                    <input
                      type="text"
                      required
                      placeholder="LMS signature block..."
                      value={verifySignature}
                      onChange={(e) => setVerifySignature(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-cyan-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">LMS Public Key (Hex)</label>
                    <input
                      type="text"
                      required
                      placeholder="LMS public key..."
                      value={verifyPublicKey}
                      onChange={(e) => setVerifyPublicKey(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-cyan-500 transition"
                    />
                  </div>

                  {verifyResult !== null && (
                    <div className={`text-xs p-2.5 rounded border ${
                      verifyResult 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {verifyResult 
                        ? '✓ Valid Signature: Artifact is authentic, unmodified, and verified by post-quantum signatures.' 
                        : '✗ Invalid Signature: Payload tampered, key mismatch, or corrupted signature.'
                      }
                    </div>
                  )}

                  {verifyError && (
                    <div className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded border border-rose-500/20">
                      {verifyError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="w-full py-2 bg-cyan-950 text-cyan-400 border border-cyan-500/30 rounded text-xs font-semibold hover:bg-cyan-900 hover:text-cyan-300 transition"
                  >
                    {isVerifying ? 'Verifying...' : 'Verify Signature'}
                  </button>
                </form>
              </div>
            </div>

            {/* Signed Artifact Registry Table */}
            <div className="bg-[#0b0f19] border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-bold text-white mb-4">Signed Artifact Audits Registry</h3>
              {signatures.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">
                  No artifacts signed in this session.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-800 text-[10px] font-semibold uppercase text-gray-400">
                        <th className="py-2.5 px-3">Artifact Label</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">LMS Public Key</th>
                        <th className="py-2.5 px-3">Signature (Hex Snippet)</th>
                        <th className="py-2.5 px-3">Signed At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 text-xs font-mono">
                      {signatures.map((sa) => (
                        <tr key={sa.id} className="hover:bg-gray-900/50 transition">
                          <td className="py-2.5 px-3 text-white font-semibold">{sa.artifact_name}</td>
                          <td className="py-2.5 px-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {sa.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-cyan-400 truncate max-w-[150px]" title={sa.public_key}>
                            {sa.public_key.slice(0, 20)}...
                          </td>
                          <td className="py-2.5 px-3 text-gray-400 truncate max-w-[200px]" title={sa.signature}>
                            {sa.signature.slice(0, 30)}...
                          </td>
                          <td className="py-2.5 px-3 text-[10px] text-gray-500">
                            {new Date(sa.created_at).toLocaleString()}
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


      </main>
    </div>
  );
}
