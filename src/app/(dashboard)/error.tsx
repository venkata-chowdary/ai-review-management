"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Display";
import { ErrorState } from "@/components/ui/States";

export default function DashboardError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="px-4 py-5 md:px-8 md:py-[26px]">
      <Card>
        <ErrorState
          title="We couldn’t load this page"
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="primary" icon="refresh" iconMotion="spin" onClick={() => retry()}>
                Try again
              </Button>
              <ButtonLink href="/">Go to Overview</ButtonLink>
            </div>
          }
        >
          {error instanceof Error ? error.message : "Something went wrong."} Your data is safe; nothing was published.
        </ErrorState>
      </Card>
    </main>
  );
}
