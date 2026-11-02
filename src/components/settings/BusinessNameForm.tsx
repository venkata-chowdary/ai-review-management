"use client";

import { useActionState, useId } from "react";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/Field";
import { Icon } from "@/components/icons/Icon";
import { saveBusinessName } from "@/lib/settings-actions";

export function BusinessNameForm({ name, email }: { name: string; email: string }) {
  const [state, action, pending] = useActionState(saveBusinessName, {});
  const id = useId();
  const error = state.fieldErrors?.name ?? state.error;

  return (
    <form action={action} noValidate className="mt-4 flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-name`} className="text-label font-semibold">
            Business name
          </label>
          <TextInput
            id={`${id}-name`}
            name="name"
            defaultValue={state.values?.name ?? name}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
          />
          {error && (
            <p id={`${id}-error`} className="flex items-center gap-1.5 text-[12.5px] text-danger">
              <Icon name="alert" size={13} />
              {error}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-email`} className="text-label font-semibold">
            Signed in as
          </label>
          <TextInput id={`${id}-email`} defaultValue={email} readOnly />
        </div>
      </div>
      <div className="flex items-center justify-end gap-3">
        <span role="status" aria-live="polite" className="text-[12px] font-semibold text-success">
          {state.ok && "Saved"}
        </span>
        <Button type="submit" variant="primary" size="md" icon="check" loading={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
