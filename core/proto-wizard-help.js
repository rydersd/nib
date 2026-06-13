/**
 * proto-wizard-help.js — Wizard help-column toggle
 *
 * Flips .wf-wizard-help-col[data-help-state] between "default" (a quiet
 * helper card with sample questions + an ask field) and "active" (a
 * pre-seeded AI-chat thread).
 *
 * For wireframes only — production would route the question to a real
 * assistant and stream the response. Each wizard page inlines its own
 * seeded Q&A in the active-state markup; this JS just toggles which
 * state is visible. Companion CSS lives in core/proto-components.css
 * under "Wizard help column".
 *
 * Markup shape:
 *   <aside class="wf-wizard-help-col" data-help-state="default">
 *     <div class="wf-wizard-help-card">…helper card…
 *       <textarea class="wf-wizard-help-ask-textarea"></textarea>
 *       <button class="wf-wizard-help-ask-submit">Ask</button>
 *       <button class="wf-wizard-help-suggestion" data-seed="…">…</button>
 *     </div>
 *     <div class="wf-wizard-help-thread">…seeded chat thread…
 *       <div class="wf-wizard-help-msg-user">…</div>
 *     </div>
 *   </aside>
 *
 * Exposes window.wfWizardAsk(seed) and window.wfWizardAskClose().
 */
(function () {
  function getHelpCol() {
    return document.querySelector('.wf-wizard-help-col');
  }

  // Open the AI chat. Optional `seed` injects a different user-message at
  // the top of the thread (lets suggestion buttons route to topic-specific
  // seeds when the page wants them).
  window.wfWizardAsk = function (seed) {
    var col = getHelpCol();
    if (!col) return;
    col.setAttribute('data-help-state', 'active');
    if (seed) {
      var firstUser = col.querySelector('.wf-wizard-help-msg-user');
      if (firstUser) firstUser.textContent = seed;
    }
    // scroll thread to bottom so the latest reply is visible
    var bd = col.querySelector('.wf-wizard-help-thread-bd');
    if (bd) bd.scrollTop = bd.scrollHeight;
  };

  // Close the AI chat — return to the helper card.
  window.wfWizardAskClose = function () {
    var col = getHelpCol();
    if (!col) return;
    col.setAttribute('data-help-state', 'default');
  };

  // Wire the default-state textarea: pressing Enter (no shift) or
  // clicking the Ask button submits the typed text as the seed.
  function wire() {
    var ta = document.querySelector('.wf-wizard-help-ask-textarea');
    var btn = document.querySelector('.wf-wizard-help-ask-submit');
    if (ta) {
      ta.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          window.wfWizardAsk(ta.value.trim() || null);
        }
      });
    }
    if (btn) {
      btn.addEventListener('click', function () {
        window.wfWizardAsk((ta && ta.value.trim()) || null);
      });
    }
    // Suggestion chips: each carries data-seed with the question text
    document.querySelectorAll('.wf-wizard-help-suggestion').forEach(function (s) {
      s.addEventListener('click', function () {
        window.wfWizardAsk(s.dataset.seed || s.textContent.trim());
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wire);
  } else {
    wire();
  }
})();
