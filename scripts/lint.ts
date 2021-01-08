import { exec } from "shelljs"

exec("eslint --ext .ts .")
exec("svelte-check")
exec("prettier --check .")
