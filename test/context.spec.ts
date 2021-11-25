import { expect } from 'chai'
import sinon from 'sinon'
import { LiveContext, LifeCycle, PassiveContext } from '../src/context'

describe('context.ts', () => {
  context('LiveContext', () => {
    it('should get and set values', () => {
      let context = LiveContext.of('v1')
      expect(context.peek()).to.equals('v1')
      context.update('v2')
      expect(context.peek()).to.equals('v2')
    })

    it('should invoke setup lifecycle', () => {
      let context = LiveContext.of('v1')
      let setup = sinon.fake()
      context.attach({
        setup,
      })
      expect(setup.getCalls().length).to.equals(1)
    })

    it('should invoke teardown lifecycle', () => {
      let context = LiveContext.of('v1')
      let teardown = sinon.fake()
      context.attach({
        teardown,
      })
      expect(teardown.getCalls().length).to.equals(0)
      context.teardown()
      expect(teardown.getCalls().length).to.equals(1)
    })

    context('pushing live update', () => {
      let context: LiveContext<string>
      let update: sinon.SinonSpy
      let remove: () => void
      before(() => {
        context = LiveContext.of('v1')
        update = sinon.fake()
      })
      after(() => {
        context.teardown()
      })
      it('return remover function when attach lifecycle', () => {
        remove = context.attach({ update })
        expect(remove).to.be.a('function')
      })
      it('should push live update when attached lifecycle', () => {
        expect(update.getCalls().length).to.equals(0)
        context.update('v2')
        expect(update.getCalls().length).to.equals(1)
        expect(update.getCalls()[0].args).to.deep.equals(['v2', 'v1'])
      })
      it('should not push update when the new value is the same as old value', () => {
        context.update('v2')
        expect(update.getCalls().length).to.equals(1)
      })
      it('should update when value is changed multiple times', () => {
        context.update('v3')
        expect(update.getCalls().length).to.equals(2)
        expect(update.getCalls()[1].args).to.deep.equals(['v3', 'v2'])
      })
      it('remove lifecycle', () => {
        remove()
      })
      it('should not push live update after remove lifecycle', () => {
        context.update('v3')
        expect(update.getCalls().length).to.equals(2)
      })
    })

    context('context.map', () => {
      it('should push life cycle down the chain', () => {
        let context1 = LiveContext.of(1)
        let context2 = context1.map(x => x + 10)

        expect(context1.peek()).to.equals(1)
        expect(context2.peek()).to.equals(11)

        context1.update(2)
        expect(context1.peek()).to.equals(2)
        expect(context2.peek()).to.equals(12)

        let teardown = sinon.fake()
        context2.attach({ teardown })
        context1.teardown()

        expect(teardown.getCalls().length).to.equals(1)
      })

      it('should throw error when directly update mapped context', () => {
        let context1 = LiveContext.of(1)
        let context2 = context1.map(x => x + 10)

        let errorMock = mockConsoleError()
        expect(() => (context2 as LiveContext<any>).update(2)).to.throw(
          'Cannot update passive context',
        )
        expect(errorMock.spy.getCalls().length).to.equals(1)
        errorMock.restore()

        context1.teardown()
      })
    })

    context('LiveContext.combine', () => {
      let a: LiveContext<string>
      let b: LiveContext<string>
      let c: PassiveContext<[string, string]>
      before(() => {
        a = LiveContext.of('a')
        b = LiveContext.of('b')
      })
      it('should combine context with initial value', () => {
        c = LiveContext.combine(a, b, (a, b) => [a, b], '[a, b]')
        expect(c.peek()).to.deep.equals(['a', 'b'])
      })
      it('should push update from upstream', () => {
        a.update('aa')
        expect(c.peek()).to.deep.equals(['aa', 'b'])
        b.update('bb')
        expect(c.peek()).to.deep.equals(['aa', 'bb'])
      })
      it('should not re-compute when upstream value is not changed', () => {
        let value = c.peek()
        a.update('aa')
        b.update('bb')
        expect(c.peek()).to.equals(value)
      })
      it('should not allow update combined value from external', () => {
        let errorMock = mockConsoleError()
        expect(() => (c as LiveContext<any>).update('c')).to.throw(
          'Cannot update passive context',
        )
        expect(errorMock.spy.getCalls().length).to.equals(1)
        errorMock.restore()
      })
    })
  })
})

function mockConsoleError() {
  let originalError = console.error
  let spy = sinon.fake()
  console.error = spy

  let restore = () => (console.error = originalError)
  return { spy, restore }
}
