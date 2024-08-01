import { MR2Globals } from "magic-research-2-modding-sdk";
import {
  ActionEffect,
  DoActionArgs,
} from "magic-research-2-modding-sdk/modding-decs/backend/action/Action";
import { GameState } from "magic-research-2-modding-sdk/modding-decs/backend/GameState";
import { Spell } from "magic-research-2-modding-sdk/modding-decs/backend/spells/Spell";
import { t } from "./utils";

function overrideSpell(
  MR2: MR2Globals,
  spellId: string,
  baseActionEffects,
  doSpellAction?: (
    spell: Spell,
    state: GameState,
    args: DoActionArgs,
  ) => GameState,
  getDisplayEffect?: (spell: Spell, state: GameState) => string,
) {
  const spell = MR2.Spells.getById(spellId);
  if (spell == null) {
    throw new Error(spellId + " spell not found");
  }
  // @ts-ignore This is ok
  spell.getBaseActionEffects = () => baseActionEffects;
  if (doSpellAction != null) {
    spell.doSpellAction = function (state, args) {
      return doSpellAction(spell, state, args);
    };
  }
  if (getDisplayEffect != null) {
    spell.getDisplayEffect = function (state) {
      return getDisplayEffect(spell, state);
    };
  }
}

export function loadSpellChanges(MR2: MR2Globals) {
  overrideSpell(
    MR2,
    "blindingSpeed",
    {
      magnitude: {
        value: 0.66667,
        tags: [
          MR2.TransformationTags.TemporaryEffectMagnitude,
          MR2.CombatStat.AttackDelay,
        ],
        valueType: MR2.TransformationValueType.Divisor,
      },
      duration: {
        value: 4.0,
        tags: [MR2.TransformationTags.TemporaryEffectDuration],
        unit: " sec",
      },
    },
    (spell, state, args) => {
      const effects = spell.getActionEffects(state);
      return MR2.grantTemporaryEffect("blindingSpeed", effects.duration, {
        params: {
          commonBuff: {
            AttackDelayMultiplier: 1.0 / (1 + effects.magnitude),
          },
        },
      })(state);
    },
    (spell, state: GameState): string => {
      const effects = spell.getActionEffects(state);
      const explanations = spell.getActionEffectExplanations(state);
      return t(
        "^{{magnitude}}^<{{magnitudeExplanation}}>:attackDelay: for ^{{duration}}^<{{durationExplanation}}> sec",
        {
          magnitude: MR2.formatMultiplier(1.0 / (1 + effects.magnitude)),
          magnitudeExplanation: explanations.magnitude,
          duration: MR2.formatNumber(effects.duration),
          durationExplanation: explanations.duration,
        },
      );
    },
  );

  overrideSpell(
    MR2,
    "haste",
    {
      magnitude: {
        value: 0.13637,
        tags: [
          MR2.TransformationTags.TemporaryEffectMagnitude,
          MR2.CombatStat.AttackDelay,
        ],
        valueType: MR2.TransformationValueType.Divisor,
      },
      duration: {
        value: 60.0,
        tags: [MR2.TransformationTags.TemporaryEffectDuration],
        unit: " sec",
      },
    },
    (spell, state: GameState, args: DoActionArgs): GameState => {
      const effects = spell.getActionEffects(state);
      return MR2.grantTemporaryEffect("haste", effects.duration, {
        params: {
          commonBuff: {
            AttackDelayMultiplier: 1.0 / (1 + effects.magnitude),
          },
        },
      })(state);
    },
    (spell, state: GameState): string => {
      const effects = spell.getActionEffects(state);
      const explanations = spell.getActionEffectExplanations(state);
      return t(
        "^{{magnitude}}^<{{magnitudeExplanation}}>:attackDelay: for ^{{duration}}^<{{durationExplanation}}> sec",
        {
          magnitude: MR2.formatMultiplier(1.0 / (1 + effects.magnitude)),
          magnitudeExplanation: explanations.magnitude,
          duration: MR2.formatNumber(effects.duration),
          durationExplanation: explanations.duration,
        },
      );
    },
  );

  overrideSpell(MR2, "blur", {
    magnitude: {
      value: 40,
      tags: [
        MR2.TransformationTags.TemporaryEffectMagnitude,
        MR2.CombatStat.Dodge,
      ],
      unit: ":dodge:",
    },
    duration: {
      value: 15.0,
      tags: [MR2.TransformationTags.TemporaryEffectDuration],
      unit: " sec",
    },
  });

  overrideSpell(
    MR2,
    "lastBurst",
    {
      attackMultiplier: {
        value: 0.5,
        tags: [MR2.TransformationTags.TemporaryEffectMagnitude],
        valueType: MR2.TransformationValueType.Percent,
      },
      defenseMultiplier: {
        value: 2.0,
        tags: [MR2.TransformationTags.TemporaryEffectMagnitude],
        valueType: MR2.TransformationValueType.Percent,
      },
      attackDelayMultiplier: {
        value: 0.25,
        tags: [
          MR2.TransformationTags.TemporaryEffectMagnitude,
          MR2.CombatStat.AttackDelay,
        ],
        valueType: MR2.TransformationValueType.Divisor,
      },
      duration: {
        value: 3.0,
        tags: [MR2.TransformationTags.TemporaryEffectDuration],
        unit: " sec",
      },
    },
    (spell, state: GameState, args: DoActionArgs): GameState => {
      const effects = spell.getActionEffects(state);
      return MR2.grantTemporaryEffect("lastBurst", effects.duration, {
        params: {
          commonBuff: {
            AttackMultiplier: effects.attackMultiplier + 1.0,
            DefenseMultiplier: effects.defenseMultiplier + 1.0,
            AttackDelayMultiplier: 1.0 / (1 + effects.attackDelayMultiplier),
          },
        },
      })(state);
    },
    (spell, state: GameState): string => {
      const effects = spell.getActionEffects(state);
      const explanations = spell.getActionEffectExplanations(state);
      return t(
        "^{{attackMultiplier}}^<{{attackExplanation}}>:attack:, ^{{defenseMultiplier}}^<{{defenseExplanation}}>:defense:, ^{{attackDelayMultiplier}}^<{{attackDelayExplanation}}>:attackDelay: for ^{{duration}}^<{{durationExplanation}}> sec; when effect runs out, lose combat immediately",
        {
          attackMultiplier: MR2.formatMultiplier(
            effects.attackMultiplier + 1.0,
          ),
          attackExplanation: explanations.attackMultiplier,
          defenseMultiplier: MR2.formatMultiplier(
            effects.defenseMultiplier + 1.0,
          ),
          defenseExplanation: explanations.defenseMultiplier,
          attackDelayMultiplier: MR2.formatMultiplier(
            1.0 / (1 + effects.attackDelayMultiplier),
          ),
          attackDelayExplanation: explanations.attackDelayMultiplier,
          duration: MR2.formatNumber(effects.duration),
          durationExplanation: explanations.duration,
        },
      );
    },
  );

  const shapeshiftEagle = MR2.Spells.getById("shapeshiftEagle");
  // @ts-ignore This is ok
  shapeshiftEagle.getBuffs = function (state: GameState) {
    const effects = this.getActionEffects(state);
    return {
      AttackMultiplier: 0.95,
      Accuracy: effects.accuracy,
      AttackDelayMultiplier: 1.0 / (1 + effects.attackDelayMultiplier),
    };
  };
  // @ts-ignore This is ok
  shapeshiftEagle.getBaseActionEffects = function () {
    return {
      accuracy: {
        value: 20,
        tags: [MR2.TransformationTags.TemporaryEffectMagnitude],
        unit: ":accuracy:",
      },
      attackDelayMultiplier: {
        value: 0.11112,
        tags: [
          MR2.TransformationTags.TemporaryEffectMagnitude,
          MR2.CombatStat.AttackDelay,
        ],
        valueType: MR2.TransformationValueType.Divisor,
      },
      duration: {
        value: 70.0,
        tags: [MR2.TransformationTags.TemporaryEffectDuration],
        unit: " sec",
      },
    };
  };
  shapeshiftEagle.getDisplayEffect = function (state: GameState): string {
    const effects = shapeshiftEagle.getActionEffects(state);
    const explanations = shapeshiftEagle.getActionEffectExplanations(state);
    return t(
      "^+{{accuracy}}^<{{accuracyExplanation}}>:accuracy:, ^{{attackDelayMultiplier}}^<{{attackDelayExplanation}}>:attackDelay:, -5%:attack: for ^{{duration}}^<{{durationExplanation}}> sec; does not stack with other Shapeshift spells",
      {
        accuracy: MR2.formatNumber(effects.accuracy),
        accuracyExplanation: explanations.accuracy,
        attackDelayMultiplier: MR2.formatMultiplier(
          1.0 / (1 + effects.attackDelayMultiplier),
        ),
        attackDelayExplanation: explanations.attackDelayMultiplier,
        duration: MR2.formatNumber(effects.duration),
        durationExplanation: explanations.duration,
      },
    );
  };

  const shapeshiftMouse = MR2.Spells.getById("shapeshiftMouse");
  // @ts-ignore This is ok
  shapeshiftMouse.getBuffs = function (state: GameState) {
    const effects = this.getActionEffects(state);
    return {
      DefenseMultiplier: 0.7,
      MaxHPMultiplier: 0.7,
      AttackDelayMultiplier: 1.0 / (1 + effects.attackDelayMultiplier),
      Dodge: effects.dodge,
    };
  };
  // @ts-ignore This is ok
  shapeshiftMouse.getBaseActionEffects = function (): Record<
    string,
    ActionEffect
  > {
    return {
      dodge: {
        value: 50,
        tags: [
          MR2.TransformationTags.TemporaryEffectMagnitude,
          MR2.CombatStat.Dodge,
        ],
        unit: ":dodge:",
        valueType: MR2.TransformationValueType.Basic,
      },
      attackDelayMultiplier: {
        tags: [
          MR2.TransformationTags.TemporaryEffectMagnitude,
          MR2.CombatStat.AttackDelay,
        ],
        valueType: MR2.TransformationValueType.Divisor,
        value: 0.11112,
      },
      duration: {
        value: 70.0,
        tags: [MR2.TransformationTags.TemporaryEffectDuration],
        unit: " sec",
      },
    };
  };
  shapeshiftMouse.getDisplayEffect = function (state: GameState): string {
    const effects = this.getActionEffects(state);
    const explanations = this.getActionEffectExplanations(state);
    return t(
      "^+{{dodge}}^<{{dodgeExplanation}}>:dodge:, ^{{attackDelay}}^<{{attackDelayExplanation}}>:attackDelay:, -30% Max:hp:, -30%:defense: for ^{{duration}}^<{{durationExplanation}}> sec; does not stack with other Shapeshift spells",
      {
        dodge: MR2.formatNumber(effects.dodge),
        dodgeExplanation: explanations.dodge,
        attackDelay: MR2.formatMultiplier(
          1.0 / (1 + effects.attackDelayMultiplier),
        ),
        attackDelayExplanation: explanations.attackDelayMultiplier,
        duration: MR2.formatNumber(effects.duration),
        durationExplanation: explanations.duration,
      },
    );
  };
}
