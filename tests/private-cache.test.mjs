import test from 'node:test'
import assert from 'node:assert/strict'
import { loadCachedBoard, saveCachedBoard, loadBoardSelection, saveBoardSelection } from '../src/services/storageService.js'
test('public and each private account have isolated caches and selections', () => {
  const data = new Map()
  globalThis.window = { localStorage: { getItem: (key) => data.get(key) ?? null, setItem: (key,value) => data.set(key,value) } }
  try {
    saveCachedBoard({ tasks: ['public'] })
    saveBoardSelection({ selectedDepartmentId: 'public', selectedProtocolId: 'p' })
    assert.equal(loadCachedBoard('owner'), null)
    assert.equal(loadBoardSelection('owner'), null)
    saveCachedBoard({ tasks: ['private'] }, 'owner')
    saveBoardSelection({ selectedDepartmentId: 'private', selectedProtocolId: 'p2' }, 'owner')
    assert.deepEqual(loadCachedBoard().tasks, ['public'])
    assert.deepEqual(loadCachedBoard('owner').tasks, ['private'])
    assert.equal(loadCachedBoard('other-owner'), null)
    assert.equal(loadBoardSelection('other-owner'), null)
    assert.equal(loadBoardSelection().selectedDepartmentId, 'public')
    assert.equal(loadBoardSelection('owner').selectedDepartmentId, 'private')
    saveCachedBoard({ departments: [{ user_id: 'owner' }], tasks: ['private'] })
    assert.equal(loadCachedBoard(), null, 'reject private rows in an old public cache')
    saveCachedBoard({ departments: [{ user_id: null }], tasks: ['public'] }, 'owner')
    assert.equal(loadCachedBoard('owner'), null, 'reject public rows in a private cache')
  } finally { delete globalThis.window }
})
