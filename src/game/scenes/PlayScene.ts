import Phaser from "phaser";
import { ensureArt, ensureItemTexture } from "../art/createSprites";
import { closingSound, eatSound, hurtSound, successSound, warnSound } from "../audio/sfx";
import { CRAVING_GROWTH, EAT_RATIO, GROWTH_KEEP, HURT_COOLDOWN, MAX_ALERT, STREET_Y, WORLD_H, WORLD_W } from "../constants";
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
    this.cameras.main.setZoom(1);
    this.cameras.main.fadeIn(280, 12, 8, 18);

    const rng = new Phaser.Math.RandomDataGenerator();
    this.list = new NightList(rng);
    this.items = spawnMarket(this, rng, this.list.courses);
    this.cat = new Cat(this, 170, STREET_Y);

    this.crumbs = this.add.particles(0, 0, "px-crumb", {
      lifespan: 420,
      speed: { min: 30, max: 90 },
      scale: { start: 1.2, end: 0 },
      alpha: { start: 1, end: 0 },
      emitting: false,
      quantity: 8,
    });
    this.crumbs.setDepth(3000);

    const kb = this.input.keyboard;
    this.keys = kb ? (kb.addKeys("W,A,S,D,UP,DOWN,LEFT,RIGHT") as Record<string, Phaser.Input.Keyboard.Key>) : {};

    this.buildHud();
    this.cameras.main.startFollow(this.cat, true, 0.16, 0.16);
    this.hudCam = this.cameras.add(0, 0, this.scale.width, this.scale.height);
    this.hudCam.setScroll(0, 0);
    this.hudCam.transparent = true;
    this.bindCameras();
    this.scale.on("resize", (gameSize: Phaser.Structs.Size) => this.hudCam.setSize(gameSize.width, gameSize.height));
    this.updateHud();
  }

  update(_time: number, delta: number): void {
    const dt = Math.min(delta, 40) / 1000;
    this.hurtWait = Math.max(0, this.hurtWait - dt);
    this.pingT += dt;
    this.readMove(dt);
    this.cat.x = Phaser.Math.Clamp(this.cat.x, 40, WORLD_W - 40);
    this.cat.y = Phaser.Math.Clamp(this.cat.y, STREET_Y - 40, STREET_Y + 50);
    for (const item of this.items) item.tension = this.list.completed;
    this.spawnHunterIfNeeded();
    this.sweeper?.chase(this.cat, dt);
    this.resolveEats(dt);
    this.resolveSweeper();
    this.refreshPings();
    this.updateHud();
  }

  private buildHud(): void {
    const { width, height } = this.scale;
    const panel = this.add.graphics().setScrollFactor(0).setDepth(4990);
    panel.fillStyle(0x12080c, 0.72);
    panel.fillRect(width / 2 - 78, 6, 156, 36);
    panel.fillRect(width - 70, 8, 62, 20);
    this.list.courses.forEach((course, i) => {
      const icon = this.add.image(width / 2 - 40 + i * 40, 24, ensureItemTexture(this, course));
      icon.setScrollFactor(0).setDepth(5000).setScale(1);
      this.courseIcons.push(icon);
    });
    this.stars = this.add
      .text(width - 12, 10, "", {
        fontFamily: "Microsoft YaHei, PingFang SC, sans-serif",
        fontSize: "12px",
        color: "#ffb3b3",
        stroke: "#1a0c10",
        strokeThickness: 3,
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(5000);
    this.coach = this.add
      .text(width / 2, height - 10, "", {
        fontFamily: "Microsoft YaHei, PingFang SC, sans-serif",
        fontSize: "14px",
        color: "#ffe7c2",
        backgroundColor: "#12080c",
        padding: { x: 8, y: 4 },
        stroke: "#1a0c10",
        strokeThickness: 2,
      })
      .setOrigin(0.5, 1)
      .setScrollFactor(0)
      .setDepth(5000);
    this.uiObjects = [panel, ...this.courseIcons, this.stars, this.coach];
  }

  private readMove(dt: number): void {
    let ix = 0;
    let iy = 0;
    if (this.keys.A?.isDown || this.keys.LEFT?.isDown) ix -= 1;
    if (this.keys.D?.isDown || this.keys.RIGHT?.isDown) ix += 1;
    if (this.keys.W?.isDown || this.keys.UP?.isDown) iy -= 1;
    if (this.keys.S?.isDown || this.keys.DOWN?.isDown) iy += 1;
    if (ix === 0 && iy === 0 && this.input.activePointer.isDown && this.input.activePointer.getDuration() > 160) {
      this.cameras.main.getWorldPoint(this.input.activePointer.x, this.input.activePointer.y, this.pointerWorld);
      ix = this.pointerWorld.x - this.cat.x;
      iy = this.pointerWorld.y - this.cat.y;
    }
    this.cat.steer(ix, iy, dt);
  }

  private guardOf(item: Edible): Edible | undefined {
    if (item.def.tier === "stall") return item;
    if (item.parentStall && !item.parentStall.eaten) return item.parentStall;
    return undefined;
  }

  private currentTarget(): Edible | undefined {
    return this.items.find((item) => !item.eaten && this.list.isTarget(item.def));
  }

  private spawnHunterIfNeeded(): void {
    if (this.sweeper || this.list.alert < 2) return;
    this.sweeper = new Sweeper(this, this.cat.x > WORLD_W / 2 ? 40 : WORLD_W - 40, this.cat.y);
    this.hudCam.ignore(this.sweeper);
    this.cameras.main.flash(160, 180, 40, 40);
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
      eatSound(40);
      return;
    }
    if (this.list.alert >= MAX_ALERT) {
      this.finish("caught");
      return;
    }
    if (this.hurtWait > 0) return;
    const inv = dist === 0 ? 1 : 1 / dist;
    this.cat.bounceFrom(-dx * inv, -dy * inv, 28);
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
      if (dist > this.cat.radius + item.radius * 0.2) continue;
      if (this.cat.radius > item.radius * EAT_RATIO) this.trySwallow(item);
      else if (item.radius > this.cat.radius * 1.05) {
        const inv = dist === 0 ? 1 : 1 / dist;
        this.cat.bounceFrom(-dx * inv, -dy * inv, 16);
      }
    }
  }

  private trySwallow(item: Edible): void {
    const risky = item.def.tier !== "snack" || this.list.isTarget(item.def);
    const guard = this.guardOf(item);
    if (risky && guard?.watching) {
      const dx = item.x - this.cat.x;
      const dy = item.y - this.cat.y;
      const dist = Math.hypot(dx, dy) || 1;
      this.cat.bounceFrom(-dx / dist, -dy / dist, 22);
      this.list.raise(1);
      this.hurtWait = HURT_COOLDOWN;
      this.flash("红灯！等一等");
      hurtSound();
      return;
    }

    item.eaten = true;
    const target = this.list.isTarget(item.def);
    const keep = target ? CRAVING_GROWTH : item.def.tier === "snack" ? GROWTH_KEEP : GROWTH_KEEP * 0.7;
    this.cat.growBy(item.area * keep, item.def.name, item.radius, item.def.tier === "landmark");
    this.crumbs.emitParticleAt(item.x, item.y, 8);
    this.cameras.main.shake(60, 0.004);
    this.tweens.add({ targets: item, scale: 0, alpha: 0, duration: 140, onComplete: () => item.destroy() });

    if (item.def.tier === "landmark") {
      this.finish("king");
      return;
    }
    if (target) {
      successSound();
      this.list.succeed();
      this.flash(`偷到了 ${this.list.completed}/3`);
      if (this.list.done) this.finish("win");
      return;
    }
    eatSound(item.radius);
  }

  private flash(text: string): void {
    const label = this.add
      .text(this.cat.x, this.cat.y - this.cat.radius - 12, text, {
        fontFamily: "Microsoft YaHei, PingFang SC, sans-serif",
        fontSize: "12px",
        color: "#ffe7c2",
        stroke: "#1a0c10",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(4000);
    this.hudCam.ignore(label);
    this.tweens.add({ targets: label, y: label.y - 18, alpha: 0, duration: 640, onComplete: () => label.destroy() });
  }

  private refreshPings(): void {
    const live = this.items.filter((item) => !item.eaten && this.list.isTarget(item.def));
    while (this.pings.length < live.length) {
      const ping = this.add.image(0, 0, "px-ping").setDepth(2500).setScale(1.6);
      this.hudCam.ignore(ping);
      this.pings.push(ping);
    }
    this.pings.forEach((ping, i) => {
      const item = live[i];
      ping.setVisible(!!item);
      if (item) ping.setPosition(item.x, item.y - item.radius - 12 + Math.sin(this.pingT * 6) * 3);
    });
    for (const item of this.items) {
      if (item.eaten) continue;
      if (!this.list.isTarget(item.def)) {
        item.showMark("none");
        continue;
      }
      const guard = this.guardOf(item);
      item.showMark(guard?.watching ? "no" : "yes");
    }
  }

  private updateHud(): void {
    this.courseIcons.forEach((icon, i) => {
      icon.setAlpha(i < this.list.index ? 0.28 : 1);
      icon.setScale(i === this.list.index ? 1.15 : 0.9);
    });
    this.stars.setText(alertStars(this.list.alert));
    const target = this.currentTarget();
    const dist = target ? Math.hypot(target.x - this.cat.x, target.y - this.cat.y) : 999;
    const guard = target ? this.guardOf(target) : undefined;
    let line = "跟着箭头走，看摊上的灯";
    if (this.cat.eaten === 0) line = "WASD：先吃发光的小鱼丸";
    else if (this.sweeper) line = "摊主追来了，躲开";
    else if (target && dist < 90 && guard?.watching) line = "红灯！摊主在看，先等";
    else if (target && dist < 90 && !guard?.watching) line = "绿灯！现在偷";
    this.coach.setText(line);
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
