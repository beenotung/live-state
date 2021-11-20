import { expect } from 'chai'
import sinon from 'sinon'
import { LiveContext } from '../src/context'

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

    it('should push live update', () => {
      let context = LiveContext.of('v1')
      let update = sinon.fake()
      context.attach({
        update,
      })
      expect(update.getCalls().length).to.equals(0)

      context.update('v2')
      expect(update.getCalls().length).to.equals(1)
      expect(update.getCalls()[0].args).to.deep.equals(['v2', 'v1'])

      context.teardown()
    })

    it('should not push update when value is the same', () => {
      let context = LiveContext.of('v1')
      let update = sinon.fake()
      context.attach({
        update,
      })
      expect(update.getCalls().length).to.equals(0)

      context.update('v1')
      expect(update.getCalls().length).to.equals(0)

      context.update('v2')
      expect(update.getCalls().length).to.equals(1)
      expect(update.getCalls()[0].args).to.deep.equals(['v2', 'v1'])

      context.update('v2')
      expect(update.getCalls().length).to.equals(1)

      context.update('v3')
      expect(update.getCalls().length).to.equals(2)
      expect(update.getCalls()[1].args).to.deep.equals(['v3', 'v2'])

      context.update('v3')
      expect(update.getCalls().length).to.equals(2)

      context.teardown()
    })

    context('mapped context', () => {
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

        let originalError = console.error
        let fakeError = sinon.fake()
        console.error = fakeError
        expect(() => context2.update(2)).to.throw(
          'Cannot update passive context',
        )
        expect(fakeError.getCalls().length).to.equals(1)
        console.error = originalError

        context1.teardown()
      })
    })
  })
})
