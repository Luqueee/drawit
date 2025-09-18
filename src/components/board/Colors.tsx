"use client";

import React from "react";
import { Button } from "../ui/button";
import { palette } from "@/shared/colors";
import { Color } from "@/@types/color";
import { IconTrashFilled } from "@tabler/icons-react";

export const Colors: React.FC<{
  setColor: (color: number) => void;
  selectedCells: Color[];
  setSelectedCells: (cells: Color[]) => void;
  color: number;
  handlePaint: () => void;
  children?: React.ReactNode;
}> = ({
  setColor,
  color,
  setSelectedCells,
  selectedCells,
  handlePaint,
  children,
}) => {
  return (
    <div className="absolute bottom-0 left-0 p-1 flex flex-col w-full  gap-1">
      <div className="flex gap-1 h-10 ">{children}</div>
      <div className=" gap-2  text-white w-full  backdrop-blur-sm">
        <div className="flex flex-wrap gap-1 bg-black/30 p-1 rounded-md max-h-15 h-15 overflow-y-auto">
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
  );
};
