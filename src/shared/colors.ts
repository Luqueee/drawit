export const palette = new Map<number, [number, number, number]>([
    [0, [255, 255, 255]], // White
    [1, [0, 0, 0]], // Black

    // ==== Rojos y derivados ====
    // ==== Rosas ====
    [200, [255, 240, 245]], // Lavender Blush (rosa muy pálido)
    [201, [255, 228, 225]], // Misty Rose (rosa neblina)
    [202, [255, 182, 193]], // Light Pink
    [203, [255, 192, 203]], // Pink (standard)
    [204, [255, 175, 190]], // Pastel Rose
    [205, [255, 160, 176]], // Candy Pink
    [206, [255, 145, 164]], // Soft Rose
    [207, [255, 131, 156]], // Baby Rose
    [208, [255, 120, 147]], // Light Hot Pink
    [209, [255, 105, 180]], // Hot Pink
    [210, [255, 95, 160]], // Vivid Rose
    [211, [255, 85, 150]], // Neon Pink Rose
    [212, [255, 69, 140]], // Deep Rose
    [213, [219, 112, 147]], // Pale Violet Red
    [214, [199, 21, 133]], // Medium Violet Red
    [215, [178, 34, 130]], // Dark Rose Violet
    [216, [139, 0, 90]], // Deep Magenta Rose


    [113, [255, 182, 193]], // Light Pink
    [114, [255, 192, 203]], // Pink (Standard)
    [10, [244, 114, 182]],  // Pink
    [124, [255, 0, 127]],   // Bright Pink
    [125, [255, 52, 179]],  // Neon Pink
    [83, [255, 105, 180]],  // Hot Pink
    [84, [255, 20, 147]],   // Deep Pink
    [115, [219, 112, 147]], // Pale Violet Red
    [116, [199, 21, 133]],  // Medium Violet Red
    [9, [251, 113, 133]],   // Rose
    [123, [222, 49, 99]],   // Raspberry
    [6, [250, 128, 114]],   // Salmon
    [118, [255, 160, 122]], // Light Salmon (extra)
    [95, [255, 160, 122]],  // Light Salmon
    [7, [255, 127, 80]],    // Coral
    [85, [240, 128, 128]],  // Light Coral
    [8, [255, 99, 71]],     // Tomato
    [98, [255, 99, 71]],    // Sunset Orange
    [117, [255, 69, 0]],    // Red-Orange
    [2, [220, 38, 38]],     // Red
    [119, [255, 36, 0]],    // Neon Red
    [120, [227, 38, 54]],   // Alizarin
    [121, [237, 41, 57]],   // Imperial Red
    [3, [220, 20, 60]],     // Crimson
    [122, [205, 38, 38]],   // Persian Red
    [87, [205, 92, 92]],    // Indian Red
    [86, [178, 34, 34]],    // Firebrick
    [4, [139, 0, 0]],       // Dark Red
    [5, [128, 0, 0]],       // Maroon
    [126, [255, 153, 153]], // Pastel Red
    [127, [255, 102, 178]], // Pastel Pink
    [92, [188, 143, 143]],  // Rosy Brown
    [36, [255, 0, 255]],    // Magenta

    // ==== Naranjas y amarillos ====
    [11, [251, 146, 60]],   // Orange
    [12, [255, 140, 0]],    // Dark Orange
    [99, [255, 117, 24]],   // Pumpkin
    [100, [204, 85, 0]],    // Burnt Orange
    [102, [183, 65, 14]],   // Rust
    [103, [226, 114, 91]],  // Terracotta
    [101, [184, 115, 51]],  // Copper
    [90, [210, 105, 30]],   // Chocolate
    [91, [205, 133, 63]],   // Peru
    [89, [184, 134, 11]],   // Dark Goldenrod
    [88, [218, 165, 32]],   // Goldenrod
    [13, [251, 191, 36]],   // Amber
    [15, [255, 215, 0]],    // Gold
    [14, [250, 204, 21]],   // Yellow
    [16, [240, 230, 140]],  // Khaki

    // ==== Verdes ====
    // ==== Verdes Claros ====
    [190, [204, 255, 204]], // Mint Cream
    [191, [189, 252, 201]], // Honeydew Green
    [192, [170, 240, 190]], // Pastel Mint
    [193, [152, 251, 152]], // Pale Green
    [194, [144, 238, 144]], // Light Green
    [195, [120, 220, 160]], // Soft Jade
    [196, [102, 205, 170]], // Aquatic Mint
    [197, [90, 200, 140]],  // Fresh Spring Green
    [198, [200, 230, 200]], // Pastel Sage
    [199, [180, 220, 170]], // Light Moss Green

    [52, [144, 238, 144]],  // Light Green
    [53, [152, 251, 152]],  // Pale Green
    [50, [0, 255, 127]],    // Spring Green
    [51, [127, 255, 0]],    // Chartreuse
    [17, [163, 230, 53]],   // Lime
    [54, [60, 179, 113]],   // Medium Sea Green
    [22, [46, 139, 87]],    // Sea Green
    [23, [34, 139, 34]],    // Forest Green
    [18, [22, 163, 74]],    // Green
    [19, [5, 150, 105]],    // Emerald
    [20, [13, 148, 136]],   // Teal
    [24, [0, 100, 0]],      // Dark Green
    [21, [128, 128, 0]],    // Olive
    // ==== Verdes Oscuros ====
    [180, [34, 139, 34]],   // Forest Green
    [181, [28, 120, 48]],   // Dark Leaf Green
    [182, [25, 105, 42]],   // Moss Green
    [183, [20, 90, 38]],    // Deep Emerald
    [184, [18, 77, 33]],    // Pine Green
    [185, [16, 65, 28]],    // Dark Pine
    [186, [14, 55, 25]],    // Evergreen
    [187, [12, 45, 22]],    // Midnight Green
    [188, [10, 35, 18]],    // Charcoal Green
    [189, [8, 25, 15]],     // Near Black Green

    // ==== Azules ====
    [28, [127, 255, 212]],  // Aquamarine
    [27, [64, 224, 208]],   // Turquoise
    [26, [34, 211, 238]],   // Cyan
    [25, [56, 189, 248]],   // Sky
    [29, [0, 191, 255]],    // Deep Sky Blue
    [62, [30, 144, 255]],   // Dodger Blue
    [59, [173, 216, 230]],  // Light Blue
    [58, [176, 224, 230]],  // Powder Blue
    [60, [70, 130, 180]],   // Steel Blue
    [61, [65, 105, 225]],   // Royal Blue
    [30, [37, 99, 235]],    // Blue
    [63, [0, 0, 205]],      // Medium Blue
    [31, [79, 70, 229]],    // Indigo
    [65, [123, 104, 238]],  // Medium Slate Blue
    [64, [106, 90, 205]],   // Slate Blue
    [32, [0, 0, 128]],      // Navy
    [104, [0, 49, 83]],     // Prussian Blue
    [109, [0, 33, 71]],     // Oxford Blue
    [108, [25, 25, 112]],   // Midnight Blue
    [105, [72, 61, 139]],   // Dark Slate Blue
    [106, [67, 70, 75]],    // Steel Navy
    [112, [57, 62, 70]],    // Cadet Navy
    [110, [42, 52, 57]],    // Gunmetal
    [107, [54, 69, 79]],    // Charcoal Blue
    [111, [29, 41, 81]],    // Space Cadet

    // ==== Violetas y púrpuras ====
    [240, [245, 240, 250]], // Lilac White (muy pálido)
    [241, [238, 230, 250]], // Soft Lilac
    [242, [230, 220, 250]], // Pastel Lilac
    [243, [216, 191, 216]], // Thistle Lilac
    [244, [200, 162, 200]], // Light Lilac
    [245, [186, 145, 200]], // Medium Lilac
    [246, [170, 125, 185]], // Classic Lilac
    [247, [155, 110, 175]], // Deep Lilac
    [248, [140, 95, 165]],  // Dark Lilac
    [249, [120, 80, 150]],  // Royal Lilac
    [250, [100, 65, 135]],  // Rich Lilac
    // ==== Lilas ====

    [38, [230, 230, 250]],  // Lavender
    [66, [216, 191, 216]],  // Thistle
    [37, [221, 160, 221]],  // Plum
    [35, [218, 112, 214]],  // Orchid
    [67, [186, 85, 211]],   // Medium Orchid
    [34, [147, 51, 234]],   // Purple
    [33, [124, 58, 237]],   // Violet
    [68, [153, 50, 204]],   // Dark Orchid
    [69, [148, 0, 211]],    // Dark Violet
    [70, [102, 51, 153]],   // Rebecca Purple



    // ==== Tierras y neutros cálidos ====
    [42, [245, 245, 220]],  // Beige
    [41, [210, 180, 140]],  // Tan
    [40, [160, 82, 45]],    // Sienna
    [39, [113, 63, 18]],    // Brown
    [232, [205, 133, 63]],  // Light Sienna
    [233, [139, 69, 19]],   // Dark Sienna
    [234, [210, 105, 30]],  // Chocolate Sienna
    [235, [255, 130, 71]],  // Bright Sienna (casi Coral)

    [236, [139, 69, 19]],   // Saddle Brown (oscuro intermedio)
    [237, [92, 51, 23]],    // Deep Brown (más oscuro que el base)
    [238, [77, 38, 17]],    // Coffee Brown
    [239, [65, 29, 15]],    // Almost Black Brown 2
    // ==== Marrones adicionales ==== 
    [217, [125, 100, 35]],  // Golden Brown
    [218, [140, 110, 40]],  // Ochre Brown
    [219, [160, 120, 45]],  // Warm Brown
    [220, [175, 130, 55]],  // Honey Brown
    [221, [145, 105, 35]],  // Caramel Brown
    [222, [120, 85, 25]],   // Deep Brown
    [223, [100, 70, 20]],   // Dark Earth Brown
    [224, [80, 60, 20]],    // Espresso Brown
    [225, [65, 50, 15]],    // Coffee Bean Brown
    [226, [50, 40, 10]],    // Ebony Brown
    [227, [35, 25, 10]],    // Almost Black Brown

    [71, [189, 183, 107]],  // Dark Khaki
    [72, [222, 184, 135]],  // Burly Wood
    [73, [245, 222, 179]],  // Wheat
    [74, [255, 248, 220]],  // Cornsilk
    [75, [255, 228, 181]],  // Moccasin
    [77, [255, 228, 196]],  // Bisque
    [76, [255, 218, 185]],  // Peach Puff
    [96, [251, 206, 177]],  // Apricot
    [97, [255, 218, 185]],  // Peach
    [78, [250, 235, 215]],  // Antique White
    [79, [250, 240, 230]],  // Linen
    [80, [253, 245, 230]],  // Old Lace
    [81, [255, 250, 240]],  // Floral White
    [82, [255, 255, 240]],  // Ivory

    // ==== Cremas ====
    [128, [255, 253, 208]], // Light Cream
    [129, [255, 250, 205]], // Lemon Chiffon
    [130, [255, 245, 225]], // Cream
    [131, [255, 239, 213]], // Papaya Cream
    [132, [253, 245, 230]], // Almond Cream
    [133, [255, 236, 179]], // Vanilla Cream
    [134, [255, 228, 196]], // Soft Cream
    [135, [250, 240, 190]], // Buttercream
    [136, [255, 245, 238]], // Seashell Cream
    [137, [255, 239, 184]], // Custard
    [138, [255, 233, 214]], // Peach Cream
    [139, [252, 243, 207]], // Pastel Cream
    // ==== Variaciones del Cream Pastel (base rgb(245, 237, 154)) ====
    [160, [250, 245, 180]], // Cream Light
    [161, [247, 240, 165]], // Cream Base (muy cercano al original)
    [162, [245, 237, 154]], // Cream Original
    [163, [238, 229, 145]], // Cream Slightly Darker
    [164, [230, 220, 130]], // Warm Cream
    [165, [222, 210, 120]], // Golden Cream
    [166, [210, 200, 110]], // Deep Cream
    [167, [255, 250, 200]], // Extra Light Cream
    [168, [253, 248, 185]], // Pastel Butter Cream
    [169, [252, 246, 170]], // Soft Lemon Cream

    // ==== Variaciones Oscuras del Cream Pastel (rgb(245, 237, 154)) ====
    [170, [230, 215, 130]], // Dark Cream
    [171, [215, 200, 115]], // Cream Ochre
    [172, [200, 185, 100]], // Mustard Cream
    [173, [185, 170, 85]],  // Golden Mustard
    [174, [170, 155, 70]],  // Warm Mustard
    [175, [155, 140, 60]],  // Toasted Cream
    [176, [140, 125, 50]],  // Olive Cream
    [177, [125, 110, 40]],  // Deep Mustard
    [178, [110, 95, 30]],   // Brownish Mustard
    [179, [95, 80, 25]],    // Dark Golden Brown


    // ==== Cremas Amarillentos (variaciones de rgb(240, 230, 140)) ====
    [140, [255, 255, 224]], // Light Khaki Cream
    [141, [250, 250, 210]], // Pale Light Cream
    [142, [240, 230, 140]], // Khaki Cream (base)
    [143, [238, 232, 170]], // Pale Golden Cream
    [144, [245, 245, 200]], // Warm Cream
    [145, [253, 253, 200]], // Soft Pastel Cream
    [146, [255, 239, 184]], // Honey Cream
    [147, [255, 236, 164]], // Golden Cream
    [148, [250, 240, 190]], // Pastel Beige Cream
    [149, [248, 244, 196]], // Butter Cream
    [150, [255, 245, 188]], // Sand Cream
    [151, [252, 242, 205]], // Eggshell Cream
    [152, [247, 236, 180]], // Light Mustard Cream


    // ==== Grises ====
    [48, [220, 220, 220]],  // Gainsboro
    [47, [209, 213, 219]],  // Light Gray
    [46, [192, 192, 192]],  // Silver
    [43, [107, 114, 128]],  // Gray
    [44, [105, 105, 105]],  // Dim Gray
    [94, [119, 136, 153]],  // Light Slate Gray
    [93, [112, 128, 144]],  // Slate Gray
    [45, [64, 64, 64]],     // Dark Gray

    [228, [59, 46, 125]],
    [229, [49, 42, 109]],
    [230, [230, 232, 249]],
    [231, [99, 98, 162]]
]);
