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

function make(
  scene: Phaser.Scene,
  x: number,
  y: number,
  def: ItemDef,
  rng: Phaser.Math.RandomDataGenerator,
  phase = 0,
  startWatching = false,
): Edible {
  return new Edible(scene, x, y, def, jitter(rng, def.radius, 0.05), phase, startWatching);
}

export function spawnMarket(scene: Phaser.Scene, rng: Phaser.Math.RandomDataGenerator, courses: ItemDef[]): Edible[] {
  const items: Edible[] = [];
  const streetY = STREET_Y;
  const slots = [420, 700, 980, 1260, 1540];

  const starter = make(scene, 250, streetY + 6, SNACKS[0], rng);
  starter.markStarter();
  items.push(starter);

  slots.forEach((x, i) => {
    const north = i % 2 === 0;
    const row = north ? streetY - 58 : streetY + 52;
    const stall = make(scene, x, row, pick(rng, STALLS), rng, i * 0.4, i === 0);
    items.push(stall);
    for (let n = 0; n < 3; n++) {
      const ox = rng.between(-36, 36);
      const oy = rng.between(22, 40) * (north ? 1 : -1);
      const snack = make(scene, stall.x + ox, stall.y + oy, pick(rng, SNACKS.slice(1)), rng, n * 0.5);
      snack.parentStall = stall;
      items.push(snack);
    }
    const ware = make(scene, stall.x + rng.between(-20, 20), stall.y + (north ? 40 : -40), pick(rng, WARES), rng);
    ware.parentStall = stall;
    items.push(ware);
    if (i % 2 === 1) {
      const bike = make(scene, x + 50, streetY + 10, pick(rng, VEHICLES), rng);
      bike.vx = rng.frac() < 0.5 ? -80 : 80;
      items.push(bike);
    }
  });

  const stalls = items.filter((item) => item.def.tier === "stall");
  courses.forEach((course, i) => {
    const stall = stalls[Math.min(i, stalls.length - 1)];
    const target = make(scene, stall.x + 28, streetY + (i === 0 ? 8 : i === 1 ? -12 : 0), course, rng);
    if (course.tier !== "stall") target.parentStall = stall;
    items.push(target);
  });

  items.push(new Edible(scene, WORLD_W - 90, streetY - 36, LANDMARKS[0], LANDMARKS[0].radius));
  return items;
}
