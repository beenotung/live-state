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

export class LiveContext<T> {
  static of<T>(value: T, name?: string) {
    return new LiveContext(value, NotPassive, name)
  }

  protected constructor(
    protected _value: T,
    passive: boolean,
    public name?: string,
  ) {
    this.update = passive ? this.rejectUpdate : this.applyUpdate
  }

  peek() {
    return this._value
  }

  private lifeCycleSet = new Set<LifeCycle<T>>()

  attach(lifecycle: LifeCycle<T>) {
    this.lifeCycleSet.add(lifecycle)
    lifecycle.setup?.(this._value)
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
    this.lifeCycleSet.forEach(lifecycle => lifecycle.teardown?.(this._value))
  }

  map<R>(mapper: (value: T) => R, name?: string): LiveContext<R> {
    const life = new LiveContext<R>(mapper(this._value), Passive, name)
    const thisLifeCycle: LifeCycle<T> = {
      update(value) {
        life.applyUpdate(mapper(value))
      },
      teardown() {
        life.teardown()
      },
    }
    this.lifeCycleSet.add(thisLifeCycle)
    life.attach({
      teardown: () => {
        this.lifeCycleSet.delete(thisLifeCycle)
      },
    })
    return life
  }
}
