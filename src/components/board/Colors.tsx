"use client";

import React from "react";
import { Button } from "../ui/button";
import { palette } from "@/shared/colors";

export const Colors: React.FC<{
  setColor: (color: number) => void;
  color: number;
  children?: React.ReactNode;
}> = ({ setColor, color, children }) => {
  return (
    <div className="absolute bottom-0 left-0 w-full p-1 ">
      <div className=" bg-foreground-contrast/50 backdrop-blur-sm border border-zinc-900/20 p-2 rounded-xl  flex flex-col gap-1">
        <div className="flex gap-1 h-10 ">{children}</div>
        <div className=" gap-2  text-white w-full  backdrop-blur-sm">
          <div className="flex flex-wrap gap-1  p-1 rounded-md h-20 overflow-y-auto">
            {Array.from(palette.entries()).map(([id, p]) => {
              return (
                <Button
                  key={id}
                  className={` lg:w-7 md:w-6 w-7 h-auto aspect-square p-0 rounded-md border-2 ${
                    color === id ? "border-white" : "border-transparent"
                  }`}
                  style={{ backgroundColor: `rgb(${p.join(", ")})` }}
                  onClick={() => setColor(id)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
