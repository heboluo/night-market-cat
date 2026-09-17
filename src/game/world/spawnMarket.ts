import Phaser from "phaser";
import { LANDMARKS, SNACKS, STALLS, VEHICLES, WARES, type ItemDef } from "../data/catalog";
import { Edible } from "../entities/Edible";
import { WORLD_W, STREET_Y } from "../constants";

function pick<T>(rng: Phaser.Math.RandomDataGenerator, list: T[]): T {
  return list[rng.integerInRange(0, list.length - 1)];
}

function jitter(rng: Phaser.Math.RandomDataGenerator, base: number, amount: number): number {
  return base * rng.realInRange(1 - amount, 1 + amount);
}

function make(scene: Phaser.Scene, x: number, y: number, def: ItemDef, rng: Phaser.Math.RandomDataGenerator, phase = 0): Edible {
  return new Edible(scene, x, y, def, jitter(rng, def.radius, 0.06), phase);
}

export function spawnMarket(scene: Phaser.Scene, rng: Phaser.Math.RandomDataGenerator, courses: ItemDef[]): Edible[] {
  const items: Edible[] = [];
  const streetY = STREET_Y;
  const slots = [460, 780, 1100, 1420, 1740, 2060];

  const starter = make(scene, 340, streetY + 8, SNACKS[0], rng);
  starter.markStarter();
  items.push(starter);
  for (let n = 0; n < 3; n++) {
    items.push(make(scene, 300 + n * 36, streetY + 52, pick(rng, SNACKS), rng, n));
  }

  slots.forEach((x, i) => {
    const north = i % 2 === 0;
    const row = north ? streetY - 96 : streetY + 118;
    const stall = make(scene, x, row, pick(rng, STALLS), rng, i * 0.37);
    items.push(stall);
    for (let n = 0; n < 5; n++) {
      const ox = rng.between(-78, 78);
      const oy = rng.between(42, 92) * (north ? 1 : -1);
      const snack = make(scene, stall.x + ox, stall.y + oy, pick(rng, SNACKS), rng, n * 0.4);
      snack.parentStall = stall;
      items.push(snack);
    }
    const ware = make(scene, stall.x + rng.between(-40, 40), stall.y + (north ? 78 : -78), pick(rng, WARES), rng);
    ware.parentStall = stall;
    items.push(ware);
    if (i % 2 === 1) {
      const bike = make(scene, x + 90, streetY + 24, pick(rng, VEHICLES), rng);
      bike.vx = rng.frac() < 0.5 ? -120 : 120;
      items.push(bike);
    }
  });

  courses.forEach((course, i) => {
    const stall = items.filter((item) => item.def.tier === "stall")[Math.min(i + 1, 5)];
    const x = stall.x + rng.between(-24, 24);
    const y = streetY + (i === 0 ? 36 : i === 1 ? -28 : 8);
    const target = make(scene, x, y, course, rng);
    if (course.tier !== "stall") target.parentStall = stall;
    items.push(target);
  });

  items.push(new Edible(scene, WORLD_W - 210, streetY - 70, LANDMARKS[0], LANDMARKS[0].radius));
  return items;
}
