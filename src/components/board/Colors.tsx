"use client";

import { Button } from "../ui/button";

export const palette = [
  { id: 0, name: "White", rgb: [255, 255, 255] }, // Background color
  { id: 1, name: "Black", rgb: [0, 0, 0] },

  // ==== Rojos y derivados ====
  { id: 2, name: "Red", rgb: [220, 38, 38] },
  { id: 3, name: "Crimson", rgb: [220, 20, 60] },
  { id: 4, name: "Dark Red", rgb: [139, 0, 0] },
  { id: 5, name: "Maroon", rgb: [128, 0, 0] },
  { id: 6, name: "Salmon", rgb: [250, 128, 114] },
  { id: 7, name: "Coral", rgb: [255, 127, 80] },
  { id: 8, name: "Tomato", rgb: [255, 99, 71] },
  { id: 9, name: "Rose", rgb: [251, 113, 133] },
  { id: 10, name: "Pink", rgb: [244, 114, 182] },

  // ==== Naranjas y amarillos ====
  { id: 11, name: "Orange", rgb: [251, 146, 60] },
  { id: 12, name: "Dark Orange", rgb: [255, 140, 0] },
  { id: 13, name: "Amber", rgb: [251, 191, 36] },
  { id: 14, name: "Yellow", rgb: [250, 204, 21] },
  { id: 15, name: "Gold", rgb: [255, 215, 0] },
  { id: 16, name: "Khaki", rgb: [240, 230, 140] },

  // ==== Verdes ====
  { id: 17, name: "Lime", rgb: [163, 230, 53] },
  { id: 18, name: "Green", rgb: [22, 163, 74] },
  { id: 19, name: "Emerald", rgb: [5, 150, 105] },
  { id: 20, name: "Teal", rgb: [13, 148, 136] },
  { id: 21, name: "Olive", rgb: [128, 128, 0] },
  { id: 22, name: "Sea Green", rgb: [46, 139, 87] },
  { id: 23, name: "Forest Green", rgb: [34, 139, 34] },
  { id: 24, name: "Dark Green", rgb: [0, 100, 0] },

  // ==== Azules ====
  { id: 25, name: "Sky", rgb: [56, 189, 248] },
  { id: 26, name: "Cyan", rgb: [34, 211, 238] },
  { id: 27, name: "Turquoise", rgb: [64, 224, 208] },
  { id: 28, name: "Aquamarine", rgb: [127, 255, 212] },
  { id: 29, name: "Deep Sky Blue", rgb: [0, 191, 255] },
  { id: 30, name: "Blue", rgb: [37, 99, 235] },
  { id: 31, name: "Indigo", rgb: [79, 70, 229] },
  { id: 32, name: "Navy", rgb: [0, 0, 128] },

  // ==== Violetas y púrpuras ====
  { id: 33, name: "Violet", rgb: [124, 58, 237] },
  { id: 34, name: "Purple", rgb: [147, 51, 234] },
  { id: 35, name: "Orchid", rgb: [218, 112, 214] },
  { id: 36, name: "Magenta", rgb: [255, 0, 255] },
  { id: 37, name: "Plum", rgb: [221, 160, 221] },
  { id: 38, name: "Lavender", rgb: [230, 230, 250] },

  // ==== Tierras y neutros cálidos ====
  { id: 39, name: "Brown", rgb: [113, 63, 18] },
  { id: 40, name: "Sienna", rgb: [160, 82, 45] },
  { id: 41, name: "Tan", rgb: [210, 180, 140] },
  { id: 42, name: "Beige", rgb: [245, 245, 220] },

  // ==== Grises ====
  { id: 43, name: "Gray", rgb: [107, 114, 128] },
  { id: 44, name: "Dim Gray", rgb: [105, 105, 105] },
  { id: 45, name: "Dark Gray", rgb: [64, 64, 64] },
  { id: 46, name: "Silver", rgb: [192, 192, 192] },
  { id: 47, name: "Light Gray", rgb: [209, 213, 219] },
  { id: 48, name: "Gainsboro", rgb: [220, 220, 220] },
];

export const Colors: React.FC<{
  setColor: (color: number) => void;
  selectedCells: { x: number; y: number; color: number }[];
  color: number;
  handlePaint: () => void;
  children?: React.ReactNode;
}> = ({ setColor, color, selectedCells, handlePaint, children }) => {
  return (
    <div className="absolute bottom-0 left-0 p-1 flex flex-col w-full  gap-1">
      <div className="flex gap-1">
        <Button
          type="button"
          onClick={handlePaint}
          disabled={selectedCells.length === 0}
          className={`px-3 py-1 h-full min-h-10 rounded-lg min-w-30 text-white font-bold  ${
            color ? " hover:bg-green-700" : "bg-gray-500 cursor-not-allowed"
          }`}
          style={
            color && selectedCells.length > 0
              ? {
                  backgroundColor: `rgb(${palette[color].rgb.join(", ")})`,
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
        <div className="flex flex-wrap gap-1 bg-black/30 p-1 rounded-md">
          {palette.map((c) => (
            <Button
              key={c.id}
              className={` lg:w-10 md:w-8 w-7 h-auto aspect-square p-0 rounded-md border-2 ${
                color === c.id ? "border-white" : "border-transparent"
              }`}
              style={{ backgroundColor: `rgb(${c.rgb.join(", ")})` }}
              onClick={() => setColor(c.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
