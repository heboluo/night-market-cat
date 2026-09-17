# 夜市猫 Night Market Cat

跟着走，碰到就吃。一只在夜市里越吃越大的猫。

**没有按键，没有失败，点开就能玩。** 三分钟后夜市打烊，看你能吞到多大。

> 试玩链接会在 GitHub Pages 部署完成后出现在仓库 About 与此处。

## 怎么玩

- 鼠标或手指划过屏幕，猫会跟着走
- 碰到比自己小的东西就会吞掉
- 越吃越大，镜头会慢慢拉开
- 被更大的摊位挡住只会弹开，不会死
- 倒计时结束就打烊，再来一局

## 本地开发

需要 Node.js 20+。

```bash
npm install
npm run dev
```

浏览器打开终端里给出的本地地址即可。

```bash
npm run typecheck   # 类型检查
npm run build       # 生产构建
npm run preview     # 预览构建结果
```

## 开发流程

这个仓库按小型开源游戏的主干开发方式推进，细节见 [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)。

一句话版本：

1. 先用 Issue 记下要做的事
2. 从 `main` 拉短分支开发
3. 开 Pull Request，等 CI 通过
4. 合进 `main` 后自动部署试玩页

## 当前版本

`v0.1.0` 是可玩的垂直切面：菜单、跟着走、吞食变大、90 秒打烊结算。后续三周半会把夜市、手感和能力做完整，见 [docs/GDD.md](docs/GDD.md)。

## 技术栈

- TypeScript
- Phaser 3
- Vite
- GitHub Actions + GitHub Pages

## 许可

MIT
