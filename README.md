# live-state.ts

Create composable and reactive state that propagate updates down the stream without unnecessary computation.

[![npm Package Version](https://img.shields.io/npm/v/live-state.ts.svg?maxAge=3600)](https://www.npmjs.com/package/live-state.ts)

This library helps to maintain consistent state in realtime applications.

It is inspired from [s.js](https://github.com/adamhaile/s-js) and [rxjs](https://github.com/reactive-x/rxjs), and aims to keep simple.

## Features

- Live State with realtime updates automatically pushed to attached lifecycle hooks
- Skip unnecessary computation
- Built-in Typescript support
- 100% tested with ts-mocha

## Usage Examples

### Importing the library

#### Import npm package

Install from npm:

```bash
# install with npm
npm i live-state.ts
# or pnpm
pnpm i live-state.ts
# or yarn
yarn add live-state.ts
```

Import as typescript package / esm package:

```typescript
import { LiveState } from 'live-state.ts'
```

Import as commonjs package

```javascript
let { LiveState } = require('live-state.ts')
```

#### Import esm package over CDN

```html
<script type="module">
  import { LiveState } from 'https://cdn.jsdelivr.net/npm/live-state.ts@1.0.0/dist/esm.js'
  let state = LiveState.of(1)
</script>
```

#### Import iife library over CDN

```html
<script src="https://cdn.jsdelivr.net/npm/live-state.ts@1.0.0/dist/browser.js"></script>
<script>
  let state = LiveState.of(1)
</script>
```

### Lifecycle Hook Example

```typescript
let state = LiveState.of(1)
state.attach({
  setup(value) {
    console.log('initial value:', value)
  },
  update(value, oldValue) {
    console.log('update:', { value, oldValue })
  },
  teardown(value) {
    console.log('last value:', value)
  },
})
// print initial value: 1
state.update(2)
// print update: { value: 2, oldValue: 1 }
state.update(3)
// print update: { value: 3, oldValue: 2 }
state.teardown()
// print last value: 3
```

### Derived State Example

The `state.map(fn)` takes a projection function and derives a new state.

When the current state is teardown, the derived state will also be teardown.

```typescript
let state = LiveState.of(10)
let doubleState = state.map(x => x * 2)
let tupleState = LiveState.combine(state, doubleState, (a, b) => [a, b])

console.log(tupleState.peek())
// print [10, 20]

state.update(15)
console.log(tupleState.peek())
// print [15, 30]
```

### Watching State Example

Similar to the `state.map(fn)` method, the `state.watch(fn)` method will push the current state and future updates to the callback function.

However, this method does not derive a new state. You can use this method with less overhead when the return value of the callback function is not useful.

The concept of 'watch' is also called as 'observe', 'subscribe', or 'forEach' in other libraries.

```typescript
let state = LiveState.of(10)

let detach = state.watch(value => console.log(value))
// print 10

state.update(20)
// print 20

detach()
state.update(30)
// won't print 30
```

More usage examples refer to:

- [browser-example](./examples/browser-example)
- [commonjs-example](./examples/commonjs-example)
- [esm-example](./examples/esm-example)
- [state.spec.ts](./test/state.spec.ts)

## License

This project is licensed with [BSD-2-Clause](./LICENSE)

This is free, libre, and open-source software. It comes down to four essential freedoms [[ref]](https://seirdy.one/2021/01/27/whatsapp-and-the-domestication-of-users.html#fnref:2):

- The freedom to run the program as you wish, for any purpose
- The freedom to study how the program works, and change it so it does your computing as you wish
- The freedom to redistribute copies so you can help others
- The freedom to distribute copies of your modified versions to others
