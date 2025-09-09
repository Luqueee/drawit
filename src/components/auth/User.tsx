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
export default async function User() {
  const session = await auth();

  if (!session?.user) return null;

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
      <DropdownMenuContent className=" mr-1 " align="start">
        <DropdownMenuItem>
          <SignOut />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
