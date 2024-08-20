import { MR2Globals } from "magic-research-2-modding-sdk";
import {
  DungeonFloor,
  ExplorationPossibility,
} from "magic-research-2-modding-sdk/modding-decs/backend/exploration/dungeons/DungeonFloor";
import { Enemy } from "magic-research-2-modding-sdk/modding-decs/backend/exploration/enemies/Enemy";
import { GameState } from "magic-research-2-modding-sdk/modding-decs/backend/GameState";

export function loadShroomWorld(MR2: MR2Globals) {
  const MYSTIFYING_MUSHGROVE_POSSIBILITIES = [];
  class MystifyingMushgrove extends MR2.DungeonFloor {
    getId(): string {
      return "mystifyingMushgrove";
    }
    getFloorName(): string {
      return "Mystifying Mushgrove";
    }
    getBoss(state: GameState): Enemy | undefined {
      return undefined;
    }
    getBreedingLevel(): number {
      return 15;
    }
    isMainStoryDungeonFloor(): boolean {
      return false;
    }
    getBaseExplorationPossibilities(
      state: GameState,
    ): ExplorationPossibility[] {
      return MYSTIFYING_MUSHGROVE_POSSIBILITIES;
    }
  }

  const mystifyingMushgrove = new MystifyingMushgrove();
  MR2.DungeonFloors.register(mystifyingMushgrove);

  class ShroomWorld extends MR2.Dungeon {
    getId(): string {
      return "shroomWorld";
    }
    getName(): string {
      return "Shroom World";
    }
    getDungeonFloors(): DungeonFloor[] {
      return [mystifyingMushgrove];
    }
    isUnlocked(state: GameState): boolean {
      return false;
    }
  }
  const shroomWorld = new ShroomWorld();
  MR2.Dungeons.register(shroomWorld);
}
