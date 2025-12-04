# leafer-x-joystick

基于 Leafer 框架的虚拟摇杆插件，支持触摸和鼠标交互。

## 特性

- 🎮 支持触摸和鼠标交互
- 📐 实时计算角度（0-360°）、方向（8方向）和力度（0-1）
- 🎨 支持自定义外观
- 📦 轻量级，无额外依赖
- 💪 TypeScript 支持

## 安装

```bash
npm install leafer-x-joystick
# 或
pnpm add leafer-x-joystick
# 或
yarn add leafer-x-joystick
```

## 基本用法

```typescript
import { Leafer } from 'leafer-ui'
import { Joystick } from 'leafer-x-joystick'

const leafer = new Leafer({ view: window })

const joystick = new Joystick({
  onChange: (data) => {
    console.log('角度:', data.angle)
    console.log('方向:', data.direction)
    console.log('力度:', data.power)
  },
  onStart: () => console.log('开始拖拽'),
  onEnd: () => console.log('结束拖拽'),
})

// 定位摇杆
joystick.x = 100
joystick.y = 100

leafer.add(joystick)
```

## 自定义外观

```typescript
import { Ellipse, Image } from 'leafer-ui'
import { Joystick } from 'leafer-x-joystick'

const joystick = new Joystick({
  // 使用自定义图片
  outer: new Image({ url: 'outer.png' }),
  inner: new Image({ url: 'inner.png' }),
  // 或使用自定义图形
  outer: new Ellipse({ 
    width: 150, 
    height: 150, 
    fill: '#ff6b6b',
    opacity: 0.6 
  }),
  inner: new Ellipse({ 
    width: 80, 
    height: 80, 
    fill: '#4ecdc4' 
  }),
  // 设置缩放
  outerScale: { x: 0.8, y: 0.8 },
  innerScale: { x: 1.2, y: 1.2 },
  onChange: (data) => {
    // 处理摇杆变化
  },
})
```

## API

### JoystickSettings

| 属性 | 类型 | 说明 |
|------|------|------|
| `outer` | `UI` | 外圈元素（可选） |
| `inner` | `UI` | 内圈元素（可选） |
| `outerScale` | `{ x: number, y: number }` | 外圈缩放（可选） |
| `innerScale` | `{ x: number, y: number }` | 内圈缩放（可选） |
| `onChange` | `(data: JoystickChangeEvent) => void` | 摇杆变化回调（可选） |
| `onStart` | `() => void` | 开始拖拽回调（可选） |
| `onEnd` | `() => void` | 结束拖拽回调（可选） |

### JoystickChangeEvent

| 属性 | 类型 | 说明 |
|------|------|------|
| `angle` | `number` | 角度（0-360） |
| `direction` | `Direction` | 方向枚举 |
| `power` | `number` | 力度（0-1） |

### Direction 枚举

- `LEFT` - 左
- `RIGHT` - 右
- `TOP` - 上
- `BOTTOM` - 下
- `TOP_LEFT` - 左上
- `TOP_RIGHT` - 右上
- `BOTTOM_LEFT` - 左下
- `BOTTOM_RIGHT` - 右下

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm start

# 构建
pnpm build

# 测试
pnpm test
```

## 许可证

MIT
