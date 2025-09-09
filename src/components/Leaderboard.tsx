"use client";

import { Medal } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
export const Leaderboard = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="bg-gray-300 group hover:cursor-pointer hover:bg-gray-500 transition-all duration-300 border-2 border-gray-500 rounded-full size-[40px] flex items-center justify-center"
        >
          <Medal className="text-gray-700 group-hover:text-gray-300 transition-all duration-300" />
        </button>
      </DialogTrigger>
      <DialogContent className="h-[80vh] w-[60vw] bg-white/50 backdrop-blur-md text-slate-600">
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
