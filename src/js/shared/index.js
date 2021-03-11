import anime from 'animejs/lib/anime.es.js';

function menu() {
  const overlay = document.querySelector('.overlay');
  const navigation = document.querySelector('.navegacion');
  const body = document.querySelector('body');
  const elementBtn = document.querySelectorAll('.navegacion-btn');
  const burger = document.querySelector('.burger');

  function classToggle() {
    burger.classList.toggle('clicked');
    overlay.classList.toggle('show');
    navigation.classList.toggle('show');
    body.classList.toggle('overflow');
  }

  document.querySelector('.burger').addEventListener('click', classToggle);
  document.querySelector('.overlay').addEventListener('click', classToggle);

  for (let index = 0; index < elementBtn.length; index++) {
    elementBtn[index].addEventListener('click', function() {
      removeClass();
    });
  }

  function removeClass() {
    overlay.classList.remove('show');
    navigation.classList.remove('show');
    burger.classList.remove('clicked');
  }
}

const widthMobile = window.innerWidth > 0 ? window.innerWidth : screen.width;

function changeLanguage() {
  const ara = document.querySelector('#aragones');
  const cas = document.querySelector('#castellano');
  const araDiv = document.querySelector('.aragones');
  const casDiv = document.querySelector('.castellano');

  ara.onclick = function() {
    casDiv.classList.remove('active');
    araDiv.classList.remove('hidden');
    araDiv.classList.toggle('active');
    casDiv.classList.toggle('hidden');
    ara.classList.remove('active');
    cas.classList.remove('hidden');
    ara.classList.toggle('hidden');
    cas.classList.toggle('active');
  };

  cas.onclick = function() {
    araDiv.classList.remove('active');
    casDiv.classList.remove('hidden');
    casDiv.classList.toggle('active');
    araDiv.classList.toggle('hidden');
    cas.classList.remove('active');
    ara.classList.remove('hidden');
    cas.classList.toggle('hidden');
    ara.classList.toggle('active');
  };
}

function animation() {
  anime
    .timeline()
    .add({
      targets: '.header-title .letter',
      translateY: [0, '1.5rem'],
      translateZ: 0,
      duration: 750,
      delay: anime.stagger(500)
    })
    .add({
      targets: '.letter',
      translateY: ['1.5rem', '2rem'],
      translateZ: 0,
      rotate: 45,
      duration: 750,
      delay: anime.stagger(1000)
    });
};

export { menu, widthMobile, changeLanguage, animation };
