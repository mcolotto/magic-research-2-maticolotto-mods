import { MR2Globals } from "magic-research-2-modding-sdk";
import { ActionEffect } from "magic-research-2-modding-sdk/modding-decs/backend/action/Action";
import { GameState } from "magic-research-2-modding-sdk/modding-decs/backend/GameState";
import { EquippableItem } from "magic-research-2-modding-sdk/modding-decs/backend/items/equipment/EquippableItem";
import {
  ItemOccurrence,
  ItemParams,
} from "magic-research-2-modding-sdk/modding-decs/backend/items/Item";
import {
  TransformationTag,
  TransformationType,
} from "magic-research-2-modding-sdk/modding-decs/backend/transformation/Transformation";
import { t } from "./utils";

export function loadTrasmutationOverrides(MR2: MR2Globals) {
  function applyTransformations(
    tags: TransformationTag[],
    state: GameState,
    startingValue: number,
    params?: Record<string, any>,
    joinedTags?: string,
  ) {
    const transformParams = params ?? {};
    const oldTransformTags = transformParams?.tags;
    transformParams.tags =
      transformParams?.tags != null ? transformParams.tags.concat(tags) : tags;

    const transformations = MR2.getTransformationsThatApply(tags, joinedTags);
    const isStartingValueNegative = startingValue <= 0;

    // Step 1: get the base power multiplier
    const basePowerMultiplierTransformations =
      transformations[MR2.TransformationType.Power] ?? [];
    let basePower = 1.0;
    if (
      !tags.includes(MR2.TransformationValueType.Log2) &&
      !tags.includes(MR2.TransformationValueType.Log2Divisor)
    ) {
      for (let transformation of basePowerMultiplierTransformations) {
        basePower *=
          transformation.transformation(state, transformParams, 1.0) ?? 1.0;
      }
    }

    // Step 2: modify the starting value based on the basePower
    if (!isStartingValueNegative) {
      startingValue = Math.pow(startingValue, 1.0 / basePower);
    }

    // Step 3: apply addition transforms
    const additionTransformations =
      transformations[MR2.TransformationType.Addition];
    let afterAddition = startingValue;
    for (let transformation of additionTransformations) {
      afterAddition +=
        transformation.transformation(state, transformParams, startingValue) ??
        0;
    }

    // Step 5: apply multiplication transforms
    const multiplicationTransformations =
      transformations[MR2.TransformationType.Multiplier];
    let afterMultiplication = afterAddition;
    for (let transformation of multiplicationTransformations) {
      afterMultiplication *=
        transformation.transformation(state, transformParams, afterAddition) ??
        1.0;
    }

    // Step 6: apply the base power
    if (!isStartingValueNegative) {
      afterMultiplication = Math.pow(afterMultiplication, basePower);
    }

    // Step 7: finally, apply override transforms
    const overrideTransformations =
      transformations[MR2.TransformationType.Override];
    let afterOverride = afterMultiplication;
    for (let transformation of overrideTransformations) {
      const newOverride = transformation.transformation(
        state,
        transformParams,
        afterMultiplication,
      );
      if (newOverride != null) {
        afterOverride = newOverride;
      }
    }

    transformParams.tags = oldTransformTags;

    return afterOverride as number;
  }

  function explainTransformations(
    tags: TransformationTag[],
    state: GameState,
    startingValue: number,
    params?: Record<string, any>,
  ): {
    transformations: Record<
      TransformationType,
      Array<{ id: string; description: string; value: number | undefined }>
    >;
    basePower: number;
  } {
    const transformParams = params ?? {};
    const oldTransformTags = transformParams?.tags;
    transformParams.tags =
      transformParams?.tags != null ? transformParams.tags.concat(tags) : tags;
    const output: Record<
      TransformationType,
      Array<{ id: string; description: string; value: number | undefined }>
    > = {
      Power: [],
      Addition: [],
      Multiplier: [],
      Override: [],
    };

    const isStartingValueNegative = startingValue <= 0;

    // Step 1: get the transformations that apply
    const allTransformationsThatApply = MR2.getTransformationsThatApply(tags);

    // Step 2: get the base power multiplier
    const basePowerMultiplierTransformations =
      allTransformationsThatApply[MR2.TransformationType.Power] ?? [];
    let basePower = 1.0;
    if (
      !tags.includes(MR2.TransformationValueType.Log2) &&
      !tags.includes(MR2.TransformationValueType.Log2Divisor)
    ) {
      for (let transformation of basePowerMultiplierTransformations) {
        basePower *=
          transformation.transformation(state, transformParams, 1.0) ?? 1.0;
      }
    }

    // Step 3: modify the starting value based on the basePower
    if (!isStartingValueNegative) {
      startingValue = Math.pow(startingValue, 1.0 / basePower);
    }

    // Step 4: apply addition transforms
    const additionTransformations = allTransformationsThatApply.Addition;
    const afterAddition = additionTransformations
      .map((data) => {
        const value = data.transformation(
          state,
          transformParams,
          startingValue ?? 0,
        );
        output.Addition.push({
          id: data.id,
          description: data.description,
          value,
        });
        return value;
      })
      .reduce(
        (prev, current) => (prev ?? 0) + (current ?? 0),
        startingValue,
      ) as number;

    // Step 6: apply multiplication transforms
    const multiplicationTransformations =
      allTransformationsThatApply.Multiplier;
    const afterMultiplication = multiplicationTransformations
      .map((data) => {
        const value = data.transformation(
          state,
          transformParams,
          afterAddition ?? 0,
        );
        output.Multiplier.push({
          id: data.id,
          description: data.description,
          value,
        });
        return value;
      })
      .reduce(
        (prev, current) => (prev ?? 1.0) * (current ?? 1.0),
        afterAddition,
      ) as number;

    // Step 7: apply base power
    const afterBasePower = !isStartingValueNegative
      ? Math.pow(afterMultiplication, basePower)
      : afterMultiplication;

    // Step 8: finally, apply override transforms
    const overrideTransformations = allTransformationsThatApply.Override;
    const _afterOverride = overrideTransformations
      .map((data) => {
        const value = data.transformation(
          state,
          transformParams,
          afterBasePower ?? 0,
        );
        output.Override.push({
          id: data.id,
          description: data.description,
          value,
        });
        return value;
      })
      .reduce((prev, current) => current ?? prev, afterMultiplication);

    transformParams.tags = oldTransformTags;

    return {
      transformations: output,
      basePower: isStartingValueNegative ? 1.0 : basePower,
    };
  }

  function explainTransformationsTextUncached(
    tags: TransformationTag[],
    state: GameState,
    startingValue: number,
    params?: Record<string, any>,
  ): string {
    const explained = explainTransformations(
      tags,
      state,
      startingValue,
      params,
    );
    const unit = params?.unit ?? "";
    const type = params?.valueType ?? MR2.TransformationValueType.Basic;

    const overrides = explained.transformations.Override.filter(
      (value) => value.value != null,
    );

    if (overrides.length > 0) {
      return `Overridden: ${MR2.formatNumber(
        overrides[0].value as number,
      )}${unit} (${overrides[0].description})`;
    }

    function toTextAddition(result: {
      id: string;
      description: string;
      value: number;
    }) {
      return `${
        result.value > 0
          ? "+" + MR2.formatNumber(result.value)
          : MR2.formatNumber(result.value)
      }${unit} (${result.description})`;
    }

    function toTextMultiplier(result: {
      id: string;
      description: string;
      value: number;
    }) {
      return `${MR2.formatMultiplier(result.value)} (${result.description})`;
    }

    startingValue = Math.pow(startingValue, 1.0 / explained.basePower);

    const additions = explained.transformations.Addition.filter(
      (value) => value.value != 0,
    );
    const multipliers = explained.transformations.Multiplier.filter(
      (value) => value.value != 1,
    );

    if (additions.length == 0 && multipliers.length == 0) {
      return "";
    }

    const baseText = `Base: ${MR2.formatNumber(startingValue, {
      showDecimals: true,
      extraPrecision: true,
    })}${unit}`;
    const additionText =
      additions.length > 0
        ? `; Plus: ${additions.map(toTextAddition).join(", ")}`
        : "";
    const multiplierText =
      multipliers.length > 0
        ? `; Multipliers: ${multipliers.map(toTextMultiplier).join(", ")}`
        : "";

    if (type == MR2.TransformationValueType.Log2) {
      const base = params?.base ?? 1.0;
      return `Results from multiplying ${MR2.formatNumber(base, {
        showDecimals: true,
      })} by the base 2 logarithm of the following: ${baseText}${additionText}${multiplierText}`;
    }

    if (type == MR2.TransformationValueType.Log2Divisor) {
      const base = params?.base ?? 1.0;
      return `Results from dividing by 1.0 + ${MR2.formatNumber(base, {
        showDecimals: true,
      })} times the base 2 logarithm of the following: ${baseText}${additionText}${multiplierText}`;
    }

    if (type == MR2.TransformationValueType.Divisor) {
      if (explained.basePower != 1.0) {
        return `Results from dividing by 1.0 + applying the power of ${MR2.formatNumber(
          explained.basePower,
          {
            showDecimals: true,
          },
        )} to the following: ${baseText}${additionText}${multiplierText}`;
      }
      return `Results from dividing by 1.0 + the following: ${baseText}${additionText}${multiplierText}`;
    }

    if (explained.basePower != 1.0) {
      return `Results from applying the power of ${MR2.formatNumber(
        explained.basePower,
        {
          showDecimals: true,
        },
      )} to the following: ${baseText}${additionText}${multiplierText}`;
    }
    return `${baseText}${additionText}${multiplierText}`;
  }

  MR2.registerOverridableFunctions({
    applyTransformations: (original) => applyTransformations,
    explainTransformationsTextUncached: (original) =>
      explainTransformationsTextUncached,
  });

  MR2.Action.prototype.getTagsByEffect = function (
    key: string,
    baseEffect: ActionEffect,
  ): string[] {
    if (this.tagsByEffect?.[key] == null) {
      this.tagsByEffect[key] = [
        ...this.getTags(),
        ...(baseEffect.tags ?? []),
        MR2.TransformationTags.ActionEffect,
        key,
        baseEffect.valueType ?? MR2.TransformationValueType.Basic,
      ];
    }
    return this.tagsByEffect[key];
  };

  MR2.CombatClass.prototype.getTagsByEffect = function (
    key: string,
    baseEffect: ActionEffect,
  ): string[] {
    if (this.tagsByEffect?.[key] == null) {
      this.tagsByEffect[key] = [
        ...(baseEffect.tags ?? []),
        MR2.TransformationTags.ClassEffect,
        key,
        baseEffect.valueType ?? MR2.TransformationValueType.Basic,
      ];
    }
    return this.tagsByEffect[key];
  };

  MR2.Item.prototype.getTagsByEffect = function (
    key: string,
    baseEffect: ActionEffect,
  ): string[] {
    if (this.tagsByEffect?.[key] == null) {
      this.tagsByEffect[key] = [
        ...this.getTags(),
        this.getId(),
        ...(baseEffect.tags ?? []),
        MR2.TransformationTags.ItemEffect,
        baseEffect.valueType ?? MR2.TransformationValueType.Basic,
      ];
    }
    return this.tagsByEffect[key];
  };

  MR2.Ritual.prototype.getTagsByEffect = function (
    key: string,
    baseEffect: ActionEffect,
  ): string[] {
    if (this.tagsByEffect?.[key] == null) {
      this.tagsByEffect[key] = [
        ...this.getTags(),
        ...(baseEffect.tags ?? []),
        MR2.TransformationTags.RitualEffect,
        key,
        baseEffect.valueType ?? MR2.TransformationValueType.Basic,
      ];
    }
    return this.tagsByEffect[key];
  };

  MR2.Spellcraft.prototype.getTagsByEffect = function (
    key: string,
    baseEffect: ActionEffect,
  ): string[] {
    if (this.tagsByEffect?.[key] == null) {
      this.tagsByEffect[key] = [
        ...this.getTags(),
        this.getId(),
        ...(baseEffect.tags ?? []),
        MR2.TransformationTags.SpellcraftEffect,
        baseEffect.valueType ?? MR2.TransformationValueType.Basic,
      ];
    }
    return this.tagsByEffect[key];
  };

  MR2.SynchroBonus.prototype.getTagsByEffect = function (
    key: string,
    baseEffect: ActionEffect,
  ): string[] {
    if (this.tagsByEffect?.[key] == null) {
      this.tagsByEffect[key] = [
        ...this.getTags(),
        this.getId(),
        ...(baseEffect.tags ?? []),
        MR2.TransformationTags.SynchroEffect,
        baseEffect.valueType ?? MR2.TransformationValueType.Basic,
      ];
    }
    return this.tagsByEffect[key];
  };

  // @ts-ignore This is ok
  MR2.EquippableItem.prototype.getOldBaseItemEffects =
    // @ts-ignore This is ok
    MR2.EquippableItem.prototype.getBaseItemEffects;
  // @ts-ignore This is ok
  MR2.EquippableItem.prototype.getBaseItemEffects = function (
    params: ItemParams,
  ): Record<string, ActionEffect> {
    const effects = this.getOldBaseItemEffects(params);
    if (this.getAttackDelayBonusRatioBase(params) != 0) {
      effects.attackDelay = {
        value: 1.0 / (1.0 + this.getAttackDelayBonusRatioBase(params)) - 1.0,
        tags: this.attackDelayTags,
        unit: ":attackDelay:",
        valueType: MR2.TransformationValueType.Divisor,
      };
    }
    return effects;
  };
  MR2.EquippableItem.prototype.getEffectBase = function (
    state: GameState,
    params: ItemParams,
  ): string | undefined {
    const effects = this.getItemEffects(state, params);
    const effectExplanations = this.getItemEffectExplanations(state, params);

    const bonuses: Record<string, number> = {
      attack: effects.attack ?? 0,
      defense: effects.defense ?? 0,
      maxHP: effects.maxHP ?? 0,
      manaRegen: effects.manaRegen ?? 0,
      maxMana: effects.maxMana ?? 0,
      attackDelay: 1.0 / ((effects.attackDelay ?? 0) + 1.0),

      // 1.0 /
      // ((1.0 / (1.0 + this.getAttackDelayBonusRatioBase(params)) - 1.0) *
      //   Math.max(Math.log2(effects.attackDelay ?? 0)) +
      //   1.0), // 1.0 / ((effects.attackDelay ?? 0) + 1.0),
      accuracy: effects.accuracy ?? 0,
      dodge: effects.dodge ?? 0,
      crit: effects.crit ?? 0,
    };

    const bonusStrings = Object.keys(bonuses).map((stat) => {
      let value = bonuses?.[stat];
      if (value == 0 || (value == 1.0 && stat == "attackDelay")) {
        return null;
      }
      const explanation = effectExplanations?.[stat];
      let prefix = "+";
      if (value < 0) {
        prefix = "-";
        value = Math.abs(value);
      }
      switch (stat) {
        case "attack":
        case "defense":
        case "accuracy":
        case "dodge":
          return t("^{{value}}^<{{explanation}}>{{statIcon}}", {
            value: prefix + MR2.formatNumber(value),
            explanation,
            statIcon: `:${stat}:`,
          });
        case "crit":
          return t("^{{value}}^<{{explanation}}>{{statIcon}}", {
            value: prefix + MR2.formatNumber(value),
            explanation,
            statIcon: `:critChance:`,
          });
        case "manaRegen":
          return t("^{{value}}^<{{explanation}}>:mana:/sec", {
            value: prefix + MR2.formatNumber(value),
            explanation,
          });
        case "maxHP":
          return t("^{{value}}^<{{explanation}}> Max:hp:", {
            value: prefix + MR2.formatNumber(value),
            explanation,
          });
        case "maxMana":
          return t("^{{value}}^<{{explanation}}> Max:mana:", {
            value: prefix + MR2.formatNumber(value),
            explanation,
          });
        case "attackDelay":
          return t("^{{value}}^<{{explanation}}>:attackDelay:", {
            value: MR2.formatMultiplier(value),
            explanation,
          });
      }
    });

    const bonusEffect = this.getEffectExtra(state, params);
    bonusStrings.push(bonusEffect);

    return bonusStrings.filter((bonusString) => bonusString != null).join(", ");
  };

  type EquippedItemFunction = (itemOccurrence: ItemOccurrence) => void;

  const forEachEquippedItem = function (
    state: GameState,
    each: EquippedItemFunction,
  ): void {
    const equippedItemHand = MR2.getEquippedItem(state, MR2.EquipmentSlot.Hand);
    const equippedItemBody = MR2.getEquippedItem(state, MR2.EquipmentSlot.Body);
    const equippedItemAccessory = MR2.getEquippedItems(
      state,
      MR2.EquipmentSlot.Accessory,
    );

    [
      equippedItemHand,
      equippedItemBody,
      ...equippedItemAccessory.flat(),
    ].forEach((itemOccurrence) => {
      if (itemOccurrence == null) {
        return;
      }
      each(itemOccurrence);
    });
  };
  const multiplicativeTransform = (bonusFn) => {
    return (state: GameState) => {
      let totalMultiplier = 1.0;
      forEachEquippedItem(state, (itemOccurrence) => {
        const item = MR2.Items.getById(itemOccurrence.itemId) as EquippableItem;

        const bonus = bonusFn(state, item, itemOccurrence.params);
        if (bonus != 1.0) {
          totalMultiplier *= bonus;
        }
      });

      return totalMultiplier;
    };
  };
  MR2.registerTransformation(
    [[MR2.AttackTarget.Player, MR2.CombatStat.AttackDelay]],
    "EquippableItemAttackDelay",
    "Equipped Items",
    MR2.TransformationType.Multiplier,
    multiplicativeTransform((state, item, params) => {
      const denominator =
        1.0 + item.getItemEffect(state, params, "attackDelay", 0);
      return 1.0 / denominator;
    }),
  );
}
