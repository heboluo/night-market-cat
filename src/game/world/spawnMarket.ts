import Phaser from "phaser";
import { LANDMARKS, SNACKS, STALLS, VEHICLES, WARES, type ItemDef } from "../data/catalog";
import { Edible } from "../entities/Edible";
import { WORLD_SIZE } from "../constants";

function pick<T>(rng: Phaser.Math.RandomDataGenerator, list: T[]): T {
  return list[rng.integerInRange(0, list.length - 1)];
}

function jitter(rng: Phaser.Math.RandomDataGenerator, base: number, amount: number): number {
  return base * rng.realInRange(1 - amount, 1 + amount);
}

function make(scene: Phaser.Scene, x: number, y: number, def: ItemDef, rng: Phaser.Math.RandomDataGenerator): Edible {
  const radius = jitter(rng, def.radius, 0.1);
  return new Edible(scene, x, y, def, radius);
}

export function spawnMarket(scene: Phaser.Scene, rng: Phaser.Math.RandomDataGenerator): Edible[] {
  const items: Edible[] = [];
  const pad = 280;
  const spacing = 520;
  const center = WORLD_SIZE / 2;

  for (let i = 0; i < 8; i++) {
    const ang = (Math.PI * 2 * i) / 8;
    const dist = rng.between(70, 120);
    items.push(make(scene, center + Math.cos(ang) * dist, center + Math.sin(ang) * dist, pick(rng, SNACKS), rng));
  }
  for (let i = 0; i < 6; i++) {
    const ang = rng.realInRange(0, Math.PI * 2);
    const dist = rng.between(140, 220);
    items.push(make(scene, center + Math.cos(ang) * dist, center + Math.sin(ang) * dist, WARES[1], rng));
  }

  for (let x = pad; x < WORLD_SIZE - pad; x += spacing) {
    for (let y = pad; y < WORLD_SIZE - pad; y += spacing) {
      if (Math.abs(x - center) < 200 && Math.abs(y - center) < 200) continue;
      const stall = make(scene, x + rng.between(-40, 40), y + rng.between(-40, 40), pick(rng, STALLS), rng);
      items.push(stall);

      const around = rng.between(3, 5);
      for (let i = 0; i < around; i++) {
        const ang = rng.realInRange(0, Math.PI * 2);
        const dist = rng.between(80, 180);
        items.push(make(scene, stall.x + Math.cos(ang) * dist, stall.y + Math.sin(ang) * dist, pick(rng, SNACKS), rng));
      }

      if (rng.frac() > 0.4) {
        items.push(make(scene, stall.x + rng.between(-90, 90), stall.y + rng.between(80, 140), pick(rng, WARES), rng));
      }
      if (rng.frac() > 0.55) {
        const bike = make(scene, stall.x + rng.between(-180, 180), stall.y + rng.between(-40, 40), pick(rng, VEHICLES), rng);
        bike.vx = (rng.frac() < 0.5 ? -1 : 1) * rng.between(90, 140);
        items.push(bike);
      }
    }
  }

  items.push(new Edible(scene, center, 520, LANDMARKS[0], LANDMARKS[0].radius));
  return items;
}

export function paintGround(scene: Phaser.Scene): void {
  scene.add.tileSprite(0, 0, WORLD_SIZE, WORLD_SIZE, "px-ground").setOrigin(0, 0).setDepth(0);
  for (let x = 180; x < WORLD_SIZE; x += 520) {
    scene.add.tileSprite(x, WORLD_SIZE / 2, 128, WORLD_SIZE, "px-road").setDepth(1);
  }
  for (let y = 180; y < WORLD_SIZE; y += 520) {
    scene.add.tileSprite(WORLD_SIZE / 2, y, WORLD_SIZE, 128, "px-road").setDepth(1);
  }
}
