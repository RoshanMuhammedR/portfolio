"use client";

import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  MapPin, 
  Copy, 
  Check, 
  Github, 
  Linkedin, 
  Send
} from 'lucide-react';
import { identityData } from '@/content/portfolioData';
import { useDialog } from '@/lib/useDialog';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    roleOrCompany: '',
    message: ''
  });

  const panelRef = useDialog(isOpen, onClose);

  if (!isOpen) return null;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Inquiry from ${formData.name || 'Recruiter'} (${formData.roleOrCompany || 'Tech Team'})`);
    const body = encodeURIComponent(`Hi Roshan,\n\n${formData.message}\n\nFrom: ${formData.name}\nEmail: ${formData.email}\nCompany: ${formData.roleOrCompany}`);
    window.location.href = `mailto:${identityData.email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150" onClick={onClose}>
      <div 
        className="w-full max-w-xl bg-[#F4F6F1] border border-[#D4D8CF] rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Contact Roshan Muhammed R"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DCDFD6] bg-[#ECEFEA]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-[#00FF9D]/30 border border-[#00FF9D] flex items-center justify-center text-[#121316]">
              <Mail className="w-4 h-4 text-[#0B8043]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#121316] tracking-tight">Get in Touch with Roshan</h2>
              <p className="text-xs text-[#585F6B] font-mono">Available for Full-Time & Systems Engineering Roles</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#585F6B] hover:text-[#121316] hover:bg-[#DCDFD6] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-[#121316]">
          {/* Quick Direct Channels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Email Card */}
            <div className="p-3.5 rounded-lg bg-[#EAEFE6] border border-[#CCD2C5] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-mono text-[#585F6B] font-bold">EMAIL ADDRESS</span>
                <button
                  onClick={() => handleCopy(identityData.email, 'email')}
                  className="text-xs font-mono text-[#0A733E] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                >
                  {copiedField === 'email' ? <Check className="w-3 h-3 text-[#00B86B]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedField === 'email' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <a 
                href={`mailto:${identityData.email}`} 
                className="text-xs font-mono text-[#121316] font-semibold hover:text-[#0A733E] truncate"
              >
                {identityData.email}
              </a>
            </div>

            {/* Phone Card */}
            <div className="p-3.5 rounded-lg bg-[#EAEFE6] border border-[#CCD2C5] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-mono text-[#585F6B] font-bold">PHONE / WHATSAPP</span>
                <button
                  onClick={() => handleCopy(identityData.phone, 'phone')}
                  className="text-xs font-mono text-[#0A733E] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                >
                  {copiedField === 'phone' ? <Check className="w-3 h-3 text-[#00B86B]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedField === 'phone' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <span className="text-xs font-mono text-[#121316] font-semibold">
                {identityData.phone}
              </span>
            </div>
          </div>

          {/* Social Links Bar */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#EAEFE6] border border-[#CCD2C5] text-xs font-mono">
            <div className="flex items-center gap-2 text-[#585F6B]">
              <MapPin className="w-3.5 h-3.5 text-[#0A733E]" />
              <span>{identityData.location}</span>
            </div>
            <div className="flex items-center space-x-3">
              <a
                href={`https://${identityData.github}`}
                target="_blank"
                rel="noreferrer"
                className="text-[#585F6B] hover:text-[#121316] flex items-center gap-1 font-semibold"
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub</span>
              </a>
              <span>·</span>
              <a
                href={`https://${identityData.linkedin}`}
                target="_blank"
                rel="noreferrer"
                className="text-[#585F6B] hover:text-[#121316] flex items-center gap-1 font-semibold"
              >
                <Linkedin className="w-3.5 h-3.5" />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>

          {/* Direct Message Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="text-xs font-mono uppercase tracking-wider text-[#585F6B] font-bold">
              SEND DIRECT TRANSMISSION
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-[#585F6B] mb-1 font-semibold">Your Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Alex (Recruiter / Tech Lead)"
                  className="w-full px-3 py-2 rounded-lg bg-[#FFFFFF] border border-[#CCD2C5] text-[#121316] placeholder-[#8A92A0] text-xs focus:outline-none focus:border-[#121316] focus:ring-1 focus:ring-[#121316]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#585F6B] mb-1 font-semibold">Your Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="alex@company.com"
                  className="w-full px-3 py-2 rounded-lg bg-[#FFFFFF] border border-[#CCD2C5] text-[#121316] placeholder-[#8A92A0] text-xs focus:outline-none focus:border-[#121316] focus:ring-1 focus:ring-[#121316]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#585F6B] mb-1 font-semibold">Company or Role Context</label>
              <input
                type="text"
                value={formData.roleOrCompany}
                onChange={(e) => setFormData({ ...formData, roleOrCompany: e.target.value })}
                placeholder="e.g. Senior Frontend / Full-Stack Position"
                className="w-full px-3 py-2 rounded-lg bg-[#FFFFFF] border border-[#CCD2C5] text-[#121316] placeholder-[#8A92A0] text-xs focus:outline-none focus:border-[#121316] focus:ring-1 focus:ring-[#121316]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#585F6B] mb-1 font-semibold">Message</label>
              <textarea
                rows={4}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Hi Roshan, we loved your work on Redis task metering and Saga RAG indexing. Let's talk about..."
                className="w-full px-3 py-2 rounded-lg bg-[#FFFFFF] border border-[#CCD2C5] text-[#121316] placeholder-[#8A92A0] text-xs focus:outline-none focus:border-[#121316] focus:ring-1 focus:ring-[#121316]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-full bg-[#232832] hover:bg-[#16181F] text-white font-mono text-xs uppercase font-bold tracking-wider flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-xs"
            >
              <Send className="w-3.5 h-3.5 text-[#00FF9D]" />
              <span>Launch Mail Client</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
