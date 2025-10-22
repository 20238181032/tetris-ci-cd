import { describe, test, expect } from '@jest/globals'
import { shallowMount } from '@vue/test-utils'
import TetrisGame from '../../src/components/TetrisGame.vue'

describe('俄罗斯方块逻辑测试', () => {
  test('方块左移逻辑正确', () => {
    const wrapper = shallowMount(TetrisGame)
    const vm = wrapper.vm
    vm.currentX = 3
    vm.move(-1, 0)
    expect(vm.currentX).toBe(2)
  })

  test('消除行后分数增加', () => {
    const wrapper = shallowMount(TetrisGame)
    const vm = wrapper.vm
    vm.board = [
      [1,1,1,1,1,1,1,1,1,1], // 满行
      [1,1,1,1,1,1,1,1,1,1], // 满行
      ...Array(18).fill().map(() => Array(10).fill(0))
    ]
    vm.clearLines()
    expect(vm.score).toBe(200) // 消除2行，每行100分
  })
})
