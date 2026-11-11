"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { CreateProjectModal } from "@/components/CreateProjectModal";
import { GuidedHelpModal } from "@/components/GuidedHelpModal";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header 
          onOpenNewProject={() => setIsNewProjectOpen(true)}
          onOpenHelp={() => setIsHelpOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-950/80">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <CreateProjectModal 
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
        onProjectCreated={(p) => {
          window.location.reload();
        }}
      />
      <GuidedHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}
