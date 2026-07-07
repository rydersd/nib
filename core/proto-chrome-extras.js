/* ========================================================================
   PROTO-CHROME-EXTRAS — Lazy-loaded companion to proto-nav.js
   ------------------------------------------------------------------------
   Opt-in chrome that most page views never trigger: the feedback panel,
   review mode, and the settings/theme panel UI. proto-nav.js keeps thin
   stubs with the same names (wfFbOpen, wfSettingsOpen, wfReviewToggle,
   wfReviewPopulateTab) that call wfLoadChromeExtras() to inject this
   file, then re-invoke the real function. Because this is a plain
   classic script (no modules — file:// must keep working), the top-level
   function declarations below become globals and overwrite those stubs;
   HTML onclick attributes resolve them by name at click time.

   Contract with proto-nav.js:
   - Load only via wfLoadChromeExtras() (or a <script> tag placed after
     proto-nav.js) — this file relies on proto-nav globals: WF_CONFIG,
     SECTIONS, STORY_MAP, STORY_TITLES, currentFile(), findPage(),
     wfToast(), _wfMergedThemes(), wfThemeDetect(), wfThemeApply().
   - Panels are no longer pre-built at wfNavInit time: wfFbOpen() and
     wfSettingsOpen() build their (hidden-overlay) DOM on first open, so
     the deferred build is invisible to users.
   - window._wfExtrasLoaded is set to true at the end of this file; the
     proto-nav stubs check it to guard against re-entrant recursion.
   ======================================================================== */

/* ========================================================================
   FEEDBACK PANEL — Screenshot Paste, Page Context, Email
   ======================================================================== */

var _wfFbScreenshot = null;

/**
 * Build page context string for feedback emails
 */
function wfFbPageContext() {
  var file = currentFile();
  var page = findPage(file);
  var lines = [];

  lines.push('Page: ' + file);
  if (page) {
    lines.push('Section: ' + page.section.label);
    lines.push('Screen: ' + page.item.label);
  }

  var stories = STORY_MAP[file];
  if (stories && stories.length) {
    var storyLines = stories.map(function(sid) {
      return sid + ' — ' + (STORY_TITLES[sid] || '');
    });
    lines.push('Design Stories: ' + storyLines.join(', '));
  }

  lines.push('URL: ' + window.location.href);
  return lines.join('\n');
}

/**
 * Build and inject the feedback panel DOM
 */
function buildFeedbackPanel() {
  if (document.getElementById('wf-fb-overlay')) return;

  var file = currentFile();
  var page = findPage(file);
  var pageLabel = page ? page.item.label : file;

  // Story chips for this page
  var stories = STORY_MAP[file] || [];
  var storyChipsHTML = '';
  if (stories.length) {
    storyChipsHTML = '<div class="wf-fb-stories">';
    for (var i = 0; i < stories.length; i++) {
      storyChipsHTML += '<span class="wf-fb-story-chip" title="' +
        (STORY_TITLES[stories[i]] || '') + '">' + stories[i] + '</span>';
    }
    storyChipsHTML += '</div>';
  }

  var typeDefs = [
    { val: 'question',   label: 'Question',   icon: '❓' },
    { val: 'issue',      label: 'Issue',       icon: '🔴' },
    { val: 'suggestion', label: 'Suggestion',  icon: '💡' },
    { val: 'approved',   label: 'Approved',    icon: '✅' }
  ];

  var typePillsHTML = '';
  for (var t = 0; t < typeDefs.length; t++) {
    var td = typeDefs[t];
    typePillsHTML += '<label class="wf-fb-type-pill">' +
      '<input type="radio" name="wf-fb-type" value="' + td.val + '"' +
      (td.val === 'question' ? ' checked' : '') + '>' +
      '<span>' + td.icon + '\u00a0' + td.label + '</span>' +
      '</label>';
  }

  var html =
    '<div class="wf-fb-overlay" id="wf-fb-overlay" onclick="if(event.target===this)wfFbClose()">' +
      '<div class="wf-fb-panel" role="dialog" aria-modal="true" aria-label="Feedback">' +

        '<div class="wf-fb-hd">' +
          '<div class="wf-fb-hd-left">' +
            '<span class="wf-fb-hd-title">💬 Feedback</span>' +
            '<span class="wf-fb-page-badge">' + pageLabel + '</span>' +
          '</div>' +
          '<button class="wf-fb-hd-close" onclick="wfFbClose()" aria-label="Close feedback">✕</button>' +
        '</div>' +

        storyChipsHTML +

        '<form id="wf-fb-form" class="wf-fb-body" onsubmit="wfFbSubmit(event)" novalidate>' +

          '<div class="wf-fb-field">' +
            '<div class="wf-fb-label">Type</div>' +
            '<div class="wf-fb-type-pills">' + typePillsHTML + '</div>' +
          '</div>' +

          '<div class="wf-fb-field">' +
            '<label class="wf-fb-label" for="wf-fb-desc">Description</label>' +
            '<textarea id="wf-fb-desc" class="wf-fb-textarea" rows="4" ' +
              'placeholder="Describe the feedback, question, or issue\u2026" required></textarea>' +
          '</div>' +

          '<div class="wf-fb-field">' +
            '<div class="wf-fb-label">Screenshot <span class="wf-fb-optional">(optional)</span></div>' +
            '<div class="wf-fb-drop" id="wf-fb-img-drop" ' +
              'ondragover="event.preventDefault()" ondrop="wfFbDropImage(event)" ' +
              'onclick="document.getElementById(\'wf-fb-img-input\').click()" ' +
              'role="button" tabindex="0" aria-label="Upload screenshot">' +
              '<span id="wf-fb-img-drop-text" class="wf-fb-drop-hint">' +
                'Paste, drop, or click to upload a screenshot' +
              '</span>' +
              '<img id="wf-fb-img-preview" class="wf-fb-img-preview" alt="Screenshot preview" style="display:none">' +
            '</div>' +
            '<div class="wf-fb-img-actions">' +
              '<button type="button" class="wf-fb-paste-btn" onclick="wfFbCaptureScreen()" id="wf-fb-capture-btn">\ud83d\udcf7 Capture this page</button>' +
              '<button type="button" class="wf-fb-paste-btn" onclick="wfFbPasteClipboard()">\u2318V Paste</button>' +
              '<button type="button" class="wf-fb-clear-btn" id="wf-fb-clear-btn" ' +
                'onclick="wfFbClearImage()" style="display:none">\u00d7 Remove</button>' +
            '</div>' +
            '<input type="file" id="wf-fb-img-input" accept="image/*" ' +
              'style="display:none" onchange="wfFbImageFile(event)">' +
          '</div>' +

          '<div class="wf-fb-actions">' +
            '<button type="submit" class="wf-fb-submit-btn">Send Feedback</button>' +
          '</div>' +

        '</form>' +

      '</div>' +
    '</div>';

  document.body.insertAdjacentHTML('beforeend', html);
}

/**
 * Open feedback panel
 * Builds the panel DOM on first open (it's a hidden overlay, so the
 * deferred build is invisible) — wfNavInit no longer pre-builds it.
 */
function wfFbOpen() {
  buildFeedbackPanel();
  var overlay = document.getElementById('wf-fb-overlay');
  if (!overlay) return;
  overlay.classList.add('open');
  document.body.classList.add('wf-fb-open');
  setTimeout(function() {
    var desc = document.getElementById('wf-fb-desc');
    if (desc) desc.focus();
  }, 150);
}

/**
 * Close feedback panel
 */
function wfFbClose() {
  var overlay = document.getElementById('wf-fb-overlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.classList.remove('wf-fb-open');
}

/**
 * Image handling — drop, file picker, paste
 */
function wfFbDropImage(e) {
  e.preventDefault();
  var f = e.dataTransfer.files[0];
  if (f && f.type.startsWith('image/')) wfFbReadImage(f);
}

function wfFbImageFile(e) {
  var f = e.target.files[0];
  if (f) wfFbReadImage(f);
}

function wfFbReadImage(f) {
  var reader = new FileReader();
  reader.onload = function(ev) {
    _wfFbScreenshot = ev.target.result;
    var preview  = document.getElementById('wf-fb-img-preview');
    var hint     = document.getElementById('wf-fb-img-drop-text');
    var clearBtn = document.getElementById('wf-fb-clear-btn');
    if (preview)  { preview.src = _wfFbScreenshot; preview.style.display = ''; }
    if (hint)     { hint.style.display = 'none'; }
    if (clearBtn) { clearBtn.style.display = ''; }
  };
  reader.readAsDataURL(f);
}

function wfFbClearImage() {
  _wfFbScreenshot = null;
  var preview   = document.getElementById('wf-fb-img-preview');
  var hint      = document.getElementById('wf-fb-img-drop-text');
  var clearBtn  = document.getElementById('wf-fb-clear-btn');
  var fileInput = document.getElementById('wf-fb-img-input');
  if (preview)   { preview.style.display = 'none'; preview.src = ''; }
  if (hint)      { hint.style.display = ''; }
  if (clearBtn)  { clearBtn.style.display = 'none'; }
  if (fileInput) { fileInput.value = ''; }
}

/**
 * Paste from clipboard button — focuses the panel so the global paste handler catches it
 */
function wfFbPasteClipboard() {
  // If the Clipboard API is available, read directly
  if (navigator.clipboard && navigator.clipboard.read) {
    navigator.clipboard.read().then(function(items) {
      for (var i = 0; i < items.length; i++) {
        var types = items[i].types;
        for (var t = 0; t < types.length; t++) {
          if (types[t].startsWith('image/')) {
            items[i].getType(types[t]).then(function(blob) {
              wfFbReadImage(blob);
            });
            return;
          }
        }
      }
      wfToast('No image found in clipboard');
    }).catch(function() {
      wfToast('Paste an image with \u2318V / Ctrl+V');
    });
  } else {
    wfToast('Paste an image with \u2318V / Ctrl+V');
  }
}

/**
 * Capture the current page as a PNG and stash it in _wfFbScreenshot.
 * Uses html2canvas, lazy-loaded from jsdelivr on first use (~50 KB).
 * The feedback overlay is hidden during capture so it doesn't appear
 * in the snapshot.
 */
var _wfHtml2canvasPromise = null;
function wfFbLoadHtml2Canvas() {
  if (typeof window.html2canvas === 'function') {
    return Promise.resolve(window.html2canvas);
  }
  if (_wfHtml2canvasPromise) return _wfHtml2canvasPromise;
  _wfHtml2canvasPromise = new Promise(function(resolve, reject) {
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
    s.async = true;
    s.onload = function() {
      if (typeof window.html2canvas === 'function') resolve(window.html2canvas);
      else reject(new Error('html2canvas loaded but global not available'));
    };
    s.onerror = function() { reject(new Error('Failed to load html2canvas from CDN')); };
    document.head.appendChild(s);
  });
  return _wfHtml2canvasPromise;
}

function wfFbCaptureScreen() {
  var btn = document.getElementById('wf-fb-capture-btn');
  var origLabel = btn ? btn.textContent : '';
  if (btn) { btn.textContent = 'Capturing…'; btn.disabled = true; }
  var panel = document.getElementById('wf-fb-overlay');
  var prevDisplay = panel ? panel.style.display : '';
  if (panel) panel.style.display = 'none';

  wfFbLoadHtml2Canvas()
    .then(function(h2c) {
      return new Promise(function(res) { setTimeout(function() { res(h2c); }, 80); });
    })
    .then(function(h2c) {
      return h2c(document.body, {
        backgroundColor: '#ffffff',
        scale: Math.min(window.devicePixelRatio || 1, 2),
        logging: false,
        useCORS: true,
        allowTaint: false
      });
    })
    .then(function(canvas) {
      if (panel) panel.style.display = prevDisplay;
      _wfFbScreenshot = canvas.toDataURL('image/png');
      var preview  = document.getElementById('wf-fb-img-preview');
      var hint     = document.getElementById('wf-fb-img-drop-text');
      var clearBtn = document.getElementById('wf-fb-clear-btn');
      if (preview)  { preview.src = _wfFbScreenshot; preview.style.display = ''; }
      if (hint)     { hint.style.display = 'none'; }
      if (clearBtn) { clearBtn.style.display = ''; }
      if (btn)      { btn.textContent = origLabel; btn.disabled = false; }
      wfToast('Captured ✓');
    })
    .catch(function(err) {
      if (panel) panel.style.display = prevDisplay;
      if (btn)   { btn.textContent = origLabel; btn.disabled = false; }
      console.warn('[feedback] capture failed:', err);
      wfToast('Capture failed — try Paste or upload');
    });
}

/**
 * Submit feedback. Two modes, selected by WF_CONFIG.feedbackEndpoint:
 *   - Endpoint set: POST JSON to the endpoint (e.g. a Cloudflare Worker
 *     that creates a GitHub issue). Payload includes screenshot_base64
 *     when a screenshot has been captured/pasted. Falls back to mailto
 *     on network or server error (when emailRecipient is also set) so
 *     feedback is never dropped.
 *   - Endpoint empty: open a mailto: with full page context.
 *
 * See examples/cloudflare-worker/ for a reference Worker implementation
 * and docs/Feedback.md for endpoint / payload shape.
 */
function wfFbSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();
  var typeEl = document.querySelector('input[name="wf-fb-type"]:checked');
  var descEl = document.getElementById('wf-fb-desc');

  var type = typeEl ? typeEl.value : 'question';
  var desc = descEl ? descEl.value.trim() : '';
  if (!desc) { if (descEl) descEl.focus(); return; }

  if (WF_CONFIG.feedbackEndpoint) {
    _wfFbSubmitToEndpoint(type, desc, descEl);
    return;
  }
  _wfFbSubmitViaMailto(type, desc, descEl);
}

function _wfFbResetForm(descEl) {
  if (descEl) descEl.value = '';
  wfFbClearImage();
  var defaultType = document.querySelector('input[name="wf-fb-type"][value="question"]');
  if (defaultType) defaultType.checked = true;
}

function _wfFbSubmitToEndpoint(type, desc, descEl) {
  var file = currentFile();
  var chip = document.querySelector('.wf-ctx-persona-chip, .persona-badge');
  var payload = {
    type: type,
    description: desc,
    page_url: window.location.href,
    page_file: file,
    persona: chip ? chip.textContent.trim() : '',
    user_agent: navigator.userAgent,
    // Data URL; Worker decodes and uploads to R2 when bound.
    screenshot_base64: _wfFbScreenshot || null,
    // When the user opens feedback from a blueprint canvas node, the canvas
    // sets window._wfActiveNodeId so the Worker can label the issue node:<id>.
    node_id: (typeof window._wfActiveNodeId === 'string') ? window._wfActiveNodeId : ''
  };

  wfToast('Sending…');

  fetch(WF_CONFIG.feedbackEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(function(res) {
      if (!res.ok) {
        return res.text().then(function(txt) {
          throw new Error('HTTP ' + res.status + ': ' + txt.slice(0, 200));
        });
      }
      return res.json();
    })
    .then(function(json) {
      if (json && json.issue_number) {
        wfToast('Issue #' + json.issue_number + ' created ✓');
      } else {
        wfToast('Feedback sent ✓');
      }
      _wfFbResetForm(descEl);
      setTimeout(wfFbClose, 600);
    })
    .catch(function(err) {
      console.warn('[feedback] endpoint failed, falling back to mailto:', err);
      if (WF_CONFIG.emailRecipient) {
        _wfFbSubmitViaMailto(type, desc, descEl);
      } else {
        wfToast('Could not send feedback. Please try again later.');
      }
    });
}

function _wfFbSubmitViaMailto(type, desc, descEl) {
  var context = wfFbPageContext();
  var typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
  var file = currentFile();

  var subject = WF_CONFIG.emailPrefix + ' ' + typeLabel + ': ' + file;
  var bodyParts = [context, '', 'Type: ' + typeLabel, '', desc];

  if (_wfFbScreenshot) {
    bodyParts.push('');
    bodyParts.push('[Screenshot attached — paste into email from clipboard]');
  }

  bodyParts.push('');
  bodyParts.push('---');
  bodyParts.push(WF_CONFIG.emailFooter);

  var mailtoUrl = 'mailto:' + WF_CONFIG.emailRecipient + '?subject=' +
    encodeURIComponent(subject) + '&body=' +
    encodeURIComponent(bodyParts.join('\n'));

  if (_wfFbScreenshot && navigator.clipboard && navigator.clipboard.write) {
    fetch(_wfFbScreenshot)
      .then(function(r) { return r.blob(); })
      .then(function(blob) {
        return navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob })
        ]);
      })
      .then(function() {
        window.open(mailtoUrl, '_blank');
        wfToast('Screenshot copied to clipboard — paste into email with ⌘V');
      })
      .catch(function() {
        window.open(mailtoUrl, '_blank');
      });
  } else {
    window.open(mailtoUrl, '_blank');
  }

  _wfFbResetForm(descEl);
  wfToast('Feedback sent ✓');
  setTimeout(wfFbClose, 500);
}

/* ========================================================================
   Settings Panel — Theme Configuration UI
   ======================================================================== */

function buildSettingsPanel() {
  if (document.getElementById('wf-settings-panel')) return;

  var overlay = document.createElement('div');
  overlay.id = 'wf-settings-overlay';
  overlay.className = 'wf-settings-overlay';
  overlay.setAttribute('onclick', 'wfSettingsClose()');

  var panel = document.createElement('aside');
  panel.id = 'wf-settings-panel';
  panel.className = 'wf-settings-panel';
  panel.innerHTML =
    '<div class="wf-settings-hd">' +
      '<span class="wf-settings-hd-title">Settings</span>' +
      '<button class="wf-settings-close" onclick="wfSettingsClose()">&#10005;</button>' +
    '</div>' +
    '<div class="wf-settings-body" id="wf-settings-body"></div>';

  document.body.appendChild(overlay);
  document.body.appendChild(panel);
}

function wfSettingsOpen() {
  // Deferred build — the panel DOM is created on first open (no-op after)
  buildSettingsPanel();

  var panel = document.getElementById('wf-settings-panel');
  var overlay = document.getElementById('wf-settings-overlay');
  if (!panel) return;

  // Populate settings body
  var body = document.getElementById('wf-settings-body');
  if (body) _wfPopulateSettings(body);

  panel.classList.add('open');
  if (overlay) overlay.classList.add('open');
}

function wfSettingsClose() {
  var panel = document.getElementById('wf-settings-panel');
  var overlay = document.getElementById('wf-settings-overlay');
  if (panel) panel.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
}

function _wfPopulateSettings(body) {
  var themes = _wfMergedThemes();
  var currentTheme = sessionStorage.getItem('wf_theme') || WF_CONFIG.defaultTheme || 'nib';
  var themeObj = themes[currentTheme];
  var html = '';

  // Active theme section
  html += '<div class="wf-settings-section">' +
    '<div class="wf-settings-section-title">Active Theme</div>' +
    '<div class="wf-settings-active-theme">' + (themeObj ? themeObj.label : currentTheme) + '</div>' +
    '<p>Auto-detected from current page</p>' +
  '</div>';

  // Theme assignments table
  if (SECTIONS.length) {
    html += '<div class="wf-settings-section">' +
      '<div class="wf-settings-section-title">Theme Assignments</div>' +
      '<table class="wf-settings-table">' +
      '<tr><th>Group / Section</th><th>Theme</th></tr>';

    var themeOptions = _wfBuildThemeOptions(themes);
    var currentGroup = null;
    var assignments = {};
    try {
      var stored = sessionStorage.getItem('wf_theme_assignments');
      if (stored) assignments = JSON.parse(stored);
    } catch (e) { /* ignore */ }

    for (var s = 0; s < SECTIONS.length; s++) {
      var sec = SECTIONS[s];
      if (sec.isGroup) {
        currentGroup = sec;
        var groupTheme = assignments[sec.id] || sec.theme || '';
        html += '<tr class="wf-settings-group-row">' +
          '<td>' + sec.label + '</td>' +
          '<td><select onchange="wfSettingsAssign(\'' + sec.id + '\',this.value)">' +
            _wfBuildThemeOptions(themes, groupTheme) +
          '</select></td></tr>';
      } else if (sec.items) {
        var secTheme = assignments[sec.id] || sec.theme || '';
        var inheriting = !secTheme;
        html += '<tr class="wf-settings-section-row">' +
          '<td>' + sec.label + '</td>' +
          '<td>';
        if (inheriting) {
          html += '<span class="wf-settings-inherit" onclick="wfSettingsPromoteSection(\'' + sec.id + '\',this)" title="Click to override">(group)</span>';
        } else {
          html += '<select onchange="wfSettingsAssign(\'' + sec.id + '\',this.value)">' +
            _wfBuildThemeOptions(themes, secTheme) +
          '</select>';
        }
        html += '</td></tr>';
      }
    }

    html += '</table>' +
      '<p>Sections show "(group)" when inheriting. Click to override.</p>' +
    '</div>';
  }

  // Session override section
  html += '<div class="wf-settings-section">' +
    '<div class="wf-settings-section-title">Session Override</div>' +
    '<div class="wf-settings-override">' +
      '<input type="checkbox" id="wf-override-check"' +
        (sessionStorage.getItem('wf_theme_override') ? ' checked' : '') +
        ' onchange="wfSettingsToggleOverride(this.checked)">' +
      '<label for="wf-override-check">Force all pages to:</label>' +
      '<select id="wf-override-select" onchange="wfSettingsSetOverride(this.value)"' +
        (!sessionStorage.getItem('wf_theme_override') ? ' disabled' : '') + '>' +
        _wfBuildThemeOptions(themes, sessionStorage.getItem('wf_theme_override') || '') +
      '</select>' +
    '</div>' +
    '<p>Overrides everything for this session — useful for comparing.</p>' +
  '</div>';

  // Custom theme builder
  html += '<div class="wf-settings-section">' +
    '<div class="wf-settings-section-title">Custom Theme</div>' +
    '<div class="wf-settings-custom-field"><label>Name</label><input type="text" id="wf-custom-name" placeholder="my-brand"></div>' +
    '<div class="wf-settings-custom-field"><label>Font</label><input type="text" id="wf-custom-font" placeholder="\'Font Name\', sans-serif"></div>' +
    '<div class="wf-settings-custom-field"><label>Font URL</label><input type="text" id="wf-custom-fonturl" placeholder="https://fonts.googleapis.com/..."></div>' +
    '<div style="display:flex;gap:12px;">' +
      '<div class="wf-settings-custom-field" style="flex:1"><label>Accent</label><input type="color" id="wf-custom-accent" value="#3d6daa"></div>' +
      '<div class="wf-settings-custom-field" style="flex:1"><label>Surface</label><input type="color" id="wf-custom-surface" value="#edf1f7"></div>' +
    '</div>' +
    '<button class="btn btn-primary" style="font-size:11px;padding:5px 12px;" onclick="wfSettingsSaveCustom()">Save as Theme</button>' +
  '</div>';

  body.innerHTML = html;
}

function _wfBuildThemeOptions(themes, selected) {
  var html = '<option value="">— default —</option>';
  for (var id in themes) {
    if (themes.hasOwnProperty(id)) {
      html += '<option value="' + id + '"' + (id === selected ? ' selected' : '') + '>' +
        themes[id].label + '</option>';
    }
  }
  return html;
}

function wfSettingsAssign(sectionId, themeId) {
  var assignments = {};
  try {
    var stored = sessionStorage.getItem('wf_theme_assignments');
    if (stored) assignments = JSON.parse(stored);
  } catch (e) { /* ignore */ }

  if (themeId) {
    assignments[sectionId] = themeId;
  } else {
    delete assignments[sectionId];
  }

  sessionStorage.setItem('wf_theme_assignments', JSON.stringify(assignments));
  wfThemeDetect();
}

function wfSettingsPromoteSection(sectionId, el) {
  // Replace "(group)" text with a select dropdown
  var themes = _wfMergedThemes();
  var select = document.createElement('select');
  select.setAttribute('onchange', "wfSettingsAssign('" + sectionId + "',this.value)");
  select.innerHTML = _wfBuildThemeOptions(themes, '');
  el.parentNode.replaceChild(select, el);
}

function wfSettingsToggleOverride(checked) {
  var select = document.getElementById('wf-override-select');
  if (checked) {
    if (select) {
      select.disabled = false;
      var val = select.value;
      if (val) {
        sessionStorage.setItem('wf_theme_override', val);
        wfThemeApply(val);
      }
    }
  } else {
    sessionStorage.removeItem('wf_theme_override');
    if (select) select.disabled = true;
    wfThemeDetect();
  }
}

function wfSettingsSetOverride(themeId) {
  var check = document.getElementById('wf-override-check');
  if (check && check.checked && themeId) {
    sessionStorage.setItem('wf_theme_override', themeId);
    wfThemeApply(themeId);
  }
}

function wfSettingsSaveCustom() {
  var name = (document.getElementById('wf-custom-name') || {}).value;
  if (!name) { alert('Please enter a theme name'); return; }

  var font = (document.getElementById('wf-custom-font') || {}).value;
  var fontUrl = (document.getElementById('wf-custom-fonturl') || {}).value;
  var accent = (document.getElementById('wf-custom-accent') || {}).value;
  var surface = (document.getElementById('wf-custom-surface') || {}).value;

  var theme = {
    label: name,
    tokens: {}
  };
  if (font) theme.font = font;
  if (fontUrl) theme.fontUrl = fontUrl;
  if (accent && accent !== '#3d6daa') theme.tokens['--wf-accent'] = accent;
  if (surface && surface !== '#edf1f7') theme.tokens['--wf-surface'] = surface;

  // Store in sessionStorage for this session
  var customThemes = {};
  try {
    var stored = sessionStorage.getItem('wf_custom_themes');
    if (stored) customThemes = JSON.parse(stored);
  } catch (e) { /* ignore */ }
  customThemes[name.toLowerCase().replace(/\s+/g, '-')] = theme;
  sessionStorage.setItem('wf_custom_themes', JSON.stringify(customThemes));

  // Merge into WF_CONFIG so it's available immediately
  WF_CONFIG.themes[name.toLowerCase().replace(/\s+/g, '-')] = theme;

  // Refresh settings
  var body = document.getElementById('wf-settings-body');
  if (body) _wfPopulateSettings(body);
}

/* ========================================================================
   REVIEW MODE — Confidence Negotiation Protocol
   ======================================================================== */

var _reviewMode = false;
var REVIEW_ANNOTATIONS = [];
var _reviewToolbarTimer = null;
var _reviewCurrentEl = null;

/**
 * Toggle review mode on/off
 */
function wfReviewToggle() {
  _reviewMode = !_reviewMode;
  var btn = document.getElementById('wf-review-mode-btn');

  if (_reviewMode) {
    document.documentElement.classList.add('wf-review-active');
    if (btn) btn.classList.add('wf-ctx-btn--active');

    // Set up event delegation for hover on confidence elements
    document.body.addEventListener('mouseover', _reviewMouseOver);
    document.body.addEventListener('mouseout', _reviewMouseOut);

    wfToast('Review mode ON — hover elements to annotate');
  } else {
    document.documentElement.classList.remove('wf-review-active');
    if (btn) btn.classList.remove('wf-ctx-btn--active');

    // Remove event delegation
    document.body.removeEventListener('mouseover', _reviewMouseOver);
    document.body.removeEventListener('mouseout', _reviewMouseOut);

    // Remove any open toolbar
    _reviewRemoveToolbar();

    wfToast('Review mode OFF');
  }
}

// Selector for reviewable elements — confidence-annotated OR common wireframe components
var _reviewSelector = '[data-wf-confidence], .wf-card, .sfdc-card, .ds-card, .ds-kpi-card, .sfdc-detail-grid, .sfdc-highlights-bar, .sfdc-path-bar, .sfdc-feed-item, .wf-table, [data-journey], .wf-form-group, section, .sfdc-record-header, .ds-kpi-grid';

function _reviewMouseOver(e) {
  var el = e.target.closest(_reviewSelector);
  if (!el) return;
  if (_reviewCurrentEl === el) return;

  clearTimeout(_reviewToolbarTimer);
  _reviewCurrentEl = el;
  wfReviewShowToolbar(el);
}

function _reviewMouseOut(e) {
  var el = e.target.closest(_reviewSelector);
  var toolbar = document.getElementById('wf-review-toolbar');

  // Small delay to prevent flicker when moving between element and toolbar
  _reviewToolbarTimer = setTimeout(function() {
    // Check if mouse is over toolbar or the element
    var hovered = document.querySelectorAll(':hover');
    for (var i = 0; i < hovered.length; i++) {
      if (hovered[i] === _reviewCurrentEl) return;
      if (hovered[i].id === 'wf-review-toolbar' || (toolbar && toolbar.contains(hovered[i]))) return;
    }
    _reviewRemoveToolbar();
    _reviewCurrentEl = null;
  }, 150);
}

function _reviewRemoveToolbar() {
  var existing = document.getElementById('wf-review-toolbar');
  if (existing) existing.parentNode.removeChild(existing);
}

/**
 * Show floating reaction toolbar near the given element
 */
function wfReviewShowToolbar(el) {
  _reviewRemoveToolbar();

  var rect = el.getBoundingClientRect();
  var toolbar = document.createElement('div');
  toolbar.className = 'wf-review-toolbar';
  toolbar.id = 'wf-review-toolbar';

  toolbar.innerHTML =
    '<button class="wf-review-confirm" onclick="wfReviewReact(_reviewCurrentEl,\'confirm\')" title="Confirm — this works">✓</button>' +
    '<button class="wf-review-question" onclick="wfReviewReact(_reviewCurrentEl,\'question\')" title="Question — needs discussion">?</button>' +
    '<button class="wf-review-reject" onclick="wfReviewReact(_reviewCurrentEl,\'reject\')" title="Reject — doesn\'t work">✗</button>';

  // Prevent toolbar mouseout from dismissing itself
  toolbar.addEventListener('mouseover', function() {
    clearTimeout(_reviewToolbarTimer);
  });
  toolbar.addEventListener('mouseout', function() {
    _reviewToolbarTimer = setTimeout(function() {
      var hovered = document.querySelectorAll(':hover');
      for (var i = 0; i < hovered.length; i++) {
        if (hovered[i] === _reviewCurrentEl) return;
        if (hovered[i].id === 'wf-review-toolbar') return;
      }
      _reviewRemoveToolbar();
      _reviewCurrentEl = null;
    }, 150);
  });

  document.body.appendChild(toolbar);

  // Position above the element, centered
  var tbRect = toolbar.getBoundingClientRect();
  var left = rect.left + (rect.width / 2) - (tbRect.width / 2);
  var top = rect.top - tbRect.height - 8;

  // If toolbar would go off-screen top, position below
  if (top < 4) {
    top = rect.bottom + 8;
  }
  // Keep within viewport horizontally
  if (left < 4) left = 4;
  if (left + tbRect.width > window.innerWidth - 4) {
    left = window.innerWidth - tbRect.width - 4;
  }

  toolbar.style.left = left + 'px';
  toolbar.style.top = top + 'px';
}

/**
 * Build a reasonable CSS selector for an element
 */
function buildSelector(el) {
  var parts = [];
  parts.push(el.tagName.toLowerCase());
  if (el.id) {
    parts.push('#' + el.id);
    return parts.join('');
  }
  if (el.className && typeof el.className === 'string') {
    var classes = el.className.split(/\s+/);
    for (var i = 0; i < classes.length; i++) {
      if (classes[i] && classes[i].indexOf('wf-review') === -1) {
        parts.push('.' + classes[i]);
      }
    }
  }
  var journey = el.getAttribute('data-journey');
  if (journey) {
    parts.push('[data-journey="' + journey + '"]');
  }
  var confidence = el.getAttribute('data-wf-confidence');
  if (confidence) {
    parts.push('[data-wf-confidence="' + confidence + '"]');
  }
  return parts.join('');
}

/**
 * Capture a review reaction on an element
 */
function wfReviewReact(el, reaction) {
  if (!el) return;

  var noteText = '';
  if (reaction === 'question' || reaction === 'reject') {
    noteText = prompt(reaction === 'question' ? 'What needs discussion?' : 'What doesn\'t work?') || '';
  }

  var annotation = {
    elementSelector: buildSelector(el),
    elementText: el.textContent.substring(0, 80).trim(),
    previousConfidence: el.getAttribute('data-wf-confidence'),
    reaction: reaction,
    note: noteText,
    reviewer: sessionStorage.getItem('wf_reviewer') || 'anonymous',
    timestamp: new Date().toISOString(),
    page: currentFile()
  };

  REVIEW_ANNOTATIONS.push(annotation);

  // Merge with existing sessionStorage annotations
  var existing = [];
  try {
    var raw = sessionStorage.getItem('wf_review_annotations');
    if (raw) existing = JSON.parse(raw);
  } catch (e) { /* ignore */ }
  existing.push(annotation);
  sessionStorage.setItem('wf_review_annotations', JSON.stringify(existing));

  // Apply visual indicator
  el.setAttribute('data-wf-review', reaction);

  // Remove toolbar
  _reviewRemoveToolbar();
  _reviewCurrentEl = null;

  // Try POST to API
  fetch('/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(annotation)
  }).catch(function() { /* silent — offline fallback is sessionStorage */ });

  var icons = { confirm: '✓', question: '?', reject: '✗' };
  wfToast('Review: ' + (icons[reaction] || reaction) + ' ' + annotation.elementText.substring(0, 40));
}

/**
 * Export review annotations as a downloadable JSON file
 */
function wfReviewExport() {
  var annotations = [];
  try {
    var raw = sessionStorage.getItem('wf_review_annotations');
    if (raw) annotations = JSON.parse(raw);
  } catch (e) { /* ignore */ }

  // Filter to current page
  var file = currentFile();
  var pageAnnotations = [];
  for (var i = 0; i < annotations.length; i++) {
    if (annotations[i].page === file) {
      pageAnnotations.push(annotations[i]);
    }
  }

  var blob = new Blob([JSON.stringify(pageAnnotations, null, 2)], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  var date = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = 'review-' + file + '-' + date + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  wfToast('Exported ' + pageAnnotations.length + ' review annotations');
}

/**
 * Toggle heat map mode for review annotations
 */
function wfReviewHeatMap() {
  document.documentElement.classList.toggle('wf-review-heatmap');
}

/**
 * Load existing annotations from sessionStorage on page load
 */
function wfReviewLoadAnnotations() {
  var file = currentFile();

  // Load from sessionStorage
  var annotations = [];
  try {
    var raw = sessionStorage.getItem('wf_review_annotations');
    if (raw) annotations = JSON.parse(raw);
  } catch (e) { /* ignore */ }

  // Re-apply data-wf-review attributes for current page
  for (var i = 0; i < annotations.length; i++) {
    var ann = annotations[i];
    if (ann.page !== file) continue;

    // Push to in-memory array
    REVIEW_ANNOTATIONS.push(ann);

    // Try to find the element
    try {
      var els = document.querySelectorAll(ann.elementSelector);
      for (var j = 0; j < els.length; j++) {
        els[j].setAttribute('data-wf-review', ann.reaction);
      }
    } catch (e) { /* selector might be invalid */ }
  }

  // Also try to fetch from API and merge
  fetch('/api/reviews?page=' + encodeURIComponent(file))
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (!Array.isArray(data)) return;
      for (var i = 0; i < data.length; i++) {
        var ann = data[i];
        // Check if already in local annotations
        var isDupe = false;
        for (var j = 0; j < REVIEW_ANNOTATIONS.length; j++) {
          if (REVIEW_ANNOTATIONS[j].timestamp === ann.timestamp &&
              REVIEW_ANNOTATIONS[j].elementSelector === ann.elementSelector) {
            isDupe = true;
            break;
          }
        }
        if (!isDupe) {
          REVIEW_ANNOTATIONS.push(ann);
          try {
            var els = document.querySelectorAll(ann.elementSelector);
            for (var k = 0; k < els.length; k++) {
              els[k].setAttribute('data-wf-review', ann.reaction);
            }
          } catch (e) { /* ignore */ }
        }
      }
    })
    .catch(function() { /* silent — no API available */ });
}

/**
 * Populate the Reviews tab in the design notes panel
 */
function wfReviewPopulateTab(container) {
  var file = currentFile();
  var annotations = [];
  try {
    var raw = sessionStorage.getItem('wf_review_annotations');
    if (raw) annotations = JSON.parse(raw);
  } catch (e) { /* ignore */ }

  // Filter to current page
  var pageAnnotations = [];
  for (var i = 0; i < annotations.length; i++) {
    if (annotations[i].page === file) {
      pageAnnotations.push(annotations[i]);
    }
  }

  // Count by reaction
  var counts = { confirm: 0, question: 0, reject: 0 };
  for (var i = 0; i < pageAnnotations.length; i++) {
    var r = pageAnnotations[i].reaction;
    if (counts[r] !== undefined) counts[r]++;
  }

  var html = '';

  // Reviewer name input
  var savedReviewer = sessionStorage.getItem('wf_reviewer') || '';
  html +=
    '<div class="wf-review-reviewer">' +
      '<label for="wf-review-reviewer-input">Reviewer Name</label>' +
      '<input type="text" id="wf-review-reviewer-input" value="' + savedReviewer + '" ' +
        'placeholder="Your name" onchange="sessionStorage.setItem(\'wf_reviewer\',this.value)">' +
    '</div>';

  // Summary counts
  html +=
    '<div class="wf-review-summary">' +
      '<div class="wf-review-stat">' +
        '<div class="wf-review-stat-count" style="color:var(--wf-green)">' + counts.confirm + '</div>' +
        '<div class="wf-review-stat-label">Confirmed</div>' +
      '</div>' +
      '<div class="wf-review-stat">' +
        '<div class="wf-review-stat-count" style="color:var(--wf-amber)">' + counts.question + '</div>' +
        '<div class="wf-review-stat-label">Questioned</div>' +
      '</div>' +
      '<div class="wf-review-stat">' +
        '<div class="wf-review-stat-count" style="color:var(--wf-red)">' + counts.reject + '</div>' +
        '<div class="wf-review-stat-label">Rejected</div>' +
      '</div>' +
    '</div>';

  // Heat map toggle
  var heatmapChecked = document.documentElement.classList.contains('wf-review-heatmap') ? ' checked' : '';
  html +=
    '<label style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--wf-text);margin-bottom:12px;cursor:pointer;">' +
      '<input type="checkbox" onchange="wfReviewHeatMap()"' + heatmapChecked + '>' +
      'Heat Map mode' +
    '</label>';

  // Annotation list
  if (pageAnnotations.length === 0) {
    html += '<p class="wf-dn-placeholder">No review annotations yet. Enable Review mode from the context bar to start annotating elements.</p>';
  } else {
    var icons = { confirm: '✓', question: '?', reject: '✗' };
    for (var i = 0; i < pageAnnotations.length; i++) {
      var ann = pageAnnotations[i];
      var icon = icons[ann.reaction] || ann.reaction;
      var time = '';
      try {
        var d = new Date(ann.timestamp);
        time = d.toLocaleString();
      } catch (e) {
        time = ann.timestamp;
      }

      html +=
        '<div class="wf-review-item">' +
          '<div class="wf-review-item-header">' +
            '<span class="wf-review-item-reaction">' + icon + '</span>' +
            '<span class="wf-review-item-text">' + (ann.elementText || '').substring(0, 60) + '</span>' +
          '</div>' +
          (ann.note ? '<div class="wf-review-item-note">' + ann.note + '</div>' : '') +
          '<div class="wf-review-item-meta">' + ann.reviewer + ' · ' + time + '</div>' +
        '</div>';
    }
  }

  // Action buttons
  html +=
    '<div class="wf-review-actions">' +
      '<button class="btn" onclick="wfReviewExport()">Export JSON</button>' +
      '<button class="btn" onclick="wfReviewClearPage()">Clear Page Reviews</button>' +
    '</div>';

  container.innerHTML = html;
}

/**
 * Clear review annotations for the current page
 */
function wfReviewClearPage() {
  var file = currentFile();

  // Remove from sessionStorage
  var annotations = [];
  try {
    var raw = sessionStorage.getItem('wf_review_annotations');
    if (raw) annotations = JSON.parse(raw);
  } catch (e) { /* ignore */ }

  var remaining = [];
  for (var i = 0; i < annotations.length; i++) {
    if (annotations[i].page !== file) {
      remaining.push(annotations[i]);
    }
  }
  sessionStorage.setItem('wf_review_annotations', JSON.stringify(remaining));

  // Clear in-memory
  REVIEW_ANNOTATIONS = [];

  // Remove data-wf-review attributes from DOM
  var reviewed = document.querySelectorAll('[data-wf-review]');
  for (var i = 0; i < reviewed.length; i++) {
    reviewed[i].removeAttribute('data-wf-review');
  }

  // Refresh the tab content
  var reviewsTab = document.getElementById('wf-dn-tab-reviews');
  if (reviewsTab) wfReviewPopulateTab(reviewsTab);

  wfToast('Cleared review annotations for this page');
}

/* Signal to the proto-nav.js stubs that the real implementations are in
   place — checked to guard against stub → load → stub recursion. */
window._wfExtrasLoaded = true;
