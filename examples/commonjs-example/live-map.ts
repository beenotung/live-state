import { LiveState } from 'live-state.ts'

const life = LiveState.of(0, 'life')

const life10 = life.map(x => x * 10, 'life10')
const life100 = life10.map(x => x * 10, 'life100')

const monitor = (name: string) => {
  return {
    setup() {
      console.log('setup:', name)
    },
    update(value: number, oldValue: number) {
      console.log('update:', name, { value, oldValue })
    },
    teardown() {
      console.log('teardown:', name)
    },
  }
}

life.attach(monitor('life'))
life10.attach(monitor('life10'))
life100.attach(monitor('life100'))

life.update(1)
life.update(2)
life.update(2)
life.update(3)

life10.teardown()

life.update(4)
