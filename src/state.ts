export type LifeCycle<T> = {
  setup?: (value: T) => void
  update?: (value: T, oldValue: T) => void
  teardown?: (value: T) => void
}

export type StateMode = boolean

export type PassiveState<T> = Omit<LiveState<T>, 'update'>

// Default false. If true, will disallow triggering update externally
export const Mode = {
  Passive: true,
  NotPassive: false,
}
export class LiveState<T> {
  static of<T>(value: T, name?: string) {
    return new LiveState(value, Mode.NotPassive, name)
  }

  // TODO allow to update multiple state in batch (like transaction), to avoid this combined state do intermediate computation
  static combine<A, B, R>(
    a: PassiveState<A>,
    b: PassiveState<B>,
    combineFn: (a: A, b: B) => R,
    name?: string,
  ): PassiveState<R> {
    const c = new LiveState<R>(
      combineFn(a.peek(), b.peek()),
      Mode.Passive,
      name,
    )
    const detachA = a.attach({
      update: a => c.applyUpdate(combineFn(a, b.peek())),
      teardown: () => c.teardown(),
    })
    const detachB = b.attach({
      update: b => c.applyUpdate(combineFn(a.peek(), b)),
      teardown: () => c.teardown(),
    })
    c.attach({
      teardown: () => (detachA(), detachB()),
    })
    return c
  }

  protected constructor(
    protected _value: T,
    mode: StateMode,
    public name?: string, // for debugging
  ) {
    this.update = mode == Mode.Passive ? this.rejectUpdate : this.applyUpdate
  }

  peek() {
    return this._value
  }

  private lifeCycleSet = new Set<LifeCycle<T>>()

  attach(lifecycle: LifeCycle<T>) {
    this.lifeCycleSet.add(lifecycle)
    lifecycle.setup?.(this._value)
    const detach: () => void = () => this.lifeCycleSet.delete(lifecycle)
    return detach
  }

  update: (value: T) => void

  protected applyUpdate(value: T) {
    if (value === this._value) return
    const oldValue = this._value
    this._value = value
    this.lifeCycleSet.forEach(lifecycle =>
      lifecycle.update?.(this._value, oldValue),
    )
  }

  protected rejectUpdate() {
    const name = this.name || 'this'
    console.error(`${name} is passive state, should not be updated`)
    throw new Error('Cannot update passive state')
  }

  teardown() {
    this.lifeCycleSet.forEach(
      lifecycle => (
        lifecycle.teardown?.(this._value), this.lifeCycleSet.delete(lifecycle)
      ),
    )
  }

  map<R>(mapper: (value: T) => R, name?: string): PassiveState<R> {
    const other = new LiveState<R>(mapper(this.peek()), Mode.Passive, name)
    const detach = this.attach({
      update: value => other.applyUpdate(mapper(value)),
      teardown: () => other.teardown(),
    })
    other.attach({
      teardown: detach,
    })
    return other
  }

  watch(fn: (value: T) => void) {
    fn(this._value)
    const detach = this.attach({
      update: value => fn(value),
      teardown: () => detach(),
    })
    return detach
  }
}
