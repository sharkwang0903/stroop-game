(function () {
  "use strict";

  const GAME_DURATION_MS = 60_000;
  const QUESTION_TYPES = Object.freeze({
    fontColor: Object.freeze({ prompt: "請選擇「字體的顏色」" }),
    wordMeaning: Object.freeze({ prompt: "請選擇「顏色的文字」" })
  });
  const MODES = Object.freeze({
    normal: Object.freeze({ label: "一般模式", coloredOptions: true, questionMode: "fontColor" }),
    expert: Object.freeze({ label: "專家模式", coloredOptions: false, questionMode: "fontColor" }),
    hard: Object.freeze({ label: "困難模式", coloredOptions: false, questionMode: "random" }),
    survival: Object.freeze({ label: "極限生存", coloredOptions: false, questionMode: "random" })
  });
  const COLORS = Object.freeze([
    { id: "red", word: "紅", css: "var(--red)" },
    { id: "blue", word: "藍", css: "var(--blue)" },
    { id: "green", word: "綠", css: "var(--green)" },
    { id: "yellow", word: "黃", css: "var(--yellow)" }
  ]);

  const elements = {};
  let state = createInitialState();

  function createInitialState(mode = "normal") {
    return {
      mode,
      status: "home",
      startedAt: 0,
      finishedAt: 0,
      endsAt: 0,
      currentQuestion: null,
      currentOptions: [],
      questionStartedAt: 0,
      acceptingAnswer: false,
      total: 0,
      correct: 0,
      wrong: 0,
      streak: 0,
      maximumStreak: 0,
      correctReactionTimes: [],
      allAnswers: [],
      answerBag: [],
      congruencyBag: [],
      questionTypeBag: [],
      timerIntervalId: null,
      endTimeoutId: null,
      questionToken: 0
    };
  }

  function init() {
    elements.homeScreen = document.getElementById("home-screen");
    elements.gameScreen = document.getElementById("game-screen");
    elements.resultScreen = document.getElementById("result-screen");
    elements.resultMode = document.getElementById("result-mode");
    elements.timer = document.getElementById("timer");
    elements.instruction = document.getElementById("game-instruction");
    elements.stimulus = document.getElementById("stimulus");
    elements.answerButtons = Array.from(document.querySelectorAll(".answer-button"));
    elements.resultTotal = document.getElementById("result-total");
    elements.resultCorrect = document.getElementById("result-correct");
    elements.resultAccuracy = document.getElementById("result-accuracy");
    elements.resultReaction = document.getElementById("result-reaction");
    elements.reactionUnit = document.getElementById("reaction-unit");
    elements.resultStreak = document.getElementById("result-streak");
    elements.survivalResultItem = document.getElementById("survival-result-item");
    elements.resultSurvivalTime = document.getElementById("result-survival-time");
    elements.resultComment = document.getElementById("result-comment");
    elements.resultCommentHeadline = document.getElementById("result-comment-headline");
    elements.resultCommentSummary = document.getElementById("result-comment-summary");
    elements.resultCommentAdvice = document.getElementById("result-comment-advice");
    showScreen("home");
  }

  function shuffle(items) {
    const copy = items.slice();
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }
    return copy;
  }

  function refillAnswerBag() {
    state.answerBag = shuffle(COLORS);
  }

  function refillCongruencyBag() {
    state.congruencyBag = shuffle([true, false, false, false]);
  }

  function takeCorrectColor() {
    if (state.answerBag.length === 0) {
      refillAnswerBag();
    }
    return state.answerBag.pop();
  }

  function takeCongruency() {
    if (state.congruencyBag.length === 0) {
      refillCongruencyBag();
    }
    return state.congruencyBag.pop();
  }

  function refillQuestionTypeBag() {
    state.questionTypeBag = shuffle([
      "fontColor",
      "fontColor",
      "wordMeaning",
      "wordMeaning"
    ]);
  }

  function takeQuestionType() {
    const modeConfig = MODES[state.mode];
    if (modeConfig.questionMode !== "random") {
      return modeConfig.questionMode;
    }

    if (state.questionTypeBag.length === 0) {
      refillQuestionTypeBag();
    }
    return state.questionTypeBag.pop();
  }

  function makeQuestion() {
    const questionType = takeQuestionType();
    const correctColor = takeCorrectColor();
    const isCongruent = takeCongruency();
    let inkColor = correctColor;
    let wordColor = correctColor;

    if (!isCongruent) {
      const conflictingColor = shuffle(
        COLORS.filter((color) => color.id !== correctColor.id)
      )[0];

      if (questionType === "fontColor") {
        wordColor = conflictingColor;
      } else {
        inkColor = conflictingColor;
      }
    }

    return {
      word: wordColor.word,
      wordColorId: wordColor.id,
      inkColorId: inkColor.id,
      inkCss: inkColor.css,
      isCongruent,
      questionType,
      correctColorId: correctColor.id
    };
  }

  function showScreen(name) {
    elements.homeScreen.hidden = name !== "home";
    elements.gameScreen.hidden = name !== "playing";
    elements.resultScreen.hidden = name !== "results";
  }

  function applyModePresentation() {
    const modeConfig = MODES[state.mode];
    elements.gameScreen.dataset.mode = state.mode;
    elements.gameScreen.dataset.options = modeConfig.coloredOptions ? "colored" : "neutral";
    elements.resultMode.textContent = modeConfig.label;
  }

  function setAnswerButtonsDisabled(disabled) {
    elements.answerButtons.forEach((button) => {
      button.disabled = disabled;
    });
  }

  function renderStandardOptions() {
    elements.answerButtons.forEach((button, index) => {
      const color = COLORS[index];
      const isStandardOption = Boolean(color);

      button.hidden = !isStandardOption;
      button.style.removeProperty("color");
      if (isStandardOption) {
        button.textContent = color.word;
        button.dataset.color = color.id;
      }
    });
    state.currentOptions = [];
  }

  function renderSurvivalOptions() {
    const options = window.StroopSurvivalMode.createOptions(state.currentQuestion, COLORS);
    state.currentOptions = options;

    elements.answerButtons.forEach((button, index) => {
      const option = options[index];
      button.hidden = false;
      button.textContent = option.word;
      button.dataset.color = option.answerValue;
      button.style.color = option.fontCss;
    });
  }

  function renderQuestion() {
    state.currentQuestion = makeQuestion();
    state.acceptingAnswer = false;
    state.questionToken += 1;
    const token = state.questionToken;

    elements.stimulus.textContent = state.currentQuestion.word;
    elements.stimulus.style.color = state.currentQuestion.inkCss;
    elements.instruction.textContent = QUESTION_TYPES[state.currentQuestion.questionType].prompt;
    if (state.mode === "survival") {
      renderSurvivalOptions();
    } else {
      renderStandardOptions();
    }
    setAnswerButtonsDisabled(false);

    requestAnimationFrame(() => {
      if (state.status === "playing" && token === state.questionToken) {
        state.questionStartedAt = performance.now();
        state.acceptingAnswer = true;
      }
    });
  }

  function renderTimer() {
    if (state.status !== "playing") {
      return;
    }

    const remainingMs = Math.max(0, state.endsAt - performance.now());
    if (state.mode === "survival") {
      const remainingSeconds = Math.ceil(remainingMs / 100) / 10;
      elements.timer.textContent = `剩餘時間：${remainingSeconds.toFixed(1)} 秒`;
    } else {
      const remainingSeconds = Math.ceil(remainingMs / 1000);
      elements.timer.textContent = `剩餘時間：${remainingSeconds} 秒`;
    }

    if (remainingMs <= 0) {
      finishGame();
    }
  }

  function clearTimers() {
    window.clearInterval(state.timerIntervalId);
    window.clearTimeout(state.endTimeoutId);
    state.timerIntervalId = null;
    state.endTimeoutId = null;
  }

  function startGame(mode = "normal") {
    const selectedMode = Object.hasOwn(MODES, mode) ? mode : "normal";
    clearTimers();
    state = createInitialState(selectedMode);
    state.status = "playing";
    state.startedAt = performance.now();
    const isSurvival = selectedMode === "survival";
    const gameDurationMs = isSurvival
      ? window.StroopSurvivalMode.INITIAL_TIME_MS
      : GAME_DURATION_MS;
    state.endsAt = state.startedAt + gameDurationMs;

    applyModePresentation();
    showScreen("playing");
    elements.timer.textContent = isSurvival
      ? "剩餘時間：20.0 秒"
      : "剩餘時間：60 秒";
    renderQuestion();
    state.timerIntervalId = window.setInterval(renderTimer, isSurvival ? 50 : 100);
    if (!isSurvival) {
      state.endTimeoutId = window.setTimeout(finishGame, GAME_DURATION_MS);
    }
  }

  function restartGame() {
    startGame(state.mode);
  }

  function submitAnswer(colorId) {
    const submittedAt = performance.now();

    if (
      state.status !== "playing" ||
      !state.acceptingAnswer ||
      submittedAt >= state.endsAt ||
      !COLORS.some((color) => color.id === colorId)
    ) {
      if (submittedAt >= state.endsAt && state.status === "playing") {
        finishGame();
      }
      return false;
    }

    state.acceptingAnswer = false;
    setAnswerButtonsDisabled(true);

    const reactionTimeMs = Math.max(0, submittedAt - state.questionStartedAt);
    const isCorrect = colorId === state.currentQuestion.correctColorId;
    state.total += 1;

    if (isCorrect) {
      state.correct += 1;
      state.streak += 1;
      state.maximumStreak = Math.max(state.maximumStreak, state.streak);
      state.correctReactionTimes.push(reactionTimeMs);
      if (state.mode === "survival") {
        const remainingMs = Math.max(0, state.endsAt - submittedAt);
        state.endsAt = submittedAt + window.StroopSurvivalMode.addCorrectBonus(remainingMs);
        renderTimer();
      }
    } else {
      state.wrong += 1;
      state.streak = 0;
      if (state.mode === "survival") {
        const remainingMs = Math.max(0, state.endsAt - submittedAt);
        const penalizedRemainingMs = window.StroopSurvivalMode.subtractWrongPenalty(remainingMs);
        state.endsAt = submittedAt + penalizedRemainingMs;
        if (penalizedRemainingMs > 0) {
          renderTimer();
        } else {
          elements.timer.textContent = "剩餘時間：0.0 秒";
        }
      }
    }

    state.allAnswers.push({
      selectedColorId: colorId,
      correctColorId: state.currentQuestion.correctColorId,
      inkColorId: state.currentQuestion.inkColorId,
      wordColorId: state.currentQuestion.wordColorId,
      questionType: state.currentQuestion.questionType,
      isCongruent: state.currentQuestion.isCongruent,
      isCorrect,
      reactionTimeMs
    });

    if (performance.now() < state.endsAt) {
      renderQuestion();
    } else {
      finishGame();
    }

    return true;
  }

  function calculateResults() {
    const accuracy = state.total > 0 ? (state.correct / state.total) * 100 : null;
    const averageReactionMs = state.correctReactionTimes.length > 0
      ? state.correctReactionTimes.reduce((sum, time) => sum + time, 0) / state.correctReactionTimes.length
      : null;

    return {
      total: state.total,
      correct: state.correct,
      wrong: state.wrong,
      accuracy,
      averageReactionSeconds: averageReactionMs === null ? null : averageReactionMs / 1000,
      maximumStreak: state.maximumStreak,
      survivalDurationSeconds: state.mode === "survival"
        ? Math.max(0, state.finishedAt - state.startedAt) / 1000
        : null,
      answers: state.allAnswers.slice()
    };
  }

  function renderResults(results) {
    elements.resultTotal.textContent = String(results.total);
    elements.resultCorrect.textContent = String(results.correct);
    elements.resultAccuracy.textContent = results.accuracy === null
      ? "--"
      : `${results.accuracy.toFixed(1)}%`;
    elements.resultReaction.textContent = results.averageReactionSeconds === null
      ? "--"
      : results.averageReactionSeconds.toFixed(3);
    elements.reactionUnit.hidden = results.averageReactionSeconds === null;
    elements.resultStreak.textContent = String(results.maximumStreak);
    elements.survivalResultItem.hidden = results.survivalDurationSeconds === null;
    if (results.survivalDurationSeconds !== null) {
      elements.resultSurvivalTime.textContent = results.survivalDurationSeconds.toFixed(1);
    }

    const comment = state.mode === "survival"
      ? window.StroopResultComments.getSurvivalModeComment(
        results.total,
        results.accuracy
      )
      : window.StroopResultComments.getStandardModeComment(
        results.total,
        results.accuracy,
        results.averageReactionSeconds
      );
    const reactionText = results.averageReactionSeconds === null
      ? "--"
      : `${results.averageReactionSeconds.toFixed(3)} 秒`;
    const accuracyText = results.accuracy === null
      ? "--"
      : `${results.accuracy.toFixed(1)}%`;

    elements.resultComment.hidden = false;
    elements.resultCommentHeadline.textContent = comment.headline;
    elements.resultCommentSummary.textContent = `你總共完成了 ${results.total} 題，平均反應時間為 ${reactionText}，準確率為 ${accuracyText}。`;
    elements.resultCommentAdvice.textContent = comment.advice;
  }

  function finishGame() {
    if (state.status !== "playing") {
      return;
    }

    clearTimers();
    state.finishedAt = performance.now();
    state.status = "results";
    state.acceptingAnswer = false;
    state.questionToken += 1;
    setAnswerButtonsDisabled(true);
    renderResults(calculateResults());
    showScreen("results");
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function goHome() {
    clearTimers();
    state.status = "home";
    state.acceptingAnswer = false;
    state.questionToken += 1;
    showScreen("home");
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function getSnapshot() {
    return {
      mode: state.mode,
      status: state.status,
      total: state.total,
      correct: state.correct,
      wrong: state.wrong,
      streak: state.streak,
      maximumStreak: state.maximumStreak,
      currentQuestion: state.currentQuestion ? { ...state.currentQuestion } : null,
      currentOptions: state.currentOptions.map((option) => ({ ...option })),
      remainingTimeMs: state.status === "playing"
        ? Math.max(0, state.endsAt - performance.now())
        : 0,
      answers: state.allAnswers.slice()
    };
  }

  window.StroopGame = Object.freeze({
    init,
    start: startGame,
    restart: restartGame,
    submitAnswer,
    goHome,
    getSnapshot
  });
})();
