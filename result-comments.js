(function () {
  "use strict";

  function getStandardModeComment(total, accuracy, averageReactionSeconds) {
    const safeAccuracy = accuracy ?? 0;
    const safeReactionSeconds = averageReactionSeconds ?? Number.POSITIVE_INFINITY;

    if (total < 20 && safeAccuracy >= 90) {
      return {
        headline: "準確率很漂亮，但樣本還不多。",
        advice: "可以試著提高作答節奏，看看在更多題目的情況下能否維持同樣的準確率。"
      };
    }

    if (total < 20) {
      return {
        headline: "先熟悉節奏，再追求速度。",
        advice: "目前作答題數還不多，可以先熟悉題目規則，再慢慢提高速度與準確率。"
      };
    }

    if (safeAccuracy >= 90 && safeReactionSeconds <= 1.0) {
      return {
        headline: "又快又準！",
        advice: "你的速度與穩定性都維持得很好，可以試著在下一次挑戰中進一步提高總題數。"
      };
    }

    if (safeAccuracy >= 90 && safeReactionSeconds <= 1.5) {
      return {
        headline: "準確度很高，節奏也很穩。",
        advice: "你已經兼顧了準確率與節奏，下次可以試著再縮短一些反應時間。"
      };
    }

    if (safeAccuracy >= 90) {
      return {
        headline: "判斷很穩，但節奏偏保守。",
        advice: "你已經有很高的準確率，下次可以試著稍微加快反應速度。"
      };
    }

    if (safeAccuracy >= 80 && safeReactionSeconds <= 1.0) {
      return {
        headline: "速度很快，穩定度也不錯。",
        advice: "你的反應速度很快，如果能再減少幾次失誤，整體表現會更完整。"
      };
    }

    if (safeAccuracy >= 80 && safeReactionSeconds <= 1.5) {
      return {
        headline: "速度與準確率都很均衡。",
        advice: "目前節奏相當穩定，可以試著在維持準確率的同時增加答題數。"
      };
    }

    if (safeAccuracy >= 80) {
      return {
        headline: "準確率不錯，但還可以更俐落。",
        advice: "你已經有不錯的判斷穩定度，可以試著逐步加快作答節奏。"
      };
    }

    if (safeAccuracy >= 50 && safeReactionSeconds <= 1.0) {
      return {
        headline: "反應很快，但有點太急了。",
        advice: "如果稍微降低搶答速度，成績可能會更穩定。"
      };
    }

    if (safeAccuracy >= 50 && safeReactionSeconds <= 1.5) {
      return {
        headline: "還在抓節奏。",
        advice: "目前速度與準確率都還有調整空間，可以先專注在看清題目要求，再逐步提高作答速度。"
      };
    }

    if (safeAccuracy >= 50) {
      return {
        headline: "可以先把準確率拉高。",
        advice: "目前已經花了不少時間判斷，可以先以降低失誤為目標，再考慮加快速度。"
      };
    }

    return {
      headline: "這次被文字干擾得有點明顯。",
      advice: "下次可以先放慢節奏，確認題目要求後再作答，通常會比一味追求速度更有效。"
    };
  }

  window.StroopResultComments = Object.freeze({
    getStandardModeComment
  });
})();
