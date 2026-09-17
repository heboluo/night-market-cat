/** Night-market ramp: shadows go cool, highlights go warm. */
export const INK = 0x1a1024;
export const NIGHT = 0x16101c;
export const ROAD = 0x2a1c26;
export const STONE = 0x3c2a32;
export const STONE_HI = 0x4a3840;
export const ORANGE = 0xe8893a;
export const ORANGE_HI = 0xffc56a;
export const ORANGE_SH = 0x8a3a52;
export const CREAM = 0xffe6c4;
export const PINK = 0xff8aa0;
export const GOLD = 0xffd36a;
export const WHITE = 0xfff6ea;
export const NOSE = 0xe07070;
export const WOOD = 0x6b3226;
export const WOOD_HI = 0x8a4a32;

export function rgb(color: number): [number, number, number] {
  return [(color >> 16) & 255, (color >> 8) & 255, color & 255];
}

export function lighten(color: number, t = 0.28): number {
  const [r, g, b] = rgb(color);
  return ((r + (255 - r) * t) << 16) | ((g + (255 - g) * t) << 8) | (b + (255 - b) * t);
}

export function hueShadow(color: number): number {
  const [r, g, b] = rgb(color);
  return (Math.floor(r * 0.55) << 16) | (Math.floor(g * 0.38) << 8) | Math.min(255, Math.floor(b * 0.7) + 28);
}
