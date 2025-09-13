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

  // ==== EXPANSIÓN: Colores adicionales ====
  { id: 49, name: "Mint", rgb: [189, 252, 201] },
  { id: 50, name: "Spring Green", rgb: [0, 255, 127] },
  { id: 51, name: "Chartreuse", rgb: [127, 255, 0] },
  { id: 52, name: "Light Green", rgb: [144, 238, 144] },
  { id: 53, name: "Pale Green", rgb: [152, 251, 152] },
  { id: 54, name: "Medium Sea Green", rgb: [60, 179, 113] },
  { id: 55, name: "Medium Aquamarine", rgb: [102, 205, 170] },
  { id: 56, name: "Light Sea Green", rgb: [32, 178, 170] },
  { id: 57, name: "Cadet Blue", rgb: [95, 158, 160] },

  { id: 58, name: "Powder Blue", rgb: [176, 224, 230] },
  { id: 59, name: "Light Blue", rgb: [173, 216, 230] },
  { id: 60, name: "Steel Blue", rgb: [70, 130, 180] },
  { id: 61, name: "Royal Blue", rgb: [65, 105, 225] },
  { id: 62, name: "Dodger Blue", rgb: [30, 144, 255] },
  { id: 63, name: "Medium Blue", rgb: [0, 0, 205] },
  { id: 64, name: "Slate Blue", rgb: [106, 90, 205] },
  { id: 65, name: "Medium Slate Blue", rgb: [123, 104, 238] },

  { id: 66, name: "Thistle", rgb: [216, 191, 216] },
  { id: 67, name: "Medium Orchid", rgb: [186, 85, 211] },
  { id: 68, name: "Dark Orchid", rgb: [153, 50, 204] },
  { id: 69, name: "Dark Violet", rgb: [148, 0, 211] },
  { id: 70, name: "Rebecca Purple", rgb: [102, 51, 153] },

  { id: 71, name: "Dark Khaki", rgb: [189, 183, 107] },
  { id: 72, name: "Burly Wood", rgb: [222, 184, 135] },
  { id: 73, name: "Wheat", rgb: [245, 222, 179] },
  { id: 74, name: "Cornsilk", rgb: [255, 248, 220] },
  { id: 75, name: "Moccasin", rgb: [255, 228, 181] },
  { id: 76, name: "Peach Puff", rgb: [255, 218, 185] },
  { id: 77, name: "Bisque", rgb: [255, 228, 196] },
  { id: 78, name: "Antique White", rgb: [250, 235, 215] },
  { id: 79, name: "Linen", rgb: [250, 240, 230] },
  { id: 80, name: "Old Lace", rgb: [253, 245, 230] },
  { id: 81, name: "Floral White", rgb: [255, 250, 240] },
  { id: 82, name: "Ivory", rgb: [255, 255, 240] },

  // ==== Extras vibrantes ====
  { id: 83, name: "Hot Pink", rgb: [255, 105, 180] },
  { id: 84, name: "Deep Pink", rgb: [255, 20, 147] },
  { id: 85, name: "Light Coral", rgb: [240, 128, 128] },
  { id: 86, name: "Firebrick", rgb: [178, 34, 34] },
  { id: 87, name: "Indian Red", rgb: [205, 92, 92] },
  { id: 88, name: "Goldenrod", rgb: [218, 165, 32] },
  { id: 89, name: "Dark Goldenrod", rgb: [184, 134, 11] },
  { id: 90, name: "Chocolate", rgb: [210, 105, 30] },
  { id: 91, name: "Peru", rgb: [205, 133, 63] },
  { id: 92, name: "Rosy Brown", rgb: [188, 143, 143] },
  { id: 93, name: "Slate Gray", rgb: [112, 128, 144] },
  { id: 94, name: "Light Slate Gray", rgb: [119, 136, 153] },

  { id: 95, name: "Light Salmon", rgb: [255, 160, 122] },
  { id: 96, name: "Apricot", rgb: [251, 206, 177] },
  { id: 97, name: "Peach", rgb: [255, 218, 185] },
  { id: 98, name: "Sunset Orange", rgb: [255, 99, 71] },
  { id: 99, name: "Pumpkin", rgb: [255, 117, 24] },
  { id: 100, name: "Burnt Orange", rgb: [204, 85, 0] },
  { id: 101, name: "Copper", rgb: [184, 115, 51] },
  { id: 102, name: "Rust", rgb: [183, 65, 14] },
  { id: 103, name: "Terracotta", rgb: [226, 114, 91] },

  // ==== Tonalidades de azul oscuro (no saturados) ====
  { id: 104, name: "Prussian Blue", rgb: [0, 49, 83] },
  { id: 105, name: "Dark Slate Blue", rgb: [72, 61, 139] },
  { id: 106, name: "Steel Navy", rgb: [67, 70, 75] },
  { id: 107, name: "Charcoal Blue", rgb: [54, 69, 79] },
  { id: 108, name: "Midnight Blue", rgb: [25, 25, 112] },
  { id: 109, name: "Oxford Blue", rgb: [0, 33, 71] },
  { id: 110, name: "Gunmetal", rgb: [42, 52, 57] },
  { id: 111, name: "Space Cadet", rgb: [29, 41, 81] },
  { id: 112, name: "Cadet Navy", rgb: [57, 62, 70] },
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
