<template>
  <div class="tetris">
    <!-- 游戏画布 -->
    <canvas ref="canvas" :width="canvasWidth" :height="canvasHeight"></canvas>
    <!-- 分数显示 -->
    <div>分数: {{ score }}</div>
  </div>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// 画布尺寸
const canvasWidth = 300
const canvasHeight = 600
const canvas = ref(null)
let ctx = null
let board = Array(20).fill().map(() => Array(10).fill(0)) // 20行×10列游戏板
const score = ref(0)

// 方块形状（I、J、L、O、S、T、Z）
const shapes = [
  [[1,1,1,1]],
  [[1,0,0],[1,1,1]],
  [[0,0,1],[1,1,1]],
  [[1,1],[1,1]],
  [[0,1,1],[1,1,0]],
  [[0,1,0],[1,1,1]],
  [[1,1,0],[0,1,1]]
]

let currentShape = null
let currentX = 0
let currentY = 0

onMounted(() => {
  ctx = canvas.value.getContext('2d')
  initGame()
  startGameLoop()
  // 键盘事件监听（左右移动、旋转、快速下落）
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  clearInterval(gameLoop)
})

// 初始化游戏
const initGame = () => {
  board = Array(20).fill().map(() => Array(10).fill(0))
  score.value = 0
  spawnShape()
  draw()
}

// 生成新方块
const spawnShape = () => {
  const shapeIndex = Math.floor(Math.random() * shapes.length)
  currentShape = shapes[shapeIndex]
  currentX = Math.floor(10 / 2 - currentShape[0].length / 2)
  currentY = 0
  // 检查是否游戏结束（新方块生成时已无法放置）
  if (!isValidMove(0, 0)) {
    alert('游戏结束！最终分数: ' + score.value)
    initGame()
  }
}

// 绘制游戏
const draw = () => {
  // 清空画布
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)
  // 绘制游戏板已有方块
  drawBoard()
  // 绘制当前方块
  drawShape(currentShape, currentX, currentY)
}

// 绘制游戏板
const drawBoard = () => {
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      if (board[y][x]) {
        drawSquare(x, y, '#3498db')
      }
    }
  }
}

// 绘制方块
const drawShape = (shape, x, y, color = '#e74c3c') => {
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        drawSquare(x + col, y + row, color)
      }
    }
  }
}

// 绘制单个方块
const drawSquare = (x, y, color) => {
  ctx.fillStyle = color
  ctx.fillRect(x * 30, y * 30, 30, 30)
  ctx.strokeStyle = '#fff'
  ctx.strokeRect(x * 30, y * 30, 30, 30)
}

// 检查移动是否有效
const isValidMove = (offsetX, offsetY, newShape = currentShape) => {
  for (let row = 0; row < newShape.length; row++) {
    for (let col = 0; col < newShape[row].length; col++) {
      if (newShape[row][col] && (
        currentY + row + offsetY < 0 ||
        currentX + col + offsetX < 0 ||
        currentX + col + offsetX >= 10 ||
        currentY + row + offsetY >= 20 ||
        board[currentY + row + offsetY][currentX + col + offsetX]
      )) {
        return false
      }
    }
  }
  return true
}

// 旋转方块
const rotate = () => {
  const newShape = currentShape[0].map((_, colIndex) => 
    currentShape.map(row => row[colIndex]).reverse()
  )
  if (isValidMove(0, 0, newShape)) {
    currentShape = newShape
  }
}

// 移动方块
const move = (offsetX, offsetY) => {
  if (isValidMove(offsetX, offsetY)) {
    currentX += offsetX
    currentY += offsetY
    return true
  }
  // 移动无效且是向下移动 → 方块落地，合并到游戏板
  if (offsetY > 0) {
    mergeShape()
    clearLines()
    spawnShape()
  }
  return false
}

// 合并方块到游戏板
const mergeShape = () => {
  for (let row = 0; row < currentShape.length; row++) {
    for (let col = 0; col < currentShape[row].length; col++) {
      if (currentShape[row][col]) {
        board[currentY + row][currentX + col] = 1
      }
    }
  }
}

// 消除满行
const clearLines = () => {
  let linesCleared = 0
  for (let y = board.length - 1; y >= 0; y--) {
    if (board[y].every(cell => cell)) {
      board.splice(y, 1)
      board.unshift(Array(10).fill(0))
      linesCleared++
      y++ // 因为删除了一行，需要再检查当前行
    }
  }
  score.value += linesCleared * 100 // 消除行数越多，分数越高
}

// 键盘事件处理
const handleKeyDown = (e) => {
  switch (e.key) {
    case 'ArrowLeft':
      move(-1, 0)
      break
    case 'ArrowRight':
      move(1, 0)
      break
    case 'ArrowDown':
      move(0, 1)
      break
    case 'ArrowUp':
      rotate()
      break
  }
  draw()
}

// 游戏循环（自动下落）
let gameLoop = null
const startGameLoop = () => {
  gameLoop = setInterval(() => {
    move(0, 1)
    draw()
  }, 500)
}
</script>
<style scoped>
.tetris { display: inline-block; }
canvas { border: 2px solid #333; }
</style>
