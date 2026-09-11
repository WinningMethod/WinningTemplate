import path from 'node:path'
import fs from 'node:fs'
import { spawnSync } from 'node:child_process'
const core=process.argv[2] && path.resolve(process.argv[2])
if (!core || !fs.existsSync(path.join(core,'scripts/check-plugin-integration.mjs'))) throw new Error('Usage: npm run integration:check -- /path/to/WinningOS-0.2-or-newer')
const r=spawnSync(process.execPath,[path.join(core,'scripts/check-plugin-integration.mjs'),process.cwd()],{stdio:'inherit'})
process.exit(r.status??1)
