import { Ellipse, Group, PointerEvent as LeaferPointerEvent, UI } from '@leafer-ui/core'
import type { IPointData } from '@leafer-ui/interface'
import { Direction, type JoystickSettings } from './types'

/**
 * 虚拟摇杆组件
 * 基于 Leafer 框架实现的触摸/鼠标交互摇杆
 */
export class Joystick extends Group {
    settings: JoystickSettings

    outerRadius: number = 0
    innerRadius: number = 0

    outer!: UI
    inner!: UI

    innerAlphaStandby = 0.5

    constructor(opts: JoystickSettings = {}) {
        super()

        this.settings = Object.assign(
            {
                outerScale: { x: 1, y: 1 },
                innerScale: { x: 1, y: 1 },
            },
            opts,
        )

        // 创建默认外圈
        if (!this.settings.outer) {
            const outer = new Ellipse({
                width: 120,
                height: 120,
                fill: '#000000',
                opacity: 0.5,
            })
            this.settings.outer = outer
        }

        // 创建默认内圈
        if (!this.settings.inner) {
            const inner = new Ellipse({
                width: 70,
                height: 70,
                fill: '#000000',
                opacity: this.innerAlphaStandby,
            })
            this.settings.inner = inner
        }

        this.initialize()
    }

    /**
     * 初始化摇杆
     */
    initialize() {
        this.outer = this.settings.outer!
        this.inner = this.settings.inner!

        // 添加到组
        this.add(this.outer)
        this.add(this.inner)

        // 获取原始尺寸
        const outerOriginalWidth = this.outer.width || 0
        const outerOriginalHeight = this.outer.height || 0
        const innerOriginalWidth = this.inner.width || 0
        const innerOriginalHeight = this.inner.height || 0

        // 设置缩放
        this.outer.scaleX = this.settings.outerScale!.x
        this.outer.scaleY = this.settings.outerScale!.y
        this.inner.scaleX = this.settings.innerScale!.x
        this.inner.scaleY = this.settings.innerScale!.y

        // 计算缩放后的实际尺寸
        const outerScaledWidth = outerOriginalWidth * this.outer.scaleX
        const outerScaledHeight = outerOriginalHeight * this.outer.scaleY
        const innerScaledWidth = innerOriginalWidth * this.inner.scaleX
        const innerScaledHeight = innerOriginalHeight * this.inner.scaleY

        // 计算半径（基于缩放后的尺寸）
        this.outerRadius = outerScaledWidth / 2.5
        this.innerRadius = innerScaledWidth / 2

        // 设置内圈初始位置（居中）
        this.inner.x = outerScaledWidth / 2 - innerScaledWidth / 2
        this.inner.y = outerScaledHeight / 2 - innerScaledHeight / 2

        // 绑定事件
        this.bindEvents()
    }

    /**
     * 绑定交互事件
     */
    protected bindEvents() {
        // 启用交互
        this.cursor = 'pointer'

        let dragging = false
        let startPosition: IPointData = { x: 0, y: 0 }
        let power = 0

        const onDragStart = () => {
            // 计算缩放后的外圈尺寸
            const outerScaledWidth = (this.outer.width || 0) * this.outer.scaleX
            const outerScaledHeight = (this.outer.height || 0) * this.outer.scaleY

            // 起始位置是外圈中心（基于缩放后的尺寸）
            startPosition = {
                x: outerScaledWidth / 2,
                y: outerScaledHeight / 2
            }

            dragging = true
            this.inner.opacity = 1

            this.settings.onStart?.()
        }

        const onDragEnd = () => {
            if (!dragging) return

            // 计算缩放后的尺寸
            const outerScaledWidth = (this.outer.width || 0) * this.outer.scaleX
            const outerScaledHeight = (this.outer.height || 0) * this.outer.scaleY

            // 重置内圈位置到中心
            this.inner.x = outerScaledWidth / 2 - this.innerRadius
            this.inner.y = outerScaledHeight / 2 - this.innerRadius

            dragging = false
            this.inner.opacity = this.innerAlphaStandby

            this.settings.onEnd?.()
        }

        const onDragMove = (event: LeaferPointerEvent) => {
            if (!dragging) return

            const newPosition = this.getInnerPoint({ x: event.x, y: event.y })

            const sideX = newPosition.x - startPosition.x
            const sideY = newPosition.y - startPosition.y

            const centerPoint: IPointData = { x: 0, y: 0 }
            let angle = 0

            if (sideX === 0 && sideY === 0) return

            let direction = Direction.LEFT

            // 处理垂直方向
            if (sideX === 0) {
                if (sideY > 0) {
                    centerPoint.y = sideY > this.outerRadius ? this.outerRadius : sideY
                    angle = 270
                    direction = Direction.BOTTOM
                }
                else {
                    centerPoint.y = -(Math.abs(sideY) > this.outerRadius ? this.outerRadius : Math.abs(sideY))
                    angle = 90
                    direction = Direction.TOP
                }
                this.inner.x = startPosition.x + centerPoint.x - this.innerRadius
                this.inner.y = startPosition.y + centerPoint.y - this.innerRadius
                power = this.getPower(centerPoint)
                this.settings.onChange?.({ angle, direction, power })
                return
            }

            // 处理水平方向
            if (sideY === 0) {
                if (sideX > 0) {
                    centerPoint.x = Math.abs(sideX) > this.outerRadius ? this.outerRadius : Math.abs(sideX)
                    angle = 0
                    direction = Direction.RIGHT
                }
                else {
                    centerPoint.x = -(Math.abs(sideX) > this.outerRadius ? this.outerRadius : Math.abs(sideX))
                    angle = 180
                    direction = Direction.LEFT
                }

                this.inner.x = startPosition.x + centerPoint.x - this.innerRadius
                this.inner.y = startPosition.y + centerPoint.y - this.innerRadius
                power = this.getPower(centerPoint)
                this.settings.onChange?.({ angle, direction, power })
                return
            }

            // 处理斜向方向
            const tanVal = Math.abs(sideY / sideX)
            const radian = Math.atan(tanVal)
            angle = (radian * 180) / Math.PI

            let centerX = 0
            let centerY = 0

            if (sideX * sideX + sideY * sideY >= this.outerRadius * this.outerRadius) {
                centerX = this.outerRadius * Math.cos(radian)
                centerY = this.outerRadius * Math.sin(radian)
            }
            else {
                centerX = Math.abs(sideX) > this.outerRadius ? this.outerRadius : Math.abs(sideX)
                centerY = Math.abs(sideY) > this.outerRadius ? this.outerRadius : Math.abs(sideY)
            }

            if (sideY < 0) {
                centerY = -Math.abs(centerY)
            }
            if (sideX < 0) {
                centerX = -Math.abs(centerX)
            }

            // 计算角度（0-360）
            if (sideX > 0 && sideY < 0) {
                // < 90
            }
            else if (sideX < 0 && sideY < 0) {
                // 90 ~ 180
                angle = 180 - angle
            }
            else if (sideX < 0 && sideY > 0) {
                // 180 ~ 270
                angle = angle + 180
            }
            else if (sideX > 0 && sideY > 0) {
                // 270 ~ 360
                angle = 360 - angle
            }

            centerPoint.x = centerX
            centerPoint.y = centerY
            power = this.getPower(centerPoint)

            direction = this.getDirection(centerPoint)
            this.inner.x = startPosition.x + centerPoint.x - this.innerRadius
            this.inner.y = startPosition.y + centerPoint.y - this.innerRadius

            this.settings.onChange?.({ angle, direction, power })
        }

        // 监听事件
        this.on(LeaferPointerEvent.DOWN, onDragStart)
        this.on(LeaferPointerEvent.UP, onDragEnd)
        this.on(LeaferPointerEvent.MOVE, onDragMove)
    }

    /**
     * 计算力度 (0-1)
     */
    protected getPower(centerPoint: IPointData): number {
        const a = centerPoint.x - 0
        const b = centerPoint.y - 0
        return Math.min(1, Math.sqrt(a * a + b * b) / this.outerRadius)
    }

    /**
     * 计算方向（8方向）
     */
    protected getDirection(center: IPointData): Direction {
        const rad = Math.atan2(center.y, center.x) // [-PI, PI]

        if ((rad >= -Math.PI / 8 && rad < 0) || (rad >= 0 && rad < Math.PI / 8)) {
            return Direction.RIGHT
        }
        else if (rad >= Math.PI / 8 && rad < (3 * Math.PI) / 8) {
            return Direction.BOTTOM_RIGHT
        }
        else if (rad >= (3 * Math.PI) / 8 && rad < (5 * Math.PI) / 8) {
            return Direction.BOTTOM
        }
        else if (rad >= (5 * Math.PI) / 8 && rad < (7 * Math.PI) / 8) {
            return Direction.BOTTOM_LEFT
        }
        else if ((rad >= (7 * Math.PI) / 8 && rad < Math.PI) || (rad >= -Math.PI && rad < (-7 * Math.PI) / 8)) {
            return Direction.LEFT
        }
        else if (rad >= (-7 * Math.PI) / 8 && rad < (-5 * Math.PI) / 8) {
            return Direction.TOP_LEFT
        }
        else if (rad >= (-5 * Math.PI) / 8 && rad < (-3 * Math.PI) / 8) {
            return Direction.TOP
        }
        else {
            return Direction.TOP_RIGHT
        }
    }
}
