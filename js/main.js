document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  const input = document.querySelector('input[name="name"]');
  const btn = document.getElementById('understood-btn');
  const robot = document.querySelector('.robot');

  if (form && input) {
    form.addEventListener('submit', (e) => {
      if (input.value.trim() === '') {
        e.preventDefault();
        alert("من فضلك اكتب اسمك يا بشمهندس 😊");
      }
    });
  }

  if (btn) {
    btn.addEventListener('mouseenter', () => {
      btn.style.backgroundColor = '#4CAF50';
      btn.style.transform = 'scale(1.05)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.backgroundColor = '';
      btn.style.transform = '';
    });
  }

  if (robot) {
    robot.addEventListener('click', () => {
      robot.style.transform = 'rotate(5deg)';
      setTimeout(() => robot.style.transform = 'rotate(-5deg)', 150);
      setTimeout(() => robot.style.transform = 'rotate(0deg)', 300);
    });
  }
});
