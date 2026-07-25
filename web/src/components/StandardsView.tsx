'use client';

import React from 'react';

export const StandardsView: React.FC = () => {
  const standards = [
    {
      code: 'FIPS 203',
      name: 'ML-KEM (Module-Lattice-Based KEM)',
      origin: 'Derived from CRYSTALS-Kyber',
      useCase: 'Asymmetric Key Encapsulation & TLS 1.3 Key Exchange',
      securityLevels: 'ML-KEM-512 (L1), ML-KEM-768 (L3), ML-KEM-1024 (L5)',
      status: 'NIST Standardized (Aug 2024)',
      color: 'border-cyan-500/40 bg-cyan-500/5',
      textColor: 'text-cyan-400',
    },
    {
      code: 'FIPS 204',
      name: 'ML-DSA (Module-Lattice-Based Digital Signature)',
      origin: 'Derived from CRYSTALS-Dilithium',
      useCase: 'General Digital Signatures, X.509 Certificates, PKI',
      securityLevels: 'ML-DSA-44 (L2), ML-DSA-65 (L3), ML-DSA-87 (L5)',
      status: 'NIST Standardized (Aug 2024)',
      color: 'border-indigo-500/40 bg-indigo-500/5',
      textColor: 'text-indigo-400',
    },
    {
      code: 'FIPS 205',
      name: 'SLH-DSA (Stateless Hash-Based Signature)',
      origin: 'Derived from SPHINCS+',
      useCase: 'High-assurance long-term signatures without lattice assumptions',
      securityLevels: 'SLH-DSA-SHA2-128f, SLH-DSA-SHAKE-256s',
      status: 'NIST Standardized (Aug 2024)',
      color: 'border-purple-500/40 bg-purple-500/5',
      textColor: 'text-purple-400',
    },
    {
      code: 'RFC 8554',
      name: 'LMS / HSS (Leighton-Micali Hash-Based Signatures)',
      origin: 'IETF RFC 8554 & NIST SP 800-208',
      useCase: 'Stateful Code Signing, Firmware Updates, Secure Boot',
      securityLevels: 'LMS_SHA256_M32_H10 (Tree Height 10, Winternitz W4/W8)',
      status: 'NIST SP 800-208 Approved',
      color: 'border-amber-500/40 bg-amber-500/5',
      textColor: 'text-amber-400',
    },
  ];

  const timeline = [
    {
      year: '2025',
      title: 'Initial Preference Phase',
      details: 'CNSA 2.0 mandates PQC availability in web browsers, operating systems, and network infrastructure.',
    },
    {
      year: '2027',
      title: 'Mandatory Adoption Phase',
      details: 'All new federal acquisitions and enterprise firmware releases must enforce PQC algorithms by default.',
    },
    {
      year: '2030',
      title: 'Classical Deprecation Phase',
      details: 'Complete deprecation of legacy RSA-2048/3048, ECDSA, and Diffie-Hellman across federal systems.',
    },
    {
      year: '2035',
      title: '100% Enforced Compliance',
      details: 'Zero tolerance for classical asymmetric primitives. Full transition to NIST FIPS 203/204/205.',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0b1220] via-[#0f172a] to-[#0b1220] p-6 rounded-2xl border border-cyan-500/20">
        <div className="inline-flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
          <span>REFERENCE & POLICY MATRIX</span>
        </div>
        <h2 className="text-2xl font-bold text-white">NIST PQC & CNSA 2.0 Standards Reference</h2>
        <p className="text-xs text-slate-400 mt-1">
          Cryptographic specifications and mandatory compliance timelines for post-quantum migration.
        </p>
      </div>

      {/* Standards Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {standards.map((std, i) => (
          <div key={i} className={`border ${std.color} rounded-2xl p-6 space-y-3`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded bg-slate-900 ${std.textColor} border border-slate-800`}>
                {std.code}
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">{std.status}</span>
            </div>

            <h3 className="text-lg font-bold text-white">{std.name}</h3>
            <p className="text-xs text-slate-400 font-mono">{std.origin}</p>

            <div className="pt-2 space-y-2 text-xs">
              <div className="bg-[#070c18] p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-500 font-mono block text-[10px]">PRIMARY USE CASE</span>
                <span className="text-slate-200 font-medium">{std.useCase}</span>
              </div>

              <div className="bg-[#070c18] p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-500 font-mono block text-[10px]">SECURITY PARAMETERS</span>
                <span className="text-cyan-300 font-mono text-[11px]">{std.securityLevels}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Timeline Section */}
      <div className="bg-[#0b1220] border border-slate-800 rounded-2xl p-6 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-white">CNSA 2.0 Compliance Timeline</h3>
          <p className="text-xs text-slate-400">National Security Agency Commercial National Security Algorithm Suite 2.0</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {timeline.map((item, idx) => (
            <div key={idx} className="bg-[#070c18] border border-slate-800 p-4 rounded-xl space-y-2 relative">
              <span className="text-2xl font-black font-mono text-cyan-400">{item.year}</span>
              <h4 className="text-xs font-bold text-white">{item.title}</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">{item.details}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
