(function () {
  "use strict";

  const TOUCH_CLICK_SUPPRESSION_MS = 700;
  const DOUBLE_TAP_GUARD_MS = 250;
  let initialized = false;
  let activePointerId = null;
  let nextTouchSubmissionAt = 0;

  function init() {
    if (initialized) {
      return;
    }

    initialized = true;
    const answerGrid = document.getElementById("answer-grid");

    answerGrid.addEventListener("pointerdown", (event) => {
      if (event.pointerType !== "touch" && event.pointerType !== "pen") {
        return;
      }

      const button = event.target.closest(".answer-button");
      const now = performance.now();
      if (
        !button ||
        button.disabled ||
        activePointerId !== null ||
        now < nextTouchSubmissionAt
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      activePointerId = event.pointerId;
      nextTouchSubmissionAt = now + DOUBLE_TAP_GUARD_MS;
      window.StroopTouchSuppressUntil = now + TOUCH_CLICK_SUPPRESSION_MS;
      button.classList.add("is-pressed");
      window.StroopGame.submitAnswer(button.dataset.color);
    }, { passive: false });

    function releasePointer(event) {
      if (event.pointerType !== "touch" && event.pointerType !== "pen") {
        return;
      }

      document.querySelectorAll(".answer-button.is-pressed").forEach((button) => {
        button.classList.remove("is-pressed");
      });

      if (event.pointerId === activePointerId) {
        activePointerId = null;
      }
    }

    answerGrid.addEventListener("pointerup", releasePointer);
    answerGrid.addEventListener("pointercancel", releasePointer);
    answerGrid.addEventListener("contextmenu", (event) => event.preventDefault());
  }

  window.StroopMobileControls = Object.freeze({ init });
})();
