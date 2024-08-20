import { MR2Globals } from "magic-research-2-modding-sdk";
import {
  BattlerAction,
  BattlerStats,
  EnemyLoot,
} from "magic-research-2-modding-sdk/modding-decs/backend/exploration/enemies/Enemy";
import { GameState } from "magic-research-2-modding-sdk/modding-decs/backend/GameState";
import { hasTemporaryEffect } from "magic-research-2-modding-sdk/modding-decs/backend/temporaryeffects/TemporaryEffects";

export function loadOddfruit(MR2: MR2Globals) {
  class Oddfruit extends MR2.Enemy {
    getId(): string {
      return "oddfruit";
    }
    getName(): string {
      return "Oddfruit";
    }
    getBaseStats(): BattlerStats {
      return {
        maxHP: 1500,
        attack: 50,
        defense: 4,
        attackDelay: 2.0,
        accuracy: 100,
        dodge: 100,
        crit: 0,
      };
    }
    getPicture(state: GameState) {
      return require("./oddfruit.png");
    }
    getLevel(): number {
      return 15;
    }
    getCoinsAwardedBase(state: GameState): number {
      return 250;
    }
    getMonstiumAwardedBase(state: GameState): number {
      return 20;
    }
    getNextAction(state: GameState): BattlerAction {
      if (Math.random() < 0.3) {
        return {
          name: "Stare",
          delay: this.getAttackDelay(state) * 3.0,
          transform: (s) => s,
        };
      }
      const target = MR2.calculateAttackTarget(state);
      if (!hasTemporaryEffect(state, "poison", target) && Math.random() < 0.2) {
        return {
          name: "Sting",
          delay: this.getAttackDelay(state) * 1.5,
          transform: (state) => {
            state = MR2.standardEnemyAttackEffect(
              state,
              this.getAttack(state) * 1.0,
              {
                tags: [MR2.SpellElement.Poison],
                onHit: (state, actionResult) => {
                  if (actionResult.isHit) {
                    state = MR2.grantTemporaryEffect("poison", 12, {
                      target: actionResult.target,
                      params: {
                        magnitude: this.getAttack(state) / 12,
                      },
                    })(state);
                  }
                  return state;
                },
              },
            );
            return state;
          },
        };
      }
      const timesNurtured = MR2.getCombatVariable(state, "timesNurtured");
      if (
        timesNurtured < 2 &&
        MR2.getCurrentEnemyHPFraction(state) < 0.4 &&
        Math.random() < 0.1
      ) {
        return {
          name: "Nurture",
          delay: this.getAttackDelay(state) * 1.6,
          transform: (state) => {
            const healAmt =
              this.getMaxHP(state) -
              state.run.exploration.currentEnemy.currentHP;
            state = MR2.modifyTargetCurrentHP(
              state,
              MR2.AttackTarget.Enemy,
              healAmt,
              "Nurture",
            );
            const actionResult = {
              id: Math.random().toString(),
              damage: -healAmt,
              isCrit: false,
              isHit: true,
              time: state.run.secondsPlayed,
              source: MR2.AttackTarget.Enemy,
              target: MR2.AttackTarget.Enemy,
              tags: [],
            };
            state = MR2.pushCombatActionResult(state, actionResult);
            return state;
          },
        };
      }
      return super.getNextAction(state);
    }
    getItemsAwardedBase(state: GameState): EnemyLoot[] {
      return [{ itemId: "orangeMushroom", amount: 1, chance: 0.25 }];
    }
  }
}
