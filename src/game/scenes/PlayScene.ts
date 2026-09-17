import Phaser from "phaser";
import { ensureArt, ensureItemTexture } from "../art/createSprites";
import { closingSound, eatSound, hurtSound, successSound, warnSound } from "../audio/sfx";
import {
  CRAVING_GROWTH,
  EAT_RATIO,
  GROWTH_KEEP,
  HURT_COOLDOWN,
  MAX_ALERT,
  STALL_SIGHT,
  WORLD_H,
  WORLD_W,
} from "../constants";
import { Cat } from "../entities/Cat";
import { Edible } from "../entities/Edible";
import { Sweeper } from "../entities/Sweeper";
import { NightList } from "../systems/NightList";
import { alertStars, type EndReason, type RoundResult } from "../types";
import { spawnMarket } from "../world/spawnMarket";
import { paintStreet } from "../world/street";

export class PlayScene extends Phaser.Scene {
  private cat!: Cat;
  private items: Edible[] = [];
  private list!: NightList;
  private hurtWait = 0;
  private coach!: Phaser.GameObjects.Text;
  private stars!: Phaser.GameObjects.Text;
  private crumbs!: Phaser.GameObjects.Particles.ParticleEmitter;
  private hudCam!: Phaser.Cameras.Scene2D.Camera;
  private uiObjects: Phaser.GameObjects.GameObject[] = [];
  private pointerWorld = new Phaser.Math.Vector2();
  private ended = false;
  private sweeper?: Sweeper;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private pings: Phaser.GameObjects.Image[] = [];
  private pingT = 0;
  private courseIcons: Phaser.GameObjects.Image[] = [];

  constructor() {
    super("play");
  }

  create(): void {
    ensureArt(this);
    paintStreet(this);
    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
    this.cameras.main.fadeIn(400, 12, 8, 18);

    const rng = new Phaser.Math.RandomDataGenerator();
    this.list = new NightList(rng);
    this.items = spawnMarket(this, rng, this.list.courses);
    this.cat = new Cat(this, 280, WORLD_H * 0.62);

    this.crumbs = this.add.particles(0, 0, "px-crumb", {
      lifespan: 520,
      speed: { min: 50, max: 160 },
      scale: { start: 1.4, end: 0 },
      alpha: { start: 1, end: 0 },
      emitting: false,
      quantity: 10,
    });
    this.crumbs.setDepth(3000);

    const kb = this.input.keyboard;
    this.keys = kb ? (kb.addKeys("W,A,S,D,UP,DOWN,LEFT,RIGHT") as Record<string, Phaser.Input.Keyboard.Key>) : {};

    this.buildHud();
    this.cameras.main.startFollow(this.cat, true, 0.12, 0.12);
    this.hudCam = this.cameras.add(0, 0, this.scale.width, this.scale.height);
    this.hudCam.setScroll(0, 0);
    this.hudCam.transparent = true;
    this.bindCameras();
    this.scale.on("resize", (gameSize: Phaser.Structs.Size) => this.hudCam.setSize(gameSize.width, gameSize.height));
    this.updateHud();
    this.updateZoom();
  }

  update(_time: number, delta: number): void {
    const dt = Math.min(delta, 40) / 1000;
    this.hurtWait = Math.max(0, this.hurtWait - dt);
    this.pingT += dt;
    this.readMove(dt);
    this.cat.x = Phaser.Math.Clamp(this.cat.x, 70, WORLD_W - 70);
    this.cat.y = Phaser.Math.Clamp(this.cat.y, 220, WORLD_H - 70);
    this.spawnHunterIfNeeded();
    this.sweeper?.chase(this.cat, dt);
    this.resolveEats(dt);
    this.resolveSweeper();
    this.refreshPings();
    this.updateZoom();
    this.updateHud();
  }

  private buildHud(): void {
    const { width } = this.scale;
    this.list.courses.forEach((course, i) => {
      const icon = this.add.image(width / 2 - 70 + i * 70, 42, ensureItemTexture(this, course));
      icon.setScrollFactor(0).setDepth(5000).setScale(0.9);
      this.courseIcons.push(icon);
    });
    this.stars = this.add
      .text(width - 28, 24, "", {
        fontFamily: "Microsoft YaHei, PingFang SC, sans-serif",
        fontSize: "22px",
        color: "#ffb3b3",
        stroke: "#1a0c10",
        strokeThickness: 5,
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(5000);
    this.coach = this.add
      .text(width / 2, this.scale.height - 36, "", {
        fontFamily: "Microsoft YaHei, PingFang SC, sans-serif",
        fontSize: "22px",
        color: "#ffe7c2",
        stroke: "#1a0c10",
        strokeThickness: 6,
      })
      .setOrigin(0.5, 1)
      .setScrollFactor(0)
      .setDepth(5000);
    this.uiObjects = [...this.courseIcons, this.stars, this.coach];
  }

  private readMove(dt: number): void {
    let ix = 0;
    let iy = 0;
    if (this.keys.A?.isDown || this.keys.LEFT?.isDown) ix -= 1;
    if (this.keys.D?.isDown || this.keys.RIGHT?.isDown) ix += 1;
    if (this.keys.W?.isDown || this.keys.UP?.isDown) iy -= 1;
    if (this.keys.S?.isDown || this.keys.DOWN?.isDown) iy += 1;
    if (ix === 0 && iy === 0 && this.input.activePointer.isDown) {
      this.cameras.main.getWorldPoint(this.input.activePointer.x, this.input.activePointer.y, this.pointerWorld);
      ix = this.pointerWorld.x - this.cat.x;
      iy = this.pointerWorld.y - this.cat.y;
    }
    this.cat.steer(ix, iy, dt);
  }

  private watchingStallNear(item: Edible): Edible | undefined {
    return this.items.find(
      (stall) =>
        stall.def.tier === "stall" &&
        !stall.eaten &&
        stall.watching &&
        Math.hypot(stall.x - item.x, stall.y - item.y) < STALL_SIGHT,
    );
  }

  private spawnHunterIfNeeded(): void {
    if (this.sweeper || this.list.alert < 2) return;
    this.sweeper = new Sweeper(this, this.cat.x > WORLD_W / 2 ? 80 : WORLD_W - 80, this.cat.y);
    this.hudCam.ignore(this.sweeper);
    warnSound();
  }

  private resolveSweeper(): void {
    if (!this.sweeper || this.ended) return;
    const dx = this.sweeper.x - this.cat.x;
    const dy = this.sweeper.y - this.cat.y;
    const dist = Math.hypot(dx, dy);
    if (dist > this.cat.radius + this.sweeper.radius * 0.55) return;
    if (this.cat.radius > this.sweeper.radius * EAT_RATIO) {
      this.cat.growBy(this.sweeper.radius * this.sweeper.radius * Math.PI * GROWTH_KEEP, "收摊车", this.sweeper.radius);
      this.sweeper.destroy();
      this.sweeper = undefined;
      this.list.alert = Math.max(0, this.list.alert - 1);
      eatSound(80);
      return;
    }
    if (this.list.alert >= MAX_ALERT) {
      this.finish("caught");
      return;
    }
    if (this.hurtWait > 0) return;
    const inv = dist === 0 ? 1 : 1 / dist;
    this.cat.bounceFrom(-dx * inv, -dy * inv, 46);
    this.list.raise(1);
    this.hurtWait = HURT_COOLDOWN;
    hurtSound();
  }

  private resolveEats(dt: number): void {
    for (const item of this.items) {
      if (item.eaten) continue;
      item.wander(dt);
      const dx = item.x - this.cat.x;
      const dy = item.y - this.cat.y;
      const dist = Math.hypot(dx, dy);
      if (dist > this.cat.radius + item.radius * 0.12) continue;
      if (this.cat.radius > item.radius * EAT_RATIO) this.trySwallow(item);
      else if (item.radius > this.cat.radius * 1.15) {
        const inv = dist === 0 ? 1 : 1 / dist;
        this.cat.bounceFrom(-dx * inv, -dy * inv, 22);
      }
    }
  }

  private trySwallow(item: Edible): void {
    const risky = item.def.tier === "ware" || item.def.tier === "stall" || this.list.isTarget(item.def);
    const seen = risky ? this.watchingStallNear(item) : undefined;
    if (seen) {
      const dx = item.x - this.cat.x;
      const dy = item.y - this.cat.y;
      const dist = Math.hypot(dx, dy) || 1;
      this.cat.bounceFrom(-dx / dist, -dy / dist, 36);
      this.list.raise(1);
      this.hurtWait = HURT_COOLDOWN;
      this.flash("被看见了！等绿灯");
      hurtSound();
      return;
    }

    item.eaten = true;
    const target = this.list.isTarget(item.def);
    const keep = target ? CRAVING_GROWTH : item.def.tier === "snack" ? GROWTH_KEEP : GROWTH_KEEP * 0.7;
    this.cat.growBy(item.area * keep, item.def.name, item.radius, item.def.tier === "landmark");
    this.crumbs.emitParticleAt(item.x, item.y, 12);
    this.cameras.main.shake(80, 0.006);
    this.tweens.add({ targets: item, scale: 0, alpha: 0, duration: 160, onComplete: () => item.destroy() });

    if (item.def.tier === "landmark") {
      this.finish("king");
      return;
    }
    if (target) {
      successSound();
      this.list.succeed();
      this.flash("偷到了！");
      if (this.list.done) this.finish("win");
      return;
    }
    eatSound(item.radius);
  }

  private flash(text: string): void {
    const label = this.add
      .text(this.cat.x, this.cat.y - this.cat.radius - 20, text, {
        fontFamily: "Microsoft YaHei, PingFang SC, sans-serif",
        fontSize: "22px",
        color: "#ffe7c2",
        stroke: "#1a0c10",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setDepth(4000);
    this.hudCam.ignore(label);
    this.tweens.add({ targets: label, y: label.y - 32, alpha: 0, duration: 700, onComplete: () => label.destroy() });
  }

  private refreshPings(): void {
    const name = this.list.current?.name;
    const live = this.items.filter((item) => !item.eaten && item.def.name === name);
    while (this.pings.length < live.length) {
      const ping = this.add.image(0, 0, "px-ping").setDepth(2500).setScale(2.2);
      this.hudCam.ignore(ping);
      this.pings.push(ping);
    }
    this.pings.forEach((ping, i) => {
      const item = live[i];
      ping.setVisible(!!item);
      if (item) ping.setPosition(item.x, item.y - item.radius - 18 + Math.sin(this.pingT * 6) * 5);
    });
  }

  private updateZoom(): void {
    const zoom = Phaser.Math.Clamp(110 / this.cat.radius, 0.55, 1.15);
    this.cameras.main.setZoom(Phaser.Math.Linear(this.cameras.main.zoom, zoom, 0.08));
  }

  private updateHud(): void {
    this.courseIcons.forEach((icon, i) => {
      icon.setAlpha(i < this.list.index ? 0.28 : 1);
      icon.setScale(i === this.list.index ? 1.05 + Math.sin(this.pingT * 5) * 0.08 : 0.85);
    });
    this.stars.setText(alertStars(this.list.alert));
    this.coach.setText(
      this.cat.eaten === 0
        ? "WASD 走到发光的小吃上"
        : this.list.completed === 0
          ? "绿灯再偷金色箭头那一口，红灯会被看见"
          : this.sweeper
            ? "摊主追来了，躲开"
            : "",
    );
  }

  private finish(reason: EndReason): void {
    if (this.ended) return;
    this.ended = true;
    closingSound();
    const result: RoundResult = {
      eaten: this.cat.eaten,
      radius: this.cat.radius,
      biggestName: this.cat.biggestName,
      remaining: this.items.filter((item) => !item.eaten).length,
      ateArch: this.cat.ateArch,
      reason,
      completed: this.list.completed,
      alert: this.list.alert,
      courses: this.list.courses.map((course) => course.name),
    };
    this.scene.start("result", result);
  }

  private bindCameras(): void {
    this.cameras.main.ignore(this.uiObjects);
    this.hudCam.ignore(this.children.list.filter((obj) => !this.uiObjects.includes(obj)));
  }
}
