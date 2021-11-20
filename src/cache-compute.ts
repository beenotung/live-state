export function makeSyncComputeCache<F extends(...args: any[]) => any>(
  computeFn: F,
  callback: (result: ReturnType<F>) => void,
) {
  let lastArgument: IArguments | undefined
  function run(args: IArguments) {
    lastArgument = args
    const result = computeFn.apply(null, args as unknown as Parameters<F>)
    callback(result)
  }
  function check() {
    if (!lastArgument || lastArgument.length !== arguments.length) {
      return run(arguments)
    }
    for (let i = 0; i < arguments.length; i++) {
      if (lastArgument[i] !== arguments[i]) {
        return run(arguments)
      }
    }
  }
  return check as (...args: Parameters<F>) => void
}

export function makeAsyncComputeCache<
  F extends(...args: any[]) => Promise<any>,
>(computeFn: F, callback: (result: ReturnType<F>) => void) {
  let lastArgument: IArguments | undefined
  async function run(args: IArguments) {
    lastArgument = args
    const result = await computeFn.apply(null, args as unknown as Parameters<F>)
    callback(result)
  }
  function check() {
    if (!lastArgument || lastArgument.length !== arguments.length) {
      return run(arguments)
    }
    for (let i = 0; i < arguments.length; i++) {
      if (lastArgument[i] !== arguments[i]) {
        return run(arguments)
      }
    }
  }
  return check as (...args: Parameters<F>) => Promise<void>
}
