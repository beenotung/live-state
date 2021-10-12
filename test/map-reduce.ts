import { ValueContext } from '../src/index'

let counter = new ValueContext(0)
let sum = counter.reduce((acc, c) => acc + c)

counter.on(x => console.log('counter:', x))
sum.on(x => console.log('sum:', x))

counter.setValue(1)
counter.setValue(2)
counter.setValue(3)
