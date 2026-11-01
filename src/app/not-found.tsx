import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Display";
import { EmptyState } from "@/components/ui/States";

// Unknown URLs and QR codes that no longer exist.
export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-qr flex-1 items-center px-4 py-10">
      <Card className="w-full">
        <EmptyState
          icon="search"
          title="Page not found"
          action={
            <ButtonLink href="/" variant="primary" icon="home">
              Go to Overview
            </ButtonLink>
          }
        >
          This link may be out of date. If you scanned a QR code, ask the business for a new one.
        </EmptyState>
      </Card>
    </main>
  );
}
