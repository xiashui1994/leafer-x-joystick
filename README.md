# leafer-x-joystick

基于 Leafer 框架的虚拟摇杆插件，支持触摸和鼠标交互。

## 特性

- 🎮 支持触摸和鼠标交互
- 📐 实时计算角度（0-360°）、方向（8方向）和力度（0-1）
- 🎨 支持自定义外观
- 📦 轻量级，无额外依赖
- 💪 TypeScript 支持
- 🖐️ 支持多指触摸模式

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

## 多指触摸模式

在游戏等需要多指同时操作的场景中,可以启用多指触摸模式。启用后需要手动调用触摸方法。

### 推荐方式:配合 leafer-x-multitouch 插件使用

推荐使用 [leafer-x-multitouch](https://www.npmjs.com/package/leafer-x-multitouch) 插件来简化多指触摸的处理:

```typescript
import { Leafer, Rect } from 'leafer-ui'
import { Joystick } from 'leafer-x-joystick'
import { MultiTouch } from 'leafer-x-multitouch'

const leafer = new Leafer({ view: window })

// 创建多指触控管理器
const multiTouch = new MultiTouch(leafer)

// 绑定触摸事件
window.addEventListener('touchstart', (e) => multiTouch.handleTouchStart(e))
window.addEventListener('touchmove', (e) => multiTouch.handleTouchMove(e))
window.addEventListener('touchend', (e) => multiTouch.handleTouchEnd(e))

// 创建左侧摇杆(启用多指模式)
const leftJoystick = new Joystick({
  multiTouch: true,  // 启用多指模式,禁用自动事件
  onChange: (data) => {
    console.log('左摇杆:', data.angle, data.direction, data.power)
  },
})
leftJoystick.x = 100
leftJoystick.y = 500
leafer.add(leftJoystick)

// 为摇杆注册触摸处理
multiTouch.register(leftJoystick, {
  onStart: (touch, data) => {
    leftJoystick.handleTouchStart()
  },
  onMove: (touch, data) => {
    leftJoystick.handleTouchMove(touch.clientX, touch.clientY)
  },
  onEnd: (touch, data) => {
    leftJoystick.handleTouchEnd()
  },
})

// 创建右侧按钮
const buttonA = new Rect({
  x: 600,
  y: 500,
  width: 80,
  height: 80,
  fill: '#ff6b6b',
  cornerRadius: 40,
})
leafer.add(buttonA)

// 为按钮注册触摸处理
multiTouch.register(buttonA, {
  onStart: () => {
    console.log('按钮 A 按下')
  },
  onEnd: () => {
    console.log('按钮 A 释放')
  },
})
```

### 手动方式：自行处理触摸事件

如果不使用 `leafer-x-multitouch` 插件，也可以手动处理触摸事件：

```typescript
import { Leafer } from 'leafer-ui'
import { Joystick } from 'leafer-x-joystick'

const leafer = new Leafer({ view: window })

const joystick = new Joystick({
  multiTouch: true,
  onChange: (data) => {
    console.log('摇杆:', data.angle, data.direction, data.power)
  },
})

joystick.x = 100
joystick.y = 100
leafer.add(joystick)

// 手动处理触摸事件
let activeTouch = null

window.addEventListener('touchstart', (e) => {
  for (const touch of e.touches) {
    const pickResult = leafer.pick({ x: touch.clientX, y: touch.clientY })
    if (pickResult && isJoystick(pickResult.target)) {
      activeTouch = touch.identifier
      joystick.handleTouchStart()
      break
    }
  }
})

window.addEventListener('touchmove', (e) => {
  for (const touch of e.touches) {
    if (touch.identifier === activeTouch) {
      joystick.handleTouchMove(touch.clientX, touch.clientY)
      break
    }
  }
})

window.addEventListener('touchend', (e) => {
  for (const touch of e.changedTouches) {
    if (touch.identifier === activeTouch) {
      joystick.handleTouchEnd()
      activeTouch = null
      break
    }
  }
})

// 辅助函数：检查是否是摇杆或其子元素
function isJoystick(element) {
  let current = element
  while (current && current !== leafer) {
    if (current === joystick) return true
    current = current.parent
  }
  return false
}
```

### 手动触摸方法

当启用 `multiTouch: true` 时，需要手动调用以下方法：

| 方法 | 参数 | 说明 |
|------|------|------|
| `handleTouchStart()` | 无 | 开始触摸 |
| `handleTouchMove(globalX, globalY)` | 全局坐标 x, y | 移动触摸 |
| `handleTouchEnd()` | 无 | 结束触摸 |

## API

### JoystickSettings

| 属性 | 类型 | 说明 |
|------|------|------|
| `outer` | `UI` | 外圈元素（可选） |
| `inner` | `UI` | 内圈元素（可选） |
| `outerScale` | `{ x: number, y: number }` | 外圈缩放（可选） |
| `innerScale` | `{ x: number, y: number }` | 内圈缩放（可选） |
| `multiTouch` | `boolean` | 多指触摸模式（可选，默认 `false`） |
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
