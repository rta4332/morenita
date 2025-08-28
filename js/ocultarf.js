// Script para ocultar categoría FRUTALES
function ocultarCategoriaFrutales() {
    // Ocultar botones con onclick que contenga "frutales"
    const botonesFrutales = document.querySelectorAll('button[onclick*="frutales"]');
    botonesFrutales.forEach(boton => {
        boton.style.display = 'none';
    });

    // Ocultar links con href="frutales.html"
    const linksFrutales = document.querySelectorAll('a[href="frutales.html"]');
    linksFrutales.forEach(link => {
        // Ocultar el link
        link.style.display = 'none';
        // Si está dentro de un <li>, ocultar también el <li>
        if (link.closest('li')) {
            link.closest('li').style.display = 'none';
        }
    });
}
// Script para ocultar categoría FRUTALES
function ocultarCategoriaFrutales() {
    // Ocultar botones con onclick que contenga "frutales"
    const botonesFrutales = document.querySelectorAll('button[onclick*="frutales"]');
    botonesFrutales.forEach(boton => {
        boton.style.display = 'none';
    });

    // Ocultar links con href="frutales.html"
    const linksFrutales = document.querySelectorAll('a[href="frutales.html"]');
    linksFrutales.forEach(link => {
        // Ocultar el link
        link.style.display = 'none';
        // Si está dentro de un <li>, ocultar también el <li>
        if (link.closest('li')) {
            link.closest('li').style.display = 'none';
        }
    });

    // Método adicional: buscar por texto contenido
    const todosLosElementos = document.querySelectorAll('a, button, li');
    todosLosElementos.forEach(elemento => {
        const texto = elemento.textContent.trim().toLowerCase();
        const onclick = elemento.getAttribute('onclick');
        const href = elemento.getAttribute('href');
        
        // Si contiene "frutales" en cualquier forma
        if (texto.includes('frutales') || 
            href === 'frutales.html' || 
            (onclick && onclick.includes('frutales'))) {
            elemento.style.display = 'none';
        }
    });

    console.log('.');
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ocultarCategoriaFrutales);
} else {
    ocultarCategoriaFrutales();
}

// También ejecutar después de un pequeño delay por si hay contenido que se carga dinámicamente
setTimeout(ocultarCategoriaFrutales, 500);

// Función para mostrar la categoría nuevamente (por si la necesitas después)
function mostrarCategoriaFrutales() {
    // Mostrar botones
    const botonesFrutales = document.querySelectorAll('button[onclick*="frutales"]');
    botonesFrutales.forEach(boton => {
        boton.style.display = '';
    });

    // Mostrar links y sus contenedores li
    const linksFrutales = document.querySelectorAll('a[href="frutales.html"]');
    linksFrutales.forEach(link => {
        link.style.display = '';
        if (link.closest('li')) {
            link.closest('li').style.display = '';
        }
    });

    console.log('.');
}