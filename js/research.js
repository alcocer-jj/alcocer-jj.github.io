// ----------------------------
// HEADER ANIMATION
// ----------------------------
function typing_animation() {
  const textElement = document.querySelector(".text");
  const cursor = document.querySelector(".text_cursor");

  const text = textElement.textContent.trim();
  const textLength = text.length;

  const duration = 2000;
  const stepWidth = 100 / textLength;

  const timings = {
    easing: `steps(${textLength}, end)`,
    delay: 0,
    duration: duration,
    fill: 'forwards'
  };

  // Reveal the word one letter at a time by clipping it, so no solid block covers the photo
  textElement.animate([
    { clipPath: 'inset(-0.2em 100% -0.2em 0)' },
    { clipPath: 'inset(-0.2em 0 -0.2em 0)' }
  ], timings);

  // Animate cursor moving with the text
  const cursorMove = cursor.animate([
    { left: '0%' },
    { left: `${stepWidth * textLength}%` }
  ], timings);

  // After move, fix position and blink forever
  cursorMove.onfinish = () => {
    cursor.style.left = `${stepWidth * textLength}%`;
    cursor.animate([
      { opacity: 0 },
      { opacity: 0, offset: 0.7 },
      { opacity: 1 }
    ], {
      duration: 700,
      iterations: Infinity,
      easing: 'cubic-bezier(0,.26,.44,.93)'
    });
  };
}

window.onload = () => {
  setTimeout(() => {
    typing_animation();
  }, 1000); // Delay in milliseconds
};

// ----------------------------
// PUBLICATION LISTS
// ----------------------------
// Builds the three tabs from window.PUBLICATIONS, which /js/publications.js defines.
// It runs as the page is read, before main.js fades the page in, so the lists are
// already in place when the page appears.

const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS_WORDS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

// Buttons in the order they appear. A file button looks inside the paper's pdfs folder.
const PILLS = [
  { key: 'link', label: 'Link' },
  { key: 'pdf', label: 'PDF', file: 'main.pdf' },
  { key: 'supplement', label: 'Supplemental Material', file: 'supplementary.pdf' },
  { key: 'replication', label: 'Replication Material' },
  { key: 'bibtex', label: 'BibTeX', file: 'bibtex.bib', download: true },
];

const ABSTRACT_ICON =
  '<svg viewBox="0 0 24 24" stroke-width="1.5" aria-hidden="true">' +
  '<path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"/>' +
  '<path d="M8 12H16"/><path d="M12 16V8"/></svg>';

// Spells out a paper's number for its folder name, so 5 becomes five and 21 becomes twenty-one
function numberWord(n) {
  if (n < 20) return NUMBER_WORDS[n];
  const tens = TENS_WORDS[Math.floor(n / 10)];
  return n % 10 ? `${tens}-${NUMBER_WORDS[n % 10]}` : tens;
}

function escapeHTML(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Adds a closing period unless the text already ends in punctuation
function withPeriod(text) {
  const clean = String(text || '').trim();
  return clean === '' || /[.?!]$/.test(clean) ? clean : `${clean}.`;
}

// Turns a list of names into "With A.", "With A and B.", or "With A, B, and C."
// Each name is kept whole, so a wrapped line never splits one in two.
function withLine(names) {
  const list = Array.isArray(names) ? names.map(n => String(n).replace(/\s+/g, ' ').trim()).filter(Boolean) : [];
  if (list.length === 0) return '';
  const tagged = list.map(n => `<span class="pub-name">${escapeHTML(n)}</span>`);
  let joined = tagged[0];
  if (tagged.length === 2) joined = `${tagged[0]} and ${tagged[1]}`;
  if (tagged.length > 2) joined = `${tagged.slice(0, -1).join(', ')}, and ${tagged[tagged.length - 1]}`;
  return `With ${joined}${/[.?!]$/.test(list[list.length - 1]) ? '' : '.'}`;
}

// Gives the downloaded BibTeX file a readable name, like alcocer-2026-police-as-policymakers.bib
function bibFileName(entry) {
  const words = String(entry.title || 'citation')
    .replace(/^(the|a|an)\s+/i, '')
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .slice(0, 3)
    .join('-')
    .toLowerCase();
  return `alcocer-${entry.year || 'paper'}-${words}.bib`;
}

function pillsHTML(entry, folder) {
  const pills = PILLS.map(pill => {
    const value = entry[pill.key];
    let href = '';
    if (typeof value === 'string') href = value.trim();
    else if (value === true && pill.file && folder) href = `/pdfs/${folder}/${pill.file}`;
    if (!href) return '';
    if (pill.download) {
      return `<a class="pub-pill" href="${escapeHTML(href)}" download="${escapeHTML(bibFileName(entry))}">${pill.label}</a>`;
    }
    return `<a class="pub-pill" href="${escapeHTML(href)}" target="_blank" rel="noopener">${pill.label}</a>`;
  }).join('');
  return pills ? `<div class="pub-pills">${pills}</div>` : '';
}

function entryHTML(entry, kind, folder) {
  const parts = [`<p class="pub-title">${escapeHTML(withPeriod(entry.title))}</p>`];

  const authors = withLine(entry.coauthors);
  if (authors) parts.push(`<p class="pub-authors">${authors}</p>`);

  if (kind === 'working') {
    // Status line, like Under Review or Revised and Resubmitted at a journal
    const status = String(entry.status || '').trim();
    const venue = String(entry.venue || '').trim();
    if (status || venue) {
      const text = [escapeHTML(status), venue ? `<cite>${escapeHTML(venue)}</cite>` : ''].filter(Boolean).join(' ');
      parts.push(`<p class="pub-meta pub-status">${text}.</p>`);
    }
  } else if (entry.venue || entry.year) {
    // Venue line, with the outlet in italics followed by the year
    const venue = entry.venue ? `<cite class="pub-outlet">${escapeHTML(entry.venue)}</cite>` : '';
    const year = entry.year ? escapeHTML(entry.year) : '';
    // The non-breaking space keeps the year on the same line as the end of the outlet name
    parts.push(`<p class="pub-meta">${[venue, year].filter(Boolean).join(',&nbsp;')}.</p>`);
  }

  parts.push(pillsHTML(entry, folder));

  if (kind === 'peer' && String(entry.abstract || '').trim()) {
    const id = `abstract-${folder}`;
    parts.push(
      `<button type="button" class="abstract-toggle" aria-expanded="false" aria-controls="${id}">` +
      `${ABSTRACT_ICON}<span>Abstract</span></button>` +
      `<div class="abstract-panel" id="${id}"><p>${entry.abstract}</p></div>`
    );
  }
  return parts.join('');
}

// Flags entries that are missing something the layout expects, without stopping the page
function checkEntry(entry, kind, position) {
  const e = entry || {};
  const missing = [];
  if (!String(e.title || '').trim()) missing.push('title');
  if (kind !== 'working' && !e.venue) missing.push('venue');
  if (kind !== 'working' && !e.year) missing.push('year');
  if (missing.length) {
    console.warn(`publications.js, ${kind} entry ${position} is missing ${missing.join(', ')}`);
  }
}

function renderList(containerId, entries, kind) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const list = Array.isArray(entries) ? entries : [];
  const total = list.length;
  const items = list.map((entry, i) => {
    checkEntry(entry, kind, i + 1);
    const folder = kind === 'peer' ? `pr-${numberWord(total - i)}` : null;
    return `<li class="pub-entry">${entryHTML(entry || {}, kind, folder)}</li>`;
  }).join('');
  container.innerHTML = kind === 'working'
    ? `<ul class="pub-list pub-list-plain">${items}</ul>`
    : `<ol class="pub-list" reversed>${items}</ol>`;
}

function renderPublications() {
  const lists = [
    ['peer-reviewed-list', 'peerReviewed', 'peer'],
    ['other-writings-list', 'otherWritings', 'other'],
    ['working-papers-list', 'workingPapers', 'working'],
  ];
  const data = window.PUBLICATIONS;
  if (!data) {
    console.error('publications.js did not load, or it has a syntax error such as a missing comma or quote.');
    lists.forEach(([containerId]) => {
      const container = document.getElementById(containerId);
      if (container) container.innerHTML = '<p class="pub-notice">The publication list is temporarily unavailable.</p>';
    });
    return;
  }
  lists.forEach(([containerId, key, kind]) => renderList(containerId, data[key], kind));
}

renderPublications();

// ----------------------------
// ABSTRACT TOGGLE
// ----------------------------
document.addEventListener('click', event => {
  const toggle = event.target.closest('.abstract-toggle');
  if (!toggle) return;
  const panel = document.getElementById(toggle.getAttribute('aria-controls'));
  if (!panel) return;
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  panel.classList.toggle('open', open);
});


// ----------------------------
// TAB SWITCHING
// ----------------------------
const panelMap = { 'tab-peer': 'panel-peer', 'tab-other': 'panel-other', 'tab-wp': 'panel-wp' };

document.querySelectorAll('input[name="pub-tabs"]').forEach(radio => {
  radio.addEventListener('change', function () {
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(panelMap[this.id]).classList.add('active');
  });
});