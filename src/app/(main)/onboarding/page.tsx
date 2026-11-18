"use client";

import AppShell from "@/shared/components/organisms/AppShell";
import OnboardingWizard from "@/shared/components/organisms/OnboardingWizard";

export default function OnboardingPage() {
  return (
    <AppShell title="Complete seu perfil">
      <OnboardingWizard />
    </AppShell>
  );
}
