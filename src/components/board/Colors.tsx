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
  const isColorSelected = palette.has(color) && selectedCells.length > 0;
  const current = palette.get(color);

  return (
    <div className="absolute bottom-0 left-0 p-1 flex flex-col w-full  gap-1">
      <div className="flex gap-1">
        <Button
          type="button"
          onClick={handlePaint}
          disabled={selectedCells.length === 0}
          className={`px-3 py-1 h-full min-h-10 rounded-lg min-w-30 text-white font-bold  ${
            palette.has(color)
              ? " hover:bg-green-700"
              : "bg-gray-500 cursor-not-allowed"
          }`}
          style={
            isColorSelected && current
              ? {
                  backgroundColor: `rgb(${current.join(", ")})`,
                  color: color === 0 ? "black" : "white",
                  border: color === 0 ? `2px solid black` : `none`,
                }
              : undefined
          }
        >
          Paint (Space)
        </Button>
        <Button
          disabled={selectedCells.length === 0}
          className="bg-red-700 text-white hover:bg-red-500"
          onClick={() => setSelectedCells([])}
        >
          <IconTrashFilled stroke={2} />
        </Button>
        <div className="bg-black/30 flex items-center px-2 rounded-md">
          {children}
        </div>
      </div>
      <div className=" gap-2  text-white w-full  backdrop-blur-sm">
        <div className="flex flex-wrap gap-1 bg-black/30 p-1 rounded-md md:lg:max-h-none max-h-15 overflow-y-auto">
          {Array.from(palette.entries()).map(([id, p]) => {
            return (
              <Button
                key={id}
                className={` lg:w-10 md:w-8 w-7 h-auto aspect-square p-0 rounded-md border-2 ${
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
