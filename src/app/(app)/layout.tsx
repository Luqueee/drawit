import { auth } from "@/auth";
import { SignIn } from "@/components/auth/sign-in";
import { SessionProvider } from "next-auth/react";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <SignIn />
      </div>
    );
  }

  console.log(session);

  return <SessionProvider session={session}>{children}</SessionProvider>;
}
