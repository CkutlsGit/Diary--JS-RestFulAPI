const Buttonhide = document.getElementById('hide');

function Clickhide(event) {
    const Menu = document.querySelector('.menu');
    Menu.style.visibility = Menu.style.visibility ===
    Menu.classList.toggle('active');
    Buttonhide.classList.toggle('active__btn');
}

Buttonhide.addEventListener('click', Clickhide);