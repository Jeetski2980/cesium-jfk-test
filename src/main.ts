import "cesium/Build/Cesium/Widgets/widgets.css";
import {
  BoundingSphere,
  Cartesian3,
  createWorldImageryAsync,
  createOsmBuildingsAsync,
  createWorldTerrainAsync,
  Ion,
  Math as CesiumMath,
  HeadingPitchRange,
  Terrain,
  Viewer,
} from "cesium";
import "./style.css";

const token = import.meta.env.VITE_CESIUM_ION_TOKEN?.trim();
const statusLabel = document.querySelector<HTMLElement>("#status")!;
const statusDot = document.querySelector<HTMLElement>("#status-dot")!;
const errorNote = document.querySelector<HTMLElement>("#error-note")!;
const resetButton = document.querySelector<HTMLButtonElement>("#reset-jfk")!;

const JFK = { longitude: -73.7781, latitude: 40.6413 };

function setStatus(status: "Token missing" | "Connecting" | "Connected" | "Request failed") {
  statusLabel.textContent = status;
  statusDot.dataset.state = status.toLowerCase().replaceAll(" ", "-");
}

function classifyIonFailure(error: unknown): string {
  const candidate = error as {
    statusCode?: number;
    httpStatus?: number;
    response?: { status?: number };
    message?: string;
  };
  const statusCode = candidate?.statusCode ?? candidate?.httpStatus ?? candidate?.response?.status;
  const message = typeof candidate?.message === "string" ? candidate.message : "";

  if (statusCode === 401) {
    return "The token was rejected. Check that the value in .env.local is current and copied correctly.";
  }
  if (statusCode === 403) {
    return "Ion denied access. Check the token’s assets:read scope, its allowed assets, and whether its Allowed URLs include this local app address.";
  }
  if (/failed to fetch|networkerror|network request|load failed/i.test(message) || statusCode === 0) {
    return "The browser could not reach Cesium ion. Check your internet connection, firewall, and browser network access.";
  }
  return "Check your internet connection, token validity, assets:read access, allowed assets, and the token’s Allowed URLs for this local app address.";
}

function showSafeFailure(error: unknown) {
  setStatus("Request failed");
  errorNote.textContent = classifyIonFailure(error);
  errorNote.hidden = false;
}

function aimAtJFK(viewer: Viewer) {
  const target = Cartesian3.fromDegrees(JFK.longitude, JFK.latitude, 0);
  viewer.camera.flyToBoundingSphere(new BoundingSphere(target, 1_000), {
    offset: new HeadingPitchRange(
      CesiumMath.toRadians(0),
      CesiumMath.toRadians(-45),
      12_000,
    ),
    duration: 1.2,
  });
}

const viewer = new Viewer("cesium-container", {
  animation: false,
  baseLayerPicker: false,
  geocoder: false,
  homeButton: false,
  infoBox: false,
  navigationHelpButton: false,
  sceneModePicker: false,
  selectionIndicator: false,
  timeline: false,
  baseLayer: false,
});
viewer.scene.globe.enableLighting = true;
aimAtJFK(viewer);

resetButton.addEventListener("click", () => aimAtJFK(viewer));

if (!token) {
  setStatus("Token missing");
  errorNote.textContent = "Add VITE_CESIUM_ION_TOKEN=your_real_token to .env.local in this folder, then restart the dev server.";
  errorNote.hidden = false;
} else {
  Ion.defaultAccessToken = token;
  setStatus("Connecting");

  void (async () => {
    try {
      const terrainProvider = await createWorldTerrainAsync();
      viewer.scene.setTerrain(new Terrain(Promise.resolve(terrainProvider)));

      const optionalLayerNotes: string[] = [];
      try {
        const imageryProvider = await createWorldImageryAsync();
        viewer.imageryLayers.addImageryProvider(imageryProvider);
      } catch {
        optionalLayerNotes.push("The Cesium World Imagery basemap wasn’t available. Check its asset access in Cesium ion.");
      }

      try {
        const buildings = await createOsmBuildingsAsync();
        viewer.scene.primitives.add(buildings);
      } catch {
        optionalLayerNotes.push("The optional 3D buildings layer wasn’t available. Check its asset access in Cesium ion.");
      }

      if (optionalLayerNotes.length > 0) {
        errorNote.textContent = `Terrain connected. ${optionalLayerNotes.join(" ")}`;
        errorNote.hidden = false;
      }

      setStatus("Connected");
    } catch (error) {
      showSafeFailure(error);
    }
  })();
}

export {};
