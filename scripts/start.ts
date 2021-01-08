import { exec } from "shelljs"

async function spawnRenderer() {
  exec("rollup -c -w", { async: true })
}

async function spawnMain() {
  exec("tsc src/main.ts --outDir public/build", { async: false })
  exec("electron-forge start", { async: true })
}

spawnRenderer()
spawnMain()
