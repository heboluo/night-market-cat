import Phaser from "phaser";
import { LANDMARKS, SNACKS, STALLS, VEHICLES, WARES, type ItemDef } from "../data/catalog";
import { Edible } from "../entities/Edible";
import { WORLD_H, WORLD_W } from "../constants";

function pick<T>(rng: Phaser.Math.RandomDataGenerator, list: T[]): T {
  return list[rng.integerInRange(0, list.length - 1)];
}

function jitter(rng: Phaser.Math.RandomDataGenerator, base: number, amount: number): number {
  return base * rng.realInRange(1 - amount, 1 + amount);
}

function make(scene: Phaser.Scene, x: number, y: number, def: ItemDef, rng: Phaser.Math.RandomDataGenerator, look = 1.8): Edible {
  return new Edible(scene, x, y, def, jitter(rng, def.radius, 0.08), look);
}

export function spawnMarket(scene: Phaser.Scene, rng: Phaser.Math.RandomDataGenerator, courses: ItemDef[]): Edible[] {
  const items: Edible[] = [];
  const streetY = WORLD_H * 0.62;
  const slots = [380, 680, 980, 1280, 1580, 1880];

  items.push(make(scene, 280, streetY + 20, SNACKS[0], rng));

  slots.forEach((x, i) => {
    const row = i % 2 === 0 ? streetY - 90 : streetY + 110;
    const stall = make(scene, x, row, pick(rng, STALLS), rng, 1.5 + i * 0.12);
    items.push(stall);
    for (let n = 0; n < 4; n++) {
      const ox = rng.between(-70, 70);
      const oy = rng.between(50, 90) * (row > streetY ? -1 : 1);
      items.push(make(scene, stall.x + ox, stall.y + oy, pick(rng, SNACKS), rng));
    }
    items.push(make(scene, stall.x + rng.between(-50, 50), stall.y + (row > streetY ? -70 : 70), pick(rng, WARES), rng));
    if (i % 2 === 1) {
      const bike = make(scene, x + 80, streetY + 20, pick(rng, VEHICLES), rng);
      bike.vx = rng.frac() < 0.5 ? -110 : 110;
      items.push(bike);
    }
  });

  courses.forEach((course, i) => {
    const x = slots[Math.min(i + 1, slots.length - 1)] + rng.between(-30, 30);
    const y = streetY + (i === 0 ? 40 : i === 1 ? -40 : 0);
    items.push(make(scene, x, y, course, rng));
  });

  items.push(new Edible(scene, WORLD_W - 180, 280, LANDMARKS[0], LANDMARKS[0].radius));
  return items;
}
