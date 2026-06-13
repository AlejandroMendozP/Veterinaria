document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // 1. INDICADOR MÓVIL DEL MENÚ DE NAVEGACIÓN
    // ==========================================
    const listaNav = document.getElementById('lista-nav');
    const links = document.querySelectorAll('.links-nav');
    const indicador = document.querySelector('.indicador-movil');

    if (listaNav && links.length && indicador) {
        function moverIndicador(elemento) {
            const contRect = listaNav.getBoundingClientRect();
            const elemRect = elemento.getBoundingClientRect();
            const izquierdaX = elemRect.left - contRect.left;

            indicador.style.width = `${elemRect.width}px`;
            indicador.style.transform = `translateX(${izquierdaX}px)`;
        }

        const activeLink = document.querySelector('.links-nav.active');
        if (activeLink) {
            setTimeout(() => moverIndicador(activeLink), 150);
        }

        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href === '#') {
                    e.preventDefault();
                }

                const currentActive = document.querySelector('.links-nav.active');
                if (currentActive) currentActive.classList.remove('active');
                
                link.classList.add('active');
                moverIndicador(link);
            });
        });

        window.addEventListener('resize', () => {
            const currentActive = document.querySelector('.links-nav.active');
            if (currentActive) moverIndicador(currentActive);
        });
    }

    // ==========================================
    // 2. CONFIGURACIÓN DE INPUTS (FECHA Y TLF)
    // ==========================================
    const inputFecha = document.getElementById('fecha-cita');
    const inputTelefono = document.getElementById('telefono');

    if (inputFecha) {
        const hoy = new Date();
        const anio = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, '0');
        const dia = String(hoy.getDate()).padStart(2, '0');
        inputFecha.min = `${anio}-${mes}-${dia}`;
    }

    if (inputTelefono) {
        inputTelefono.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }

    // ==========================================
    // 3. VALIDACIÓN DE FORMULARIO DE RESERVA
    // ==========================================
    function validarYObtenerDatos() {
        const nombreInput = document.getElementById('nombre');
        const tipoMascotaSelect = document.getElementById('tipo-mascota');
        const servicioSelect = document.getElementById('servicio-interes');
        const fechaInput = document.getElementById('fecha-cita');
        const horaInput = document.getElementById('hora-cita');
        const telefonoInput = document.getElementById('telefono');
        
        const nombre = nombreInput.value.trim();
        const telefono = telefonoInput.value.trim();
        const fecha = fechaInput.value;
        const hora = horaInput.value;

        if (!nombre || !fecha || !hora || !telefono || tipoMascotaSelect.value === "" || servicioSelect.value === "") {
            alert("Todos los campos son obligatorios. Por favor, completa el formulario.");
            return null;
        }

        const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,60}$/;
        if (!regexNombre.test(nombre)) {
            alert("Por favor, ingresa un nombre válido (mínimo 3 caracteres, sin números ni símbolos).");
            nombreInput.focus(); 
            return null;
        }

        const regexCelular = /^9\d{8}$/;
        if (!regexCelular.test(telefono)) {
            alert("El número de teléfono debe ser un celular válido de 9 dígitos (debe empezar con 9).");
            telefonoInput.focus();
            return null;
        }

        const fechaSeleccionada = new Date(fecha + 'T00:00:00');
        const diaSemana = fechaSeleccionada.getDay();
        const anioSeleccionado = fechaSeleccionada.getFullYear();
        const anioLimiteMaximo = new Date().getFullYear() + 1;

        if (anioSeleccionado > anioLimiteMaximo || isNaN(fechaSeleccionada.getTime())) {
            alert("Por favor, ingresa un año válido de 4 dígitos.");
            fechaInput.focus();
            return null;
        }
        
        if (diaSemana === 0) {
            alert("Zoe Vet permanece cerrado los domingos. Por favor, selecciona un día de Lunes a Sábado.");
            fechaInput.focus();
            return null;
        }

        const [horas, minutos] = hora.split(':').map(Number);
        const tiempoEnMinutos = (horas * 60) + minutos; 
        const aperturaMinutos = (9 * 60);
        const cierreMinutos = (19 * 60);

        if (tiempoEnMinutos < aperturaMinutos || tiempoEnMinutos > cierreMinutos) {
            alert("El horario de atención es de 9:00 a.m. a 7:00 p.m. Por favor, ajusta la hora.");
            horaInput.focus();
            return null;
        }

        const tipoMascotaText = tipoMascotaSelect.options[tipoMascotaSelect.selectedIndex].text;
        const servicioText = servicioSelect.options[servicioSelect.selectedIndex].text;

        return { nombre, tipoMascota: tipoMascotaText, servicio: servicioText, fecha, hora, telefono };
    }

    // ==========================================
    // 4. ENVÍO DE RESERVAS (WHATSAPP / GMAIL)
    // ==========================================
    const formulario = document.querySelector('.formulario-horizontal');
    const btnWhatsapp = document.getElementById('btn-whatsapp-dinamico');

    if (btnWhatsapp) {
        btnWhatsapp.addEventListener('click', (e) => {
            e.preventDefault();
            
            const datos = validarYObtenerDatos();
            if (!datos) return;

            const mensajeText = `¡Hola Zoe Vet! Deseo agendar una reserva:\n\n` +
                                `*Dueño:* ${datos.nombre}\n` +
                                `*Teléfono:* ${datos.telefono}\n` +
                                `*Mascota:* ${datos.tipoMascota}\n` +
                                `*Servicio:* ${datos.servicio}\n` +
                                `*Fecha:* ${datos.fecha}\n` +
                                `*Hora:* ${datos.hora}`;

            const numeroTelefonoVet = "51931492700";
            const urlWhatsApp = `https://wa.me/${numeroTelefonoVet}?text=${encodeURIComponent(mensajeText)}`;
            
            window.open(urlWhatsApp, '_blank');
        });
    }

    if (formulario) {
        formulario.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const datos = validarYObtenerDatos();
            if (!datos) return;

            const correoDestino = "itsnotalejobarca20@gmail.com";
            const asunto = `Nueva Solicitud de Reserva Web - ${datos.nombre}`;
            const cuerpoEmail = `Detalles de la Reserva:\n\n` +
                                `Nombre del Dueño: ${datos.nombre}\n` +
                                `Teléfono de Contacto: ${datos.telefono}\n` +
                                `Tipo de Mascota: ${datos.tipoMascota}\n` +
                                `Servicio Requerido: ${datos.servicio}\n` +
                                `Fecha Solicitada: ${datos.fecha}\n` +
                                `Hora Solicitada: ${datos.hora}\n\n` +
                                `Por favor, verificar agenda interna y responder para confirmar la cita.`;

            const urlGmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${correoDestino}&su=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpoEmail)}`;
            
            window.open(urlGmail, '_blank');
        });
    }
    
    // ==========================================
    // 5. CARRUSEL INFINITO DE IMÁGENES
    // ==========================================
    const cinta = document.getElementById("cinta");
    const carrusel = document.getElementById("carrusel");

    if (cinta && carrusel) {
        const hijosOriginales = cinta.innerHTML;
        cinta.innerHTML += hijosOriginales;

        let posicionX = 0;
        const velocidadCarrusel = 1;
        let animacionID;
        let estaPausado = false;

        function moverCarrusel() {
            if (!estaPausado) {
                posicionX -= velocidadCarrusel;
                const mitadAncho = cinta.scrollWidth / 2;
                
                if (Math.abs(posicionX) >= mitadAncho) {
                    posicionX = 0;
                }
                cinta.style.transform = `translate3d(${posicionX}px, 0, 0)`;
            }
            animacionID = requestAnimationFrame(moverCarrusel);
        }

        carrusel.addEventListener("mouseenter", () => { estaPausado = true; });
        carrusel.addEventListener("mouseleave", () => { estaPausado = false; });

        moverCarrusel();
    }

    // ==========================================
    // 6. INTERSECTION OBSERVER (ANIMACIONES)
    // ==========================================
    const opcionesObserver = {
        root: null, 
        threshold: 0.15
    };

    const animarSecciones = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('seccion-visible');
                entry.target.classList.remove('seccion-oculta');
                
                // Deja de observar una vez ejecutado para evitar rebotes
                animarSecciones.unobserve(entry.target); 
            }
        });
    }, opcionesObserver);

    // Secciones con animación general hacia arriba (Excluye #nosotros y #reseñas)
    const componentesGenerales = document.querySelectorAll('.hero, section:not(#reseñas):not(#nosotros)');
    componentesGenerales.forEach(comp => {
        comp.classList.add('seccion-animada', 'seccion-oculta');
        animarSecciones.observe(comp);
    });

    // Implementación Lateral Independiente para la Sección "Nosotros"
    const textoNosotros = document.querySelector('.nosotros-contenido');
    const imagenNosotros = document.querySelector('.nosotros-imagen-bloque');

    if (textoNosotros && imagenNosotros) {
        // Inicializamos las clases de movimiento horizontal
        textoNosotros.classList.add('animacion-izquierda', 'seccion-oculta');
        imagenNosotros.classList.add('animacion-derecha', 'seccion-oculta');

        // Ponemos a observar ambos elementos por separado
        animarSecciones.observe(textoNosotros);
        animarSecciones.observe(imagenNosotros);
    }
});