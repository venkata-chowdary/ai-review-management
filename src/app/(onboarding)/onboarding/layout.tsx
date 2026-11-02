import { ProductLabel } from "@/components/auth/AuthShell";
import { StepList, StepProgress } from "@/components/onboarding/Stepper";
import { signOut } from "@/lib/auth/actions";

// First-run setup after sign-up. Step list on the left from 1024px, a compact
// progress bar on smaller screens. Sized so each step fits one screen
// (375×812 phones, 1280×720 laptops) with Continue at the bottom.
export default function OnboardingLayout({ children }: LayoutProps<"/onboarding">) {
  const signOutButton = (
    <form action={signOut}>
      <button type="submit" className="text-[13px] font-semibold whitespace-nowrap text-fg-muted hover:text-fg">
        Sign out
      </button>
    </form>
  );
  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <header className="hidden items-center justify-between gap-4 px-10 pt-4 lg:flex">
        <ProductLabel />
        {signOutButton}
      </header>
      <div className="mx-auto flex w-full max-w-[1040px] flex-1 gap-10 px-4 py-5 md:px-10 lg:pt-8 lg:pb-5">
        <aside className="hidden w-[232px] flex-none lg:block">
          <div className="sticky top-8">
            <StepList />
          </div>
        </aside>
        <main className="flex min-w-0 flex-1 flex-col gap-5">
          <div className="flex items-start gap-4 lg:hidden">
            <div className="min-w-0 flex-1">
              <StepProgress />
            </div>
            {signOutButton}
          </div>
          <div className="flex w-full max-w-[640px] flex-1 flex-col">{children}</div>
        </main>
      </div>
    </div>
  );
}
