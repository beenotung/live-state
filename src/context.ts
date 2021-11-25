export type LifeCycle<T> = {
  setup?: (value: T) => void
  update?: (value: T, oldValue: T) => void
  teardown?: (value: T) => void
}

export type LiveContextOptions = {
  // For debugging
  name?: string
  // Default false. If true, will disallow triggering update externally
  passive?: boolean
}

export const Passive = true
export const NotPassive = false

export type ContextMode = boolean

export type PassiveContext<T> = Omit<LiveContext<T>, 'update'>

export class LiveContext<T> {
  static of<T>(value: T, name?: string) {
    return new LiveContext(value, NotPassive, name)
  }

  static combine<A, B, R>(
    aContext: PassiveContext<A>,
    bContext: PassiveContext<B>,
    combineFn: (a: A, b: B) => R,
    name?: string,
  ): PassiveContext<R> {
    const cContext = new LiveContext<R>(
      combineFn(aContext.peek(), bContext.peek()),
      Passive,
      name,
    )
    const aRemove = aContext.attach({
      update: a => cContext.applyUpdate(combineFn(a, bContext.peek())),
      teardown: () => cContext.teardown(),
    })
    const bRemove = bContext.attach({
      update: b => cContext.applyUpdate(combineFn(aContext.peek(), b)),
      teardown: () => cContext.teardown(),
    })
    cContext.attach({
      teardown: () => (aRemove(), bRemove()),
    })
    return cContext
  }

  protected constructor(
    protected _value: T,
    mode: ContextMode,
    public name?: string,
  ) {
    this.update = mode == Passive ? this.rejectUpdate : this.applyUpdate
  }

  peek() {
    return this._value
  }

  private lifeCycleSet = new Set<LifeCycle<T>>()

  attach(lifecycle: LifeCycle<T>) {
    this.lifeCycleSet.add(lifecycle)
    lifecycle.setup?.(this._value)
    const remove: () => void = () => this.lifeCycleSet.delete(lifecycle)
    return remove
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
    console.error(`${name} is passive context, should not be updated`)
    throw new Error('Cannot update passive context')
  }

  teardown() {
    this.lifeCycleSet.forEach(
      lifecycle => (
        lifecycle.teardown?.(this._value), this.lifeCycleSet.delete(lifecycle)
      ),
    )
  }

  map<R>(mapper: (value: T) => R, name?: string): PassiveContext<R> {
    const other = new LiveContext<R>(mapper(this.peek()), Passive, name)
    const remove = this.attach({
      update: value => other.applyUpdate(mapper(value)),
      teardown: () => other.teardown(),
    })
    other.attach({
      teardown: remove,
    })
    return other
  }
}
