export type EndReason = "caught" | "win" | "king";

export interface RoundResult {
  eaten: number;
  radius: number;
  biggestName: string;
  remaining: number;
  ateArch: boolean;
  reason: EndReason;
  completed: number;
  alert: number;
  courses: string[];
}

export function formatSize(radius: number): string {
  if (radius < 40) return "还是小猫";
  if (radius < 70) return "街口一霸";
  if (radius < 110) return "摊位克星";
  if (radius < 160) return "夜市传说";
  return "能吞牌坊";
}

export function formatRank(result: RoundResult): string {
  if (result.reason === "king" || result.ateArch) return "夜市之王";
  if (result.reason === "win") return "今晚吃饱了";
  if (result.reason === "caught") return "被摊主抓住了";
  return formatSize(result.radius);
}

export function alertStars(alert: number): string {
  return "★".repeat(alert) + "☆".repeat(Math.max(0, 3 - alert));
}
