import { MR2Globals } from "magic-research-2-modding-sdk";
import { ActionEffect } from "magic-research-2-modding-sdk/modding-decs/backend/action/Action";
import { ItemParams } from "magic-research-2-modding-sdk/modding-decs/backend/items/Item";

const BASE_POWER_MULTIPLIER = 0.7;
const ENABLE_BALANCING_ACT = true;

export function preloadMiscLogic(MR2: MR2Globals) {
  if (ENABLE_BALANCING_ACT) {
    MR2.registerTransformation(
      [
        [MR2.TransformationValueType.Percent],
        [MR2.TransformationValueType.Divisor],
      ],
      "multiplierBasePower",
      "Multiplying effect",
      // @ts-ignore This is ok
      MR2.TransformationType.Power,
      (_state) => BASE_POWER_MULTIPLIER,
    );

    MR2.registerTransformation(
      [
        MR2.TransformationTags.ActionEffect,
        MR2.TransformationTags.SpellcraftEffect,
        MR2.TransformationTags.ItemEffect,
        MR2.TransformationTags.RitualEffect,
        MR2.TransformationTags.SynchroEffect,
      ].map((effect) => [effect, MR2.CombatStat.AttackDelay]),
      "attackDelayBasePower",
      "Attack Delay",
      // @ts-ignore This is ok
      MR2.TransformationType.Power,
      (_state) => BASE_POWER_MULTIPLIER,
    );

    MR2.registerTransformation(
      [
        MR2.TransformationTags.ActionEffect,
        MR2.TransformationTags.SpellcraftEffect,
        MR2.TransformationTags.ItemEffect,
        MR2.TransformationTags.RitualEffect,
        MR2.TransformationTags.SynchroEffect,
      ].map((effect) => [effect, MR2.CombatStat.Dodge]),
      "dodgeBasePower",
      "Dodge",
      // @ts-ignore This is ok
      MR2.TransformationType.Power,
      (_state) => BASE_POWER_MULTIPLIER,
    );

    MR2.registerTransformation(
      [
        [
          MR2.TransformationTags.ItemEffect,
          MR2.TransformationTags.TemporaryEffectDuration,
        ],
      ],
      "temporaryEffectDurationBasePower",
      "Item effect duration",
      // @ts-ignore This is ok
      MR2.TransformationType.Power,
      (_state) => BASE_POWER_MULTIPLIER,
    );

    MR2.registerTransformation(
      [["AnotherItem"]],
      "anotherItemBasePower",
      "Affects another item",
      // @ts-ignore This is ok
      MR2.TransformationType.Power,
      (_state) => BASE_POWER_MULTIPLIER,
    );
  }
}

export function loadMiscLogic(MR2: MR2Globals) {
  // @ts-ignore
  MR2.Items.getById("alchemistsCowl").getBaseExtraItemEffects = function (
    params: ItemParams,
  ): Record<string, ActionEffect> {
    return {
      magnitude: {
        value: 0.2,
        valueType: MR2.TransformationValueType.Percent,
        tags: ["AnotherItem"],
      },
    };
  };
  // @ts-ignore
  MR2.Items.getById("assassinsCloak").getBaseExtraItemEffects = function (
    params: ItemParams,
  ): Record<string, ActionEffect> {
    return {
      magnitude: {
        value: 4.0,
        valueType: MR2.TransformationValueType.Percent,
        tags: ["AnotherItem"],
      },
    };
  };
  // @ts-ignore
  MR2.Items.getById("synergizer").getBaseExtraItemEffects = function (
    params: ItemParams,
  ): Record<string, ActionEffect> {
    return {
      magnitude: {
        value: 0.15,
        valueType: MR2.TransformationValueType.Percent,
        tags: ["AnotherItem"],
      },
    };
  };
}
