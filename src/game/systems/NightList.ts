import Phaser from "phaser";
import { SNACKS, STALLS, WARES, type ItemDef } from "../data/catalog";

export class NightList {
  readonly courses: ItemDef[];
  index = 0;
  alert = 0;
  completed = 0;

  constructor(rng: Phaser.Math.RandomDataGenerator) {
    this.courses = [
      SNACKS[rng.integerInRange(0, SNACKS.length - 1)],
      WARES[rng.integerInRange(0, WARES.length - 1)],
      STALLS[rng.integerInRange(0, STALLS.length - 1)],
    ];
  }

  get current(): ItemDef | undefined {
    return this.courses[this.index];
  }

  get done(): boolean {
    return this.index >= this.courses.length;
  }

  isTarget(def: ItemDef): boolean {
    return this.current?.name === def.name;
  }

  succeed(): void {
    this.completed += 1;
    this.index += 1;
    this.alert = Math.max(0, this.alert - 1);
  }

  raise(amount = 1): void {
    this.alert = Math.min(3, this.alert + amount);
  }
}
