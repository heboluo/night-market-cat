export type EndReason = "time" | "hungry" | "swept";

export interface RoundResult {
  eaten: number;
  radius: number;
  biggestName: string;
  remaining: number;
  ateArch: boolean;
  reason: EndReason;
}

export function formatSize(radius: number): string {
  if (radius < 40) return "还是小猫";
  if (radius < 70) return "街口一霸";
  if (radius < 110) return "摊位克星";
  if (radius < 160) return "夜市传说";
  return "能吞牌坊";
}

export function formatRank(result: RoundResult): string {
  if (result.ateArch) return "夜市之王";
  if (result.reason === "hungry") return "饿扁了";
  if (result.reason === "swept") return "被收摊车撞回去了";
  return formatSize(result.radius);
}
