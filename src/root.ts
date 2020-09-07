import { supportedDeviceTypes, unsupportedDeviceString } from "./global";

export default async function (deviceType: string) {
  switch (deviceType) {
    case supportedDeviceTypes.GOOGLE_PIXEL:
      await GooglePixel();
      break;
    default:
      console.log(unsupportedDeviceString);
  }
}

async function GooglePixel() {}
