import { LiveState } from 'live-state.ts';

let state = LiveState.of(10)
let doubleState = state.map(x => x * 2)
let tupleState = LiveState.combine(state, doubleState, (a, b) => [a, b])

console.log(tupleState.peek())
// print [10, 20]

state.update(15)
console.log(tupleState.peek())