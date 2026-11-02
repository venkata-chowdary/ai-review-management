import { ProductLabel } from "@/components/auth/AuthShell";

// Signed-out pages: sign in, sign up, check email, forgot and reset password.
// One centred column sized to fit the screen without scrolling.
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-1 flex-col px-5 pt-5 pb-6 md:px-10">
      <header>
        <ProductLabel />
      </header>
      <main className="mx-auto flex w-full max-w-[380px] flex-1 flex-col justify-center py-8">{children}</main>
    </div>
  );
}
