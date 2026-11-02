"use client";

import { useActionState, useId } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Display";
import { TextInput } from "@/components/ui/Field";
import { Icon } from "@/components/icons/Icon";
import { saveBranchDetails } from "@/lib/settings-actions";

/** Add or edit one branch. With `branch` it edits that branch; without it adds a new one. */
export function BranchForm({ branch }: { branch?: { id: string; name: string; googleMapsUrl: string | null } }) {
  const [state, action, pending] = useActionState(saveBranchDetails, {});
  const id = useId();
  const errors = state.fieldErrors ?? {};

  return (
    <form action={action} noValidate>
      <Card className="flex max-w-[560px] flex-col gap-5 p-5">
        {branch && <input type="hidden" name="id" value={branch.id} />}
        {state.error && (
          <p role="alert" className="text-[13px] text-danger">
            {state.error}
          </p>
        )}
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-name`} className="text-label font-semibold">
            Branch name
          </label>
          <TextInput
            id={`${id}-name`}
            name="name"
            defaultValue={state.values?.name ?? branch?.name}
            placeholder="e.g. MG Road"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? `${id}-name-error` : undefined}
            className="h-field"
            autoFocus
          />
          {errors.name ? (
            <p id={`${id}-name-error`} className="flex items-center gap-1.5 text-[12.5px] text-danger">
              <Icon name="alert" size={13} />
              {errors.name}
            </p>
          ) : (
            <p className="text-[12px] text-fg-muted">Shown in your dashboard. For example, MG Road or Main branch.</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-url`} className="text-label font-semibold">
            Google Maps link
          </label>
          <TextInput
            id={`${id}-url`}
            name="url"
            type="url"
            inputMode="url"
            defaultValue={state.values?.url ?? branch?.googleMapsUrl ?? ""}
            placeholder="https://maps.app.goo.gl/…"
            aria-invalid={!!errors.url}
            aria-describedby={errors.url ? `${id}-url-error` : undefined}
            className="h-field"
          />
          {errors.url ? (
            <p id={`${id}-url-error`} className="flex items-center gap-1.5 text-[12.5px] text-danger">
              <Icon name="alert" size={13} />
              {errors.url}
            </p>
          ) : (
            <p className="text-[12px] text-fg-muted">Open your shop on Google Maps, tap Share, then Copy link.</p>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line pt-5">
          <ButtonLink href="/branches" variant="text" size="md">
            Cancel
          </ButtonLink>
          <Button type="submit" variant="primary" size="md" icon="check" loading={pending}>
            {pending ? "Saving…" : branch ? "Save changes" : "Add branch"}
          </Button>
        </div>
      </Card>
    </form>
  );
}
