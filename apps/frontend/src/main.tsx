import React from "react";
import { hydrateRoot, createRoot } from "react-dom/client";
import type { DehydratedState } from "@tanstack/react-query";

import { App } from "@/app/App";
import "@/styles/globals.css";

declare global {
  interface Window {
    __ECOMMERCE_DEHYDRATED_STATE__?: DehydratedState;
  }
}

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

const app = (
  <React.StrictMode>
    <App dehydratedState={window.__ECOMMERCE_DEHYDRATED_STATE__} />
  </React.StrictMode>
);

if (root.hasChildNodes()) {
  hydrateRoot(root, app);
} else {
  createRoot(root).render(app);
}
