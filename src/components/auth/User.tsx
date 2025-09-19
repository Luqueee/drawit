import { auth } from "@/auth";
import Image from "next/image";
import { SignIn } from "./sign-in";
import { SignOut } from "./sign-out";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Sign } from "crypto";
export default async function User() {
  const session = await auth();

  if (!session?.user) return <SignIn />;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {session?.user.image && (
          <Image
            width={40}
            height={40}
            src={session.user.image}
            alt="User Avatar"
            draggable={false}
            className="rounded-full "
          />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className=" mr-1 bg-foreground-contrast text-foreground border border-foreground/50 md:lg:w-80 w-70 p-4"
        align="start"
        side="left"
      >
        <div className="grid grid-cols-[auto_1fr] items-center gap-4 mb-8">
          {session?.user.image && (
            <Image
              width={50}
              height={50}
              src={session.user.image}
              alt="User Avatar"
              draggable={false}
              className="rounded-full border-2 border-foreground/50 "
            />
          )}
          <div>
            <p>{session.user.name}</p>
          </div>
        </div>

        <SignOut />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
