import { REACTIONS } from '../data/reactions';
import type { Difficulty, ICauldronValues, IIngredient, IReaction } from '../types/game';

// The reactions available at this difficulty. Easy has none; Medium gets
// the reactions tagged 'medium'; Hard gets those plus the ones tagged
// 'hard' too, so Hard is a strict superset of Medium's reactions.
export function getReactionsForDifficulty(difficulty: Difficulty): IReaction[] {
  if (difficulty === 'easy') {
    return [];
  }

  return REACTIONS.filter(
    (reaction) => reaction.difficulty === 'medium' || reaction.difficulty === difficulty,
  );
}

// Folds every currently active reaction's apply() on top of the ingredients'
// raw sum, in table order, so a later reaction sees an earlier one's already
// adjusted values. Reapplied fresh every time — nothing here is one-time.
export function applyReactions(
  values: ICauldronValues,
  reactions: IReaction[],
  ingredients: IIngredient[],
): ICauldronValues {
  return reactions
    .filter((reaction) => reaction.isActive(ingredients))
    .reduce((current, reaction) => reaction.apply(current), values);
}

// The reactions that just turned on: inactive for the ingredient list
// before the add, active for the list after it. A reaction already active
// before the add is not included — it already fired earlier and does not
// fire again while the same combination stays active (see US 3.3).
export function getFiredReactions(
  reactions: IReaction[],
  before: IIngredient[],
  after: IIngredient[],
): IReaction[] {
  return reactions.filter((reaction) => !reaction.isActive(before) && reaction.isActive(after));
}
