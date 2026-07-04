// One-shot rename: turns the example_plugin template into YOUR plugin.
//
//   npm run rename -- your_plugin_id "Your Plugin Name"
//
// Rewrites the plugin id across plugin/ source, SQL, and IMPLEMENTATION.md
// (snake_case id, permission keys, table names, route prefix, env prefix,
// display name), then re-runs nothing — run `npm run check` afterwards.
// The id is permanent after release; rename BEFORE you ship anything.

import { readFileSync, readdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const [, , rawId, ...nameParts] = process.argv

if (!rawId || !/^[a-z][a-z0-9_]*$/.test(rawId)) {
  console.error('Usage: npm run rename -- your_plugin_id "Your Plugin Name"')
  console.error("Plugin ids are lowercase snake_case, e.g. client_changelog")
  process.exit(1)
}

const RESERVED = ["core", "plugin", "plugins", "example", "example_plugin"]
if (RESERVED.includes(rawId)) {
  console.error(`"${rawId}" is a reserved id. Choose the plugin's real, permanent name.`)
  process.exit(1)
}

const displayName = nameParts.join(" ").trim()
  || rawId.split("_").map((part) => part[0].toUpperCase() + part.slice(1)).join(" ")

const OLD_ID = "example_plugin"
const replacements = [
  [new RegExp(`plugin\\.${OLD_ID}\\.`, "g"), `plugin.${rawId}.`],
  [new RegExp(`plugin_${OLD_ID}_`, "g"), `plugin_${rawId}_`],
  [new RegExp(`/p/${OLD_ID}`, "g"), `/p/${rawId}`],
  [new RegExp(`PLUGIN_${OLD_ID.toUpperCase()}_`, "g"), `PLUGIN_${rawId.toUpperCase()}_`],
  [new RegExp(`plugins/${OLD_ID}`, "g"), `plugins/${rawId}`],
  [new RegExp(`\\b${OLD_ID}\\b`, "g"), rawId],
  [/Example Plugin/g, displayName],
]

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    return entry.isDirectory() ? walk(path) : [path]
  })
}

const targets = [...walk("plugin"), "IMPLEMENTATION.md"]
let changed = 0

for (const file of targets) {
  const before = readFileSync(file, "utf8")
  let after = before

  for (const [pattern, replacement] of replacements) {
    after = after.replace(pattern, replacement)
  }

  if (after !== before) {
    writeFileSync(file, after)
    changed += 1
    console.log(`rewrote ${file}`)
  }
}

console.log(`\nRenamed ${OLD_ID} -> ${rawId} ("${displayName}") across ${changed} files.`)
console.log("Next steps:")
console.log("  1. npm run check")
console.log("  2. Update README.md, IMPLEMENTATION.md prose, and screenshots for your plugin.")
console.log("  3. Replace the example notes feature with your real feature, keeping the same structure.")
