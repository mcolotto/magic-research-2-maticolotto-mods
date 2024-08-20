import { MR2Globals } from "magic-research-2-modding-sdk";
import { loadFungalResearchBase, preloadFungalResearchBase } from "./Base";

export const id = "FungalResearch";
export const name = "Fungal Research";
export const version = "1.0.0";
export const description =
  "A slight side adventure revolving around an odd Element...";

export function load(MR2: MR2Globals) {
  loadFungalResearchBase(MR2);
}

export function preload(MR2: MR2Globals) {
  preloadFungalResearchBase(MR2);
}
