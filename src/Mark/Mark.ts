import { MR2Globals } from "magic-research-2-modding-sdk";
import {
  ActionEffect,
  DoActionArgs,
} from "magic-research-2-modding-sdk/modding-decs/backend/action/Action";
import { SpellAutocastCategory } from "magic-research-2-modding-sdk/modding-decs/backend/autocast/SpellAutocastCategory";
import { GameState } from "magic-research-2-modding-sdk/modding-decs/backend/GameState";
import { SpellElementType } from "magic-research-2-modding-sdk/modding-decs/backend/spells/Elements";
import { TemporaryEffectData } from "magic-research-2-modding-sdk/modding-decs/backend/temporaryeffects/TemporaryEffects";
import memoize from "sonic-memoize";

export const id = "Mark";
export const name = "Mark";
export const version = "1.0.2";
export const description =
  "A Mark spell, that lets you focus on a certain enemy. You will encounter the Marked enemy much more often.";

export function load(MR2: MR2Globals) {
  const getExplorationPossibilityTags = memoize(
    (floorId: string, enemyId: string | undefined, isFromFamiliars: boolean) =>
      [
        floorId,
        enemyId,
        MR2.TransformationTags.ExplorationWeight,
        isFromFamiliars
          ? MR2.TransformationTags.FromFamiliarExploration
          : MR2.TransformationTags.FromExploration,
      ].filter((value) => value != null),
  );

  class MarkTemporaryEffect extends MR2.TemporaryEffect {
    getId() {
      return "mark";
    }

    getDisplayName(): string {
      return "Mark";
    }

    getIcon() {
      return require("./mark.png");
    }

    getDisplayDescription(
      state: GameState,
      temporaryEffectData: TemporaryEffectData,
    ): string {
      const enemyId = temporaryEffectData.params.enemyId;
      const enemy = MR2.Enemies.getById(enemyId);
      const enemyName = enemy.getName();
      return `${MR2.formatMultiplier(
        temporaryEffectData.params.multiplier,
      )} chance to find ${enemyName} when exploring`;
    }
  }

  const markTemporaryEffect = new MarkTemporaryEffect();
  MR2.TemporaryEffects.register(markTemporaryEffect);

  MR2.registerTransformation(
    [[MR2.TransformationTags.ExplorationWeight]],
    markTemporaryEffect.getId(),
    markTemporaryEffect.getDisplayName(),
    MR2.TransformationType.Multiplier,
    (state, params) => {
      const enemyId = params.enemyId;
      if (MR2.hasTemporaryEffect(state, markTemporaryEffect.getId())) {
        const data = MR2.getTemporaryEffectData(
          state,
          markTemporaryEffect.getId(),
        );
        if (data != null && data.params.enemyId == enemyId) {
          return data.params.multiplier;
        }
      }
      return 1.0;
    },
  );

  MR2.DungeonFloor.prototype.getExplorationPossibilities = function (
    state: GameState,
    isFromFamiliars: boolean,
  ) {
    const basePossibilities = this.getBaseExplorationPossibilities(state);
    return basePossibilities.map((possibility) => ({
      weight: MR2.applyTransformations(
        getExplorationPossibilityTags(
          this.getId(),
          possibility.transforms.enemy?.getId?.(),
          isFromFamiliars,
        ),
        state,
        possibility.weight,
        { enemyId: possibility.transforms.enemy?.getId?.() },
      ),
      transforms: possibility.transforms,
    }));
  };

  class Mark extends MR2.CombatSpellBase {
    getId(): string {
      return "mark";
    }

    getSpellName(): string {
      return "Mark";
    }

    getElement(): SpellElementType {
      return MR2.SpellElement.Mind;
    }

    getAutocastCategory(): SpellAutocastCategory {
      return MR2.SpellAutocastCategory.GENERAL_BUFF;
    }

    getBaseManaCost(state: GameState): number {
      return 3000;
    }

    canUseOutsideOfCombat(): boolean {
      return false;
    }

    protected getBaseActionEffects(): Record<string, ActionEffect> {
      return {
        magnitude: {
          value: 2.0,
          tags: [MR2.TransformationTags.TemporaryEffectMagnitude],
          unit: "x chance of encountering Marked enemy",
        },
        duration: {
          value: 300.0,
          tags: [MR2.TransformationTags.TemporaryEffectDuration],
          unit: " sec",
        },
      };
    }

    doSpellAction(state: GameState, args: DoActionArgs): GameState {
      const effects = this.getActionEffects(state);
      const enemyId = state.run.exploration.currentEnemy?.id;
      if (enemyId == null || MR2.Enemies.getByIdNullable(enemyId) == null) {
        return state;
      }
      if (MR2.hasTemporaryEffect(state, markTemporaryEffect.getId())) {
        return MR2.clearTemporaryEffect(markTemporaryEffect.getId())(state);
      }
      return MR2.grantTemporaryEffect(
        markTemporaryEffect.getId(),
        effects.duration,
        {
          params: { multiplier: effects.magnitude + 1.0, enemyId },
        },
      )(state);
    }

    getDisplayDescription(state: GameState): string {
      return "Mark an enemy so that you can find it more often while Exploring. Use again to remove.";
    }

    getDisplayEffect(state: GameState): string {
      const effects = this.getActionEffects(state);
      const explanations = this.getActionEffectExplanations(state);
      return `^${MR2.formatMultiplier(effects.magnitude + 1.0)}^<${
        explanations.magnitude
      }> chance of finding the enemy you are currently fighting for ^${MR2.formatNumber(
        effects.duration,
      )}^<${explanations.duration}> sec`;
    }

    getLevelRequirements(): Partial<Record<SpellElementType, number>> {
      return { Mind: 32 };
    }
  }

  const mark = new Mark();
  MR2.Spells.register(mark);
}

export function preload(MR2: MR2Globals) {}
