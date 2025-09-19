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
      <button
        type="submit"
        className="flex hover:cursor-pointer transition-all duration-300 gap-4 items-center px-4 py-2 rounded-full justify-center border border-zinc-300 bg-[#f5f6f1] hover:bg-[#e3e4e0] text-foreground w-full h-fit"
      >
        Cerrar sesión
      </button>
    </form>
  );
}
