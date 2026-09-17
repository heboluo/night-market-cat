export type ItemTier = "snack" | "ware" | "stall" | "vehicle" | "landmark";
export type ItemShape = "round" | "box" | "bowl" | "lantern" | "stall" | "scooter" | "arch";

export interface ItemDef {
  name: string;
  tier: ItemTier;
  radius: number;
  color: number;
  accent: number;
  shape: ItemShape;
}

export const SNACKS: ItemDef[] = [
  { name: "小鱼丸", tier: "snack", radius: 14, color: 0xf3d3a0, accent: 0xe8896a, shape: "round" },
  { name: "烤肠", tier: "snack", radius: 16, color: 0xe36b4e, accent: 0x8b2a22, shape: "box" },
  { name: "臭豆腐", tier: "snack", radius: 15, color: 0x6c5a3a, accent: 0x2d2114, shape: "box" },
  { name: "糖葫芦", tier: "snack", radius: 13, color: 0xc62828, accent: 0xffd54f, shape: "round" },
  { name: "珍珠奶茶", tier: "snack", radius: 17, color: 0x8d6e4c, accent: 0xf5d0c5, shape: "bowl" },
  { name: "章鱼小丸子", tier: "snack", radius: 15, color: 0xd9a066, accent: 0x5d3a1a, shape: "round" },
  { name: "烤鱿鱼", tier: "snack", radius: 16, color: 0xd7b899, accent: 0x7a3e2b, shape: "box" },
  { name: "炒板栗", tier: "snack", radius: 12, color: 0x8a4b22, accent: 0xe6c07b, shape: "round" },
];

export const WARES: ItemDef[] = [
  { name: "小板凳", tier: "ware", radius: 32, color: 0xc48a4a, accent: 0x6b3f1f, shape: "box" },
  { name: "灯笼", tier: "ware", radius: 28, color: 0xff8a3d, accent: 0xffe08a, shape: "lantern" },
  { name: "蒸笼", tier: "ware", radius: 34, color: 0xd8b07a, accent: 0x8a5a32, shape: "bowl" },
  { name: "花盆", tier: "ware", radius: 30, color: 0x5d8a5a, accent: 0xc45a4a, shape: "bowl" },
  { name: "纸箱", tier: "ware", radius: 33, color: 0xc4a574, accent: 0x7a6240, shape: "box" },
];

export const STALLS: ItemDef[] = [
  { name: "烧烤摊", tier: "stall", radius: 78, color: 0x6b3226, accent: 0xff9a4a, shape: "stall" },
  { name: "面摊", tier: "stall", radius: 74, color: 0x4a3b2a, accent: 0xe8d2a0, shape: "stall" },
  { name: "糖水摊", tier: "stall", radius: 70, color: 0x5a2a44, accent: 0xffb7c5, shape: "stall" },
  { name: "杂货摊", tier: "stall", radius: 80, color: 0x3d4a3a, accent: 0xc9e29a, shape: "stall" },
];

export const VEHICLES: ItemDef[] = [
  { name: "电动车", tier: "vehicle", radius: 58, color: 0x3a4458, accent: 0xffd166, shape: "scooter" },
];

export const LANDMARKS: ItemDef[] = [
  { name: "夜市牌坊", tier: "landmark", radius: 160, color: 0x8b1e1e, accent: 0xffd54f, shape: "arch" },
];
