"use client";

import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Github, 
  Copy, 
  Check, 
  Cpu, 
  Database, 
  Terminal,  
  Workflow
} from 'lucide-react';
import { projectsData, experienceData } from '@/content/portfolioData';
import { useDialog } from '@/lib/useDialog';

interface TechnicalDeepDiveModalProps {
  itemId: string | null;
  onClose: () => void;
}

export const TechnicalDeepDiveModal: React.FC<TechnicalDeepDiveModalProps> = ({
  itemId,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'architecture' | 'code' | 'benchmarks'>('architecture');

  const panelRef = useDialog(Boolean(itemId), onClose);

  if (!itemId) return null;

  // Find project or experience item
  const project = projectsData.find((p) => p.id === itemId);
  const experience = experienceData.find((e) => e.id === itemId);

  const title = project ? `${project.title} — ${project.subtitle}` : experience ? `${experience.company} — Architectural Deep Dive` : '';
  const liveUrl = project?.liveUrl;
  const repoUrl = project?.repoUrl;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150" onClick={onClose}>
      <div 
        className="w-full max-w-4xl bg-[#F4F6F1] border border-[#D4D8CF] rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Technical detail"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DCDFD6] bg-[#ECEFEA]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-[#00FF9D]/30 text-[#0B8043] border border-[#00FF9D]">
              {project?.diagramType === 'rag-pipeline' ? (
                <Database className="w-5 h-5" />
              ) : project?.diagramType === 'trip-planner' ? (
                <Cpu className="w-5 h-5" />
              ) : (
                <Workflow className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#0A733E] bg-[#00FF9D]/25 border border-[#00FF9D]/60 px-2 py-0.5 rounded-full font-bold">
                  Technical Architecture
                </span>
                <span className="text-xs text-[#585F6B] font-mono">Deep Dive</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#121316] tracking-tight mt-0.5">{title}</h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {liveUrl && (
              <a
                href={liveUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1 px-3 py-1.5 text-xs font-bold text-[#121316] bg-[#00FF9D] rounded-full hover:bg-[#00E88C] transition-colors shadow-xs"
              >
                <span>Live Demo</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            {repoUrl && (
              <a
                href={repoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1 px-3 py-1.5 text-xs font-bold text-white bg-[#232832] rounded-full hover:bg-[#16181F] transition-colors"
              >
                <Github className="w-3.5 h-3.5" />
                <span>Repo</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#585F6B] hover:text-[#121316] hover:bg-[#DCDFD6] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-[#DCDFD6] bg-[#EAEFE6] space-x-6">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-3 text-xs font-mono border-b-2 font-bold transition-colors cursor-pointer ${
              activeTab === 'architecture'
                ? 'border-[#121316] text-[#121316]'
                : 'border-transparent text-[#585F6B] hover:text-[#121316]'
            }`}
          >
            01. System Architecture
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`py-3 text-xs font-mono border-b-2 font-bold transition-colors cursor-pointer ${
              activeTab === 'code'
                ? 'border-[#121316] text-[#121316]'
                : 'border-transparent text-[#585F6B] hover:text-[#121316]'
            }`}
          >
            02. Core Implementation
          </button>
          <button
            onClick={() => setActiveTab('benchmarks')}
            className={`py-3 text-xs font-mono border-b-2 font-bold transition-colors cursor-pointer ${
              activeTab === 'benchmarks'
                ? 'border-[#121316] text-[#121316]'
                : 'border-transparent text-[#585F6B] hover:text-[#121316]'
            }`}
          >
            03. Constraints & Metrics
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-[#121316] bg-[#F4F6F1]">
          {project && (
            <>
              {activeTab === 'architecture' && (
                <div className="space-y-6">
                  {/* Overview Block */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#EAEFE6] border border-[#CCD2C5]">
                      <div className="text-xs font-mono text-[#585F6B] mb-1 font-bold">State Decoupling</div>
                      <div className="text-sm font-semibold text-[#121316]">Celery Workers over Redis</div>
                      <p className="text-xs text-[#585F6B] mt-1">
                        Ensures long document extraction jobs never block the HTTP client connection.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#EAEFE6] border border-[#CCD2C5]">
                      <div className="text-xs font-mono text-[#585F6B] mb-1 font-bold">Precision Grounding</div>
                      <div className="text-sm font-semibold text-[#121316]">pgvector Exact Source Lineage</div>
                      <p className="text-xs text-[#585F6B] mt-1">
                        Every answer links directly to the cited source chunk with offset tracing.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {experience && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#CCD2C5] shadow-xs">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#585F6B] mb-1 font-bold">
                  Internship Technical Summary ({experience.period})
                </h3>
                <p className="text-[#121316] font-semibold mb-3">{experience.summary}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {experience.stack.map((item, idx) => (
                    <span 
                      key={idx}
                      className="px-2.5 py-0.5 rounded-full bg-[#EAEFE6] border border-[#CCD2C5] text-xs font-mono text-[#121316] font-semibold"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {experience.codeSnippet && (
                <div>
                  <div className="flex items-center justify-between bg-[#1B1E24] px-4 py-2.5 rounded-t-lg border border-[#2B303C] border-b-0">
                    <span className="font-mono text-xs text-[#00FF9D] flex items-center gap-2 font-bold">
                      <Terminal className="w-3.5 h-3.5" />
                      {experience.codeSnippet.filename}
                    </span>
                    <button
                      onClick={() => handleCopyCode(experience.codeSnippet!.code)}
                      className="flex items-center space-x-1 text-xs text-[#8B92A0] hover:text-[#00FF9D] transition-colors font-mono cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-[#00FF9D]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="p-4 rounded-b-lg bg-[#121418] border border-[#2B303C] font-mono text-xs text-[#E1E4EA] overflow-x-auto leading-relaxed">
                    <code>{experience.codeSnippet.code}</code>
                  </pre>
                  <p className="text-xs text-[#585F6B] mt-2">
                    {experience.codeSnippet.explanation}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {experience.highlights.map((h, i) => (
                  <div key={i} className="p-3 rounded-lg bg-[#EAEFE6] border border-[#CCD2C5]">
                    <span className="text-[10px] font-mono text-[#0A733E] bg-[#00FF9D]/25 border border-[#00FF9D]/50 px-2 py-0.5 rounded-full block w-fit mb-1.5 font-bold">
                      {h.badge}
                    </span>
                    <h4 className="font-semibold text-xs text-[#121316] mb-1">{h.title}</h4>
                    <p className="text-[11px] text-[#585F6B] leading-relaxed">{h.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#ECEFEA] border-t border-[#DCDFD6] flex items-center justify-between text-xs font-mono text-[#585F6B]">
          <span>Roshan Muhammed R · Full-Stack Systems</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#232832] hover:bg-[#16181F] text-white rounded-full transition-colors cursor-pointer font-semibold"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
