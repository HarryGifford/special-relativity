import { Gltf } from "@sr/gltf-types";

export const loadGltf = async (filename: string): Promise<Gltf> => {
  const resp = await fetch(filename);
  if (!resp.ok) {
    throw new Error(resp.statusText);
  }
  const json = await resp.json();
  return json;
}

export * from "./gltf-to-scene";
