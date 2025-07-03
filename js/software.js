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