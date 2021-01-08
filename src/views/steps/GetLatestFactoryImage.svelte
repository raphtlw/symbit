<script lang="ts">
  import { Link, Button, StepDoneButton, Loader } from "../../components"
  import {
    remote,
    extract,
    DIR,
    glob,
    path,
    fs,
    Log,
    imageDirStore,
  } from "../../global"

  let pathToImageZipFile: string
  let imageDir: string

  imageDirStore.subscribe((value) => (imageDir = value))

  async function processImageZipFile() {
    try {
      await extract(pathToImageZipFile, { dir: DIR })
      imageDir = glob.sync(
        `${DIR}/${path.basename(pathToImageZipFile, ".zip").split("-")[0]}*`
      )[0]
      imageDirStore.set(imageDir)
      Log.i(`Image directory saved in global state as: ${imageDir}`)
      await extract(glob.sync(`${imageDir}/image-*.zip`)[0], {
        dir: imageDir,
      })
      fs.unlink(`${imageDir}.zip`, () => {
        Log.i("Deleted image directory zip")
      })
      Log.i("Extracted inner image folder")
    } catch (e) {
      remote.dialog.showErrorBox("Error", e.message)
    }
  }
</script>

<div>
  Please download the latest factory image for your Google Pixel and unzip the
  zip file from
  <Link href="https://developers.google.com/android/images">here.</Link>
</div>
<span class="spacing-top spacing-bottom">Select the zip file you downloaded</span>
<div class="horizontal-layout">
  <Button
    label="Choose file"
    onClick={async () => {
      const result = await remote.dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Zip files', extensions: ['zip'] }],
      })
      if (!result.canceled) {
        pathToImageZipFile = result.filePaths[0]
      }
    }} />
  <span
    class="spacing-left"
    style="margin-top: 0.5rem">{pathToImageZipFile}</span>
</div>
{#if pathToImageZipFile !== undefined}
  <span class="spacing-top spacing-bottom">Processing file...</span>
  {#await processImageZipFile()}
    <div class="loading">
      <Loader primary />
    </div>
  {:then}
    <StepDoneButton />
  {/await}
{/if}
