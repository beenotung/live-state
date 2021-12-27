import { LiveState } from 'live-state.ts'

let state = LiveState.of(10)

let detach = state.watch(value => console.log(value))
// print 10

state.update(20)
// print 20

detach()
state.update(30)
// won't print 30
