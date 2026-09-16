(function () {
  "use strict";

  const INITIAL_TIME_MS = 20_000;
  const CORRECT_BONUS_MS = 2_000;
  const WRONG_PENALTY_MS = 2_000;
  const MAX_TIME_MS = 20_000;
  const OPTION_COUNT = 6;

  function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function shuffle(items) {
    const copy = items.slice();
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }
    return copy;
  }

  function makeOption(wordColor, fontColor, questionType) {
    return {
      word: wordColor.word,
      wordColorId: wordColor.id,
      fontColorId: fontColor.id,
      fontCss: fontColor.css,
      answerValue: questionType === "fontColor" ? fontColor.id : wordColor.id
    };
  }

  function createOptions(question, colors) {
    const correctColor = colors.find((color) => color.id === question.correctColorId);
    const distractorColors = colors.filter((color) => color.id !== question.correctColorId);
    const options = [];

    if (question.questionType === "fontColor") {
      options.push(makeOption(randomItem(colors), correctColor, question.questionType));

      while (options.length < OPTION_COUNT) {
        options.push(makeOption(
          randomItem(colors),
          randomItem(distractorColors),
          question.questionType
        ));
      }
    } else {
      options.push(makeOption(correctColor, randomItem(colors), question.questionType));

      while (options.length < OPTION_COUNT) {
        options.push(makeOption(
          randomItem(distractorColors),
          randomItem(colors),
          question.questionType
        ));
      }
    }

    return shuffle(options);
  }

  function addCorrectBonus(remainingMs) {
    return Math.min(Math.max(0, remainingMs) + CORRECT_BONUS_MS, MAX_TIME_MS);
  }

  function subtractWrongPenalty(remainingMs) {
    return Math.max(remainingMs - WRONG_PENALTY_MS, 0);
  }

  window.StroopSurvivalMode = Object.freeze({
    INITIAL_TIME_MS,
    MAX_TIME_MS,
    OPTION_COUNT,
    createOptions,
    addCorrectBonus,
    subtractWrongPenalty
  });
})();
