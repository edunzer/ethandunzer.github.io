// Function to animate progress bars
function animateProgressBar() {
  document.querySelectorAll('.progressbar').forEach(el => {
      el.style.animationPlayState = "running";
  });
}

// Ensure animations trigger when the skills section is in view
const skillsSection = document.getElementById('cv');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
      if (entry.isIntersecting) {
          animateProgressBar(); // Start the animation
          observer.unobserve(skillsSection); // Stop observing once triggered
      }
  });
}, { threshold: 0.2 }); // Triggers when 20% of the section is in view

observer.observe(skillsSection);


// MAIN NAV ANIMATION TRIGGER
$('#navigation a').on('click', function(e) {
  e.preventDefault();
  var hash = this.hash;
  $('html, body').animate({
    scrollTop: $(this.hash).offset().top
  }, 1000);
});


$('.toggler, .nav-content a:not(#dropdown-link)').on('click', function(){
  $('.toggler').toggleClass('change');
  $('.nav-content').slideToggle();
  $('#dropdown-menu').slideUp();
  $('.menu-overlay').toggle();
});

$('.nav-content .dropdown').on('click', function(){
  $('#dropdown-menu').slideToggle();
});

$('.menu-overlay').on('click', function(){
  $('.toggler').removeClass('change');
  $('.nav-content').slideUp();
  $('#dropdown-menu').slideUp();
  $('.menu-overlay').hide();
});

$("#contact input, #contact textarea").on('focusout', function(){

  var text_val = $(this).val();
  if (text_val === "") {
    $(this).removeClass('has-value');
  } else {
    $(this).addClass('has-value');
  }

});


  // move section down one
  $(document).on("click", "#moveDown", function () {
    $.fn.fullpage.moveSectionDown();
  });

  // Smooth scrolling for anchor links (no jQuery needed)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
  });

