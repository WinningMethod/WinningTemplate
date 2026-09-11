import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { readManifest, validateMetadata, validateImports } from './lib/portability.mjs'

// Standalone template has no owner dependencies. Real dependent plugins run
// the scratch integration command against a deployment with their owners.
const manifest=readManifest(path.resolve('plugin'))
if (!manifest.minCoreVersion) throw new Error('Declare minCoreVersion')
const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'winning-template-contract-'))
try {
  const folder=path.join(scratch,'plugins',manifest.id)
  fs.cpSync('plugin',folder,{recursive:true})
  validateMetadata([{...manifest,folder}],manifest.minCoreVersion)
  validateImports(scratch,[{...manifest,folder}])
  const guide=fs.readFileSync('IMPLEMENTATION.md','utf8')
  for (const heading of ['What the plugin does','Compatibility','Install','Environment','Tables and permissions','Navigation','External integrations','Validation','Removal','Known limitations']) {
    if (!new RegExp(`^## (?:[0-9]+\\. )?${heading}`, 'm').test(guide)) throw new Error(`IMPLEMENTATION.md needs ## ${heading}`)
  }
  if (!guide.includes('Verified Core revision:')) throw new Error('Record the tested Core revision (or explicitly mark it pending)')
  console.log('Template portability metadata, boundaries and handover sections passed')
} finally {fs.rmSync(scratch,{recursive:true,force:true})}
