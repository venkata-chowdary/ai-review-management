import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Display";
import { EmptyState } from "@/components/ui/States";

export default function DashboardNotFound() {
  return (
    <main className="px-4 py-5 md:px-8 md:py-[26px]">
      <Card>
        <EmptyState
          icon="search"
          title="Page not found"
          action={
            <ButtonLink href="/" variant="primary" icon="home">
              Go to Overview
            </ButtonLink>
          }
        >
          The page you were looking for doesn’t exist or has moved.
        </EmptyState>
      </Card>
    </main>
  );
}
