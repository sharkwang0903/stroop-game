(function () {
  "use strict";

  const DOUBLE_CLICK_GUARD_MS = 180;
  let initialized = false;
  let nextMouseSubmissionAt = 0;

  function init() {
    if (initialized) {
      return;
    }

    initialized = true;
    const answerGrid = document.getElementById("answer-grid");

    answerGrid.addEventListener("click", (event) => {
      const button = event.target.closest(".answer-button");
      if (!button || button.disabled) {
        return;
      }

      if (event.pointerType === "touch" || event.pointerType === "pen") {
        return;
      }

      if (performance.now() < (window.StroopTouchSuppressUntil || 0)) {
        return;
      }

      const now = performance.now();
      if (now < nextMouseSubmissionAt) {
        return;
      }

      if (window.StroopGame.submitAnswer(button.dataset.color)) {
        nextMouseSubmissionAt = now + DOUBLE_CLICK_GUARD_MS;
      }
    });

    answerGrid.addEventListener("mousedown", (event) => {
      const button = event.target.closest(".answer-button");
      if (button && !button.disabled) {
        button.classList.add("is-pressed");
      }
    });

    document.addEventListener("mouseup", () => {
      document.querySelectorAll(".answer-button.is-pressed").forEach((button) => {
        button.classList.remove("is-pressed");
      });
    });
  }

  window.StroopDesktopControls = Object.freeze({ init });
})();
