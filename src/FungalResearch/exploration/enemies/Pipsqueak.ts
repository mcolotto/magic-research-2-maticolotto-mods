import { MR2Globals } from "magic-research-2-modding-sdk";
import {
  BattlerAction,
  BattlerStats,
  EnemyLoot,
} from "magic-research-2-modding-sdk/modding-decs/backend/exploration/enemies/Enemy";
import { GameState } from "magic-research-2-modding-sdk/modding-decs/backend/GameState";

export function loadPipsqueak(MR2: MR2Globals) {
  class Pipsqueak extends MR2.Enemy {
    getId(): string {
      return "pipsqueak";
    }
    getName(): string {
      return "Pipsqueak";
    }
    getBaseStats(): BattlerStats {
      return {
        maxHP: 1200,
        attack: 45,
        defense: 15,
        attackDelay: 1.3,
        accuracy: 100,
        dodge: 100,
        crit: 0,
      };
    }
    getPicture(state: GameState) {
      return require("./pipsqueak.png");
    }
    getLevel(): number {
      return 16;
    }
    getCoinsAwardedBase(state: GameState): number {
      return 50;
    }
    getMonstiumAwardedBase(state: GameState): number {
      return 50;
    }
    getNextAction(state: GameState): BattlerAction {
      if (Math.random() < 0.3) {
        return {
          name: "Fast Attack",
          delay: this.getAttackDelay(state) * 0.5,
          transform: (state) =>
            MR2.standardEnemyAttackEffect(state, this.getAttack(state) * 0.8),
        };
      }

      if (Math.random() < 0.5) {
        return {
          name: "Drain",
          delay: this.getAttackDelay(state) * 2.0,
          transform: (state) => {
            state = MR2.standardEnemyAttackEffect(
              state,
              this.getAttack(state) * 1.2,
              {
                tags: [MR2.SpellElement.Life],
                onHit: (state, result) => {
                  if (result.isHit) {
                    const healAmt = result.damage * 4;
                    state = MR2.modifyTargetCurrentHP(
                      state,
                      MR2.AttackTarget.Enemy,
                      healAmt,
                      "Drain",
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
                  }
                  return state;
                },
              },
            );

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
