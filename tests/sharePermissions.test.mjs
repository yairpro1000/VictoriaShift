import test from 'node:test'
import assert from 'node:assert/strict'
import { protocolChoices, changePermission, accessProtocols, mayEditProtocol } from '../src/services/sharePermissions.js'
const protocols = [{id:'a'},{id:'b'},{id:'c'}]
test('all current protocols default to view and edit', () => {
  assert.deepEqual(protocolChoices(protocols), protocols.map(row => ({protocol_id:row.id,can_view:true,can_edit:true})))
})
test('view and edit bulk controls enforce edit includes view', () => {
  let rows = protocolChoices(protocols)
  rows = protocolChoices(protocols, changePermission(rows,null,'can_edit',false))
  assert.ok(rows.every(row => row.can_view && !row.can_edit))
  rows = protocolChoices(protocols, changePermission(rows,'b','can_view',false))
  assert.equal(rows[1].can_view,false)
  rows = protocolChoices(protocols, changePermission(rows,'b','can_edit',true))
  assert.equal(rows[1].can_view,true)
  assert.equal(rows[1].can_edit,true)
  rows = protocolChoices(protocols, changePermission(rows,null,'can_view',false))
  assert.ok(rows.every(row => !row.can_view && !row.can_edit))
  rows = protocolChoices(protocols, changePermission(rows,null,'can_edit',true))
  assert.ok(rows.every(row => row.can_view && row.can_edit))
})
test('access checks distinguish hidden, view-only and editable protocols regardless of manager flag', () => {
  const access = {is_manager:true,protocols:[{protocol_id:'a',can_view:true,can_edit:true},{protocol_id:'b',can_view:true,can_edit:false}]}
  assert.equal(mayEditProtocol(access,'a'),true)
  assert.equal(mayEditProtocol(access,'b'),false)
  assert.equal(mayEditProtocol(access,'c'),false)
  assert.equal(mayEditProtocol({...access,is_manager:false},'a'),true)
  assert.equal(mayEditProtocol({protocols:[]},'a'),false)
  assert.equal(mayEditProtocol(null,'a'),true)
  assert.equal(accessProtocols({protocol_id:'legacy'})[0].can_edit,true)
})
