import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveBoardSelection, categoriesForSelection } from '../src/services/boardSelection.js'
import { loadBoardSelection, saveBoardSelection } from '../src/services/storageService.js'

const departments = [{ id: 'lob', name: 'Lobhörner' }, { id: 'pasta', name: 'Pasta & More' }]
const protocols = [
  { id: 'opening', department_id: 'pasta', name: 'Opening', active: true },
  { id: 'closing', department_id: 'pasta', name: 'Shift Teardown', active: true },
]
const categories = [{ id: 'surfaces', protocol_id: 'closing' }, { id: 'setup', protocol_id: 'opening' }]

test('first visit defaults to the named department and protocol regardless of list order', () => {
  assert.deepEqual(resolveBoardSelection(departments, protocols, null), {
    selectedDepartmentId: 'pasta', selectedProtocolId: 'closing',
  })
})

test('saved nondefault protocol is preserved', () => {
  assert.equal(resolveBoardSelection(departments, protocols, {
    selectedDepartmentId: 'pasta', selectedProtocolId: 'opening',
  }).selectedProtocolId, 'opening')
})

test('empty department never inherits another department protocol or categories', () => {
  const selected = resolveBoardSelection(departments, protocols, {
    selectedDepartmentId: 'lob', selectedProtocolId: 'closing',
  })
  assert.deepEqual(selected, { selectedDepartmentId: 'lob', selectedProtocolId: '' })
  assert.deepEqual(categoriesForSelection(categories, protocols, 'lob', ''), [])
  assert.deepEqual(categoriesForSelection(categories, protocols, 'lob', 'closing'), [])
})

test('valid protocol scopes categories, deleted selections fall back safely', () => {
  assert.deepEqual(categoriesForSelection(categories, protocols, 'pasta', 'closing'), [categories[0]])
  assert.equal(resolveBoardSelection(departments, protocols, {
    selectedDepartmentId: 'removed', selectedProtocolId: 'removed',
  }).selectedProtocolId, 'closing')
  assert.deepEqual(resolveBoardSelection([], [], null), { selectedDepartmentId: '', selectedProtocolId: '' })
})

test('selection survives localStorage round trip, including empty department protocols', () => {
  const data = new Map()
  globalThis.window = { localStorage: {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
  } }
  try {
    assert.equal(loadBoardSelection(), null)
    for (const selection of [
      { selectedDepartmentId: 'pasta', selectedProtocolId: 'opening' },
      { selectedDepartmentId: 'lob', selectedProtocolId: '' },
    ]) {
      saveBoardSelection(selection)
      assert.deepEqual(loadBoardSelection(), selection)
    }
    data.clear()
    data.set('victoria-shift-board-cache', JSON.stringify({
      selectedDepartmentId: 'pasta', selectedProtocolId: 'opening',
    }))
    assert.equal(loadBoardSelection().selectedProtocolId, 'opening')
    data.set('victoria-shift-board-selection', '{broken')
    assert.equal(loadBoardSelection(), null)
  } finally {
    delete globalThis.window
  }
})
