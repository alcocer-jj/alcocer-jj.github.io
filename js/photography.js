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
// GALLERY
// ----------------------------
// Builds the gallery and the country dropdown from window.PHOTOS, which /js/photos.js
// defines. That file is written by _gallery/build_gallery.R, so to change the photos,
// edit _gallery/photos.csv and run the script rather than editing photos.js by hand.
// Like the publication lists on the research page, this runs as the page is read,
// so the photos are in place before main.js fades the page in.

const GALLERY_DIR = '/imgs/gallery/';

// How wide a photo is drawn at each window width, so the browser can fetch the
// smallest copy that still looks sharp. The numbers follow the grid in
// photography.css, so update them together. Browsers that understand the leading
// auto measure each photo themselves and skip the rest.
const PHOTO_SIZES = [
  'auto',
  '(max-width: 559px) calc(100vw - 50px)',
  '(max-width: 819px) calc((100vw - 60px) / 2)',
  '(max-width: 999px) calc((100vw - 70px) / 3)',
  '(max-width: 1249px) calc((100vw - 190px) / 2)',
  '(max-width: 1609px) calc((100vw - 200px) / 3)',
  '400px',
].join(', ');

const galleryElement = document.getElementById('gallery');
let galleryItems = [];

function escapeHTML(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Leaves out any entry that's missing something the markup needs, without stopping the page
function isUsable(photo, position) {
  const ok = Boolean(photo)
    && /^[a-z0-9-]+$/.test(photo.name)
    && Array.isArray(photo.widths) && photo.widths.length > 0
    && photo.widths.every(width => Number.isInteger(width) && width > 0)
    && Number.isInteger(photo.jpg) && photo.jpg > 0
    && Number.isInteger(photo.width) && Number.isInteger(photo.height)
    && String(photo.place || '').trim() !== ''
    && String(photo.country || '').trim() !== '';
  if (!ok) console.warn(`photos.js, entry ${position} is incomplete, so it was left out`);
  return ok;
}

function photoHTML(photo) {
  const base = GALLERY_DIR + photo.name;
  const srcset = photo.widths.map(width => `${base}-${width}.avif ${width}w`).join(', ');
  const caption = `${photo.place} (${photo.year})`;
  const alt = String(photo.alt || '').trim() || `${photo.place}, ${photo.year}`;
  const placeholder = /^#[0-9a-f]{6}$/i.test(photo.color) ? ` style="background-color: ${photo.color}"` : '';
  return (
    `<figure class="image-container" data-country="${escapeHTML(photo.country)}">` +
      '<picture>' +
        `<source type="image/avif" srcset="${srcset}" sizes="${PHOTO_SIZES}">` +
        `<img src="${base}-${photo.jpg}.jpg" width="${photo.width}" height="${photo.height}" ` +
          `alt="${escapeHTML(alt)}" loading="lazy" decoding="async"${placeholder}>` +
      '</picture>' +
      `<figcaption class="caption">${escapeHTML(caption)}</figcaption>` +
    '</figure>'
  );
}

function renderGallery() {
  if (!galleryElement) return [];
  const data = window.PHOTOS;
  if (!Array.isArray(data)) {
    console.error('photos.js did not load. Run _gallery/build_gallery.R to create it, then check it for syntax errors.');
    galleryElement.innerHTML = '<p class="gallery-notice">The gallery is temporarily unavailable.</p>';
    return [];
  }
  const photos = data.filter((photo, i) => isUsable(photo, i + 1));
  galleryElement.innerHTML = photos.map(photoHTML).join('');
  galleryItems = Array.from(galleryElement.querySelectorAll('.image-container'));
  return photos;
}

// ----------------------------
// COUNTRY DROPDOWN
// ----------------------------
// The box shows the chosen countries as tags and the list under it holds the rest.
// Choosing a country turns it into a tag, and clicking a tag puts it back in the
// list. With nothing chosen, every photo shows.

const reduceMotion = window.matchMedia
  ? window.matchMedia('(prefers-reduced-motion: reduce)')
  : { matches: false };

const filter = {
  root: null,
  box: null,
  placeholder: null,
  toggle: null,
  list: null,
  status: document.getElementById('galleryStatus'),
  countries: [],
  selected: new Set(),
};

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, reduceMotion.matches ? 0 : ms));
}

// Plays an animation and resolves when it ends. With reduced motion, or in a
// browser without the Web Animations API, it resolves right away.
function play(element, keyframes, options) {
  if (reduceMotion.matches || typeof element.animate !== 'function') return Promise.resolve();
  return element.animate(keyframes, options).finished.catch(() => {});
}

// The same height slide jQuery's slideDown and slideUp gave the old dropdown
function slideFrames(element) {
  const style = getComputedStyle(element);
  return {
    open: {
      height: `${element.offsetHeight}px`,
      paddingTop: style.paddingTop,
      paddingBottom: style.paddingBottom,
      marginTop: style.marginTop,
      marginBottom: style.marginBottom,
    },
    closed: { height: '0px', paddingTop: '0px', paddingBottom: '0px', marginTop: '0px', marginBottom: '0px' },
  };
}

function slideDown(element, duration) {
  const { open, closed } = slideFrames(element);
  element.style.overflow = 'hidden';
  return play(element, [closed, open], { duration, easing: 'ease-in-out' })
    .then(() => { element.style.overflow = ''; });
}

function slideUp(element, duration) {
  const { open, closed } = slideFrames(element);
  element.style.overflow = 'hidden';
  return play(element, [open, closed], { duration, easing: 'ease-in-out', fill: 'forwards' });
}

function isOpen() {
  return filter.root.classList.contains('open');
}

// Options that can still be chosen, leaving out any on their way out of the list
function liveOptions() {
  return Array.from(filter.list.querySelectorAll('li:not(.leaving) > button'));
}

function setOpen(open) {
  if (open && liveOptions().length === 0) open = false;
  filter.root.classList.toggle('open', open);
  filter.toggle.setAttribute('aria-expanded', String(open));
}

function optionElement(country) {
  const item = document.createElement('li');
  item.dataset.country = country;
  item.innerHTML = `<button type="button">${escapeHTML(country)}</button>`;
  return item;
}

function tagElement(country) {
  const tag = document.createElement('button');
  tag.type = 'button';
  tag.className = 'tag';
  tag.dataset.country = country;
  tag.setAttribute('aria-label', `Remove ${country}`);
  tag.innerHTML = `<em>${escapeHTML(country)}</em><i aria-hidden="true"></i>`;
  return tag;
}

// Puts a returning country back in its alphabetical spot
function insertOption(item) {
  const rank = filter.countries.indexOf(item.dataset.country);
  const after = Array.from(filter.list.children)
    .find(other => filter.countries.indexOf(other.dataset.country) > rank);
  filter.list.insertBefore(item, after || null);
}

function applyFilter() {
  let shown = 0;
  galleryItems.forEach(item => {
    const show = filter.selected.size === 0 || filter.selected.has(item.dataset.country);
    item.style.display = show ? '' : 'none';
    if (show) shown += 1;
  });
  if (filter.status) {
    filter.status.textContent = filter.selected.size === 0
      ? `Showing all ${galleryItems.length} photos`
      : `Showing ${shown} of ${galleryItems.length} photos`;
  }
}

function choose(item, fromKeyboard) {
  const country = item.dataset.country;
  if (filter.selected.has(country)) return;

  // Pick where keyboard focus goes before this option leaves the list
  const options = liveOptions();
  const index = options.indexOf(item.querySelector('button'));
  const next = options[index + 1] || options[index - 1] || null;

  filter.selected.add(country);
  item.classList.add('leaving');
  applyFilter();

  const tag = tagElement(country);
  filter.box.insertBefore(tag, filter.toggle);
  filter.placeholder.classList.add('hide');
  slideDown(tag, 400);

  if (fromKeyboard) (next || filter.toggle).focus();
  slideUp(item, 400).then(() => {
    item.remove();
    if (liveOptions().length === 0) setOpen(false);
  });
}

async function unchoose(tag, fromKeyboard) {
  const country = tag.dataset.country;
  if (tag.classList.contains('remove')) return;

  filter.selected.delete(country);
  applyFilter();
  if (fromKeyboard) filter.toggle.focus();

  // The tag shrinks, fades, and collapses, then the country slides back into the list
  tag.classList.add('remove');
  await wait(400);
  tag.classList.add('disappear');
  await wait(300);
  const style = getComputedStyle(tag);
  await play(tag, [
    {
      width: `${tag.offsetWidth}px`, height: `${tag.offsetHeight}px`,
      paddingLeft: style.paddingLeft, paddingRight: style.paddingRight, paddingBottom: style.paddingBottom,
      marginRight: style.marginRight,
    },
    { width: '0px', height: '0px', paddingLeft: '0px', paddingRight: '0px', paddingBottom: '0px', marginRight: '0px' },
  ], { duration: 300, easing: 'ease-in-out', fill: 'forwards' });
  tag.remove();
  if (filter.selected.size === 0) filter.placeholder.classList.remove('hide');

  const item = optionElement(country);
  item.classList.add('notShown');
  insertOption(item);
  await slideDown(item, 400);
  item.classList.add('show');
  await wait(400);
  item.classList.remove('notShown', 'show');
}

function buildFilter(photos) {
  filter.root = document.getElementById('countryFilter');
  if (!filter.root) return;
  filter.countries = Array.from(new Set(photos.map(photo => photo.country)))
    .sort((a, b) => a.localeCompare(b));

  const label = filter.root.dataset.placeholder || 'Filter by Country';
  filter.box = document.createElement('div');
  filter.placeholder = document.createElement('span');
  filter.placeholder.textContent = label;
  filter.toggle = document.createElement('button');
  filter.toggle.type = 'button';
  filter.toggle.className = 'arrow';
  filter.toggle.setAttribute('aria-label', label);
  filter.toggle.setAttribute('aria-expanded', 'false');
  filter.toggle.setAttribute('aria-controls', 'countryOptions');
  filter.box.append(filter.placeholder, filter.toggle);

  filter.list = document.createElement('ul');
  filter.list.id = 'countryOptions';
  filter.list.setAttribute('aria-label', 'Countries');
  filter.countries.forEach(country => filter.list.append(optionElement(country)));

  filter.root.replaceChildren(filter.box, filter.list);

  // A click from the keyboard has a detail of 0, which is how focus knows to follow along
  filter.toggle.addEventListener('click', () => setOpen(!isOpen()));
  filter.placeholder.addEventListener('click', () => setOpen(!isOpen()));
  filter.list.addEventListener('click', event => {
    const button = event.target.closest('li:not(.leaving) > button');
    if (button) choose(button.parentElement, event.detail === 0);
  });
  filter.box.addEventListener('click', event => {
    const tag = event.target.closest('.tag');
    if (tag) unchoose(tag, event.detail === 0);
  });

  // Arrow keys move through the list, Home and End jump to its ends, and Escape closes it
  filter.root.addEventListener('keydown', event => {
    const options = liveOptions();
    if (event.key === 'Escape' && isOpen()) {
      setOpen(false);
      filter.toggle.focus();
      event.preventDefault();
      return;
    }
    if (event.target === filter.toggle && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      if (options.length === 0) return;
      setOpen(true);
      (event.key === 'ArrowDown' ? options[0] : options[options.length - 1]).focus();
      event.preventDefault();
      return;
    }
    const current = options.indexOf(document.activeElement);
    if (current === -1) return;
    let target = null;
    if (event.key === 'ArrowDown') target = options[Math.min(current + 1, options.length - 1)];
    if (event.key === 'ArrowUp') target = current === 0 ? filter.toggle : options[current - 1];
    if (event.key === 'Home') target = options[0];
    if (event.key === 'End') target = options[options.length - 1];
    if (target) {
      target.focus();
      event.preventDefault();
    }
  });

  // Clicking or tabbing anywhere else closes the list
  document.addEventListener('click', event => {
    if (isOpen() && !filter.root.contains(event.target)) setOpen(false);
  });
  document.addEventListener('focusin', event => {
    if (isOpen() && !filter.root.contains(event.target)) setOpen(false);
  });
}

buildFilter(renderGallery());
