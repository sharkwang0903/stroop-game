(function () {
  "use strict";

  function bindAction(buttonId, action) {
    const button = document.getElementById(buttonId);
    button.addEventListener("click", () => {
      if (button.disabled) {
        return;
      }

      button.disabled = true;
      action();
      window.setTimeout(() => {
        button.disabled = false;
      }, 300);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    window.StroopGame.init();
    window.StroopDesktopControls.init();
    window.StroopMobileControls.init();

    bindAction("start-normal-button", () => window.StroopGame.start("normal"));
    bindAction("start-expert-button", () => window.StroopGame.start("expert"));
    bindAction("start-hard-button", () => window.StroopGame.start("hard"));
    bindAction("start-survival-button", () => window.StroopGame.start("survival"));
    bindAction("replay-button", window.StroopGame.restart);
    bindAction("home-button", window.StroopGame.goHome);
  });
})();
