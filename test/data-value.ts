import { DataContext, ValueContext } from '../src/index'

let data = new DataContext(1).map(x => x)
let value = new ValueContext(1).map(x => x)

data.on(data => console.log('data:', data))
value.on(value => console.log('value:', value))

data.setValue(2)
value.setValue(2)

data.setValue(2)
value.setValue(2)

data.setValue(3)
value.setValue(3)
