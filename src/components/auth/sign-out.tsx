import { signOut } from "@/auth";

export function SignOut() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut();
      }}
      className="w-full"
    >
      <button type="submit" className="w-full text-start">
        Sign Out
      </button>
    </form>
  );
}
