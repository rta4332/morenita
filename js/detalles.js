const firebaseConfig = {
  apiKey: "AIzaSyBoRNOrpueYTJVeqxZwMtUsyAYArEHvgVU",
  authDomain: "morenita0ficial.firebaseapp.com",
  databaseURL: "https://morenita0ficial-default-rtdb.firebaseio.com",
  projectId: "morenita0ficial",
  storageBucket: "morenita0ficial.firebasestorage.app",
  messagingSenderId: "867231481408",
  appId: "1:867231481408:web:50512d7709d3b9d4e7a9a5"
};
firebase.apps.length || firebase.initializeApp(firebaseConfig);
const database = firebase.database();
let carrito = []
  , categoriaActual = ""
  , productosFiltrados = [];
const searchModal = document.getElementById("search-modal")
  , searchIcon = document.getElementById("search-icon")
  , mobileSearchIcon = document.getElementById("mobile-search-icon")
  , closeSearchModal = document.querySelector(".close-search-modal")
  , searchInput = document.getElementById("search-input")
  , searchButton = document.getElementById("search-button")
  , productsContainer = document.getElementById("products-container")
  , resultsCount = document.getElementById("results-count");
let todosProductos = [];
function cargarTodosProductos() {
    todosProductos = [],
    database.ref("productos").once("value").then((t => {
        const o = t.val();
        for (const t in o)
            if (o.hasOwnProperty(t)) {
                const e = o[t];
                for (const o in e)
                    if (e.hasOwnProperty(o)) {
                        const r = e[o];
                        r && r.nombre && todosProductos.push({
                            id: o,
                            nombre: r.nombre,
                            precio: r.precio || "0",
                            imagen: r.imagen || "img/placeholder.jpg",
                            categoria: t
                        })
                    }
            }
        console.log("Total de productos cargados para búsqueda:", todosProductos.length)
    }
    )).catch((t => {
        console.error("Error al cargar productos para búsqueda:", t),
        todosProductos = [{
            id: "0",
            nombre: "CONO FLORAL",
            precio: "59000",
            imagen: "https://i.imgur.com/swBqLsh.png",
            categoria: "arreglos"
        }, {
            id: "1",
            nombre: "FRESAS CHOCOLATE",
            precio: "45000",
            imagen: "https://i.imgur.com/example1.jpg",
            categoria: "fresas"
        }, {
            id: "2",
            nombre: "DESAYUNO SORPRESA",
            precio: "70000",
            imagen: "https://i.imgur.com/example2.jpg",
            categoria: "desayunos"
        }]
    }
    ))
}
function buscarProductos(t) {
    return t ? (t = t.toLowerCase().trim(),
    todosProductos.filter((o => o.nombre && o.nombre.toLowerCase().includes(t)))) : []
}
function mostrarResultados(t) {
    productsContainer.innerHTML = "",
    0 === t.length ? (resultsCount.textContent = "No se encontraron productos",
    productsContainer.innerHTML = '<div class="no-results">No se encontraron productos que coincidan con tu búsqueda</div>') : (resultsCount.textContent = `Se encontraron ${t.length} productos`,
    t.forEach((t => {
        let o = t.precio;
        isNaN(o) || (o = parseInt(o).toLocaleString("es-CO")),
        productsContainer.innerHTML += `\n                <div class="product-card">\n                    <img src="${t.imagen || "img/placeholder.jpg"}" alt="${t.nombre}" class="product-image">\n                    <div class="product-info">\n                        <div class="product-name">${t.nombre}</div>\n                        <div class="product-price">$${formatearPrecio(t.precio)}</div>\n                        <button class="product-button">Ver detalles</button>\n                    </div>\n                </div>\n            `
    }
    )),
    document.querySelectorAll(".product-button").forEach(( (o, e) => {
        o.addEventListener("click", ( () => {
            console.log("Producto seleccionado:", t[e].nombre),
            window.location.href = `detalles.html?id=${t[e].id}&categoria=${t[e].categoria}`
        }
        ))
    }
    )))
}


// Función para abrir imagen en pantalla completa
function abrirImagenCompleta(imageSrc = null, imageAlt = '') {
    const overlay = document.getElementById('imageOverlay');
    const overlayImage = document.getElementById('overlayImage');
    
    if (overlay && overlayImage) {
        // Si no se pasa imageSrc, tomar la imagen actual de la imagen principal
        if (!imageSrc) {
            const imagenPrincipal = document.getElementById('imagenPrincipal');
            if (imagenPrincipal) {
                imageSrc = imagenPrincipal.src;
                imageAlt = imagenPrincipal.alt;
            }
        }
        
        overlayImage.src = imageSrc;
        overlayImage.alt = imageAlt;
        overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}


// Función para cerrar imagen en pantalla completa



function cargarColoresLazos() {
    return firebase.database().ref('colores-lazos').once('value')
        .then(snapshot => {
            const colores = [];
            if (snapshot.exists()) {
                snapshot.forEach(childSnapshot => {
                    const color = childSnapshot.val();
                    colores.push({
                        codigo: color.codigo,
                        nombre: color.nombre
                    });
                });
            }
            return colores;
        })
        .catch(error => {
            console.error('Error al cargar colores de lazos:', error);
            return [];
        });
}

function formatearPrecio(precio) {
    if (typeof precio === 'number') {
        return precio.toLocaleString('es-CO');
    }
    const numero = parseFloat(precio);
    return isNaN(numero) ? precio : numero.toLocaleString('es-CO');
}

function actualizarContadorCarritoMovil() {
    const t = document.getElementById("mobileCarritoContador");
    if (!t)
        return void console.error("Elemento mobileCarritoContador no encontrado");
    let o = [];
    try {
        const t = localStorage.getItem("carrito");
        t && (o = JSON.parse(t))
    } catch (t) {
        console.error("Error al obtener el carrito desde localStorage:", t)
    }
    const e = o.reduce(( (t, o) => t + (o.cantidad || 0)), 0);
    t.textContent = e,
    console.log("Contador móvil actualizado:", e)
}
function handleProductSnapshot(t, o=categoria) {
    const e = t.val();
    if (!e || !t.exists())
        return void (document.getElementById("detalleProducto").innerHTML = "<p>Producto no encontrado</p>");
    
    const r = o;
    
    // Si es categoría desayunos, cargar colores de lazos
    if (r === 'desayunos') {
        cargarColoresLazos().then(colores => {
            const coloresHTML = colores.length > 0 ? `
                <div class="colores-lazos">
                    <h3>Colores de lazo disponibles:</h3>
                    <div class="opciones-colores">
                        ${colores.map(color => `
                            <div class="color-display" style="background-color: ${color.codigo}" 
                                 title="${color.nombre}">
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : '';
            
            mostrarDetalleConColores(e, r, coloresHTML);
        });
    } else {
        mostrarDetalleConColores(e, r, '');
    }
}
function mostrarDetalleConColores(e, r, coloresHTML) {
    const a = `
<div class="galeria-imagenes">
    <img src="${e.imagen}" alt="${e.nombre}" class="imagen-principal" id="imagenPrincipal" onclick="abrirImagenCompleta()">
    <div class="miniaturas">
        <img src="${e.imagen}" alt="${e.nombre}" class="miniatura" onclick="cambiarImagen('${e.imagen}')">
        ${e.imagen2 ? `<img src="${e.imagen2}" alt="${e.nombre}" class="miniatura" onclick="cambiarImagen('${e.imagen2}')">` : ""}
        ${e.imagen3 ? `<img src="${e.imagen3}" alt="${e.nombre}" class="miniatura" onclick="cambiarImagen('${e.imagen3}')">` : ""}
    </div>
</div>
<div class="info-producto">
    <h1 class="titulo">${e.nombre}</h1>
    <p class="precio">$${formatearPrecio(e.precio)}</p>
    <div class="descripcion">
        <h2>Contenido</h2>
        ${e.descripcion || "Sin descripción disponible"}
    </div>
    ${coloresHTML}
    <div class="opciones">
        <p>El regalo lleva una carta personalizada, agrega tu mensaje al completar los datos del pedido<p>
    </div>
    <button class="btn-comprar" onclick="agregarAlCarrito('${productoId}', '${e.nombre}', ${e.precio}, '${e.imagen}', '${r}')">Agregar al carrito</button>
</div>
`;
    document.getElementById("detalleProducto").innerHTML = a;
}
function handleProductError(t) {
    console.error("Error al cargar el producto:", t),
    document.getElementById("detalleProducto").innerHTML = "<p>Error al cargar el producto</p>"
}
function openSearchModal(t) {
    t.preventDefault(),
    searchModal.style.display = "block",
    document.body.style.overflow = "hidden",
    searchInput.focus()
}
function cargarProductos(t) {
    categoriaActual = t;
    const o = document.getElementById("categoriaActiva");
    o && (o.innerText = `Categoría: ${t.charAt(0).toUpperCase() + t.slice(1)}`);
    const e = document.getElementById("productos");
    e && (e.innerHTML = "<p>Cargando...</p>"),
    firebase.database().ref("productos/" + t).once("value").then((o => {
        productosFiltrados = [],
        o.exists() ? (o.forEach((o => {
            let e = o.val();
            e.id = o.key,
            e.categoria = t,
            productosFiltrados.push(e)
        }
        )),
        ordenarPorFavoritos()) : e && (e.innerHTML = "<p>No hay productos en esta categoría.</p>")
    }
    )).catch((t => {
        console.error("Error al cargar productos:", t),
        e && (e.innerHTML = "<p>Error al cargar los productos.</p>")
    }
    ))
}
function mostrarProductos(t) {
    const o = document.getElementById("productos");
    if (!o)
        return;
    o.innerHTML = "";
    let e = JSON.parse(localStorage.getItem("favoritos") || "[]");
    t.forEach((t => {
        let r = document.createElement("div");
        r.classList.add("producto"),
        r.setAttribute("data-precio", t.precio);
        const a = e.some((o => o.id === t.id && o.categoria === t.categoria))
          , n = `favoritos-contador-${t.id}`;
        let c = `\n    <div class="img-container" onclick="window.location.href='detalles.html?categoria=${t.categoria}&id=${t.id}'">\n         <img src="${t.imagen}" alt="${t.nombre}" class="img-normal">\n        <img src="${t.imagen2 || t.imagen}" alt="${t.nombre}" class="img-hover">\n    </div>\n    \n    \x3c!-- Iconos de compartir y favoritos --\x3e\n    <div class="producto-iconos">\n        <button class="icon-btn" onclick="compartirProducto(event, '${t.id}', '${t.nombre}')">\n            <i class="fas fa-share"></i>\n        </button>\n        <button class="icon-btn ${a ? "favorito" : ""}" onclick="toggleFavorito(event, '${t.id}', '${categoriaActual}')">\n            <i class="${a ? "fas" : "far"} fa-heart"></i>\n            <span id="${n}" class="favoritos-count">${t.favoritos || 0}</span>\n        </button>\n    </div>\n    \n    <h3 onclick="window.location.href='detalles.html?categoria=${categoriaActual}&id=${t.id}'">${t.nombre}</h3>\n    <p>$${formatearPrecio(t.precio)}</p>\n    <button class="comprar" onclick="agregarAlCarrito('${t.id}', '${t.nombre}', ${t.precio}, '${t.imagen}', '${categoriaActual}')">Comprar</button>\n`;
        r.innerHTML = c,
        o.appendChild(r),
        escucharFavoritos(t.id, t.categoria, n)
    }
    ))
}
function escucharFavoritos(t, o, e) {
    firebase.database().ref(`productos/${o}/${t}/favoritos`).on("value", (t => {
        const o = t.val() || 0
          , r = document.getElementById(e);
        r && (r.textContent = o)
    }
    ))
}
function cargarCarritoGuardado() {
    const t = localStorage.getItem("carrito");
    t && (carrito = JSON.parse(t),
    actualizarContadorCarrito(),
    renderizarCarrito())
}
function compartirProducto(t, o, e) {
    if (t.stopPropagation(),
    navigator.share)
        navigator.share({
            title: e,
            text: `¡Mira este producto: ${e}!`,
            url: `${window.location.origin}/detalles.html?categoria=${categoriaActual}&id=${o}`
        }).then(( () => mostrarNotificacion("Producto compartido"))).catch((t => console.log("Error al compartir:", t)));
    else {
        const t = `${window.location.origin}/detalles.html?categoria=${categoriaActual}&id=${o}`;
        navigator.clipboard.writeText(t).then(( () => mostrarNotificacion("Enlace copiado al portapapeles"))).catch((t => console.error("No se pudo copiar: ", t)))
    }
}
function actualizarContadorCarrito() {
    const t = document.getElementById("carritoContador")
      , o = document.getElementById("mobileCarritoContador")
      , e = carrito.reduce(( (t, o) => t + o.cantidad), 0);
    t && (t.textContent = e),
    o && (o.textContent = e)
}
function renderizarCarrito() {
    console.log("Renderizando carrito...");
    const t = document.getElementById("carritoItems");
    if (console.log("Elemento carritoItems:", t),
    !t)
        return void console.error("No se encontró el elemento carritoItems");
    if (console.log("Contenido del carrito:", carrito),
    0 === carrito.length) {
        t.innerHTML = '\n    <div class="carrito-vacio">\n        <i class="fas fa-shopping-cart"></i>\n        <p>Tu carrito está vacío</p>\n        <p>Agrega productos para comenzar</p>\n    </div>\n';
        const o = document.getElementById("carritoTotal");
        return void (o && (o.style.display = "none"))
    }
    const o = document.getElementById("carritoTotal");
    o && (o.style.display = "block");
    let e = "";
    carrito.forEach(( (t, o) => {
        e += `\n    <div class="carrito-item">\n        <div class="carrito-item-img">\n            <img src="${t.imagen}" alt="${t.nombre}" onerror="this.src='img/placeholder.jpg';">\n        </div>\n        <div class="carrito-item-details">\n            <div class="carrito-item-name">${t.nombre}</div>\n            <div class="carrito-item-price">$${formatearPrecio(t.precio)}</div>\n            <div class="carrito-item-cantidad">\n                <button class="cantidad-btn" onclick="cambiarCantidad(${o}, -1)">-</button>\n                <span class="cantidad-valor">${t.cantidad}</span>\n                <button class="cantidad-btn" onclick="cambiarCantidad(${o}, 1)">+</button>\n            </div>\n        </div>\n        <button class="carrito-item-remove" onclick="eliminarDelCarrito(${o})">×</button>\n    </div>\n`
    }
    )),
    console.log("HTML generado para el carrito:", e),
    t.innerHTML = e,
    calcularTotales()
}
if (document.addEventListener("DOMContentLoaded", (function() {
    actualizarContadorCarritoMovil();
    const t = document.getElementById("mobileCarritoIcon");
    t && t.addEventListener("click", (function(t) {
        t.preventDefault(),
        abrirCarrito()
    }
    ))
}
)),
document.addEventListener("DOMContentLoaded", (function() {

const overlay = document.getElementById('imageOverlay');
    const closeBtn = document.getElementById('closeOverlay');

    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            cerrarImagenCompleta();
        });
    }

    if (overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === this) {
                cerrarImagenCompleta();
            }
        });
    }

    // Cerrar con ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            cerrarImagenCompleta();
        }
    });


    const t = document.getElementById("mobileCarritoIcon");
    t && t.addEventListener("click", (function(t) {
        t.preventDefault();
        const o = document.getElementById("mobileCarritoContador");
        if (o) {
            const t = carrito.reduce(( (t, o) => t + o.cantidad), 0);
            o.textContent = t
        }
        abrirCarrito()
    }
    ))
}
)),
void 0 === carrito) {}
function calcularTotales() {
    const t = carrito.reduce(( (t, o) => t + o.precio * o.cantidad), 0)
      , o = t > 0 ? 12e3 : 0
      , e = t + o
      , r = document.getElementById("subtotal")
      , a = document.getElementById("envio")
      , n = document.getElementById("total");
        r.textContent = `$${formatearPrecio(t)}`;
        a.textContent = `$${formatearPrecio(o)}`;
        n.textContent = `$${formatearPrecio(e)}`;

}
function cambiarCantidad(t, o) {
    const e = carrito[t].cantidad + o;
    e > 0 ? (carrito[t].cantidad = e,
    actualizarContadorCarrito(),
    renderizarCarrito(),
    guardarCarrito()) : eliminarDelCarrito(t)
}
function eliminarDelCarrito(t) {
    carrito.splice(t, 1),
    actualizarContadorCarrito(),
    renderizarCarrito(),
    guardarCarrito()
}
function vaciarCarrito() {
    carrito = [],
    actualizarContadorCarrito(),
    renderizarCarrito(),
    guardarCarrito(),
    mostrarNotificacion("Carrito vaciado"),
    cerrarCarrito()
}
function finalizarCompra() {
    0 !== carrito.length ? (guardarCarrito(),
    localStorage.setItem("carritoCheckout", JSON.stringify(carrito)),
    mostrarNotificacion("¡Redirigiendo al checkout!"),
    window.location.href = "checkout.html") : mostrarNotificacion("El carrito está vacío")
}
function mostrarNotificacion(t) {
    const o = document.getElementById("toastNotification");
    o ? (o.textContent = t,
    o.style.display = "block",
    setTimeout(( () => {
        o.style.display = "none"
    }
    ), 3e3)) : console.log("Notificación:", t)
}
function abrirCarrito() {
    console.log("Abriendo el carrito...");
    const t = document.getElementById("carritoModal");
    t ? (renderizarCarrito(),
    t.style.display = "block",
    document.body.style.overflow = "hidden",
    console.log("Modal del carrito abierto")) : console.error("Elemento carritoModal no encontrado")
}
function cerrarCarrito() {
    const t = document.getElementById("carritoModal");
    t && (t.style.display = "none",
    document.body.style.overflow = "auto")
}
function actualizarPrecio() {
    const t = document.getElementById("precio")
      , o = document.getElementById("valorPrecio");
    if (!t || !o)
        return;
    const e = parseInt(t.value).toLocaleString("es-CO");
    o.textContent = `Precio: $${e} COP`
}
function toggleFavorito(t, o, e) {
    t.stopPropagation();
    let r = JSON.parse(localStorage.getItem("favoritos") || "[]");
    const a = r.findIndex((t => t.id === o && t.categoria === e))
      , n = -1 !== a
      , c = firebase.database().ref(`productos/${e}/${o}`);
    n ? (r.splice(a, 1),
    mostrarNotificacion("Eliminado de favoritos"),
    c.child("favoritos").transaction((function(t) {
        return (t || 0) > 0 ? t - 1 : 0
    }
    ))) : (r.push({
        id: o,
        categoria: e
    }),
    mostrarNotificacion("Añadido a favoritos"),
    c.child("favoritos").transaction((function(t) {
        return (t || 0) + 1
    }
    ))),
    localStorage.setItem("favoritos", JSON.stringify(r));
    const i = t.currentTarget
      , d = i.querySelector("i");
    n ? (i.classList.remove("favorito"),
    d.classList.remove("fas"),
    d.classList.add("far")) : (i.classList.add("favorito"),
    d.classList.remove("far"),
    d.classList.add("fas"))
}
function calcularTotales() {
    const subtotal = carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    const envio = subtotal > 0 ? 8000 : 0;
    const total = subtotal + envio;

    const subtotalElement = document.getElementById("subtotal");
    const envioElement = document.getElementById("envio");
    const totalElement = document.getElementById("total");

    // Aplicamos formatearPrecio() aquí
    if (subtotalElement) subtotalElement.textContent = `$${formatearPrecio(subtotal)}`;
    if (envioElement) envioElement.textContent = `$${formatearPrecio(envio)}`;
    if (totalElement) totalElement.textContent = `$${formatearPrecio(total)}`;
}
function cambiarCantidad(t, o) {
    const e = carrito[t].cantidad + o;
    e > 0 ? (carrito[t].cantidad = e,
    actualizarContadorCarrito(),
    renderizarCarrito(),
    guardarCarrito()) : eliminarDelCarrito(t)
}
function eliminarDelCarrito(t) {
    carrito.splice(t, 1),
    actualizarContadorCarrito(),
    renderizarCarrito(),
    guardarCarrito()
}
function vaciarCarrito() {
    carrito = [],
    actualizarContadorCarrito(),
    renderizarCarrito(),
    guardarCarrito(),
    mostrarNotificacion("Carrito vaciado"),
    cerrarCarrito()
}
function finalizarCompra() {
    0 !== carrito.length ? (guardarCarrito(),
    localStorage.setItem("carritoCheckout", JSON.stringify(carrito)),
    mostrarNotificacion("¡Redirigiendo al checkout!"),
    window.location.href = "checkout.html") : mostrarNotificacion("El carrito está vacío")
}
function mostrarNotificacion(t) {
    const o = document.getElementById("toastNotification");
    o ? (o.textContent = t,
    o.style.display = "block",
    setTimeout(( () => {
        o.style.display = "none"
    }
    ), 3e3)) : console.log("Notificación:", t)
}
function actualizarPrecio() {
    const t = document.getElementById("precio")
      , o = document.getElementById("valorPrecio");
    if (!t || !o)
        return;
    const e = parseInt(t.value).toLocaleString("es-CO");
    o.textContent = `Precio: $${e} COP`
}
function aplicarFiltro() {
    const t = document.getElementById("precio");
    if (!t)
        return;
    const o = parseInt(t.value);
    console.log(`Filtrando productos con precio hasta $${o} COP`);
    mostrarProductos(productosFiltrados.filter((t => parseInt(t.precio) <= o)));
    const e = document.getElementById("filtersModal");
    e && window.innerWidth < 768 && (e.style.display = "none")
}
function reiniciarFiltros() {
    const t = document.getElementById("precio");
    if (!t)
        return;
    const o = Math.max(...productosFiltrados.map((t => parseInt(t.precio))));
    t.value = o,
    actualizarPrecio(),
    mostrarProductos(productosFiltrados),
    console.log("Filtros reiniciados")
}
function ordenarPorFavoritos() {
    const t = document.getElementById("ordenFavoritos");
    if (!t)
        return;
    const o = t.value;
    let e = [...productosFiltrados];
    "favoritos" === o ? e.sort(( (t, o) => {
        const e = t.favoritos || 0;
        return (o.favoritos || 0) - e
    }
    )) : "precio-asc" === o ? e.sort(( (t, o) => t.precio - o.precio)) : "precio-desc" === o && e.sort(( (t, o) => o.precio - t.precio)),
    mostrarProductos(e)
}
document.addEventListener("DOMContentLoaded", (function() {
    cargarCarritoGuardado(),
    console.log("Carrito cargado desde localStorage:", carrito);
    const t = document.getElementById("carritoIcon");
    t && t.addEventListener("click", (function() {
        console.log("Icono del carrito clickeado"),
        abrirCarrito()
    }
    ))
}
)),
document.addEventListener("DOMContentLoaded", (function() {
    const t = document.getElementById("precio")
      , o = document.getElementById("aplicarFiltro")
      , e = document.getElementById("reiniciarFiltros");
    t && (database.ref("productos").once("value").then((o => {
        let e = 1e5;
        const r = o.val();
        if (r)
            for (const t in r)
                if (r.hasOwnProperty(t)) {
                    const o = r[t];
                    for (const t in o)
                        if (o.hasOwnProperty(t)) {
                            const r = o[t];
                            if (r && r.precio) {
                                const t = parseInt(r.precio);
                                !isNaN(t) && t > e && (e = t)
                            }
                        }
                }
        t.max = e,
        t.value = e,
        actualizarPrecio()
    }
    )),
    t.addEventListener("input", actualizarPrecio)),
    o && o.addEventListener("click", aplicarFiltro),
    e && e.addEventListener("click", reiniciarFiltros),
    actualizarPrecio()
}
)),
document.addEventListener("DOMContentLoaded", (function() {
    actualizarPrecio()
}
)),
document.addEventListener("DOMContentLoaded", (function() {
    console.log("DOM cargado, inicializando..."),
    cargarTodosProductos(),
    cargarCarritoGuardado(),
    searchIcon && searchIcon.addEventListener("click", openSearchModal),
    mobileSearchIcon && mobileSearchIcon.addEventListener("click", openSearchModal),
    closeSearchModal && closeSearchModal.addEventListener("click", (function() {
        searchModal.style.display = "none",
        document.body.style.overflow = "auto"
    }
    )),
    searchButton && searchButton.addEventListener("click", (function() {
        const t = searchInput.value.trim();
        if (t) {
            const o = buscarProductos(t);
            mostrarResultados(o)
        }
    }
    )),
    searchInput && searchInput.addEventListener("keypress", (function(t) {
        if ("Enter" === t.key) {
            const t = searchInput.value.trim();
            if (t) {
                const o = buscarProductos(t);
                mostrarResultados(o)
            }
        }
    }
    )),
    window.addEventListener("click", (function(t) {
        searchModal && t.target === searchModal && (searchModal.style.display = "none",
        document.body.style.overflow = "auto");
        const o = document.getElementById("carritoModal");
        o && t.target === o && cerrarCarrito();
        const e = document.getElementById("filtersModal");
        e && t.target === e && (e.style.display = "none")
    }
    ));
    const t = document.querySelector(".menu-toggle")
      , o = document.querySelector(".close-menu")
      , e = document.querySelector(".side-menu")
      , r = document.querySelector(".overlay");
    if (t && o && e && r) {
        function a() {
            e.classList.remove("active"),
            r.style.display = "none",
            document.body.style.overflow = "auto"
        }
        t.addEventListener("click", (function() {
            e.classList.add("active"),
            r.style.display = "block",
            document.body.style.overflow = "hidden"
        }
        )),
        o.addEventListener("click", a),
        r.addEventListener("click", a),
        document.querySelectorAll(".side-menu a").forEach((t => {
            t.addEventListener("click", a)
        }
        ))
    }
    "ontouchstart"in window && document.querySelectorAll(".toggle-submenu").forEach((t => {
        t.addEventListener("click", (function(t) {
            t.preventDefault();
            let o = this.nextElementSibling;
            document.querySelectorAll(".submenu").forEach((t => {
                t !== o && t.classList.remove("show")
            }
            )),
            o.classList.toggle("show")
        }
        ))
    }
    ));
    const n = document.getElementById("carritoIcon")
      , c = document.getElementById("closeCarrito")
      , i = document.getElementById("vaciarCarrito")
      , d = document.getElementById("finalizarCompra");
    n && n.addEventListener("click", abrirCarrito),
    c && c.addEventListener("click", cerrarCarrito),
    i && i.addEventListener("click", vaciarCarrito),
    d && d.addEventListener("click", finalizarCompra);
    const s = document.getElementById("showFilters");
    s && s.addEventListener("click", (function() {
        const t = document.getElementById("filtersModal");
        if (t) {
            t.style.display = "block";
            const o = document.querySelector(".categorias")
              , e = document.querySelector(".modal-body");
            o && e && (e.innerHTML = o.innerHTML)
        }
    }
    ));
    const l = document.querySelector(".close-modal");
    l && l.addEventListener("click", (function() {
        const t = document.getElementById("filtersModal");
        t && (t.style.display = "none")
    }
    )),
    cargarProductos("fresas")
}
)),
firebase.apps.length || firebase.initializeApp(firebaseConfig);
const urlParams = new URLSearchParams(window.location.search)
  , categoria = urlParams.get("categoria")
  , productoId = urlParams.get("id");
function cargarDetallesProducto() {
    productoId ? categoria ? firebase.database().ref(`productos/${categoria}/${productoId}`).once("value").then(handleProductSnapshot).catch(handleProductError) : firebase.database().ref("productos").once("value").then((t => {
        const o = t.val();
        let e = null
          , r = "";
        for (const t in o)
            if (o.hasOwnProperty(t) && o[t][productoId]) {
                e = o[t][productoId],
                r = t;
                break
            }
        e ? handleProductSnapshot({
            val: () => e,
            exists: () => !0
        }, r) : document.getElementById("detalleProducto").innerHTML = "<p>Producto no encontrado</p>"
    }
    )).catch(handleProductError) : document.getElementById("detalleProducto").innerHTML = "<p>Producto no encontrado</p>"
}
function cerrarImagenCompleta() {
    const overlay = document.getElementById('imageOverlay');
    
    if (overlay) {
        overlay.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
}

// Función modificada para cambiar imagen (tu función existente MEJORADA)
function cambiarImagen(imageSrc) {
    const imagenPrincipal = document.getElementById("imagenPrincipal");
    if (imagenPrincipal) {
        imagenPrincipal.src = imageSrc;
        // Actualizar también el alt si es necesario
        imagenPrincipal.alt = imagenPrincipal.alt; // Mantener el alt actual
    }
}
function seleccionarColor(t) {
    document.querySelectorAll(".color-option").forEach((t => t.classList.remove("selected"))),
    t.classList.add("selected")
}
function cargarCarritoGuardado() {
    const t = localStorage.getItem("carrito");
    t && (carrito = JSON.parse(t),
    actualizarContadorCarrito())
}
function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito))
}
function agregarAlCarrito(t, o, e, r, a) {
    const n = carrito.findIndex((o => o.id === t && o.categoria === a));
    -1 !== n ? carrito[n].cantidad += 1 : carrito.push({
        id: t,
        nombre: o,
        precio: e,
        imagen: r,
        categoria: a,
        cantidad: 1
    });
    const c = document.getElementById("carritoContador")
      , i = document.getElementById("mobileCarritoContador")
      , d = carrito.reduce(( (t, o) => t + o.cantidad), 0);
    c && (c.textContent = d),
    i && (i.textContent = d),
    localStorage.setItem("carrito", JSON.stringify(carrito)),
    mostrarNotificacion(`${o} AGREGADO AL CARRITO`),
    console.log("Producto agregado al carrito. Total actual:", d)
}
function actualizarContadorCarrito() {
    const t = document.getElementById("carritoContador");
    if (!t)
        return;
    const o = carrito.reduce(( (t, o) => t + o.cantidad), 0);
    t.textContent = o
}
function mostrarNotificacion(t) {
    let o = document.getElementById("toastNotification");
    o || (o = document.createElement("div"),
    o.id = "toastNotification",
    o.className = "toast-notification",
    document.body.appendChild(o)),
    o.textContent = t,
    o.style.display = "block",
    setTimeout(( () => {
        o.style.display = "none"
    }
    ), 3e3)
}
function buscarProductos(t) {
    return t ? (t = t.toLowerCase().trim(),
    todosProductos.filter((o => o.nombre && o.nombre.toLowerCase().includes(t)))) : []
}
function mostrarResultados(t) {
    productsContainer.innerHTML = "",
    0 === t.length ? (resultsCount.textContent = "No se encontraron productos",
    productsContainer.innerHTML = '<div class="no-results">No se encontraron productos que coincidan con tu búsqueda</div>') : (resultsCount.textContent = `Se encontraron ${t.length} productos`,
    t.forEach((t => {
        let o = t.precio;
        isNaN(o) || (o = parseInt(o).toLocaleString("es-CO")),
        productsContainer.innerHTML += `\n        <div class="product-card">\n            <img src="${t.imagen || "img/placeholder.jpg"}" alt="${t.nombre}" class="product-image">\n            <div class="product-info">\n                <div class="product-name">${t.nombre}</div>\n                <div class="product-price">$${o}</div>\n                <button class="product-button" onclick="irADetalles('${t.id}', '${t.categoria}')">Ver detalles</button>\n            </div>\n        </div>\n    `
    }
    )))
}
function irADetalles(t, o) {
    window.location.href = `detalles.html?id=${t}&categoria=${o}`
}
document.addEventListener("DOMContentLoaded", (function() {
    cargarCarritoGuardado()
}
)),
document.addEventListener("DOMContentLoaded", cargarDetallesProducto);
