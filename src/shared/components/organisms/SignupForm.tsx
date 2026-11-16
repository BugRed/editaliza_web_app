"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/shared/components/atoms/Button";
import { Checkbox } from "@/shared/components/atoms/Checkbox";
import { Input } from "@/shared/components/atoms/Input";
import { FormField } from "@/shared/components/molecules/FormField";
import { validateSignup, type SignupErrors } from "@/shared/lib/signup-validation";

type SignupFormProps = { onSubmit: (email: string, password: string) => Promise<void> | void };

export function SignupForm({ onSubmit }: SignupFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<SignupErrors>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const found = validateSignup({ email, password, acceptedTerms });
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setLoading(true);
    try {
      await onSubmit(email.trim(), password);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <FormField label="E-mail" error={errors.email}>
        {(control) => (
          <Input {...control} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        )}
      </FormField>
      <FormField label="Senha" hint="Mínimo de 8 caracteres e 1 número." error={errors.password}>
        {(control) => (
          <Input
            {...control}
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}
      </FormField>
      <div className="flex flex-col gap-1.5">
        <Checkbox
          label="Aceito o tratamento dos meus dados para receber editais compatíveis."
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
        />
        {errors.acceptedTerms && (
          <p role="alert" className="text-sm text-danger">
            {errors.acceptedTerms}
          </p>
        )}
      </div>
      <Button type="submit" loading={loading} className="w-full">
        Criar conta
      </Button>
    </form>
  );
}
