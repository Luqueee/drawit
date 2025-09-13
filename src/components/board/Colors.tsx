"use client";

import React from "react";
import { Button } from "../ui/button";

export const palette = new Map<number, [number, number, number]>([
  [0, [255, 255, 255]], // White
  [1, [0, 0, 0]], // Black

  // ==== Rojos y derivados ====
  [10, [244, 114, 182]], // Pink
  [9, [251, 113, 133]], // Rose
  [6, [250, 128, 114]], // Salmon
  [7, [255, 127, 80]], // Coral
  [8, [255, 99, 71]], // Tomato
  [2, [220, 38, 38]], // Red
  [3, [220, 20, 60]], // Crimson
  [4, [139, 0, 0]], // Dark Red
  [5, [128, 0, 0]], // Maroon
  [83, [255, 105, 180]], // Hot Pink
  [84, [255, 20, 147]], // Deep Pink
  [85, [240, 128, 128]], // Light Coral
  [92, [188, 143, 143]], // Rosy Brown
  [87, [205, 92, 92]], // Indian Red
  [86, [178, 34, 34]], // Firebrick
  [36, [255, 0, 255]], // Magenta

  // ==== Naranjas y amarillos ====
  [16, [240, 230, 140]], // Khaki
  [15, [255, 215, 0]], // Gold
  [14, [250, 204, 21]], // Yellow
  [13, [251, 191, 36]], // Amber
  [11, [251, 146, 60]], // Orange
  [12, [255, 140, 0]], // Dark Orange
  [88, [218, 165, 32]], // Goldenrod
  [89, [184, 134, 11]], // Dark Goldenrod
  [90, [210, 105, 30]], // Chocolate
  [91, [205, 133, 63]], // Peru
  [95, [255, 160, 122]], // Light Salmon
  [98, [255, 99, 71]], // Sunset Orange
  [99, [255, 117, 24]], // Pumpkin
  [103, [226, 114, 91]], // Terracotta
  [101, [184, 115, 51]], // Copper
  [102, [183, 65, 14]], // Rust
  [100, [204, 85, 0]], // Burnt Orange

  // ==== Verdes ====
  [52, [144, 238, 144]], // Light Green
  [53, [152, 251, 152]], // Pale Green
  [50, [0, 255, 127]], // Spring Green
  [51, [127, 255, 0]], // Chartreuse
  [17, [163, 230, 53]], // Lime
  [54, [60, 179, 113]], // Medium Sea Green
  [22, [46, 139, 87]], // Sea Green
  [23, [34, 139, 34]], // Forest Green
  [18, [22, 163, 74]], // Green
  [19, [5, 150, 105]], // Emerald
  [20, [13, 148, 136]], // Teal
  [24, [0, 100, 0]], // Dark Green
  [21, [128, 128, 0]], // Olive

  // ==== Azules ====
  [28, [127, 255, 212]], // Aquamarine
  [27, [64, 224, 208]], // Turquoise
  [26, [34, 211, 238]], // Cyan
  [25, [56, 189, 248]], // Sky
  [29, [0, 191, 255]], // Deep Sky Blue
  [62, [30, 144, 255]], // Dodger Blue
  [59, [173, 216, 230]], // Light Blue
  [58, [176, 224, 230]], // Powder Blue
  [60, [70, 130, 180]], // Steel Blue
  [61, [65, 105, 225]], // Royal Blue
  [30, [37, 99, 235]], // Blue
  [63, [0, 0, 205]], // Medium Blue
  [31, [79, 70, 229]], // Indigo
  [65, [123, 104, 238]], // Medium Slate Blue
  [64, [106, 90, 205]], // Slate Blue
  [32, [0, 0, 128]], // Navy
  [104, [0, 49, 83]], // Prussian Blue
  [109, [0, 33, 71]], // Oxford Blue
  [108, [25, 25, 112]], // Midnight Blue
  [105, [72, 61, 139]], // Dark Slate Blue
  [106, [67, 70, 75]], // Steel Navy
  [112, [57, 62, 70]], // Cadet Navy
  [110, [42, 52, 57]], // Gunmetal
  [107, [54, 69, 79]], // Charcoal Blue
  [111, [29, 41, 81]], // Space Cadet

  // ==== Violetas y púrpuras ====
  [38, [230, 230, 250]], // Lavender
  [37, [221, 160, 221]], // Plum
  [66, [216, 191, 216]], // Thistle
  [35, [218, 112, 214]], // Orchid
  [67, [186, 85, 211]], // Medium Orchid
  [33, [124, 58, 237]], // Violet
  [34, [147, 51, 234]], // Purple
  [68, [153, 50, 204]], // Dark Orchid
  [69, [148, 0, 211]], // Dark Violet
  [70, [102, 51, 153]], // Rebecca Purple

  // ==== Tierras y neutros cálidos ====
  [42, [245, 245, 220]], // Beige
  [41, [210, 180, 140]], // Tan
  [40, [160, 82, 45]], // Sienna
  [39, [113, 63, 18]], // Brown
  [71, [189, 183, 107]], // Dark Khaki
  [72, [222, 184, 135]], // Burly Wood
  [73, [245, 222, 179]], // Wheat
  [74, [255, 248, 220]], // Cornsilk
  [75, [255, 228, 181]], // Moccasin
  [77, [255, 228, 196]], // Bisque
  [76, [255, 218, 185]], // Peach Puff
  [96, [251, 206, 177]], // Apricot
  [97, [255, 218, 185]], // Peach
  [78, [250, 235, 215]], // Antique White
  [79, [250, 240, 230]], // Linen
  [80, [253, 245, 230]], // Old Lace
  [81, [255, 250, 240]], // Floral White
  [82, [255, 255, 240]], // Ivory

  // ==== Grises ====
  [48, [220, 220, 220]], // Gainsboro
  [47, [209, 213, 219]], // Light Gray
  [46, [192, 192, 192]], // Silver
  [43, [107, 114, 128]], // Gray
  [44, [105, 105, 105]], // Dim Gray
  [94, [119, 136, 153]], // Light Slate Gray
  [93, [112, 128, 144]], // Slate Gray
  [45, [64, 64, 64]], // Dark Gray
]);

export const Colors: React.FC<{
  setColor: (color: number) => void;
  selectedCells: { x: number; y: number; color: number }[];
  color: number;
  handlePaint: () => void;
  children?: React.ReactNode;
}> = ({ setColor, color, selectedCells, handlePaint, children }) => {
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
