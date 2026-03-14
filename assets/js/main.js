document.addEventListener('DOMContentLoaded', () => {
    // Inicializar AOS
    AOS.init({
        once: true,
        offset: 50,
        duration: 800,
        easing: 'ease-in-out',
    });

    // 1. Funcionalidad de Acordeón para la página de FAQ

    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const contentId = header.getAttribute('data-target');
            const content = document.querySelector(contentId);
            const isExpanded = header.getAttribute('aria-expanded') === 'true';

            // Cierra todos los contenidos (comportamiento de un acordeón)
            accordionHeaders.forEach(otherHeader => {
                if (otherHeader !== header) {
                    otherHeader.setAttribute('aria-expanded', 'false');
                    document.querySelector(otherHeader.getAttribute('data-target')).classList.remove('active');
                }
            });

            // Alterna el estado del encabezado y el contenido actual
            if (!isExpanded) {
                header.setAttribute('aria-expanded', 'true');
                content.classList.add('active');
            } else {
                header.setAttribute('aria-expanded', 'false');
                content.classList.remove('active');
            }
        });
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
    const swiperConfig = {
        slidesPerView: 1, 
        spaceBetween: 0,
        loop: true, 
        observer: true, 
        observeParents: true,
        
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
    };

    // Inicialización del Apartamento MAR
   
    var swiperMar = new Swiper("#swiper-mar", swiperConfig);

    // Inicialización del Apartamento ARENA 
     var swiperArena = new Swiper("#swiper-arena", swiperConfig);
});

