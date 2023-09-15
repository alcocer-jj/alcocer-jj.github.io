
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
