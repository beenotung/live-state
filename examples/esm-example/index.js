import { LiveState } from 'live-state.ts'

const state = LiveState.of(1)
if (state.peek() == 1) {
  console.log('live-state.ts works with esm')
} else {
  process.exit(1)
}
