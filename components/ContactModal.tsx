"use client";

import React, { useState } from 'react';
import { Check, Copy, Github, Linkedin, Mail, MapPin, X } from 'lucide-react';
import { identityData } from '@/content/portfolioData';
import { useDialog } from '@/lib/useDialog';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** One of the two channels that reach Roshan directly, with its own copy button. */
const Channel: React.FC<{
  label: string;
  value: string;
  href?: string;
  copied: boolean;
  onCopy: () => void;
}> = ({ label, value, href, copied, onCopy }) => (
  <div className="flex flex-col gap-1.5 rounded-lg border border-rule bg-paper p-3.5">
    <div className="flex items-center justify-between gap-2">
      <span className="font-mono text-[11px] font-semibold tracking-[0.12em] text-ink-faint uppercase">
        {label}
      </span>
      <button
        type="button"
        onClick={onCopy}
        aria-label={`Copy ${label.toLowerCase()}`}
        className="flex cursor-pointer items-center gap-1 font-mono text-[11px] font-semibold text-mint-ink transition-opacity hover:opacity-70"
      >
        {copied ? (
          <Check className="h-3 w-3" aria-hidden="true" />
        ) : (
          <Copy className="h-3 w-3" aria-hidden="true" />
        )}
        <span>{copied ? 'Copied' : 'Copy'}</span>
      </button>
    </div>
    {href ? (
      <a
        href={href}
        className="truncate font-mono text-[13px] font-semibold text-ink hover:text-mint-ink"
      >
        {value}
      </a>
    ) : (
      <span className="truncate font-mono text-[13px] font-semibold text-ink">{value}</span>
    )}
  </div>
);

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
    const subject = encodeURIComponent(
      `Inquiry from ${formData.name || 'Recruiter'} (${formData.roleOrCompany || 'Tech Team'})`
    );
    const body = encodeURIComponent(
      `Hi Roshan,\n\n${formData.message}\n\nFrom: ${formData.name}\nEmail: ${formData.email}\nCompany: ${formData.roleOrCompany}`
    );
    window.location.href = `mailto:${identityData.email}?subject=${subject}&body=${body}`;
  };

  const field =
    'field px-3 py-2.5 text-[13px] focus:outline-none';
  const labelClass = 'mb-1.5 block font-mono text-[11px] font-semibold text-ink-faint';

  return (
    <div
      className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay)] p-4 backdrop-blur-xs duration-150 sm:p-6"
      onClick={onClose}
    >
      <div
        className="panel flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-rule px-6 py-4">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-rule bg-paper text-ink-faint"
            >
              <Mail className="h-4 w-4" />
            </span>
            <div>
              <h2 id="contact-title" className="text-base font-bold tracking-tight text-ink">
                Get in Touch with Roshan
              </h2>
              <p className="font-mono text-[11px] text-ink-faint">
                Available for full-time &amp; systems engineering roles
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="-mr-1.5 cursor-pointer rounded-full p-1.5 text-ink-faint transition-colors hover:bg-paper hover:text-ink"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Channel
              label="Email"
              value={identityData.email}
              href={`mailto:${identityData.email}`}
              copied={copiedField === 'email'}
              onCopy={() => handleCopy(identityData.email, 'email')}
            />
            <Channel
              label="Phone / WhatsApp"
              value={identityData.phone}
              copied={copiedField === 'phone'}
              onCopy={() => handleCopy(identityData.phone, 'phone')}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-y border-rule py-3 font-mono text-[12px]">
            <span className="flex items-center gap-2 text-ink-faint">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{identityData.location}</span>
            </span>
            <span className="flex items-center gap-4">
              <a
                href={identityData.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 font-semibold text-ink-muted transition-colors hover:text-mint-ink"
              >
                <Github className="h-3.5 w-3.5" aria-hidden="true" />
                <span>GitHub</span>
              </a>
              <a
                href={identityData.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 font-semibold text-ink-muted transition-colors hover:text-mint-ink"
              >
                <Linkedin className="h-3.5 w-3.5" aria-hidden="true" />
                <span>LinkedIn</span>
              </a>
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h3 className="font-mono text-[11px] font-semibold tracking-[0.14em] text-ink-faint uppercase">
                Write a message
              </h3>
              <p className="mt-1.5 text-[12px] text-ink-faint">
                This opens your own mail app with the message ready to send &mdash; nothing
                is submitted from this page.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="contact-name" className={labelClass}>
                  Your name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Alex Rivera"
                  className={field}
                />
              </div>

              <div>
                <label htmlFor="contact-email" className={labelClass}>
                  Your email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="alex@company.com"
                  className={field}
                />
              </div>
            </div>

            <div>
              <label htmlFor="contact-role" className={labelClass}>
                Company or role{' '}
                <span className="font-normal text-ink-ghost">(optional)</span>
              </label>
              <input
                id="contact-role"
                type="text"
                value={formData.roleOrCompany}
                onChange={(e) => setFormData({ ...formData, roleOrCompany: e.target.value })}
                placeholder="Senior full-stack, Acme"
                className={field}
              />
            </div>

            <div>
              <label htmlFor="contact-message" className={labelClass}>
                Message
              </label>
              <textarea
                id="contact-message"
                rows={4}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="We are hiring for a backend role and your work on Redis task metering caught our eye…"
                className={`${field} resize-y`}
              />
            </div>

            <button
              type="submit"
              className="w-full cursor-pointer rounded-full bg-ink px-6 py-3.5 text-sm font-bold text-on-ink transition-colors hover:bg-ink-hover"
            >
              Open in your mail app
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
