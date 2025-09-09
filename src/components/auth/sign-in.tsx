import { signIn } from "@/auth";
import { Google } from "../Icons";

export function SignIn() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google", {});
      }}
      className="flex flex-col gap-4 items-center"
    >
      <p className="">Debes iniciar sesion para pintar</p>
      <button
        type="submit"
        className="flex hover:cursor-pointer transition-all hover:bg-zinc-900 duration-300 gap-4 items-center px-4 py-2 rounded-full justify-center bg-zinc-800 text-white w-full h-fit"
      >
        <Google /> <span className="font-semibold">Google</span>
      </button>
    </form>
  );
}
