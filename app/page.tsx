"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { ArchitectLayout } from "@/components/architect/ArchitectLayout";
import { CommandPalette } from "@/components/CommandPalette";
import { ResumeModal } from "@/components/ResumeModal";
import { ContactModal } from "@/components/ContactModal";
import { TechnicalDeepDiveModal } from "@/components/TechnicalDeepDiveModal";

export default function HomePage() {
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [deepDiveId, setDeepDiveId] = useState<string | null>(null);

  const handleOpenDeepDive = (id: string) => {
    setDeepDiveId(id);
  };

  const handleCloseDeepDive = () => {
    setDeepDiveId(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#ECEEE9] text-[#121316]">
      {/* Top Fixed Header */}
      <Navbar
        onOpenCmd={() => setIsCmdOpen(true)}
        onOpenResume={() => setIsResumeOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
      />

      <main id="main" className="flex-1">
        <ArchitectLayout
          onOpenResume={() => setIsResumeOpen(true)}
          onOpenContact={() => setIsContactOpen(true)}
          onOpenDeepDive={handleOpenDeepDive}
        />
      </main>

      {/* Modals & Overlays */}
      <CommandPalette
        isOpen={isCmdOpen}
        onClose={() => setIsCmdOpen(false)}
        onOpenResume={() => setIsResumeOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
        onOpenProjectDeepDive={handleOpenDeepDive}
      />

      <ResumeModal
        isOpen={isResumeOpen}
        onClose={() => setIsResumeOpen(false)}
      />

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />

      <TechnicalDeepDiveModal
        itemId={deepDiveId}
        onClose={handleCloseDeepDive}
      />
    </div>
  );
}
