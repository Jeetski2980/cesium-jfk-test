import { cp, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const cesiumBuild = join(projectRoot, "node_modules/cesium/Build/Cesium");
const publicCesium = join(projectRoot, "public/Cesium");

await mkdir(publicCesium, { recursive: true });
for (const folder of ["Workers", "ThirdParty", "Assets", "Widgets"]) {
  await cp(join(cesiumBuild, folder), join(publicCesium, folder), { recursive: true });
}
