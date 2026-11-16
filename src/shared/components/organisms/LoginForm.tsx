"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/shared/components/atoms/Button";
import { Input } from "@/shared/components/atoms/Input";
import { FormField } from "@/shared/components/molecules/FormField";

export type LoginResult = { success: boolean; message?: string };

type LoginFormProps = {
  onSubmit: (email: string, password: string) => Promise<LoginResult>;
  onSuccess: () => void;
};

export function LoginForm({ onSubmit, onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await onSubmit(email, password);
      if (result.success) {
        onSuccess();
        return;
      }
      setError(result.message ?? "E-mail ou senha incorretos.");
    } catch {
      setError("Não foi possível entrar agora. Tente de novo em instantes.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <p role="alert" className="rounded-md border border-danger px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
      <FormField label="E-mail">
        {(control) => (
          <Input {...control} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        )}
      </FormField>
      <FormField label="Senha">
        {(control) => (
          <Input
            {...control}
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}
      </FormField>
      <Button type="submit" loading={loading}>
        Entrar
      </Button>
    </form>
  );
}
