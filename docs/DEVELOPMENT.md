# 开发流程

这个项目按「小型开源游戏」的常见做法来做，而不是大公司式的 Git Flow。一个人开发也走完整流程，是为了仓库看起来专业、后面也好继续加功能。

## 主干开发

- 长期只有一条稳定分支：`main`
- 新功能用短分支：`feat/camera-zoom`、`fix/eat-hitbox`、`chore/ci`
- 分支寿命以小时或一两天计，做完就合，不囤大分支
- 不在 `main` 上直接堆未完成的实验

## 先记 Issue，再写代码

每一件能独立交付的事都先开 Issue，例如「吞掉摊位时镜头要拉得更明显」。Issue 里写：

- 玩家会看到什么
- 怎样算做完
- 不做什么（避免范围膨胀）

三周半的工作拆在里程碑里，不把「做完整个游戏」写成一个 Issue。

## 提交信息

用约定式提交，方便以后写 Changelog：

```
feat: 吞食后镜头随体型拉开
fix: 猫在地图边缘会穿出世界
chore: 加上类型检查 CI
docs: 补充本地启动步骤
```

一次提交只做一件事。不要把「改手感 + 加新食物 + 改 README」揉进同一个 commit。

## Pull Request

即使是自己的仓库，也用 PR 合进 `main`。好处是：

- CI 会在合并前跑类型检查和构建
- GitHub 上能看出每一周加了什么
- 简历里可以指着 PR 讲决策

PR 描述用模板，至少写清：做了什么、怎么试、有没有截图或 GIF。

## 持续集成

- 向 `main` 开 PR 时：安装依赖、`npm run typecheck`、`npm run build`
- 推到 `main` 后：把 `dist` 发布到 GitHub Pages

Pages 第一次需要在仓库 Settings → Pages 里把 Source 选成 GitHub Actions。

## 版本

- `0.1.x` 垂直切面，能玩但不完整
- `0.2.x` 夜市内容和手感
- `0.3.x` 完整一局循环
- `1.0.0` 可以对外发的第一版

版本记在 `package.json` 和 `CHANGELOG.md`。

## 本地命令

```bash
npm install
npm run dev
npm run typecheck
npm run build
```
