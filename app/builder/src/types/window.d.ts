import type { WebContainer } from "@webcontainer/api";

declare global {
  interface Window {
    __wc?: WebContainer;
  }
}

export {};