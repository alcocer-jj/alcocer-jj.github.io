// ----------------------------
// HEADER ANIMATION
// ----------------------------
function typing_animation() {
  const textElement = document.querySelector(".text");
  const textHide = document.querySelector(".text_hide");
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

  // Animate the text reveal mask
  textHide.animate([
    { left: '0%' },
    { left: `${stepWidth * textLength}%` }
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
// ABSTRACT COLLAPSIBLE
// ----------------------------
document.querySelectorAll('.fancy-abstract-button').forEach((btn) => {
  btn.addEventListener('click', () => {
    const id = btn.getAttribute('data-id');
    const dropdown = document.querySelector(`.dropdown-menu[data-id="${id}"]`);
    
    if (!dropdown) return;

    dropdown.classList.toggle('open');         // Toggle dropdown visibility
    btn.classList.toggle('active');            // Toggle rotation of the button
  });
});


// ----------------------------
// SELECT MULTIPLE DROPDOWN
// ----------------------------

$(document).ready(function () {
  $('select[multiple]').each(function () {
    const select = $(this);
    const options = select.find('option');
    const div = $('<div />').addClass('selectMultiple');
    const active = $('<div />');
    const list = $('<ul />');
    const placeholder = select.data('placeholder') || 'Select';

    const span = $('<span />').text(placeholder).appendTo(active);

    options.each(function () {
      const text = $(this).text();
      if ($(this).is(':selected')) {
        active.append($('<a />').html('<em>' + text + '</em><i></i>'));
        span.addClass('hide');
      } else {
        list.append($('<li />').html(text));
      }
    });

    active.append($('<div />').addClass('arrow'));
    div.append(active).append(list);

    // Wrap and replace select
    select.after(div);
    select.hide(); // Keep select hidden but functional

    // CLICK TO SELECT TAG
    list.on('click', 'li', function () {
      const li = $(this);
      const text = li.text();
      const a = $('<a />').html('<em>' + text + '</em><i></i>').hide();
      active.append(a);
      a.slideDown(400, function () {
        setTimeout(function () {
          a.addClass('shown');
          span.addClass('hide');
          select.find('option:contains(' + text + ')').prop('selected', true);
          filterPublications();
        }, 500);
      });
      li.slideUp(400, function () {
        li.remove();
      });
    });

    // CLICK TO REMOVE TAG
    active.on('click', 'a', function () {
      const a = $(this);
      const text = a.find('em').text();
      a.removeClass().addClass('remove');
      setTimeout(function () {
        a.addClass('disappear');
        setTimeout(function () {
          a.animate({ width: 0, height: 0, padding: 0, margin: 0 }, 300, function () {
            const li = $('<li />').text(text).addClass('notShown').hide().appendTo(list);
            li.slideDown(400, function () {
              li.addClass('show');
              select.find('option:contains(' + text + ')').prop('selected', false);
              if (!select.find('option:selected').length) {
                span.removeClass('hide');
              }
              filterPublications();
            });
            a.remove();
          });
        }, 300);
      }, 400);
    });

    // OPEN / CLOSE DROPDOWN
    active.on('click', '.arrow, span', function () {
      div.toggleClass('open');
    });
  });

  filterPublications(); // Initial run
});

function filterPublications() {
  const selectedTypes = Array.from(
    document.querySelectorAll('#filter-type option:checked')
  ).map(opt => opt.textContent.trim().toLowerCase());

  const selectedKeywords = Array.from(
    document.querySelectorAll('#filter-keywords option:checked')
  ).map(opt => opt.textContent.trim().toLowerCase());

  document.querySelectorAll('.publication-entry').forEach(pub => {
    const typeTag = (pub.dataset.type || '').toLowerCase().trim();
    const keywords = (pub.dataset.keywords || '')
      .toLowerCase()
      .split(',')
      .map(t => t.trim());

    const hasType = selectedTypes.length === 0 || selectedTypes.includes(typeTag);

    const hasKeywords = selectedKeywords.length === 0 ||
      selectedKeywords.every(k => keywords.includes(k));

    pub.style.display = hasType && hasKeywords ? '' : 'none';
  });
}