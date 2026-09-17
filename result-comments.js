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

  function getSurvivalModeComment(total, accuracy) {
    const safeAccuracy = Number.isFinite(accuracy) ? accuracy : 0;
    const isPerfect = safeAccuracy === 100;

    if (total > 30) {
      if (isPerfect) {
        return {
          headline: "百發百中之王者",
          advice: "題數多、而且沒有失誤，你已經把速度與精準度都維持在非常高的水準。試著看看自己還能把生存紀錄推到多遠。"
        };
      }
      if (safeAccuracy >= 85) {
        return {
          headline: "做題之王",
          advice: "你能在高強度作答下維持很高的準確率，整體節奏非常穩定。再減少少數失誤，就離完美更近了。"
        };
      }
      if (safeAccuracy >= 60) {
        return {
          headline: "生存強者",
          advice: "你已經有很不錯的作答量，代表節奏掌握得很好。接下來如果能降低失誤率，生存時間還能再明顯提升。"
        };
      }
      if (safeAccuracy >= 40) {
        return {
          headline: "反應快，但失誤可以更少",
          advice: "你能快速完成大量題目，但部分速度轉化成了失誤。稍微放慢關鍵幾題，可能反而能活得更久。"
        };
      }
      return {
        headline: "打了很多，命中率卻不高",
        advice: "你的作答速度非常積極，但目前錯誤消耗了不少生存時間。先提高判斷品質，會比繼續加快更有效。"
      };
    }

    if (total >= 15) {
      if (isPerfect) {
        return {
          headline: "極限生存之王",
          advice: "你在有限時間內保持了完全正確，控制力非常漂亮。接下來可以嘗試在維持零失誤的前提下增加題數。"
        };
      }
      if (safeAccuracy >= 85) {
        return {
          headline: "生存好手",
          advice: "你的準確率相當穩定，也已經成功撐過不少題目。再提升一些作答節奏，就有機會進入更高的生存區間。"
        };
      }
      if (safeAccuracy >= 60) {
        return {
          headline: "眼力好",
          advice: "你大多能正確分辨題目與選項的干擾，基礎判斷很不錯。再提高穩定度與節奏，就能撐得更久。"
        };
      }
      if (safeAccuracy >= 40) {
        return {
          headline: "極限生存轉職者",
          advice: "你已經開始掌握生存模式的節奏，但失誤仍會快速消耗時間。先把準確率拉高，效果會很明顯。"
        };
      }
      return {
        headline: "反應很快，但失誤正在吃掉你的時間",
        advice: "生存模式不只要求快，錯誤也會直接影響續航。稍微確認問法再出手，通常比盲目搶答更划算。"
      };
    }

    if (isPerfect) {
      return {
        headline: "精準的答題者",
        advice: "雖然完成的題數不多，但每一次判斷都很準確。下一步可以在保持零失誤的同時逐漸提高速度。"
      };
    }
    if (safeAccuracy >= 85) {
      return {
        headline: "鷹眼",
        advice: "你的辨識準確率很高，代表你不容易被顏色與文字的衝突騙到。再提升作答節奏，就能延長生存時間。"
      };
    }
    if (safeAccuracy >= 60) {
      return {
        headline: "很準，但節奏稍微保守",
        advice: "你的判斷品質不錯，但目前完成題數偏少。可以試著更相信第一直覺，在維持準確率的同時加快出手。"
      };
    }
    if (safeAccuracy >= 40) {
      return {
        headline: "極限生存初心者",
        advice: "你已經開始掌握玩法，但速度與準確率都還有成長空間。先以看清問法、減少失誤為優先。"
      };
    }
    return {
      headline: "有待加強",
      advice: "目前還容易受到文字與顏色的雙重干擾。先不要急著搶答，確認題目到底在問「字色」還是「字義」會更重要。"
    };
  }

  window.StroopResultComments = Object.freeze({
    getStandardModeComment,
    getSurvivalModeComment
  });
})();
