"use client";

import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  FileText, 
  Briefcase, 
  Code 
} from 'lucide-react';
import { identityData, experienceData, projectsData } from '@/content/portfolioData';
import { useDialog } from '@/lib/useDialog';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  const panelRef = useDialog(isOpen, onClose);

  if (!isOpen) return null;

  const handleCopySummary = () => {
    const summaryText = `Roshan Muhammed R - Full-stack Engineer
Email: ${identityData.email} | Phone: ${identityData.phone} | Location: ${identityData.location}
GitHub: ${identityData.githubUrl} | LinkedIn: ${identityData.linkedinUrl}

Positioning: ${identityData.positioningLine}

Experience:
Konnectify - Software Development Intern (Jan 2026 – Jul 2026)
- Invite-based user management with minute-level permissions dynamically resolved on backend.
- Task-based crediting on Redis with batch-aggregated writes to DB.
- Workflow builder performance optimization for large graph state in Redux.

Projects:
- Saga (RAG Knowledge Base): ${projectsData[0].description}
- AI Trip Planner: ${projectsData[1].description}`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150" onClick={onClose}>
      <div 
        className="w-full max-w-3xl bg-[#F4F6F1] border border-[#D4D8CF] rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[92vh]"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Résumé of Roshan Muhammed R"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#DCDFD6] bg-[#ECEFEA]">
          <div className="flex items-center space-x-2.5">
            <FileText className="w-5 h-5 text-[#0B8043]" />
            <span className="font-semibold text-[#121316] text-sm">Roshan_Muhammed_R_Resume.pdf</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopySummary}
              className="flex items-center space-x-1 px-3 py-1.5 text-xs text-[#121316] bg-[#EAEFE6] hover:bg-[#E0E5DC] border border-[#CCD2C5] rounded-full transition-colors cursor-pointer font-mono font-semibold"
              title="Copy plain text résumé"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#00B86B]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
            <a
              href={identityData.resumeUrl}
              download="Roshan_Muhammed_R_Resume.pdf"
              className="flex items-center space-x-1.5 px-4 py-1.5 text-xs font-bold text-[#121316] bg-[#00FF9D] hover:bg-[#00E88C] rounded-full transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#585F6B] hover:text-[#121316] hover:bg-[#DCDFD6] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Resume Canvas */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-sm text-[#121316] bg-[#FFFFFF]">
          {/* Header Contact Block */}
          <div className="border-b border-[#DCDFD6] pb-6 space-y-2">
            <h1 className="text-2xl font-bold text-[#121316]">{identityData.name}</h1>
            <p className="text-sm font-semibold text-[#0A733E]">{identityData.role} — {identityData.location}</p>
            <p className="text-xs text-[#585F6B] leading-relaxed pt-1">
              {identityData.positioningLine}
            </p>
            <div className="flex flex-wrap gap-4 text-xs font-mono text-[#585F6B] pt-2">
              <span>{identityData.email}</span>
              <span>·</span>
              <span>{identityData.phone}</span>
              <span>·</span>
              <span>github.com/RoshanMuhammedR</span>
              <span>·</span>
              <span>linkedin.com/in/roshan2004</span>
            </div>
          </div>

          {/* Experience Section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-mono text-[#0A733E] uppercase font-bold tracking-wider">
              <Briefcase className="w-3.5 h-3.5" />
              <span>EXPERIENCE</span>
            </div>
            <div className="p-4 rounded-lg bg-[#F8FAF6] border border-[#E0E5DC] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#121316] text-sm">{experienceData[0].company}</span>
                <span className="text-xs font-mono text-[#585F6B]">{experienceData[0].period}</span>
              </div>
              <p className="text-xs text-[#0A733E] font-medium">{experienceData[0].role}</p>
              <p className="text-xs text-[#585F6B] leading-relaxed">{experienceData[0].summary}</p>
              <ul className="text-xs text-[#383E4B] list-disc list-inside space-y-1 pt-1">
                {experienceData[0].highlights.map((h, i) => (
                  <li key={i}>
                    <span className="font-semibold text-[#121316]">{h.title}:</span> {h.description}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Projects Section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-mono text-[#0A733E] uppercase font-bold tracking-wider">
              <Code className="w-3.5 h-3.5" />
              <span>PROJECTS</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {projectsData.map((proj) => (
                <div key={proj.id} className="p-4 rounded-lg bg-[#F8FAF6] border border-[#E0E5DC] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#121316]">{proj.title}</span>
                    <span className="text-[10px] font-mono text-[#0A733E] bg-[#00FF9D]/20 px-2 py-0.5 rounded-full">{proj.subtitle}</span>
                  </div>
                  <p className="text-xs text-[#585F6B] leading-relaxed">{proj.description}</p>
                  <div className="text-[10px] font-mono text-[#7C8494] pt-1">
                    {proj.stack.slice(0, 5).join(' · ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
