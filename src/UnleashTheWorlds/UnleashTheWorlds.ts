import { MR2Globals } from "magic-research-2-modding-sdk";

export const id = "UnleashTheWorlds";
export const name = "Unleash the Worlds";
export const version = "1.0.0";
export const description =
  "Increase maximum difficulties and boons of NG+ to 100";

export function load(MR2: MR2Globals) {
  // Set the max difficulty level and max boon level
  MR2.NewGamePlus.MAX_DIFFICULTY_LEVEL = 100;
  MR2.NewGamePlus.MAX_BOON_LEVEL = 100;
  // Do not require people to continue to beat levels to jump to max difficulty
  MR2.NewGamePlus.getMaxPossibleDifficultyLevel = (state) =>
    MR2.NewGamePlus.MAX_DIFFICULTY_LEVEL;

  // Override stats for difficulty levels > D11
  const oldFn1 = MR2.NewGamePlus.getNewGamePlusAccuracyAndDodgeMultiplier;
  MR2.NewGamePlus.getNewGamePlusAccuracyAndDodgeMultiplier = (
    difficultyLevel: number,
  ) => {
    if (difficultyLevel <= 11) {
      return oldFn1(difficultyLevel);
    }
    return oldFn1(11) * Math.pow(oldFn1(1) / oldFn1(0), difficultyLevel - 11);
  };
  const oldFn2 = MR2.NewGamePlus.getNewGamePlusAttackDelayMultiplier;
  MR2.NewGamePlus.getNewGamePlusAttackDelayMultiplier = (
    difficultyLevel: number,
  ) => {
    if (difficultyLevel <= 11) {
      return oldFn2(difficultyLevel);
    }
    return oldFn2(11) * Math.pow(oldFn2(1) / oldFn2(0), difficultyLevel - 11);
  };
  const oldFn3 = MR2.NewGamePlus.getNewGamePlusHpMultiplier;
  MR2.NewGamePlus.getNewGamePlusHpMultiplier = (difficultyLevel: number) => {
    if (difficultyLevel <= 11) {
      return oldFn3(difficultyLevel);
    }
    return oldFn3(11) * Math.pow(oldFn3(1) / oldFn3(0), difficultyLevel - 11);
  };
  const oldFn4 = MR2.NewGamePlus.getNewGamePlusOtherStatMultiplier;
  MR2.NewGamePlus.getNewGamePlusOtherStatMultiplier = (
    difficultyLevel: number,
  ) => {
    if (difficultyLevel <= 11) {
      return oldFn4(difficultyLevel);
    }
    return oldFn4(11) * Math.pow(oldFn4(1) / oldFn4(0), difficultyLevel - 11);
  };

  // Remove outdated warnings
  MR2.registerStringOverride(
    " **And if you clear the World, you may unlock something special...**",
    "",
  );
  MR2.registerStringOverride(
    " **This is the maximum World Difficulty! Some Challenges may not be possible. Good luck!**",
    "",
  );
  MR2.registerStringOverride(
    ' You can access higher difficulties by traveling to a new World and reaching the ending "To Save a Life".',
    "",
  );
}

export function preload(MR2: MR2Globals) {}
