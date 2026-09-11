import test from 'node:test'
import assert from 'node:assert/strict'
import { validateMetadata, validateAliases, readManifest } from '../scripts/lib/portability.mjs'
import path from 'node:path'
const template=readManifest(path.resolve('plugin'))
test('worked example has an explicit supported minimum',()=>{
  validateMetadata([template],'0.2.0')
  assert.throws(()=>validateMetadata([template],'0.1.0'))
})
test('dependencies require a sufficient installed version and ordering',()=>{
  const consumer={...template,id:'viewer',dependsOn:[{pluginId:template.id,minVersion:'2.0.0'}]}
  assert.throws(()=>validateMetadata([template,consumer],'0.2.0'))
  assert.throws(()=>validateMetadata([consumer,template],'0.2.0'))
})
test('example can receive a deployment alias without plugin source changes',()=>{
  const alias={path:'/notes',pluginId:template.id,route:''}
  validateAliases([alias],[template]);validateAliases([alias],[])
  assert.throws(()=>validateAliases([{...alias,path:'/settings'}],[template]))
})
