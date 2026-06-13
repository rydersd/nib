// Setup wizard — drives panel transitions and POSTs to /api/setup.

const params = new URLSearchParams(location.search);
const projName = params.get('name') || 'your-project';
document.getElementById('proj-name').textContent = projName;

const panels = ['choose', 'workbook', 'template', 'progress', 'done'];
function show(id) {
  for (const p of panels) {
    document.getElementById('panel-' + p).hidden = (p !== id);
  }
}
function logLine(msg) {
  const log = document.getElementById('log');
  log.textContent += msg + '\n';
  log.scrollTop = log.scrollHeight;
}

// ── Panel: choose ────────────────────────────────────────────────────────
document.querySelectorAll('[data-go]').forEach((b) => {
  b.addEventListener('click', () => {
    const next = b.dataset.go;
    if (next === 'blank') return runSetup({ mode: 'blank' });
    if (next === 'template') loadTemplates();
    show(next);
  });
});
document.querySelectorAll('[data-back]').forEach((b) => {
  b.addEventListener('click', () => show('choose'));
});

// Personalize the welcome heading.
fetch('/api/templates').then((r) => r.json()).then((d) => {
  if (d && d.suggestedTitle) {
    const h = document.getElementById('welcome');
    h.textContent = `Set up “${d.suggestedTitle}”`;
  }
});

// ── Panel: workbook ──────────────────────────────────────────────────────
const drop = document.getElementById('drop');
const fileInput = document.getElementById('file');
const dropText = document.getElementById('drop-text');
const sheetUrl = document.getElementById('sheet-url');
const ingestBtn = document.getElementById('ingest-btn');
let _file = null;

drop.addEventListener('click', () => fileInput.click());
drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('drag'); });
drop.addEventListener('dragleave', () => drop.classList.remove('drag'));
drop.addEventListener('drop', (e) => {
  e.preventDefault();
  drop.classList.remove('drag');
  if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
});
fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) handleFile(fileInput.files[0]);
});
function handleFile(f) {
  _file = f;
  drop.classList.add('has-file');
  dropText.textContent = '✓ ' + f.name + ' (' + Math.round(f.size / 1024) + ' KB)';
  refreshIngestBtn();
}
sheetUrl.addEventListener('input', refreshIngestBtn);
function refreshIngestBtn() {
  ingestBtn.disabled = !(_file || sheetUrl.value.trim());
}

ingestBtn.addEventListener('click', async () => {
  if (sheetUrl.value.trim()) {
    return runSetup({ mode: 'workbook', sheetsUrl: sheetUrl.value.trim() });
  }
  if (!_file) return;
  const base64 = await fileToBase64(_file);
  return runSetup({ mode: 'workbook', filename: _file.name, base64 });
});

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const s = reader.result;
      // Strip the "data:...;base64," prefix.
      const idx = s.indexOf(',');
      resolve(idx >= 0 ? s.slice(idx + 1) : s);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// ── Panel: template ──────────────────────────────────────────────────────
const tmplList = document.getElementById('tmpl-list');
const tmplBtn = document.getElementById('tmpl-btn');
let _selectedTmpl = null;

function loadTemplates() {
  if (tmplList.dataset.loaded) return;
  fetch('/api/templates').then((r) => r.json()).then((d) => {
    tmplList.innerHTML = '';
    (d.templates || []).forEach((t) => {
      const label = document.createElement('label');
      label.className = 'tmpl-item';
      label.innerHTML =
        '<input type="radio" name="tmpl" value="' + t.id + '">' +
        '<span class="tmpl-name">' + t.id + '</span>' +
        (t.summary ? '<div class="tmpl-summary">' + escapeHtml(t.summary) + '</div>' : '');
      label.querySelector('input').addEventListener('change', (e) => {
        document.querySelectorAll('.tmpl-item.selected').forEach((el) => el.classList.remove('selected'));
        label.classList.add('selected');
        _selectedTmpl = e.target.value;
        tmplBtn.disabled = false;
      });
      tmplList.appendChild(label);
    });
    tmplList.dataset.loaded = '1';
  });
}
function escapeHtml(s) {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

tmplBtn.addEventListener('click', () => {
  if (!_selectedTmpl) return;
  runSetup({ mode: 'template', template: _selectedTmpl });
});

// ── Run setup ────────────────────────────────────────────────────────────
async function runSetup(payload) {
  show('progress');
  document.getElementById('progress-h').textContent =
    payload.mode === 'workbook' ? 'Ingesting workbook…' :
    payload.mode === 'template' ? `Copying template ${payload.template}…` :
    'Writing blank scaffold…';
  logLine('POST /api/setup');
  logLine('mode: ' + payload.mode);
  try {
    const res = await fetch('/api/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || ('HTTP ' + res.status));
    logLine('✓ done');
    show('done');
    if (data.redirect) {
      document.getElementById('open-btn').href = data.redirect;
    }
  } catch (err) {
    logLine('✗ ' + err.message);
    const div = document.createElement('div');
    div.className = 'err';
    div.textContent = 'Setup failed: ' + err.message;
    document.getElementById('panel-progress').appendChild(div);
  }
}
