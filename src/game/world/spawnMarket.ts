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
  const radius = jitter(rng, def.radius, 0.12);
  return new Edible(scene, x, y, def, radius);
}

export function spawnMarket(scene: Phaser.Scene, rng: Phaser.Math.RandomDataGenerator): Edible[] {
  const items: Edible[] = [];
  const pad = 280;
  const spacing = 520;

  for (let x = pad; x < WORLD_SIZE - pad; x += spacing) {
    for (let y = pad; y < WORLD_SIZE - pad; y += spacing) {
      if (Math.abs(x - WORLD_SIZE / 2) < 180 && Math.abs(y - WORLD_SIZE / 2) < 180) continue;
      const stall = make(scene, x + rng.between(-40, 40), y + rng.between(-40, 40), pick(rng, STALLS), rng);
      items.push(stall);

      const around = rng.between(5, 8);
      for (let i = 0; i < around; i++) {
        const ang = rng.realInRange(0, Math.PI * 2);
        const dist = rng.between(70, 170);
        const snack = make(scene, stall.x + Math.cos(ang) * dist, stall.y + Math.sin(ang) * dist, pick(rng, SNACKS), rng);
        items.push(snack);
      }

      if (rng.frac() > 0.35) {
        items.push(make(scene, stall.x + rng.between(-90, 90), stall.y + rng.between(80, 140), pick(rng, WARES), rng));
      }
      if (rng.frac() > 0.72) {
        items.push(make(scene, stall.x + rng.between(-160, 160), stall.y + rng.between(-160, 160), pick(rng, VEHICLES), rng));
      }
    }
  }

  items.push(new Edible(scene, WORLD_SIZE / 2, 520, LANDMARKS[0], LANDMARKS[0].radius));

  for (let i = 0; i < 40; i++) {
    items.push(
      make(
        scene,
        rng.between(pad, WORLD_SIZE - pad),
        rng.between(pad, WORLD_SIZE - pad),
        pick(rng, SNACKS),
        rng,
      ),
    );
  }

  return items;
}

export function paintGround(scene: Phaser.Scene): void {
  const g = scene.add.graphics().setDepth(0);
  g.fillStyle(0x140c18, 1);
  g.fillRect(0, 0, WORLD_SIZE, WORLD_SIZE);

  g.fillStyle(0x24161f, 1);
  for (let x = 180; x < WORLD_SIZE; x += 520) {
    g.fillRect(x - 70, 0, 140, WORLD_SIZE);
  }
  for (let y = 180; y < WORLD_SIZE; y += 520) {
    g.fillRect(0, y - 70, WORLD_SIZE, 140);
  }

  g.lineStyle(3, 0x3a2430, 0.5);
  for (let i = 240; i < WORLD_SIZE; i += 80) {
    g.lineBetween(i, 0, i, WORLD_SIZE);
    g.lineBetween(0, i, WORLD_SIZE, i);
  }

  for (let i = 0; i < 90; i++) {
    const x = Phaser.Math.Between(40, WORLD_SIZE - 40);
    const y = Phaser.Math.Between(40, WORLD_SIZE - 40);
    g.fillStyle(0xffb35a, Phaser.Math.FloatBetween(0.04, 0.12));
    g.fillCircle(x, y, Phaser.Math.Between(6, 18));
  }
}
