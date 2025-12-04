import { Image, Leafer, Rect, Text } from 'leafer-ui'
import { Direction, Joystick } from './src'

const leafer = new Leafer({ view: window })

// 获取屏幕尺寸
const screenWidth = window.innerWidth
const screenHeight = window.innerHeight

// 判断是否为移动端
const isMobile = screenWidth < 768

// 创建信息显示文本
const infoText = new Text({
    x: 20,
    y: 20,
    text: isMobile ? '拖动摇杆' : '拖动摇杆控制方块移动',
    fontSize: isMobile ? 14 : 16,
    fill: '#333',
    fontWeight: 'bold',
})

const angleText = new Text({
    x: 20,
    y: isMobile ? 45 : 50,
    text: '角度: 0°',
    fontSize: isMobile ? 12 : 14,
    fill: '#666',
})

const directionText = new Text({
    x: 20,
    y: isMobile ? 65 : 75,
    text: '方向: -',
    fontSize: isMobile ? 12 : 14,
    fill: '#666',
})

const powerText = new Text({
    x: 20,
    y: isMobile ? 85 : 100,
    text: '力度: 0.00',
    fontSize: isMobile ? 12 : 14,
    fill: '#666',
})

leafer.add(infoText)
leafer.add(angleText)
leafer.add(directionText)
leafer.add(powerText)

// 创建一个可移动的方块，用于演示摇杆控制
const player = new Rect({
    x: screenWidth / 2 - 25,
    y: screenHeight / 2 - 25,
    width: 50,
    height: 50,
    fill: '#32cd79',
    cornerRadius: 5,
})

leafer.add(player)

// 摇杆状态
let joystickAngle = 0
let joystickPower = 0
let isJoystickActive = false

// 计算摇杆布局
const joystickSize = isMobile ? 100 : 120
const imageJoystickSize = isMobile ? 120 : 150
const bottomMargin = isMobile ? 60 : 120
const sideMargin = isMobile ? 30 : 50

// ========== 左下角：基本摇杆（默认样式） ==========
const basicLabel = new Text({
    x: sideMargin + joystickSize / 2 - 30,
    y: screenHeight - bottomMargin - joystickSize - 30,
    text: '基本摇杆',
    fontSize: isMobile ? 12 : 14,
    fill: '#666',
})
leafer.add(basicLabel)

const joystick = new Joystick({
    outerScale: { x: joystickSize / 120, y: joystickSize / 120 },
    innerScale: { x: joystickSize / 120, y: joystickSize / 120 },
    onChange: (data) => {
        // 更新显示
        angleText.text = `角度: ${data.angle.toFixed(0)}°`
        directionText.text = `方向: ${data.direction}`
        powerText.text = `力度: ${data.power.toFixed(2)}`

        // 保存摇杆状态
        joystickAngle = data.angle
        joystickPower = data.power
    },
    onStart: () => {
        console.log('开始拖拽 - 基本摇杆')
        isJoystickActive = true
    },
    onEnd: () => {
        console.log('结束拖拽 - 基本摇杆')
        isJoystickActive = false
        joystickPower = 0

        angleText.text = '角度: 0°'
        directionText.text = '方向: -'
        powerText.text = '力度: 0.00'
    },
})

// 定位到左下角
joystick.x = sideMargin
joystick.y = screenHeight - bottomMargin - joystickSize

leafer.add(joystick)

// ========== 右下角：使用图片的摇杆 ==========
const imageLabel = new Text({
    x: screenWidth - sideMargin - imageJoystickSize / 2 - 30,
    y: screenHeight - bottomMargin - imageJoystickSize - 30,
    text: '图片摇杆',
    fontSize: isMobile ? 12 : 14,
    fill: '#666',
})
leafer.add(imageLabel)

// 创建使用图片的摇杆
const imageJoystick = new Joystick({
    outer: new Image({
        url: './image/joystick.png',
        width: imageJoystickSize,
        height: imageJoystickSize,
    }),
    inner: new Image({
        url: './image/joystick-handle.png',
        width: imageJoystickSize * 0.53, // 保持比例
        height: imageJoystickSize * 0.53,
    }),
    onChange: (data) => {
        // 更新显示（与左侧摇杆共享）
        angleText.text = `角度: ${data.angle.toFixed(0)}°`
        directionText.text = `方向: ${data.direction}`
        powerText.text = `力度: ${data.power.toFixed(2)}`

        // 保存摇杆状态
        joystickAngle = data.angle
        joystickPower = data.power
    },
    onStart: () => {
        console.log('开始拖拽 - 图片摇杆')
        isJoystickActive = true
    },
    onEnd: () => {
        console.log('结束拖拽 - 图片摇杆')
        isJoystickActive = false
        joystickPower = 0

        angleText.text = '角度: 0°'
        directionText.text = '方向: -'
        powerText.text = '力度: 0.00'
    },
})

// 定位到右下角
imageJoystick.x = screenWidth - sideMargin - imageJoystickSize
imageJoystick.y = screenHeight - bottomMargin - imageJoystickSize

leafer.add(imageJoystick)

// 添加说明文字
if (!isMobile) {
    const helpText = new Text({
        x: screenWidth / 2 - 150,
        y: 20,
        text: '拖动摇杆，方块会持续朝该方向移动',
        fontSize: 14,
        fill: '#999',
    })
    leafer.add(helpText)
}

// 使用动画循环持续更新方块位置
function updatePlayer() {
    if (isJoystickActive && joystickPower > 0) {
        // 根据摇杆角度和力度计算移动速度
        const speed = (isMobile ? 2 : 3) * joystickPower
        const rad = (joystickAngle * Math.PI) / 180

        player.x += speed * Math.cos(rad)
        player.y -= speed * Math.sin(rad)

        // 边界检测
        if (player.x < 0) player.x = 0
        if (player.x > screenWidth - 50) player.x = screenWidth - 50
        if (player.y < 0) player.y = 0
        if (player.y > screenHeight - 50) player.y = screenHeight - 50
    }

    requestAnimationFrame(updatePlayer)
}

// 启动动画循环
updatePlayer()

console.log('Joystick Demo Ready!')
console.log('Screen:', screenWidth, 'x', screenHeight, isMobile ? '(Mobile)' : '(Desktop)')
console.log('Direction enum:', Direction)