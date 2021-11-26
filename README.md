# live-state.ts

Create composable and reactive state that propagate updates down the stream without unnecessary computation.

[![npm Package Version](https://img.shields.io/npm/v/live-state.ts.svg?maxAge=3600)](https://www.npmjs.com/package/live-state.ts)

This library helps to maintain consistent state in realtime applications.

It is inspired from [s.js](https://github.com/?/s-js) and [rxjs](https://github.com/reactive-x/rxjs), and aim to keep it simple.

## Main Features

- Live Context with realtime update automatically pushed to attached lifecycle hooks
- Skip unnecessary computation
- Cached Compute (memorized function with update callback)

## Feature

- Built-in Typescript support
- 100% tested with ts-mocha
