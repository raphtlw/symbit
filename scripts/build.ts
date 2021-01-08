import { exec } from "shelljs"

exec("rollup -c")
exec("tsc src/main.ts --outDir public/build")
exec("electron-forge make")
