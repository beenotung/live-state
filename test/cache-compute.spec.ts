import {
  makeSyncComputeCache,
  makeAsyncComputeCache,
} from '../src/cache-compute'
import sinon from 'sinon'
import { expect } from 'chai'

describe('cache-compute.ts', () => {
  let userList = [1, 2, 3, 4, 5]

  context('makeSyncComputeCache', () => {
    function listUser(users: any[], offset: number, count: number) {
      return users.slice(offset, offset + count)
    }
    it('should invoke callback initially', () => {
      let sendUserList = sinon.fake()
      let checkListUser = makeSyncComputeCache(listUser, sendUserList)
      checkListUser(userList, 2, 2)
      let calls = sendUserList.getCalls()
      expect(calls.length).to.equals(1)
      expect(calls[0].args).to.deep.equals([[3, 4]])
    })

    it('should not invoke callback if given same arguments', () => {
      let sendUserList = sinon.fake()
      let checkListUser = makeSyncComputeCache(listUser, sendUserList)
      checkListUser(userList, 2, 2)
      checkListUser(userList, 2, 2)
      let calls = sendUserList.getCalls()
      expect(calls.length).to.equals(1)
      expect(calls[0].args).to.deep.equals([[3, 4]])
    })

    it('should invoke callback if given different arguments', () => {
      let sendUserList = sinon.fake()
      let checkListUser = makeSyncComputeCache(listUser, sendUserList)
      checkListUser(userList, 2, 2)
      checkListUser(userList, 3, 2)
      let calls = sendUserList.getCalls()
      expect(calls.length).to.equals(2)
      expect(calls[0].args).to.deep.equals([[3, 4]])
      expect(calls[1].args).to.deep.equals([[4, 5]])
    })
  })

  context('makeAsyncComputeCache', () => {
    async function listUser(users: any[], offset: number, count: number) {
      return users.slice(offset, offset + count)
    }
    it('should invoke callback initially', async () => {
      let sendUserList = sinon.fake()
      let checkListUser = makeAsyncComputeCache(listUser, sendUserList)
      await checkListUser(userList, 2, 2)
      let calls = sendUserList.getCalls()
      expect(calls.length).to.equals(1)
      expect(calls[0].args).to.deep.equals([[3, 4]])
    })

    it('should not invoke callback if given same arguments', async () => {
      let sendUserList = sinon.fake()
      let checkListUser = makeAsyncComputeCache(listUser, sendUserList)
      await checkListUser(userList, 2, 2)
      await checkListUser(userList, 2, 2)
      let calls = sendUserList.getCalls()
      expect(calls.length).to.equals(1)
      expect(calls[0].args).to.deep.equals([[3, 4]])
    })

    it('should invoke callback if given different arguments', async () => {
      let sendUserList = sinon.fake()
      let checkListUser = makeAsyncComputeCache(listUser, sendUserList)
      await checkListUser(userList, 2, 2)
      await checkListUser(userList, 3, 2)
      let calls = sendUserList.getCalls()
      expect(calls.length).to.equals(2)
      expect(calls[0].args).to.deep.equals([[3, 4]])
      expect(calls[1].args).to.deep.equals([[4, 5]])
    })
  })
})
