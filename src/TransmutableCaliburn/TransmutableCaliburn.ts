import { MR2Globals } from "magic-research-2-modding-sdk";
import { GameState } from "magic-research-2-modding-sdk/modding-decs/backend/GameState";
import { EquippableItem } from "magic-research-2-modding-sdk/modding-decs/backend/items/equipment/EquippableItem";
import { Resource } from "magic-research-2-modding-sdk/modding-decs/backend/Resources";
import {
  SpellElement,
  SpellElementType,
} from "magic-research-2-modding-sdk/modding-decs/backend/spells/Elements";

export const id = "TransmutableCaliburn";
export const name = "Transmutable Caliburn";
export const version = "1.0.0";
export const description =
  "A mod that adds a Transmutation spell for a secret, overpowered weapon...";

export function load(MR2: MR2Globals) {
  const caliburn = MR2.Items.getByIdNullable("caliburn") as EquippableItem;
  class TransmuteCaliburn extends MR2.EquipmentTransmutationSpell {
    getItem(): EquippableItem {
      return caliburn;
    }
    getCraftingElementLevelRequirements(): Partial<
      Record<SpellElement, number>
    > {
      return {
        Fire: 2,
      };
    }
    getCraftingMaterialsBase(state: GameState): {
      resources: Partial<Record<Resource, number>>;
      items: Record<string, number>;
    } {
      return {
        resources: {
          FireEssence: 100,
          Mana: 10,
        },
        items: {
          elementalShardFire: 1,
        },
      };
    }
    getElement(): SpellElementType | undefined {
      return MR2.SpellElement.Fire;
    }
  }
  const transmuteCaliburn = new TransmuteCaliburn();
  MR2.Spells.register(transmuteCaliburn);
}

export function preload(MR2: MR2Globals) {}
