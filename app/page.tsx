"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { StripLayout } from "@/components/strip/StripLayout";
import { CommandPalette } from "@/components/CommandPalette";
import { ResumeModal } from "@/components/ResumeModal";
import { ContactModal } from "@/components/ContactModal";

export default function HomePage() {
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-[#ECEEE9] text-[#121316]">
      {/* Top Fixed Header */}
      <Navbar
        onOpenCmd={() => setIsCmdOpen(true)}
        onOpenResume={() => setIsResumeOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
      />

      <main id="main" className="flex-1">
        <StripLayout
          onOpenResume={() => setIsResumeOpen(true)}
          onOpenContact={() => setIsContactOpen(true)}
        />
      </main>

      {/* Modals & Overlays */}
      <CommandPalette
        isOpen={isCmdOpen}
        onClose={() => setIsCmdOpen(false)}
        onOpenResume={() => setIsResumeOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
      />

      <ResumeModal
        isOpen={isResumeOpen}
        onClose={() => setIsResumeOpen(false)}
      />

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </div>
  );
}
