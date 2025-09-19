import { signIn } from "@/auth";
import { Google } from "../Icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "../ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import Image from "next/image";
import { pixelify } from "@/fonts";

export function SignIn() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className=" rounded-full border-3 border-zinc-900 bg-zinc-700 hover:bg-zinc-800 transition-all duration-300 text-foreground-contrast px-2 py-2">
          Iniciar sesión
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-[50vw]">
        <DialogHeader>
          <DialogTitle
            className={`"text-center flex items-center text-[#2A2A2A] justify-center text-4xl font-semibold ${pixelify.className}`}
          >
            <Image
              draggable={false}
              src={"/logo.webp"}
              alt="Logo"
              width={60}
              height={60}
            />
            <span>drawit</span>
          </DialogTitle>
        </DialogHeader>
        <div>
          <form
            action={async () => {
              "use server";
              await signIn("google", {
                // callbackUrl: `${window.location.origin}/draw`,
              });
            }}
            className="flex flex-col gap-4 mt-6 items-center"
          >
            {/* <p className="">Debes iniciar sesion para pintar</p> */}
            <button
              type="submit"
              className="flex hover:cursor-pointer transition-all duration-300 gap-4 items-center px-4 py-2 rounded-full justify-center border border-zinc-300 bg-[#f5f6f1] hover:bg-[#e3e4e0] text-foreground w-full h-fit"
            >
              <Google />{" "}
              <span className="font-semibold">Iniciar sesión con Google</span>
            </button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
