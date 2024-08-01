import { MR2Globals } from "magic-research-2-modding-sdk";
import { ActionEffect } from "magic-research-2-modding-sdk/modding-decs/backend/action/Action";
import { GameState } from "magic-research-2-modding-sdk/modding-decs/backend/GameState";
import { ItemParams } from "magic-research-2-modding-sdk/modding-decs/backend/items/Item";
import { t } from "./utils";

export function loadItemChanges(MR2: MR2Globals) {
  const potionOfAlacrity = MR2.Items.getById("potionOfAlacrity");
  // @ts-ignore
  potionOfAlacrity.getBaseItemEffects = function (): Record<
    string,
    ActionEffect
  > {
    return {
      magnitude: {
        value: 0.13636,
        tags: [MR2.TransformationTags.TemporaryEffectMagnitude],
        valueType: MR2.TransformationValueType.Divisor,
      },
      duration: {
        value: 300,
        tags: [MR2.TransformationTags.TemporaryEffectDuration],
      },
    };
  };
  potionOfAlacrity.getEffect = function (
    state: GameState,
    params: ItemParams,
  ): string | undefined {
    const effects = this.getItemEffects(state, params);
    const explanations = this.getItemEffectExplanations(state, params);
    return t(
      "^-{{magnitude}}%^<{{explanation}}>:attackDelay: for ^{{duration}}^<{{durationExplanation}}> sec",
      {
        magnitude: MR2.formatNumber(
          Math.abs(1 - 1 / (effects.magnitude + 1)) * 100,
        ),
        explanation: explanations?.magnitude,
        duration: MR2.formatNumber(Math.floor(effects.duration)),
        durationExplanation: explanations?.duration,
      },
    );
  };
  MR2.registerTransformation(
    [[MR2.AttackTarget.Player, MR2.CombatStat.AttackDelay]],
    "potionOfAlacrity",
    MR2.TemporaryEffects.getById("potionOfAlacrity").getDisplayName(),
    MR2.TransformationType.Multiplier,
    (state) =>
      MR2.hasTemporaryEffect(state, "potionOfAlacrity", MR2.AttackTarget.Player)
        ? 1 /
            (MR2.getTemporaryEffectData(
              state,
              "potionOfAlacrity",
              MR2.AttackTarget.Player,
            )?.params?.magnitude ?? 0) +
          1
        : 1.0,
  );
}
