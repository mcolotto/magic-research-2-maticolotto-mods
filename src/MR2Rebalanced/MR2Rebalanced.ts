import { MR2Globals } from "magic-research-2-modding-sdk";
import { loadItemChanges } from "./loadItemChanges";
import { loadMiscLogic, preloadMiscLogic } from "./loadMiscLogic";
import { loadSpellChanges } from "./loadSpellChanges";
import { loadTrasmutationOverrides } from "./transmutationOverrides";

export const id = "MR2Rebalanced";
export const name = "MR2 - Rebalanced";
export const version = "1.0.0";
export const description =
  "Rebalances the scaling of effects, especially in late and post-game";

export function load(MR2: MR2Globals) {
  loadTrasmutationOverrides(MR2);
  loadItemChanges(MR2);
  loadSpellChanges(MR2);
  loadMiscLogic(MR2);
}

export function preload(MR2: MR2Globals) {
  preloadMiscLogic(MR2);
}
