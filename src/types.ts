import type { UI } from '@leafer-ui/core'

/**
 * 方向枚举
 */
export enum Direction {
    LEFT = 'left',
    RIGHT = 'right',
    TOP = 'top',
    BOTTOM = 'bottom',
    TOP_LEFT = 'top_left',
    TOP_RIGHT = 'top_right',
    BOTTOM_LEFT = 'bottom_left',
    BOTTOM_RIGHT = 'bottom_right',
}

/**
 * 摇杆变化事件数据
 */
export interface JoystickChangeEvent {
    /** 角度 (0-360) */
    angle: number
    /** 方向 */
    direction: Direction
    /** 力度 (0-1) */
    power: number
}

/**
 * 摇杆配置选项
 */
export interface JoystickSettings {
    /** 外圈元素 */
    outer?: UI
    /** 内圈元素 */
    inner?: UI
    /** 外圈缩放 */
    outerScale?: { x: number; y: number }
    /** 内圈缩放 */
    innerScale?: { x: number; y: number }
    /** 多指触摸模式（启用后需手动调用 handleTouchStart/Move/End 方法） */
    multiTouch?: boolean
    /** 摇杆变化回调 */
    onChange?: (data: JoystickChangeEvent) => void
    /** 开始拖拽回调 */
    onStart?: () => void
    /** 结束拖拽回调 */
    onEnd?: () => void
}