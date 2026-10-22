/**
 * Lazy loader for Cloudflare Turnstile.
 *
 * The Cloudflare script (and the challenge it runs) is downloaded only when the
 * visitor starts using a form that contains a widget: focus, click or touch
 * inside the form. If the form is submitted before a token exists, the submit
 * is held until Turnstile returns one, then sent again with the same button.
 */
(function () {
  'use strict';

  var API_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=pxdTurnstileOnload';
  var TRIGGERS = ['focusin', 'pointerdown', 'touchstart', 'keydown'];
  var scriptState = 'idle'; // idle | loading | ready | failed
  var queue = [];

  function loadApi(callback) {
    if (scriptState === 'ready') {
      callback();
      return;
    }
    queue.push(callback);
    if (scriptState !== 'idle') {
      return;
    }
    scriptState = 'loading';
    window.pxdTurnstileOnload = function () {
      scriptState = 'ready';
      var callbacks = queue;
      queue = [];
      callbacks.forEach(function (cb) { cb(); });
    };
    var script = document.createElement('script');
    script.src = API_URL;
    script.onerror = function () {
      scriptState = 'failed';
      queue = [];
      // Release held forms: the server will answer with its own error.
      document.querySelectorAll('.cf-turnstile').forEach(function (el) {
        if (el.pxdTurnstile) {
          el.pxdTurnstile.release();
        }
      });
    };
    document.head.appendChild(script);
  }

  function setup(el) {
    if (el.pxdTurnstile) {
      return;
    }
    var form = el.closest('form');
    var state = {
      widgetId: null,
      token: '',
      pendingSubmitter: undefined,
      release: function () {
        if (state.pendingSubmitter !== undefined) {
          resubmit();
        }
      },
    };
    el.pxdTurnstile = state;

    function resubmit() {
      var submitter = state.pendingSubmitter;
      state.pendingSubmitter = undefined;
      if (!form) {
        return;
      }
      state.resubmitting = true;
      if (typeof form.requestSubmit === 'function') {
        form.requestSubmit(submitter || undefined);
      } else {
        // Old browsers: keep the name of the clicked button, PrestaShop needs it.
        if (submitter && submitter.name) {
          var hidden = document.createElement('input');
          hidden.type = 'hidden';
          hidden.name = submitter.name;
          hidden.value = submitter.value;
          form.appendChild(hidden);
        }
        form.submit();
      }
      state.resubmitting = false;
    }

    function render() {
      if (state.widgetId !== null || !window.turnstile) {
        return;
      }
      var options = {
        sitekey: el.getAttribute('data-sitekey'),
        theme: el.getAttribute('data-theme') || 'auto',
        callback: function (token) {
          state.token = token;
          if (state.pendingSubmitter !== undefined) {
            resubmit();
          }
        },
        'expired-callback': function () {
          state.token = '';
          window.turnstile.reset(state.widgetId);
        },
        'error-callback': function () {
          state.token = '';
          // Let a held submit go through: the server shows the error message.
          state.release();
        },
      };
      var action = el.getAttribute('data-action');
      if (action) {
        options.action = action;
      }
      var appearance = el.getAttribute('data-appearance');
      if (appearance) {
        options.appearance = appearance;
      }
      state.widgetId = window.turnstile.render(el, options);
    }

    function start() {
      if (scriptState === 'failed') {
        return;
      }
      loadApi(render);
    }

    var scope = form || el.parentNode;
    var onTrigger = function () {
      TRIGGERS.forEach(function (type) {
        scope.removeEventListener(type, onTrigger, true);
      });
      start();
    };
    TRIGGERS.forEach(function (type) {
      scope.addEventListener(type, onTrigger, { capture: true, passive: true });
    });

    if (form) {
      form.addEventListener('submit', function (event) {
        if (state.resubmitting || state.token || scriptState === 'failed') {
          return;
        }
        var input = form.querySelector('input[name="cf-turnstile-response"]');
        if (input && input.value) {
          return;
        }
        event.preventDefault();
        event.stopImmediatePropagation();
        state.pendingSubmitter = event.submitter || null;
        start();
      }, true);
    }
  }

  function init() {
    document.querySelectorAll('.cf-turnstile[data-sitekey]').forEach(setup);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
