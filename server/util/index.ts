import Vibrant from "node-vibrant";

export const SALT_ROUNDS = 10;

const getTextColor = (hexColor: string): string => {
  // Convert hex color to RGB
  const rgb = hexToRgb(hexColor);

  // Calculate luminance
  const luminance = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;

  // Determine suitable text color based on luminance
  return luminance > 128 ? "black" : "white";
};

// Function to convert hex color to RGB
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const bigint = parseInt(hex.slice(1), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
};

export const extractBgColorsFromImage = async (imageUrl: string) => {
  const palette = await Vibrant.from(imageUrl).getPalette();
  const vibrantColor = palette.Vibrant?.hex;
  const mutedColor = palette.Muted?.hex;
  const textColor = getTextColor(vibrantColor || "");

  return { mutedColor, vibrantColor, textColor };
};

export const groupBy = <T extends Record<string | number, any>>(
  array: T[],
  property: keyof T
): Record<string | number, T> => {
  return array.reduce((acc: Record<string | number, T>, obj: T) => {
    const key = obj[property];
    if (!acc[key]) {
      acc[key] = obj;
    }
    return acc;
  }, {} as Record<string | number, T>);
};
