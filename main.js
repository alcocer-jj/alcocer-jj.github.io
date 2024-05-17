
/// === sandwich topnav function === ///

function myFunction() {
    var x = document.getElementById("myTopnav");
    if (x.className === "topnav") {
      x.className += " responsive";
    } else {
      x.className = "topnav";
    }
  }


/// === scroll to the top function === ///

// Get the button
let mybutton = document.getElementById("to-top"); 

// When the user scrolls down 500 pixels from the top of the document, show the button
window.onscroll = function() {scrollFunction()}; 

function scrollFunction() {
  if (document.body.scrollTop > 500 || document.documentElement.scrollTop > 500) {
    mybutton.style.display = "block";
  } else {
    mybutton.style.display = "none";
  }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

/* JS to get collapsible Abstracts to work */
var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.maxHeight){
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    }
  });
}

document.getElementById('themeToggle').addEventListener('click', function() {
  var body = document.body;
  var icon = this.querySelector('i');
  console.log("click", body)
  if (body.classList.contains('dark-mode')) {
      body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
      icon.classList.remove('fa-sun');
      icon.classList.add('fa-moon');

  } else {
      body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
      icon.classList.remove('fa-moon');
      icon.classList.add('fa-sun');
  }
});

// On page load, check for a saved theme preference
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark-mode');
  icon.classList.add('fa-sun');
  icon.classList.remove('fa-moon');
}

// Collapse toggle
document.querySelectorAll('.collapse-toggle').forEach(item => {
  item.addEventListener('click', function(e) {
      e.preventDefault();
      const collapseElement = document.getElementById(this.href.split("#")[1]);
      if (collapseElement.classList.contains('collapsed')) {
          collapseElement.style.height = `${collapseElement.scrollHeight}px`; // Set to its natural height
          collapseElement.classList.remove('collapsed');
      } else {
          collapseElement.style.height = '0px'; // Set height to 0 to collapse
          collapseElement.classList.add('collapsed');
      }
  });
});

function filterImages(site) {
  const images = document.querySelectorAll('.gallery .image-container');
  const currentButton = document.getElementById('btn' + site);
  const isActive = currentButton.classList.contains('active');

  document.querySelectorAll('.year-buttons button').forEach(btn => {
      btn.classList.remove('active'); // Remove active class from all buttons
  });

  if (isActive) {
      // If the button was already active, show all images
      images.forEach(container => {
          container.style.display = 'inline-block'; // Make sure to reset to the default display style
      });
      currentButton.classList.remove('active');
  } else {
      // Filter images by the selected year
      currentButton.classList.add('active');
      images.forEach(container => {
          const img = container.querySelector('img');
          container.style.display = img.getAttribute('data-site') === site ? 'inline-block' : 'none';
      });
  }
}

