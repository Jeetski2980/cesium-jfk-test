# Cesium ion JFK test

Small Vite + TypeScript app for checking Cesium ion terrain and optional OSM buildings around JFK Airport.

## Run locally

1. Copy `.env.example` to `.env.local`.
2. In `.env.local`, replace the placeholder with your Cesium ion token:

   ```dotenv
   VITE_CESIUM_ION_TOKEN=your_real_token
   ```

3. Install and start the app:

   ```sh
   npm install
   npm run dev
   ```

The app reads the token through Vite's `import.meta.env.VITE_CESIUM_ION_TOKEN`. `.env.local` is ignored by Git. If an ion request is denied, check the token's `assets:read` scope, allowed assets, and Allowed URLs. This test does not edit ion token settings.

The location and scene are for map access testing. They don't claim accurate runway or taxiway geometry.
