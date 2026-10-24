/**
 * Code 128 / High-density barcode SVG generator
 */

// Pattern table for Code 128 Subset B (simplified robust generator for alpha-numeric codes)
const CODE128_PATTERNS: { [key: number]: string } = {
  0: "212222", 1: "222122", 2: "222221", 3: "121223", 4: "121322",
  5: "131222", 6: "122213", 7: "122312", 8: "132212", 9: "221213",
  10: "221312", 11: "231212", 12: "112232", 13: "122132", 14: "122231",
  15: "113222", 16: "123122", 17: "123221", 18: "223211", 19: "221132",
  20: "221231", 21: "213212", 22: "223112", 23: "312131", 24: "311222",
  25: "321122", 26: "321221", 27: "312212", 28: "322112", 29: "322211",
  30: "212123", 31: "212321", 32: "232121", 33: "111323", 34: "131123",
  35: "131321", 36: "112313", 37: "132113", 38: "132311", 39: "211313",
  40: "231113", 41: "231311", 42: "112133", 43: "112331", 44: "132131",
  45: "113123", 46: "113321", 47: "133121", 48: "313121", 49: "211331",
  50: "231131", 51: "213113", 52: "213311", 53: "213131", 54: "311123",
  55: "311321", 56: "331121", 57: "312113", 58: "312311", 59: "332111",
  60: "314111", 61: "221411", 62: "431111", 63: "111224", 64: "111422",
  65: "121124", 66: "121421", 67: "141122", 68: "141221", 69: "112214",
  70: "112412", 71: "122114", 72: "122411", 73: "142112", 74: "142211",
  75: "241211", 76: "221114", 77: "413111", 78: "241112", 79: "134111",
  80: "111242", 81: "121142", 82: "121241", 83: "114212", 84: "124112",
  85: "124211", 86: "411212", 87: "421112", 88: "421211", 89: "212141",
  90: "214121", 91: "412121", 92: "111143", 93: "111341", 94: "131141",
  95: "114113", 96: "114311", 97: "411113", 98: "411311", 99: "113141",
  100: "114131", 101: "311141", 102: "411131", // START B: 104
  103: "211412", 104: "211214", 105: "211232", 106: "2331112" // STOP
};

export function generateBarcodeSVG(code: string, width = 240, height = 70): string {
  // Clean string to ASCII 32 - 126
  const clean = code.trim().toUpperCase() || 'BHP-001';
  const startCode = 104; // Start B
  const codes: number[] = [startCode];
  
  let checksum = startCode;
  for (let i = 0; i < clean.length; i++) {
    const charCode = clean.charCodeAt(i) - 32;
    const validCode = (charCode >= 0 && charCode <= 95) ? charCode : 0;
    codes.push(validCode);
    checksum += validCode * (i + 1);
  }
  
  const checkDigit = checksum % 103;
  codes.push(checkDigit);
  codes.push(106); // Stop code

  // Build pattern
  let fullPattern = "";
  for (const c of codes) {
    fullPattern += CODE128_PATTERNS[c] || "212222";
  }

  // Calculate total modules
  let totalModules = 0;
  for (let i = 0; i < fullPattern.length; i++) {
    totalModules += parseInt(fullPattern[i], 10);
  }

  const quietZone = 10;
  const grandTotal = totalModules + (quietZone * 2);
  const moduleWidth = width / grandTotal;

  let currentX = quietZone * moduleWidth;
  let isBar = true;
  const bars: string[] = [];

  for (let i = 0; i < fullPattern.length; i++) {
    const w = parseInt(fullPattern[i], 10) * moduleWidth;
    if (isBar) {
      bars.push(`<rect x="${currentX.toFixed(2)}" y="0" width="${w.toFixed(2)}" height="${height - 20}" fill="#0f172a" />`);
    }
    currentX += w;
    isBar = !isBar;
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" class="w-full h-auto">
      <rect width="100%" height="100%" fill="#ffffff"/>
      <g>
        ${bars.join('\n')}
      </g>
      <text x="${width / 2}" y="${height - 4}" font-family="monospace, Courier" font-size="11" font-weight="700" text-anchor="middle" fill="#1e293b" letter-spacing="2">
        ${clean}
      </text>
    </svg>
  `;
}
