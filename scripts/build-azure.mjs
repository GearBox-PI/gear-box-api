#!/usr/bin/env node

import { spawn } from 'node:child_process'
import { rm, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..')
const buildDir = join(projectRoot, 'build')
const deployZip = join(projectRoot, 'deploy.zip')

async function run(command, args, options = {}) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: false,
      ...options,
    })

    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) {
        resolve(code)
        return
      }
      reject(
        new Error(`Command "${command} ${args.join(' ')}" exited with code ${code}`)
      )
    })
  })
}

async function removeEnvFiles() {
  if (!existsSync(buildDir)) {
    return
  }

  const entries = await readdir(buildDir, { withFileTypes: true })
  await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.startsWith('.env'))
      .map((entry) => rm(join(buildDir, entry.name)))
  )
}

async function main() {
  console.info('→ Building TypeScript sources')
  await run('node', ['ace', 'build'], { cwd: projectRoot })

  console.info('→ Installing production dependencies inside build/')
  await run('npm', ['install', '--omit=dev'], { cwd: buildDir })

  console.info('→ Removing .env files from build/')
  await removeEnvFiles()

  if (existsSync(deployZip)) {
    await rm(deployZip)
  }

  console.info('→ Creating deploy.zip')
  await run('zip', ['-r', deployZip, '.'], { cwd: buildDir })

  console.info('\n✅ deploy.zip pronto para publicar no Azure App Service.\n')
}

main().catch((error) => {
  console.error('\nBuild for Azure failed:')
  console.error(error)
  process.exitCode = 1
})
