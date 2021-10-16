import { LiveContext } from '../src'

let life = LiveContext.of(0, 'life')

let life10 = life.map(x => x * 10, 'life10')
let life100 = life10.map(x => x * 10, 'life100')

let monitor = (name: string) => {
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
