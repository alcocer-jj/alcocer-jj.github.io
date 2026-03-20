// =============================================================
// redistricting_map.js  —  Alcocer, Grose & McKee (2026)
// Requires: Leaflet 1.9 loaded before this script.
// GeoJSON files served from ./data/ (same level as HTML).
// =============================================================

(function () {
  'use strict';

  const DATA_PATH = './data';
  const T = { OLD: 'old', MID: 'mid', NEW: 'new' };

  // ─── STATE CONFIG ────────────────────────────────────────────────
  // NC: plans are nc22 (OLD), nc23 (MID), nc25 (NEW)
  const STATES = {
    CA: { name: 'California',     plans: [{ year: '21', type: T.OLD }, { year: '25', type: T.NEW }] },
    MO: { name: 'Missouri',       plans: [{ year: '21', type: T.OLD }, { year: '25', type: T.NEW }] },
    NC: { name: 'North Carolina', plans: [{ year: '22', type: T.OLD }, { year: '23', type: T.MID }, { year: '25', type: T.NEW }] },
    OH: { name: 'Ohio',           plans: [{ year: '22', type: T.OLD }, { year: '25', type: T.NEW }] },
    TX: { name: 'Texas',          plans: [{ year: '21', type: T.OLD }, { year: '25', type: T.NEW }] },
    UT: { name: 'Utah',           plans: [{ year: '21', type: T.OLD }, { year: '25', type: T.NEW }] },
    VA: { name: 'Virginia',       plans: [{ year: '21', type: T.OLD }, { year: '25', type: T.NEW }] }
  };

  const YEAR_LABEL = { '21': '2021 Map', '22': '2022 Map', '23': '2023 Map', '25': '2025 Map' };

  // ─── DICTIONARY CONTENT ──────────────────────────────────────────
  const DICT = {
    plan: [
      {
        label: 'By Enacted Party',
        desc: 'Indicates the political party or institution responsible for drawing and enacting each state\'s current congressional district map. Maps enacted by Democrats are shown in blue, Republican-enacted maps in red, and court-ordered maps in yellow. During this mid-decade redistricting cycle, most maps were drawn by Republican-controlled legislatures following legal challenges to earlier plans.'
      },
      {
        label: 'By Seat Composition',
        desc: 'Reflects the expected partisan composition of each state\'s congressional delegation based on projected seat-level outcomes. States where Democrats are projected to hold a majority of seats appear in blue; Republican-majority states in red. This metric captures the aggregate partisan lean of the enacted map at the state level.'
      },
      {
        label: 'By Partisan Extremity',
        desc: 'Shows where each state\'s enacted map falls in the distribution of 750,000 algorithmically simulated plans with respect to expected Democratic seat share. The percentile rank is derived from the ensemble of neutral plans generated under the same legal and demographic constraints. States at or above the 95th percentile (darkest blue) produce more Democratic-favorable outcomes than nearly all neutral maps — indicating a Democratic gerrymander. States at or below the 5th percentile (darkest red) indicate an extreme Republican advantage. States between the 20th and 80th percentile fall within the range that an impartial process would plausibly produce.'
      }
    ],
    [T.OLD]: [
      {
        label: 'Partisan Vote Share',
        desc: 'The difference between the average Democratic and Republican two-party vote share in each district (Dem% − Rep%). Positive values indicate a Democratic lean (blue, deepening with margin); negative values indicate a Republican lean (red). Districts within ±3 percentage points are treated as competitive swing districts (purple). Vote share is averaged across available election cycles to smooth out single-election volatility.'
      },
      {
        label: 'Win Probability',
        desc: 'The estimated probability that a Democratic candidate wins the district, derived from historical voting patterns and the district\'s partisan composition under the enacted map. Probabilities between 47% and 53% are classified as toss-ups (purple). This metric reflects the likely electoral outcome under normal conditions, not a single-election forecast.'
      }
    ],
    [T.MID]: [
      {
        label: 'Partisan Vote Share',
        desc: 'The difference between the average Democratic and Republican two-party vote share in each district (Dem% − Rep%). Positive values indicate a Democratic lean (blue, deepening with margin); negative values indicate a Republican lean (red). Districts within ±3 percentage points are treated as competitive swing districts (purple). Vote share is averaged across available election cycles to smooth out single-election volatility.'
      },
      {
        label: 'Win Probability',
        desc: 'The estimated probability that a Democratic candidate wins the district, derived from historical voting patterns and the district\'s partisan composition under the enacted map. Probabilities between 47% and 53% are classified as toss-ups (purple). This metric reflects the likely electoral outcome under normal conditions, not a single-election forecast.'
      }
    ],
    [T.NEW]: [
      {
        label: 'Partisan Vote Share',
        desc: 'The difference between the average Democratic and Republican two-party vote share in each district (Dem% − Rep%). Positive values indicate a Democratic lean (blue); negative values indicate a Republican lean (red). Districts within ±3 percentage points are classified as competitive swing districts (purple). Vote share is averaged across available election cycles to reduce single-election noise.'
      },
      {
        label: 'Win Probability',
        desc: 'The estimated probability that a Democratic candidate wins the district, derived from historical voting patterns and the district\'s partisan composition. Probabilities between 47% and 53% are classified as toss-ups (purple). This metric reflects expected electoral outcomes under normal partisan conditions rather than a cycle-specific forecast.'
      },
      {
        label: 'Ensemble Partisan Lean',
        desc: 'Shows where each district\'s enacted Democratic vote share falls relative to the distribution of 750,000 algorithmically simulated plans for the state. The percentile rank answers the question: among all neutral maps that could have been drawn, how many produced a less Democratic district than this one? Districts at or above the 95th percentile received a higher Democratic vote share than nearly all neutral alternatives — suggesting potential packing of Democratic voters. Districts below the 20th percentile may reflect Democratic voter cracking. The range between the 20th and 80th percentile is considered neutral.'
      },
      {
        label: 'Compactness',
        desc: 'The percentile rank of each district\'s Polsby-Compactness score — a geometric measure defined as 4π × (area / perimeter²) — relative to the ensemble distribution of simulated plans. A score of 1.0 indicates a perfect circle; lower scores indicate more irregular or elongated shapes. Districts in the upper percentiles (lighter brown) are more compact than most simulated alternatives. Highly non-compact districts (darker brown) may reflect boundary manipulation along partisan or racial lines, though irregular geography can also produce low compactness scores.'
      }
    ]
  };

  // ─── COLOR FUNCTIONS ─────────────────────────────────────────────

  function lerpColor(c1, c2, t) {
    const h = s => parseInt(s, 16);
    const [r1, g1, b1] = [h(c1.slice(1,3)), h(c1.slice(3,5)), h(c1.slice(5,7))];
    const [r2, g2, b2] = [h(c2.slice(1,3)), h(c2.slice(3,5)), h(c2.slice(5,7))];
    return `rgb(${Math.round(r1+(r2-r1)*t)},${Math.round(g1+(g2-g1)*t)},${Math.round(b1+(b2-b1)*t)})`;
  }

  function enactedColor(val) {
    if (!val) return '#d7d7d7';
    const v = val.toLowerCase();
    if (v.includes('democrat'))   return '#2166AC';
    if (v.includes('republican')) return '#CB181D';
    if (v.includes('court'))      return '#E6AB02';
    return '#888';
  }

  function compositionColor(val) {
    if (!val) return '#d7d7d7';
    const v = val.toLowerCase();
    if (v.includes('democrat'))   return '#2166AC';
    if (v.includes('republican')) return '#CB181D';
    return '#888';
  }

  function extremityColor(pct) {
    if (pct == null) return '#d7d7d7';
    const p = Number(pct);
    if (p >= 95) return '#08306b';
    if (p >= 90) return '#2171b5';
    if (p >= 81) return '#6baed6';
    if (p >= 20) return '#d7d7d7';
    if (p >= 11) return '#fc8d59';
    if (p >= 6)  return '#d7301f';
    return '#7f0000';
  }

  function partisanDiffColor(diff) {
    if (diff == null) return '#d7d7d7';
    const d = Number(diff);
    if (d >= 3)  return lerpColor('#AEC5E6', '#08306b', Math.min(1, (d - 3) / 57));
    if (d <= -3) return lerpColor('#FCAE91', '#7f0000', Math.min(1, (-d - 3) / 57));
    return '#7B2D8B';
  }

  function winProbColor(prob) {
    if (prob == null) return '#d7d7d7';
    const p = Number(prob);
    if (p > 53) return lerpColor('#6BAED6', '#08306b', (p - 53) / 47);
    if (p < 47) return lerpColor('#FC8D59', '#7f0000', (47 - p) / 47);
    return '#7B2D8B';
  }

  const BROWN = ['#1C0A09', '#5C2B1F', '#9B5E3B', '#C68B5A', '#DEB89A'];
  function compactnessColor(pct) {
    if (pct == null) return '#d7d7d7';
    const t = Math.max(0, Math.min(100, Number(pct))) / 100;
    const raw = t * (BROWN.length - 1);
    const lo = Math.floor(raw), hi = Math.ceil(raw);
    return lo === hi ? BROWN[lo] : lerpColor(BROWN[lo], BROWN[hi], raw - lo);
  }

  // ─── PILL / METRIC DEFINITIONS ───────────────────────────────────

  const PLAN_PILLS = [
    { id: 'enacted',     label: 'By Enacted Party',      colorFn: p => enactedColor(p['Plan Enacted By']),          legend: 'enacted'     },
    { id: 'composition', label: 'By Seat Composition',   colorFn: p => compositionColor(p['Exp. Seat Composition']), legend: 'composition' },
    { id: 'extremity',   label: 'By Partisan Extremity', colorFn: p => extremityColor(p['Dem. Seat % Extremity']),   legend: 'extremity'   },
    { id: 'dictionary',  label: 'Dictionary',            colorFn: null, legend: null }
  ];

  const STATE_PILLS = {
    [T.OLD]: [
      { id: 'partisan',   label: 'Partisan Vote Share', colorFn: d => partisanDiffColor(d['Partisan Vote Share']), legend: 'partisan' },
      { id: 'winprob',    label: 'Win Probability',     colorFn: d => winProbColor(d['Prob. of Dem. Win']),        legend: 'winprob'  },
      { id: 'dictionary', label: 'Dictionary',          colorFn: null, legend: null }
    ],
    [T.MID]: [
      { id: 'partisan',   label: 'Partisan Vote Share', colorFn: d => partisanDiffColor(d['Partisan Vote Share']), legend: 'partisan' },
      { id: 'winprob',    label: 'Win Probability',     colorFn: d => winProbColor(d['Prob. of Dem. Win']),        legend: 'winprob'  },
      { id: 'dictionary', label: 'Dictionary',          colorFn: null, legend: null }
    ],
    [T.NEW]: [
      { id: 'partisan',    label: 'Partisan Vote Share',    colorFn: d => partisanDiffColor(d['Partisan Vote Share']),      legend: 'partisan'    },
      { id: 'winprob',     label: 'Win Probability',        colorFn: d => winProbColor(d['Prob. of Dem. Win']),             legend: 'winprob'     },
      { id: 'ensemble',    label: 'Ensemble Partisan Lean', colorFn: d => extremityColor(d['Dem. Vote Share % Extremity']), legend: 'extremity'   },
      { id: 'compactness', label: 'Compactness',            colorFn: d => compactnessColor(d['Compactness % Extremity']),   legend: 'compactness' },
      { id: 'dictionary',  label: 'Dictionary',             colorFn: null, legend: null }
    ]
  };

  // ─── RUNTIME STATE ───────────────────────────────────────────────
  let _map        = null;
  let _tileLayer  = null;
  let _stateLayer = null;
  let _distLayer  = null;
  let _labelLayer = null;
  let _curView    = 'plan';
  let _curPlan    = null;
  let _curMapType = null;
  let _curMetric  = 'enacted';
  const _cache    = {};

  // ─── FORMATTERS ──────────────────────────────────────────────────
  const fmtN   = (n, d = 1) => n == null ? '—' : Number(n).toFixed(d);
  const fmtPct = n => n == null ? '—' : `${Number(n).toFixed(1)}%`;
  const fmtInt = n => n == null ? '—' : Number(n).toLocaleString();
  const fmtRnk = p => p == null ? '—' : `${Number(p).toFixed(1)}th pct.`;

  // ─── TABLE HTML ──────────────────────────────────────────────────

  function buildTable(title, rows) {
    const trs = rows.map(([k, v], i) => `
      <tr class="${i % 2 === 0 ? 'rmt-even' : 'rmt-odd'}">
        <td class="rmt-num">${i + 1}</td>
        <td class="rmt-key">${k}</td>
        <td class="rmt-val">${v}</td>
      </tr>`).join('');
    return `<div class="rmt-wrap"><table class="rmt">
      <thead><tr><th class="rmt-head" colspan="3">${title}</th></tr></thead>
      <tbody>${trs}</tbody>
    </table></div>`;
  }

  function stateTableHTML(p) {
    const rows = [];
    const push = (k, v) => { if (v != null && v !== '' && v !== '—') rows.push([k, v]); };
    push('No. of Districts',        p['No. of Districts']);
    push('Total Population',        fmtInt(p['Total Pop.']));
    push('Modified Voting Pop.',    fmtInt(p['Total Modified Voting Pop.']));
    push('Plan Enacted By',         p['Plan Enacted By']);
    push('Mean Avg. Dem. Vote',     fmtPct(p['Mean Avg. Dem. Vote Share']));
    push('Dem. Vote % Extremity',   fmtRnk(p['Dem. Vote Share % Extremity']));
    push('Mean Avg. Rep. Vote',     fmtPct(p['Mean Avg. Rep. Vote Share']));
    push('Rep. Vote % Extremity',   fmtRnk(p['Rep. Vote Share % Extremity']));
    push('Exp. Seat Composition',   p['Exp. Seat Composition']);
    push('Exp. Dem. Seats',         p['Exp. Dem. Seats']);
    push('Dem. Seat % Extremity',   fmtRnk(p['Dem. Seat % Extremity']));
    push('Exp. Rep. Seats',         p['Exp. Rep. Seats']);
    push('Rep. Seat % Extremity',   fmtRnk(p['Rep. Seat % Extremity']));
    push('Avg. Compactness',        fmtN(p['Avg. Polsby-Compactness'], 3));
    push('Compactness % Extremity', fmtRnk(p['Compactness % Extremity']));
    return buildTable(p['State'] || p['Abbr'] || '—', rows);
  }

  function districtTableHTML(p, mapType) {
    const rows = [];
    const push = (k, v) => { if (v != null && v !== '' && v !== '—') rows.push([k, v]); };
    push('Partisan Vote Share',      fmtPct(p['Partisan Vote Share']));
    push('Avg. Dem. Vote Share',     fmtPct(p['Avg. Dem. Vote Share']));
    push('Avg. Rep. Vote Share',     fmtPct(p['Avg. Rep. Vote Share']));
    push('Prob. of Dem. Win',        fmtPct(p['Prob. of Dem. Win']));
    push('Prob. of Rep. Win',        fmtPct(p['Prob. of Rep. Win']));
    push('Modified Voting Pop.',     fmtInt(p['Modified Voting Pop.']));
    if (mapType === T.MID || mapType === T.NEW) {
      push('Total Population',       fmtInt(p['Pop.']));
      push('Rep. Vote Share % Chg.', p['Rep. Vote Share % Change']);
    }
    if (mapType === T.NEW) {
      push('Dem. Vote Share % Ext.', fmtRnk(p['Dem. Vote Share % Extremity']));
      push('Rep. Vote Share % Ext.', fmtRnk(p['Rep. Vote Share % Extremity']));
      push('Polsby-Compactness',     fmtN(p['Polsby-Compactness'], 3));
      push('Compactness % Ext.',     fmtRnk(p['Compactness % Extremity']));
    }
    return buildTable(`District ${p['District No.']}`, rows);
  }

  // ─── LEGEND HTML ─────────────────────────────────────────────────

  function legendHTML(type) {
    switch (type) {
      case 'enacted':
        return `<div class="rmap-legend">
          <span class="rml-item"><span class="rml-dot" style="background:#2166AC"></span>Democrats</span>
          <span class="rml-item"><span class="rml-dot" style="background:#CB181D"></span>Republicans</span>
          <span class="rml-item"><span class="rml-dot" style="background:#E6AB02"></span>Courts</span>
        </div>`;
      case 'composition':
        return `<div class="rmap-legend">
          <span class="rml-item"><span class="rml-dot" style="background:#2166AC"></span>Dem. Majority</span>
          <span class="rml-item"><span class="rml-dot" style="background:#CB181D"></span>Rep. Majority</span>
          <span class="rml-item"><span class="rml-dot" style="background:#888"></span>Split / Even</span>
        </div>`;
      case 'extremity':
        return `<div class="rmap-legend rmap-legend-scale">
          <span class="rml-label">R. Extreme ←</span>
          <div class="rml-steps">
            <span class="rml-step" style="background:#7f0000"  title="≤5th pct."></span>
            <span class="rml-step" style="background:#d7301f"  title="6–10th pct."></span>
            <span class="rml-step" style="background:#fc8d59"  title="11–19th pct."></span>
            <span class="rml-step" style="background:#d7d7d7"  title="20–80th pct. (Neutral)"></span>
            <span class="rml-step" style="background:#6baed6"  title="81–89th pct."></span>
            <span class="rml-step" style="background:#2171b5"  title="90–94th pct."></span>
            <span class="rml-step" style="background:#08306b"  title="≥95th pct."></span>
          </div>
          <span class="rml-label">→ D. Extreme</span>
          <span class="rml-sub">vs. 750,000 simulated plans</span>
        </div>`;
      case 'partisan':
        return `<div class="rmap-legend rmap-legend-scale">
          <span class="rml-label">R+ ←</span>
          <div class="rml-gradient" style="background:linear-gradient(to right,#7f0000,#fc8d59,#7B2D8B,#6baed6,#08306b)"></div>
          <span class="rml-label">→ D+</span>
          <span class="rml-sub">Purple = swing (within ±3 pts)</span>
        </div>`;
      case 'winprob':
        return `<div class="rmap-legend rmap-legend-scale">
          <span class="rml-label">Safe R ←</span>
          <div class="rml-gradient" style="background:linear-gradient(to right,#7f0000,#fc8d59,#7B2D8B,#6baed6,#08306b)"></div>
          <span class="rml-label">→ Safe D</span>
          <span class="rml-sub">Purple = toss-up (47–53%)</span>
        </div>`;
      case 'compactness':
        return `<div class="rmap-legend rmap-legend-scale">
          <span class="rml-label">Less compact ←</span>
          <div class="rml-gradient" style="background:linear-gradient(to right,#1C0A09,#5C2B1F,#9B5E3B,#C68B5A,#DEB89A)"></div>
          <span class="rml-label">→ More compact</span>
        </div>`;
      default:
        return '';
    }
  }

  // ─── DICTIONARY PANEL HTML ───────────────────────────────────────

  function dictionaryHTML(dictKey) {
    const entries = DICT[dictKey] || [];
    if (!entries.length) return '';
    const items = entries.map(e => `
      <div class="rmap-dict-entry">
        <div class="rmap-dict-label">${e.label}</div>
        <div class="rmap-dict-desc">${e.desc}</div>
      </div>`).join('');
    return `<div class="rmap-dict">${items}</div>`;
  }

  // ─── CONTROLS RENDERING ──────────────────────────────────────────

  function renderControls(selectedView) {
    const el = document.getElementById('rmap-controls');
    if (!el) return;
    const stateOpts = Object.entries(STATES)
      .map(([abbr, s]) =>
        `<option value="${abbr}"${selectedView === abbr ? ' selected' : ''}>${s.name}</option>`)
      .join('');
    el.innerHTML = `
      <div class="rmap-top-bar">
        <div class="rmap-select-wrap">
          <select id="rmap-select" class="rmap-select">
            <option value="plan"${selectedView === 'plan' ? ' selected' : ''}>Plan-Level</option>
            ${stateOpts}
          </select>
          <span class="rmap-select-arrow">▾</span>
        </div>
      </div>
      <div id="rmap-pills-bar"></div>
      <div id="rmap-legend-bar"></div>`;

    document.getElementById('rmap-select').addEventListener('change', function () {
      const val = this.value;
      if (val === 'plan') {
        showPlanLevel();
      } else {
        const st = STATES[val];
        const latest = st.plans[st.plans.length - 1];
        _curMetric = 'partisan';
        loadState(val, latest.year, latest.type);
      }
    });
  }

  function renderPills(pills, activeId) {
    const bar = document.getElementById('rmap-pills-bar');
    if (!bar) return;
    bar.innerHTML = `<div class="rmap-pills">${pills.map(p =>
      `<button class="rmap-pill${p.id === 'dictionary' ? ' rmap-pill-dict' : ''}${p.id === activeId ? ' active' : ''}"
               data-pill="${p.id}" data-legend="${p.legend || ''}">
        ${p.label}
       </button>`).join('')}</div>`;

    bar.querySelectorAll('.rmap-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        bar.querySelectorAll('.rmap-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const pillId = btn.dataset.pill;

        if (pillId === 'dictionary') {
          // Show dictionary, hide legend
          const legendBar = document.getElementById('rmap-legend-bar');
          if (legendBar) legendBar.innerHTML = '';
          const dictKey = _curView === 'plan' ? 'plan' : (_curMapType || T.OLD);
          let dictEl = document.getElementById('rmap-dict-bar');
          if (!dictEl) {
            dictEl = document.createElement('div');
            dictEl.id = 'rmap-dict-bar';
            // Insert after legend bar if possible, otherwise append to controls
            const anchor = legendBar || document.getElementById('rmap-controls');
            if (legendBar && legendBar.parentNode) {
              legendBar.parentNode.insertBefore(dictEl, legendBar.nextSibling);
            } else if (anchor) {
              anchor.appendChild(dictEl);
            }
          }
          dictEl.innerHTML = dictionaryHTML(dictKey);
        } else {
          // Hide dictionary, restore legend
          const dictEl = document.getElementById('rmap-dict-bar');
          if (dictEl) dictEl.innerHTML = '';
          _curMetric = pillId;
          renderLegend(btn.dataset.legend);
          applyMetric(pillId);
        }
      });
    });
  }

  function renderLegend(type) {
    const bar = document.getElementById('rmap-legend-bar');
    if (bar) bar.innerHTML = legendHTML(type);
  }

  function renderPlanButtons(abbr, activeYear) {
    const bar = document.getElementById('rmap-plan-buttons');
    if (!bar) return;
    const st = STATES[abbr];
    if (!st) { bar.innerHTML = ''; return; }
    bar.innerHTML = `<div class="rmap-pills rmap-pills-plans">${st.plans.map(plan =>
      `<button class="rmap-pill rmap-plan-pill${plan.year === activeYear ? ' active' : ''}"
               data-year="${plan.year}" data-type="${plan.type}">
        ${YEAR_LABEL[plan.year] || plan.year}
       </button>`).join('')}</div>`;
    bar.querySelectorAll('.rmap-plan-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.year !== _curPlan) {
          _curMetric = 'partisan';
          loadState(abbr, btn.dataset.year, btn.dataset.type);
        }
      });
    });
  }

  function clearPlanButtons() {
    const bar = document.getElementById('rmap-plan-buttons');
    if (bar) bar.innerHTML = '';
  }

  // ─── APPLY METRIC ────────────────────────────────────────────────

  function applyMetric(pillId) {
    if (_curView === 'plan' && _stateLayer) {
      const pill = PLAN_PILLS.find(p => p.id === pillId);
      if (!pill || !pill.colorFn) return;
      _stateLayer.eachLayer(l => l.setStyle({ fillColor: pill.colorFn(l.feature.properties) }));
    } else if (_distLayer) {
      const pill = (STATE_PILLS[_curMapType] || []).find(p => p.id === pillId);
      if (!pill || !pill.colorFn) return;
      _distLayer.eachLayer(l => l.setStyle({ fillColor: pill.colorFn(l.feature.properties) }));
    }
  }

  // ─── LABELS ──────────────────────────────────────────────────────

  function addStateLabels(geoLayer) {
    if (_labelLayer) { _map.removeLayer(_labelLayer); _labelLayer = null; }
    const markers = [];
    geoLayer.eachLayer(layer => {
      const abbr = layer.feature.properties['Abbr'];
      if (!abbr) return;
      const center = layer.getBounds().getCenter();
      markers.push(
        L.marker(center, {
          icon: L.divIcon({
            className: 'rmap-state-label',
            html: `<span>${abbr}</span>`,
            iconSize: null,
            iconAnchor: [16, 8]
          }),
          interactive: false
        })
      );
    });
    _labelLayer = L.layerGroup(markers).addTo(_map);
  }

  function addDistrictLabels(geoLayer) {
    if (_labelLayer) { _map.removeLayer(_labelLayer); _labelLayer = null; }
    const markers = [];
    geoLayer.eachLayer(layer => {
      const num = layer.feature.properties['District No.'];
      if (num == null) return;
      const center = layer.getBounds().getCenter();
      markers.push(
        L.marker(center, {
          icon: L.divIcon({
            className: 'rmap-dist-label',
            html: `<span>${num}</span>`,
            iconSize: null,
            iconAnchor: [10, 7]
          }),
          interactive: false
        })
      );
    });
    _labelLayer = L.layerGroup(markers).addTo(_map);
  }

  function clearLabels() {
    if (_labelLayer) { _map.removeLayer(_labelLayer); _labelLayer = null; }
  }

  // ─── FETCH / CACHE ───────────────────────────────────────────────

  async function fetchGeo(url) {
    if (_cache[url]) return _cache[url];
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
    const geo = await res.json();
    _cache[url] = geo;
    return geo;
  }

  // ─── MESSAGES ────────────────────────────────────────────────────

  function setMsg(html) {
    let el = document.getElementById('rmap-msg');
    if (!el) {
      el = Object.assign(document.createElement('div'), { id: 'rmap-msg' });
      document.getElementById('redistricting-map')?.appendChild(el);
    }
    el.innerHTML = html;
    el.style.display = 'flex';
  }
  function clearMsg() {
    const el = document.getElementById('rmap-msg');
    if (el) el.style.display = 'none';
  }

  // ─── TILES / DARK MODE ───────────────────────────────────────────

  const TILES = {
    light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    dark:  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
  };
  const TILE_OPTS = {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a> © <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd', maxZoom: 20
  };
  function updateTiles() {
    if (!_map || !_tileLayer) return;
    const dark = document.body.classList.contains('dark-mode');
    _map.removeLayer(_tileLayer);
    _tileLayer = L.tileLayer(dark ? TILES.dark : TILES.light, TILE_OPTS).addTo(_map);
    _tileLayer.bringToBack();
  }

  // ─── VIEWS ───────────────────────────────────────────────────────

  async function showPlanLevel() {
    _curView = 'plan'; _curPlan = null; _curMapType = null; _curMetric = 'enacted';
    if (_distLayer)  { _map.removeLayer(_distLayer); _distLayer = null; }
    clearLabels();
    clearPlanButtons();
    renderControls('plan');
    renderPills(PLAN_PILLS, 'enacted');
    renderLegend('enacted');

    if (_stateLayer) {
      _stateLayer.addTo(_map);
      applyMetric('enacted');
      addStateLabels(_stateLayer);
      _map.flyToBounds(_stateLayer.getBounds(), { padding: [40, 40], duration: 0.6 });
      return;
    }
    setMsg('Loading map data…');
    try {
      const geo = await fetchGeo(`${DATA_PATH}/all_states.geojson`);
      clearMsg();
      _stateLayer = buildStateLayer(geo);
      _stateLayer.addTo(_map);
      addStateLabels(_stateLayer);
      _map.flyToBounds(_stateLayer.getBounds(), { padding: [40, 40], duration: 0 });
    } catch (err) {
      setMsg(`State GeoJSON not found.<br>
        <small>Export from R:<br>
        <code>st_write(all_states |> st_transform(4326),<br>"./data/all_states.geojson", driver="GeoJSON")</code></small>`);
      console.warn('[rmap]', err.message);
    }
  }

  function buildStateLayer(geo) {
    const pill = PLAN_PILLS[0];
    return L.geoJSON(geo, {
      style: f => ({ fillColor: pill.colorFn(f.properties), fillOpacity: 0.82, weight: 1.5, color: '#444' }),
      onEachFeature: (f, layer) => {
        const abbr = f.properties['Abbr'];
        layer.bindTooltip(stateTableHTML(f.properties), { className: 'rmap-leaflet-tt', sticky: true, maxWidth: 320 });
        layer.on({
          mouseover: e => e.target.setStyle({ weight: 2.5, color: '#222', fillOpacity: 0.95 }),
          mouseout:  e => _stateLayer.resetStyle(e.target),
          click: () => {
            if (!STATES[abbr]) return;
            const st = STATES[abbr];
            const latest = st.plans[st.plans.length - 1];
            _curMetric = 'partisan';
            const sel = document.getElementById('rmap-select');
            if (sel) sel.value = abbr;
            loadState(abbr, latest.year, latest.type);
          }
        });
      }
    });
  }

  async function loadState(abbr, planYear, mapType) {
    _curView = abbr; _curPlan = planYear; _curMapType = mapType;
    if (_stateLayer) _map.removeLayer(_stateLayer);
    if (_distLayer)  { _map.removeLayer(_distLayer); _distLayer = null; }
    clearLabels();

    const pills = STATE_PILLS[mapType] || STATE_PILLS[T.OLD];
    if (!pills.find(p => p.id === _curMetric)) _curMetric = pills[0].id;

    renderControls(abbr);
    renderPills(pills, _curMetric);
    const activePill = pills.find(p => p.id === _curMetric) || pills[0];
    renderLegend(activePill.legend);
    renderPlanButtons(abbr, planYear);

    setMsg('Loading district data…');
    try {
      const url = `${DATA_PATH}/${abbr.toLowerCase()}${planYear}.geojson`;
      const geo = await fetchGeo(url);
      clearMsg();

      _distLayer = L.geoJSON(geo, {
        style: f => ({ fillColor: activePill.colorFn(f.properties), fillOpacity: 0.82, weight: 1, color: '#555' }),
        onEachFeature: (f, layer) => {
          const p = f.properties;
          layer.bindTooltip(
            `<div class="rmt-tt-sm">
               <strong>District ${p['District No.']}</strong><br>
               ${activePill.label}: <em>${formatVal(p, _curMetric)}</em><br>
               <span style="font-size:10px;color:#966E6D">Click for full details</span>
             </div>`,
            { className: 'rmap-leaflet-tt', sticky: true }
          );
          layer.bindPopup(districtTableHTML(p, mapType), { maxWidth: 360, className: 'rmap-popup' });
          layer.on({
            mouseover: e => e.target.setStyle({ weight: 2.5, color: '#111', fillOpacity: 0.95 }),
            mouseout:  e => _distLayer.resetStyle(e.target),
            click:     e => e.target.openPopup()
          });
        }
      }).addTo(_map);

      addDistrictLabels(_distLayer);
      _map.flyToBounds(_distLayer.getBounds(), { padding: [30, 30], duration: 0.7 });
    } catch (err) {
      const yr = YEAR_LABEL[planYear] || planYear;
      setMsg(`<strong>${STATES[abbr]?.name} — ${yr}</strong> not yet available.<br>
        <small>Export from R:<br>
        <code>st_write(${abbr.toLowerCase()}${planYear} |> st_transform(4326),<br>
        "./data/${abbr.toLowerCase()}${planYear}.geojson", driver="GeoJSON")</code></small>`);
      if (_stateLayer) _stateLayer.addTo(_map);
      console.warn('[rmap]', err.message);
    }
  }

  function formatVal(props, pillId) {
    switch (pillId) {
      case 'partisan':    return fmtPct(props['Partisan Vote Share']);
      case 'winprob':     return fmtPct(props['Prob. of Dem. Win']);
      case 'ensemble':    return fmtRnk(props['Dem. Vote Share % Extremity']);
      case 'compactness': return fmtRnk(props['Compactness % Extremity']);
      default: return '—';
    }
  }

  // ─── MAP INIT ────────────────────────────────────────────────────

  async function initMap() {
    if (_map) { _map.invalidateSize(); return; }
    const mapEl = document.getElementById('redistricting-map');
    if (!mapEl) return;
    const dark = document.body.classList.contains('dark-mode');
    _map = L.map('redistricting-map', { center: [37.5, -96], zoom: 4, zoomControl: true });
    _tileLayer = L.tileLayer(dark ? TILES.dark : TILES.light, TILE_OPTS).addTo(_map);
    new MutationObserver(updateTiles).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    await showPlanLevel();
  }

  // ─── BUTTON WIRING ───────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', () => {
    const btn       = document.querySelector('.map-toggle-btn[data-map-id="redistricting-2026"]');
    const container = document.querySelector('.map-dropdown[data-map-id="redistricting-2026"]');
    if (!btn || !container) return;
    btn.addEventListener('click', () => {
      const opening = container.classList.toggle('open');
      btn.classList.toggle('active', opening);
      if (opening) {
        setTimeout(initMap, 60);
        setTimeout(() => _map?.invalidateSize(), 240);
      }
    });
  });

})();
