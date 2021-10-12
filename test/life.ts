import { LifeContext } from '../src'

let life = new LifeContext('loading')

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

life.update('ready')

life.teardown()
