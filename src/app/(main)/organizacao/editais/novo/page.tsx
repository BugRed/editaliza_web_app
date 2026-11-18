"use client";

import AppShell from "@/shared/components/organisms/AppShell";
import EditalPublishForm from "@/shared/components/organisms/EditalPublishForm";

export default function NovoEditalPage() {
  return (
    <AppShell title="Publicar edital">
      <EditalPublishForm />
    </AppShell>
  );
}
