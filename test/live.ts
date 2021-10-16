import { LiveContext } from '../src'

let life = LiveContext.of('loading')

life.attach({
  setup(value) {
    console.log('create element:', value)
  },
  update(value, oldValue) {
    console.log('update element:', { value, oldValue })
  },
  teardown(value) {
    console.log('remove element:', value)
  },
})

life.update('1')
life.update('2')
life.update('2')
life.update('3')

life.teardown()
