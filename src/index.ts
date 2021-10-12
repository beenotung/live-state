export type Listener<T> = (value: T) => void

export class EventEmitter<T> {
  private listenerSet = new Set<Listener<T>>()
  protected emit(event: T) {
    this.listenerSet.forEach(f => f(event))
  }
  on(listener: Listener<T>) {
    this.listenerSet.add(listener)
  }
  off(listener: Listener<T>) {
    this.listenerSet.delete(listener)
  }
}

export class DataContext<T> extends EventEmitter<T> {
  constructor(protected _value: T) {
    super()
  }
  getValue() {
    return this._value
  }
  setValue(value: T) {
    this._value = value
    this.emit(value)
  }
  map<R>(fn: (value: T) => R): DataContext<R> {
    let Class = this.constructor as any
    let g: DataContext<R> = new Class(fn(this.getValue()))
    this.on(x => g.setValue(fn(x)))
    return g
  }

  reduce(fn: (acc: T, current: T) => T): DataContext<T> {
    let Class = this.constructor as any
    let g: DataContext<T> = new Class(this.getValue())
    this.on(current => g.setValue(fn(g.getValue(), current)))
    return g
  }
}

export class ValueContext<T> extends DataContext<T> {
  set value(value: T) {
    if (value === this._value) {
      return
    }
    super.setValue(value)
  }
}

export type Lifecycle<T> = {
  setup: (value: T) => void
  update: (value: T, oldValue: T) => void
  teardown: (value: T) => void
}

export class LifeContext<T> {
  constructor(protected _value: T) {}

  peek() {
    return this._value
  }

  lifeCycleSet = new Set<Lifecycle<T>>()

  attach(lifecycle: Lifecycle<T>) {
    this.lifeCycleSet.add(lifecycle)
    lifecycle.setup(this._value)
  }

  update(value: T) {
    let oldValue = this._value
    this._value = value
    this.lifeCycleSet.forEach(lifecycle =>
      lifecycle.update(this._value, oldValue),
    )
  }

  teardown() {
    this.lifeCycleSet.forEach(lifecycle => lifecycle.teardown(this._value))
  }
}
