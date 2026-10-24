"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { PlusCircle } from "lucide-react";

import { createAuditForBrandAction } from "@/app/audits/actions";
import { Button } from "@/components/ui/button";
import { initialCreateAuditFormState } from "@/lib/audits/action-state";

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="outline" disabled={disabled || pending}>
      <PlusCircle className="me-2 h-4 w-4" aria-hidden="true" />
      {pending ? "Creating audit..." : "Start new audit"}
    </Button>
  );
}

export function StartAuditButton({
  brandId,
  disabled,
}: {
  brandId: string;
  disabled?: boolean;
}) {
  const action = createAuditForBrandAction.bind(null, brandId);
  const [state, formAction] = useActionState(action, initialCreateAuditFormState);

  return (
    <div className="space-y-2">
      <form action={formAction}>
        <SubmitButton disabled={disabled} />
      </form>
      {state.message ? (
        <p className="max-w-xs text-sm leading-5 text-destructive">{state.message}</p>
      ) : null}
    </div>
  );
}
