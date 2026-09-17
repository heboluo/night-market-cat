export interface RoundResult {
  eaten: number;
  radius: number;
  biggestName: string;
  remaining: number;
}

export function formatSize(radius: number): string {
  if (radius < 40) return "还是小猫";
  if (radius < 70) return "街口一霸";
  if (radius < 110) return "摊位克星";
  if (radius < 160) return "夜市传说";
  return "能吞牌坊";
}
