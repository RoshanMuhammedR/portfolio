"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search,  
  FileText, 
  Mail, 
  X, 
  Copy, 
  ArrowRight,
  Database,
  Cpu,
  Code
} from 'lucide-react';
import { identityData } from '@/content/portfolioData';
import { useDialog } from '@/lib/useDialog';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenResume: () => void;
  onOpenContact: () => void;
  onOpenProjectDeepDive: (projectId: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenResume,
  onOpenContact,
  onOpenProjectDeepDive
}) => {
  const [query, setQuery] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          const btn = document.getElementById('cmd-palette-btn');
          if (btn) btn.click();
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const panelRef = useDialog(isOpen, onClose);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-[#F4F6F1] border border-[#D4D8CF] rounded-2xl shadow-xl overflow-hidden font-sans flex flex-col max-h-[80vh]"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#DCDFD6] bg-[#ECEFEA]">
          <Search className="w-5 h-5 text-[#585F6B] mr-3 shrink-0" />
          <input
            type="text"
            placeholder="Type a command or search (e.g., 'resume', 'saga', 'redis', 'contact')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-[#121316] placeholder-[#7C8494] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#121316] font-mono"
          />
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-[#585F6B] hover:text-[#121316] hover:bg-[#DCDFD6] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-3 overflow-y-auto space-y-4 divide-y divide-[#DCDFD6]">
          {/* Quick Actions */}
          <div className="space-y-1">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#585F6B] px-2 py-1 font-bold">
              Quick Actions
            </div>
            
            <button
              onClick={() => { onOpenResume(); onClose(); }}
              className="w-full flex items-center justify-between p-2.5 rounded-lg text-left text-sm text-[#121316] hover:bg-[#EAEFE6] transition-colors group cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <FileText className="w-4 h-4 text-[#585F6B] group-hover:text-[#0A733E]" />
                <div>
                  <div className="font-semibold">View Full Résumé</div>
                  <div className="text-xs text-[#585F6B]">Review professional experience, architecture, and engineering stack</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#7C8494] group-hover:text-[#0A733E] group-hover:translate-x-0.5 transition-all" />
            </button>

            <button
              onClick={() => { onOpenContact(); onClose(); }}
              className="w-full flex items-center justify-between p-2.5 rounded-lg text-left text-sm text-[#121316] hover:bg-[#EAEFE6] transition-colors group cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-[#585F6B] group-hover:text-[#0A733E]" />
                <div>
                  <div className="font-semibold">Contact & Hire Roshan</div>
                  <div className="text-xs text-[#585F6B]">Send a direct message or copy email ({identityData.email})</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#7C8494] group-hover:text-[#0A733E] group-hover:translate-x-0.5 transition-all" />
            </button>

            <button
              onClick={() => handleCopy(identityData.email, 'email')}
              className="w-full flex items-center justify-between p-2.5 rounded-lg text-left text-sm text-[#121316] hover:bg-[#EAEFE6] transition-colors group cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <Copy className="w-4 h-4 text-[#585F6B]" />
                <div>
                  <div className="font-semibold">Copy Email Address</div>
                  <div className="text-xs font-mono text-[#585F6B]">{identityData.email}</div>
                </div>
              </div>
              <span className="text-xs font-mono text-[#0A733E] font-bold">
                {copiedText === 'email' ? 'Copied!' : 'Copy'}
              </span>
            </button>
          </div>

          {/* Deep Dives & Projects */}
          <div className="pt-3 space-y-1">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#585F6B] px-2 py-1 font-bold">
              Projects & Technical Architecture
            </div>

            <button
              onClick={() => { onOpenProjectDeepDive('saga'); onClose(); }}
              className="w-full flex items-center justify-between p-2.5 rounded-lg text-left text-sm text-[#121316] hover:bg-[#EAEFE6] transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <Database className="w-4 h-4 text-[#0A733E]" />
                <div>
                  <div className="font-semibold">Saga — RAG Knowledge Base Architecture</div>
                  <div className="text-xs text-[#585F6B]">Celery workers, Redis queue, pgvector citations</div>
                </div>
              </div>
              <span className="text-xs font-mono text-[#585F6B]">Deep Dive ➔</span>
            </button>

            <button
              onClick={() => { onOpenProjectDeepDive('ai-trip-planner'); onClose(); }}
              className="w-full flex items-center justify-between p-2.5 rounded-lg text-left text-sm text-[#121316] hover:bg-[#EAEFE6] transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <Cpu className="w-4 h-4 text-[#0A733E]" />
                <div>
                  <div className="font-semibold">AI Trip Planner — Prompt & API Grounding</div>
                  <div className="text-xs text-[#585F6B]">Gemini structured schemas, Google Places validation</div>
                </div>
              </div>
              <span className="text-xs font-mono text-[#585F6B]">Deep Dive ➔</span>
            </button>

            <button
              onClick={() => { onOpenProjectDeepDive('konnectify'); onClose(); }}
              className="w-full flex items-center justify-between p-2.5 rounded-lg text-left text-sm text-[#121316] hover:bg-[#EAEFE6] transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <Code className="w-4 h-4 text-[#0A733E]" />
                <div>
                  <div className="font-semibold">Konnectify — Distributed Task Crediting on Redis</div>
                  <div className="text-xs text-[#585F6B]">Atomic memory metering & BullMQ batched database writes</div>
                </div>
              </div>
              <span className="text-xs font-mono text-[#585F6B]">Deep Dive ➔</span>
            </button>
          </div>
        </div>

        {/* Footer Navigation Hints */}
        <div className="px-4 py-2.5 bg-[#ECEFEA] border-t border-[#DCDFD6] flex items-center justify-between text-[11px] text-[#585F6B] font-mono">
          <div className="flex items-center space-x-3">
            <span><kbd className="px-1.5 py-0.5 bg-[#FFFFFF] border border-[#CCD2C5] rounded text-[10px] shadow-xs">ESC</kbd> to close</span>
            <span><kbd className="px-1.5 py-0.5 bg-[#FFFFFF] border border-[#CCD2C5] rounded text-[10px] shadow-xs">↵</kbd> to select</span>
          </div>
          <span className="text-[#0A733E] font-bold">Roshan Muhammed R · 2026</span>
        </div>
      </div>
    </div>
  );
};
