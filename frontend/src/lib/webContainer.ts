import { WebContainer } from "@webcontainer/api";

let wc: WebContainer | null = null;
let bootPromise: Promise<WebContainer> | null = null;

export async function getWebContainer() {
  if (wc) return wc;

  if (!bootPromise) {
    bootPromise = WebContainer.boot().then((instance) => {
      wc = instance;
      return instance;
    });
  }

  return bootPromise;
}