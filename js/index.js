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
    database.ref("productos").once("value").then((e => {
        const t = e.val();
        for (const e in t)
            if (t.hasOwnProperty(e)) {
                const o = t[e];
                for (const t in o)
                    if (o.hasOwnProperty(t)) {
                        const n = o[t];
                        n && n.nombre && todosProductos.push({
                            id: t,
                            nombre: n.nombre,
                            precio: n.precio || "0",
                            imagen: n.imagen || "img/placeholder.jpg",
                            categoria: e
                        })
                    }
            }
        console.log("Total de productos cargados para búsqueda:", todosProductos.length)
    }
    )).catch((e => {
        console.error("Error al cargar productos para búsqueda:", e),
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
const mobileCarritoIcon = document.getElementById("mobileCarritoIcon");
function buscarProductos(e) {
    return e ? (e = e.toLowerCase().trim(),
    todosProductos.filter((t => t.nombre && t.nombre.toLowerCase().includes(e)))) : []
}
function cargarBannerEspecial() {
    const e = firebase.database().ref("bannerespecial")
      , t = document.getElementById("banner-container");
    if (!t)
        return void console.error("No se encontró el contenedor del banner");
    t.innerHTML = "<p>Cargando banner...</p>";
    const o = window.innerWidth < 768;
    e.once("value").then((e => {
        if (!e.exists())
            return void (t.innerHTML = "<p>No hay banner disponible.</p>");
        const n = e.val();
        if (!1 === n.activo || "false" === n.active)
            return void (t.innerHTML = "");
        let a;
        a = o && n.celular ? n.celular : n.pc ? n.pc : n.imagen ? n.imagen : n,
        t.innerHTML = a ? `\n            <div class="banner-especial ${o ? "banner-mobile" : "banner-desktop"}">\n                <img src="${a}" alt="Banner Especial" class="img-responsive">\n                ${n.link ? `<a href="${n.link}" class="banner-link"></a>` : ""}\n            </div>\n        ` : "<p>No se encontró la imagen del banner.</p>"
    }
    )).catch((e => {
        console.error("Error al cargar el banner:", e),
        t.innerHTML = "<p>Error al cargar el banner.</p>"
    }
    ))
}
function actualizarBannerEnResize() {
    let e;
    window.addEventListener("resize", (function() {
        clearTimeout(e),
        e = setTimeout(cargarBannerEspecial, 200)
    }
    ))
}
function mostrarResultados(e) {
    productsContainer.innerHTML = "",
    0 === e.length ? (resultsCount.textContent = "No se encontraron productos",
    productsContainer.innerHTML = '<div class="no-results">No se encontraron productos que coincidan con tu búsqueda</div>') : (resultsCount.textContent = `Se encontraron ${e.length} productos`,
    e.forEach((e => {
        let t = e.precio;
        isNaN(t) || (t = parseInt(t).toLocaleString("es-CO")),
        productsContainer.innerHTML += `\n                <div class="product-card">\n                    <img src="${e.imagen || "img/placeholder.jpg"}" alt="${e.nombre}" class="product-image">\n                    <div class="product-info">\n                        <div class="product-name">${e.nombre}</div>\n                        <div class="product-price">$${t}</div>\n                        <button class="product-button">Ver detalles</button>\n                    </div>\n                </div>\n            `
    }
    )),
    document.querySelectorAll(".product-button").forEach(( (t, o) => {
        t.addEventListener("click", ( () => {
            console.log("Producto seleccionado:", e[o].nombre),
            window.location.href = `detalles.html?id=${e[o].id}&categoria=${e[o].categoria}`
        }
        ))
    }
    )))
}
function openSearchModal(e) {
    e.preventDefault(),
    searchModal.style.display = "block",
    document.body.style.overflow = "hidden",
    searchInput.focus()
}
function cargarProductos(e) {
    categoriaActual = e;
    const t = document.getElementById("categoriaActiva");
    t && (t.innerText = `Categoría: ${e.charAt(0).toUpperCase() + e.slice(1)}`);
    const o = document.getElementById("productos");
    o && (o.innerHTML = "<p>Cargando...</p>"),
    firebase.database().ref("productos/" + e).once("value").then((t => {
        productosFiltrados = [],
        t.exists() ? (t.forEach((t => {
            let o = t.val();
            o.id = t.key,
            o.categoria = e,
            productosFiltrados.push(o)
        }
        )),
        ordenarPorFavoritos()) : o && (o.innerHTML = "<p>No hay productos en esta categoría.</p>")
    }
    )).catch((e => {
        console.error("Error al cargar productos:", e),
        o && (o.innerHTML = "<p>Error al cargar los productos.</p>")
    }
    ))
}
function renderizarCarrito() {
    const t = document.getElementById("carritoItems");
    if (!t) return;
    
    if (0 === carrito.length) {
        t.innerHTML = `
            <div class="carrito-vacio">
                <i>🛒</i>
                <p>Tu carrito está vacío</p>
                <p>Agrega productos para comenzar</p>
            </div>
        `;
        const o = document.getElementById("carritoTotal");
        return void (o && (o.style.display = "none"))
    }
    
    const o = document.getElementById("carritoTotal");
    o && (o.style.display = "block");
    
    let e = "";
    carrito.forEach(( (t, o) => {
        // Formatear el precio para mostrarlo
        const precioFormateado = formatearPrecio(t.precio);
        
        e += `
            <div class="carrito-item">
                <div class="carrito-item-img">
                    <img src="${t.imagen}" alt="${t.nombre}">
                </div>
                <div class="carrito-item-details">
                    <div class="carrito-item-name">${t.nombre}</div>
                    <div class="carrito-item-price">$${precioFormateado}</div>
                    <div class="carrito-item-cantidad">
                        <button class="cantidad-btn" onclick="cambiarCantidad(${o}, -1)">-</button>
                        <span class="cantidad-valor">${t.cantidad}</span>
                        <button class="cantidad-btn" onclick="cambiarCantidad(${o}, 1)">+</button>
                    </div>
                </div>
                <button class="carrito-item-remove" onclick="eliminarDelCarrito(${o})">×</button>
            </div>
        `
    }));
    
    t.innerHTML = e;
    calcularTotales();
}
function calcularTotales() {
    const t = carrito.reduce(( (t, o) => t + o.precio * o.cantidad), 0)
      , o = t > 0 ? 8000 : 0
      , e = t + o
      , r = document.getElementById("subtotal")
      , a = document.getElementById("envio")
      , n = document.getElementById("total");
    
    r && (r.textContent = `$${formatearPrecio(t)}`),
    a && (a.textContent = `$${formatearPrecio(o)}`),
    n && (n.textContent = `$${formatearPrecio(e)}`)
}

function formatearPrecio(precio) {
    // Si ya es un número, lo formateamos directamente
    if (typeof precio === 'number') {
        return precio.toLocaleString('es-CO');
    }
    
    // Si es un string, lo convertimos a número primero
    const numero = parseFloat(precio);
    return isNaN(numero) ? precio : numero.toLocaleString('es-CO');
}
function mostrarProductos(t) {
    const o = document.getElementById("productos");
    if (!o) return;
    
    o.innerHTML = "";
    let e = JSON.parse(localStorage.getItem("favoritos") || "[]");
    
    t.forEach((t => {
        let r = document.createElement("div");
        r.classList.add("producto"),
        r.setAttribute("data-precio", t.precio);
        
        const a = e.some((o => o.id === t.id && o.categoria === t.categoria))
          , n = `favoritos-contador-${t.id}`;
        
        // Formatear el precio para mostrarlo
        const precioFormateado = formatearPrecio(t.precio);
        
        let c = `
            <div class="img-container" onclick="window.location.href='detalles.html?categoria=${categoriaActual}&id=${t.id}'">
                <img src="${t.imagen}" alt="${t.nombre}" class="img-normal" loading="lazy">
                <img src="${t.imagen2 || t.imagen}" alt="${t.nombre}" class="img-hover" loading="lazy">
            </div>
            
            <!-- Iconos de compartir y favoritos -->
            <div class="producto-iconos">
                <button class="icon-btn" onclick="compartirProducto(event, '${t.id}', '${t.nombre}')">
                    <i class="fas fa-share"></i>
                </button>
                <button class="icon-btn ${a ? "favorito" : ""}" onclick="toggleFavorito(event, '${t.id}', '${categoriaActual}')">
                    <i class="${a ? "fas" : "far"} fa-heart"></i>
                    <span id="${n}" class="favoritos-count">${t.favoritos || 0}</span>
                </button>
            </div>
            
            <h3 onclick="window.location.href='detalles.html?categoria=${categoriaActual}&id=${t.id}'">${t.nombre}</h3>
            <p>$${precioFormateado}</p>
            <button class="comprar" onclick="agregarAlCarrito('${t.id}', '${t.nombre}', ${t.precio}, '${t.imagen}', '${categoriaActual}')">Comprar</button>
        `;
        
        r.innerHTML = c,
        o.appendChild(r),
        escucharFavoritos(t.id, t.categoria, n)
    }))
}
function escucharFavoritos(e, t, o) {
    firebase.database().ref(`productos/${t}/${e}/favoritos`).on("value", (e => {
        const t = e.val() || 0
          , n = document.getElementById(o);
        n && (n.textContent = t)
    }
    ))
}
function cargarCarritoGuardado() {
    const e = localStorage.getItem("carrito");
    e && (carrito = JSON.parse(e),
    actualizarContadorCarrito(),
    renderizarCarrito())
}
function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito))
}
function compartirProducto(e, t, o) {
    if (e.stopPropagation(),
    navigator.share)
        navigator.share({
            title: o,
            text: `¡Mira este producto: ${o}!`,
            url: `${window.location.origin}/detalles.html?categoria=${categoriaActual}&id=${t}`
        }).then(( () => mostrarNotificacion("Producto compartido"))).catch((e => console.log("Error al compartir:", e)));
    else {
        const e = `${window.location.origin}/detalles.html?categoria=${categoriaActual}&id=${t}`;
        navigator.clipboard.writeText(e).then(( () => mostrarNotificacion("Enlace copiado al portapapeles"))).catch((e => console.error("No se pudo copiar: ", e)))
    }
}
function toggleFavorito(e, t, o) {
    e.stopPropagation();
    let n = JSON.parse(localStorage.getItem("favoritos") || "[]");
    const a = n.findIndex((e => e.id === t && e.categoria === o))
      , r = -1 !== a
      , i = firebase.database().ref(`productos/${o}/${t}`);
    r ? (n.splice(a, 1),
    mostrarNotificacion("Eliminado de favoritos"),
    i.child("favoritos").transaction((function(e) {
        return (e || 0) > 0 ? e - 1 : 0
    }
    ))) : (n.push({
        id: t,
        categoria: o
    }),
    mostrarNotificacion("Añadido a favoritos"),
    i.child("favoritos").transaction((function(e) {
        return (e || 0) + 1
    }
    ))),
    localStorage.setItem("favoritos", JSON.stringify(n));
    const s = e.currentTarget
      , c = s.querySelector("i");
    r ? (s.classList.remove("favorito"),
    c.classList.remove("fas"),
    c.classList.add("far")) : (s.classList.add("favorito"),
    c.classList.remove("far"),
    c.classList.add("fas"))
}
function agregarAlCarrito(e, t, o, n, a) {
    const r = carrito.findIndex((t => t.id === e && t.categoria === a));
    -1 !== r ? carrito[r].cantidad += 1 : carrito.push({
        id: e,
        nombre: t,
        precio: o,
        imagen: n,
        categoria: a,
        cantidad: 1
    }),
    actualizarContadorCarrito(),
    renderizarCarrito(),
    guardarCarrito(),
    mostrarNotificacion(`${t} AGREGADO AL CARRITO`)
}
function actualizarContadorCarrito() {
    const e = document.getElementById("carritoContador")
      , t = document.getElementById("mobileCarritoContador")
      , o = carrito.reduce(( (e, t) => e + t.cantidad), 0);
    e && (e.textContent = o),
    t && (t.textContent = o)
}

function cambiarCantidad(e, t) {
    const o = carrito[e].cantidad + t;
    o > 0 ? (carrito[e].cantidad = o,
    actualizarContadorCarrito(),
    renderizarCarrito(),
    guardarCarrito()) : eliminarDelCarrito(e)
}
function eliminarDelCarrito(e) {
    carrito.splice(e, 1),
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
function mostrarNotificacion(e) {
    const t = document.getElementById("toastNotification");
    t ? (t.textContent = e,
    t.style.display = "block",
    setTimeout(( () => {
        t.style.display = "none"
    }
    ), 3e3)) : console.log("Notificación:", e)
}
function abrirCarrito() {
    const e = document.getElementById("carritoModal");
    e && (e.style.display = "block",
    document.body.style.overflow = "hidden")
}
function cerrarCarrito() {
    const e = document.getElementById("carritoModal");
    e && (e.style.display = "none",
    document.body.style.overflow = "auto")
}
function actualizarPrecio() {
    const e = document.getElementById("precio")
      , t = document.getElementById("valorPrecio");
    if (!e || !t)
        return;
    const o = parseInt(e.value).toLocaleString("es-CO");
    t.textContent = `Precio: $${o} COP`
}
function aplicarFiltro() {
    const e = document.getElementById("precio");
    if (!e)
        return;
    const t = parseInt(e.value);
    console.log(`Filtrando productos con precio hasta $${t} COP`);
    mostrarProductos(productosFiltrados.filter((e => parseInt(e.precio) <= t)));
    const o = document.getElementById("filtersModal");
    o && window.innerWidth < 768 && (o.style.display = "none")
}
function reiniciarFiltros() {
    const e = document.getElementById("precio");
    if (!e)
        return;
    const t = Math.max(...productosFiltrados.map((e => parseInt(e.precio))));
    e.value = t,
    actualizarPrecio(),
    mostrarProductos(productosFiltrados),
    console.log("Filtros reiniciados")
}
function ordenarPorFavoritos() {
    const e = document.getElementById("ordenFavoritos");
    if (!e)
        return;
    const t = e.value;
    let o = [...productosFiltrados];
    "favoritos" === t ? o.sort(( (e, t) => {
        const o = e.favoritos || 0;
        return (t.favoritos || 0) - o
    }
    )) : "precio-asc" === t ? o.sort(( (e, t) => e.precio - t.precio)) : "precio-desc" === t && o.sort(( (e, t) => t.precio - e.precio)),
    mostrarProductos(o)
}
mobileCarritoIcon && mobileCarritoIcon.addEventListener("click", (function(e) {
    e.preventDefault(),
    abrirCarrito()
}
)),
document.addEventListener("DOMContentLoaded", (function() {
    cargarBannerEspecial(),
    actualizarBannerEnResize()
}
)),
document.addEventListener("DOMContentLoaded", (function() {
    const e = document.getElementById("precio")
      , t = document.getElementById("aplicarFiltro")
      , o = document.getElementById("reiniciarFiltros");
    e && (database.ref("productos").once("value").then((t => {
        let o = 1e5;
        const n = t.val();
        if (n)
            for (const e in n)
                if (n.hasOwnProperty(e)) {
                    const t = n[e];
                    for (const e in t)
                        if (t.hasOwnProperty(e)) {
                            const n = t[e];
                            if (n && n.precio) {
                                const e = parseInt(n.precio);
                                !isNaN(e) && e > o && (o = e)
                            }
                        }
                }
        e.max = o,
        e.value = o,
        actualizarPrecio()
    }
    )),
    e.addEventListener("input", actualizarPrecio)),
    t && t.addEventListener("click", aplicarFiltro),
    o && o.addEventListener("click", reiniciarFiltros),
    actualizarPrecio()
}
)),
document.addEventListener("DOMContentLoaded", (function() {
    actualizarPrecio()
}
));
class Carousel {
    constructor(e, t) {
        this.container = document.getElementById(e),
        this.dbPath = t,
        this.currentSlide = 0,
        this.images = [],
        this.autoplayInterval = null,
        this.init()
    }
    async init() {
        try {
            const e = await firebase.database().ref(this.dbPath).once("value");
            if (this.images = e.val() || [],
            0 === this.images.length)
                return void console.warn(`No se encontraron imágenes en ${this.dbPath}`);
            this.renderCarousel(),
            this.addEventListeners(),
            this.updateIndicators(),
            this.startAutoplay()
        } catch (e) {
            console.error(`Error cargando imágenes de ${this.dbPath}:`, e)
        }
    }
    renderCarousel() {
        if (!this.container)
            return;
        const e = this.container.querySelector(".carousel-inner")
          , t = this.container.querySelector(".dots-container");
        e.innerHTML = this.images.map((e => `\n    <div class="slide">\n        ${e.link ? `<a href="${e.link}" class="carousel-link">` : ""}\n        <img src="${e.url}" alt="${e.alt || "Imagen"}" onerror="this.onerror=null; this.src='placeholder.jpg';">\n        ${e.link ? "</a>" : ""}\n    </div>\n`)).join(""),
        t.innerHTML = this.images.map(( (e, t) => `\n    <div class="dot" data-index="${t}">${t + 1}</div>\n`)).join(""),
        this.container.querySelectorAll(".dot").forEach((e => {
            e.addEventListener("click", ( () => this.goToSlide(parseInt(e.dataset.index))))
        }
        ))
    }
    addEventListeners() {
        if (!this.container)
            return;
        const e = this.container.querySelector(".prev")
          , t = this.container.querySelector(".next");
        e && e.addEventListener("click", ( () => this.prevSlide())),
        t && t.addEventListener("click", ( () => this.nextSlide())),
        this.container.addEventListener("mouseenter", ( () => this.stopAutoplay())),
        this.container.addEventListener("mouseleave", ( () => this.startAutoplay())),
        this.container.addEventListener("touchstart", ( () => this.stopAutoplay()), {
            passive: !0
        }),
        this.container.addEventListener("touchend", ( () => this.startAutoplay()), {
            passive: !0
        })
    }
    startAutoplay() {
        this.stopAutoplay(),
        this.autoplayInterval = setInterval(( () => this.nextSlide()), 2e3)
    }
    stopAutoplay() {
        this.autoplayInterval && (clearInterval(this.autoplayInterval),
        this.autoplayInterval = null)
    }
    nextSlide() {
        this.goToSlide(this.currentSlide + 1)
    }
    prevSlide() {
        this.goToSlide(this.currentSlide - 1)
    }
    goToSlide(e) {
        if (!this.container || 0 === this.images.length)
            return;
        const t = this.images.length;
        this.currentSlide = (e + t) % t;
        const o = this.container.querySelector(".carousel-inner");
        o && (o.style.transform = `translateX(-${100 * this.currentSlide}%)`),
        this.updateIndicators()
    }
    updateIndicators() {
        this.container && this.container.querySelectorAll(".dot").forEach(( (e, t) => {
            e.classList.toggle("active", t === this.currentSlide)
        }
        ))
    }
}
document.addEventListener("DOMContentLoaded", ( () => {
    new Carousel("desktopCarousel","carrusel/desktop"),
    new Carousel("mobileCarousel","carrusel/mobile")
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
        const e = searchInput.value.trim();
        if (e) {
            mostrarResultados(buscarProductos(e))
        }
    }
    )),
    searchInput && searchInput.addEventListener("keypress", (function(e) {
        if ("Enter" === e.key) {
            const e = searchInput.value.trim();
            if (e) {
                mostrarResultados(buscarProductos(e))
            }
        }
    }
    )),
    window.addEventListener("click", (function(e) {
        searchModal && e.target === searchModal && (searchModal.style.display = "none",
        document.body.style.overflow = "auto");
        const t = document.getElementById("carritoModal");
        t && e.target === t && cerrarCarrito();
        const o = document.getElementById("filtersModal");
        o && e.target === o && (o.style.display = "none")
    }
    ));
    const e = document.querySelector(".menu-toggle")
      , t = document.querySelector(".close-menu")
      , o = document.querySelector(".side-menu")
      , n = document.querySelector(".overlay");
    if (e && t && o && n) {
        function a() {
            o.classList.remove("active"),
            n.style.display = "none",
            document.body.style.overflow = "auto"
        }
        e.addEventListener("click", (function() {
            o.classList.add("active"),
            n.style.display = "block",
            document.body.style.overflow = "hidden"
        }
        )),
        t.addEventListener("click", a),
        n.addEventListener("click", a),
        document.querySelectorAll(".side-menu a").forEach((e => {
            e.addEventListener("click", a)
        }
        ))
    }
    "ontouchstart"in window && document.querySelectorAll(".toggle-submenu").forEach((e => {
        e.addEventListener("click", (function(e) {
            e.preventDefault();
            let t = this.nextElementSibling;
            document.querySelectorAll(".submenu").forEach((e => {
                e !== t && e.classList.remove("show")
            }
            )),
            t.classList.toggle("show")
        }
        ))
    }
    ));
    const r = document.getElementById("carritoIcon")
      , i = document.getElementById("closeCarrito")
      , s = document.getElementById("vaciarCarrito")
      , c = document.getElementById("finalizarCompra");
    r && r.addEventListener("click", abrirCarrito),
    i && i.addEventListener("click", cerrarCarrito),
    s && s.addEventListener("click", vaciarCarrito),
    c && c.addEventListener("click", finalizarCompra);
    const l = document.getElementById("showFilters");
    l && l.addEventListener("click", (function() {
        const e = document.getElementById("filtersModal");
        if (e) {
            e.style.display = "block";
            const t = document.querySelector(".categorias")
              , o = document.querySelector(".modal-body");
            t && o && (o.innerHTML = t.innerHTML)
        }
    }
    ));
    const d = document.querySelector(".close-modal");
    d && d.addEventListener("click", (function() {
        const e = document.getElementById("filtersModal");
        e && (e.style.display = "none")
    }
    )),
    cargarProductos("frutales")
}
)),
firebase.apps.length || firebase.initializeApp(firebaseConfig);

function formatearPrecio(precio) {
    if (typeof precio === 'number') {
        return precio.toLocaleString('es-CO');
    }
    const numero = parseFloat(precio);
    return isNaN(numero) ? precio : numero.toLocaleString('es-CO');
}
class Carrusel {
    constructor(e) {
        this.id = e;
        this.carruselContainer = document.getElementById(`carrusel${e}_container`);
        this.textoContainer = document.getElementById(`texto${e}_container`);
        this.carouselItems = document.getElementById(`carrusel${e}_items`);
        this.currentPosition = 0;
        this.items = [];
        this.touchStartX = 0;
        this.touchEndX = 0;
        
        // Mapeo de carruseles a categorías
        this.categoria = 
    e === 1 ? 'desayunos' :   
    e === 2 ? 'fresas' :       
    e === 3 ? 'arreglos' :     
    'desayunos';
        
        if (this.carruselContainer && this.textoContainer && this.carouselItems) {
            this.initialize();
        } else {
            console.error(`Elementos para carrusel${e} no encontrados`);
        }
    }

    initialize() {
        this.getConfigFromFirebase();
        this.initCarouselEvents();
        this.initTouchEvents();
        window.addEventListener("resize", () => {
            this.calculateItemWidth();
        });
    }

    getConfigFromFirebase() {
        firebase.database().ref(`configuracion/carrusel${this.id}`).on("value", (e) => {
            const config = e.val() || {};
            
            // Mostrar/ocultar carrusel según configuración
            this.carruselContainer.style.display = 
                config.mostrarCarrusel ? "block" : "none";
                
            // Mostrar/ocultar texto según configuración
            if (config.mostrarTexto) {
                this.textoContainer.style.display = "block";
                if (config.texto) {
                    this.textoContainer.innerHTML = config.texto;
                }
            } else {
                this.textoContainer.style.display = "none";
            }
            
            // Cargar productos si el carrusel está visible
            if (config.mostrarCarrusel) {
                this.loadProducts();
            }
        });
    }

    loadProducts() {
        firebase.database().ref(`productos/${this.categoria}`).on("value", (snapshot) => {
            const productos = [];
            
            snapshot.forEach((childSnapshot) => {
                const producto = childSnapshot.val();
                productos.push({
                    ...producto,
                    key: childSnapshot.key
                });
            });
            
            this.items = productos;
            this.carouselItems.innerHTML = "";
            
            productos.forEach((producto) => {
                const item = this.createProductElement(producto);
                this.carouselItems.appendChild(item);
            });
            
            this.currentPosition = 0;
            this.carouselItems.scrollLeft = 0;
            this.calculateItemWidth();
        });
    }

    createProductElement(producto) {
        const itemContainer = document.createElement("div");
        itemContainer.className = "carousel-item1";
        
        itemContainer.innerHTML = `
            <div class="product-card1">
                <div class="image-container1">
                    <img src="${producto.imagen}" alt="${producto.nombre}" 
                         class="product-image1 main-image1" loading="lazy">
                    <img src="${producto.imagen2 || producto.imagen}" alt="${producto.nombre}" 
                         class="product-image1 hover-image1" loading="lazy">
                </div>
                <div class="product-info1">
                    <h3 class="product-title1">${producto.nombre}</h3>
                    <p class="product-price1">$ ${formatearPrecio(producto.precio)}</p>
                    <button class="comprar-btn1">COMPRAR</button>
                </div>
            </div>
        `;

        // Añadir estilos hover si no existen
        if (!document.getElementById("hover-image-style")) {
            const style = document.createElement("style");
            style.id = "hover-image-style";
            style.textContent = `
                .image-container1 {
                    position: relative;
                    overflow: hidden;
                    width: 100%;
                    aspect-ratio: 1 / 1;
                }
                .product-image1 {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: opacity 0.9s ease;
                }
                .main-image1 {
                    position: relative;
                    z-index: 1;
                }
                .hover-image1 {
                    position: absolute;
                    top: 0;
                    left: 0;
                    z-index: 0;
                    opacity: 0;
                }
                .product-card1:hover .main-image1 {
                    opacity: 0;
                }
                .product-card1:hover .hover-image1 {
                    opacity: 1;
                }
            `;
            document.head.appendChild(style);
        }

        const productCard = itemContainer.querySelector(".product-card1");
        productCard.style.cursor = "pointer";
        
        // Click en la tarjeta (redirige a detalles)
        productCard.addEventListener("click", (event) => {
            if (!event.target.classList.contains("comprar-btn1")) {
                window.location.href = `detalles.html?categoria=${this.categoria}&id=${producto.key || ""}`;
            }
        });

        // Click en el botón COMPRAR (redirige a detalles)
        itemContainer.querySelector(".comprar-btn1").addEventListener("click", () => {
            window.location.href = `detalles.html?categoria=${this.categoria}&id=${producto.key || ""}`;
        });

        return itemContainer;
    }

    calculateItemWidth() {
        const items = this.carouselItems.querySelectorAll(".carousel-item1");
        if (items.length > 0) {
            const firstItem = items[0];
            const styles = window.getComputedStyle(firstItem);
            this.itemWidth = firstItem.offsetWidth + 
                             parseInt(styles.marginLeft) + 
                             parseInt(styles.marginRight);
        }
    }

    initCarouselEvents() {
        const prevBtn = document.querySelector(`.prev${this.id}`);
        const nextBtn = document.querySelector(`.next${this.id}`);
        
        if (prevBtn && nextBtn) {
            prevBtn.addEventListener("click", () => {
                this.moveCarousel("prev");
            });
            
            nextBtn.addEventListener("click", () => {
                this.moveCarousel("next");
            });
        }
    }

    initTouchEvents() {
        this.carouselItems.addEventListener("touchstart", (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        this.carouselItems.addEventListener("touchend", (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleTouchEnd();
        }, { passive: true });
    }

    handleTouchEnd() {
        const diffX = this.touchStartX - this.touchEndX;
        if (Math.abs(diffX) > 50) {
            diffX > 0 ? this.moveCarousel("next") : this.moveCarousel("prev");
        }
    }

    moveCarousel(direction) {
        const containerWidth = this.carouselItems.clientWidth;
        const itemsPerView = Math.floor(containerWidth / this.itemWidth);
        const scrollAmount = Math.min(itemsPerView, 2) * this.itemWidth;
        
        if (direction === "next") {
            this.currentPosition = Math.min(
                this.currentPosition + scrollAmount, 
                this.carouselItems.scrollWidth - containerWidth
            );
        } else {
            this.currentPosition = Math.max(0, this.currentPosition - scrollAmount);
        }
        
        this.carouselItems.scrollTo({
            left: this.currentPosition,
            behavior: "smooth"
        });
    }
}

function initializeCarousels() {
    const e = [1, 2, 3]
      , t = e.map((e => new Carrusel(e)));
    return console.log(`${e.length} carruseles inicializados`),
    t
}
document.addEventListener("DOMContentLoaded", ( () => {
    setTimeout(( () => {
        initializeCarousels()
    }
    ), 100)
}
));
const slidesData = [{
    title: "DESAYUNOS SORPRESA",
    description: "Comienza el día con amor. Detalles especiales que harán sonreír a esa persona especial.",
    image: "https://pub-2c0010c6ef454c3a8dd9b573f70a17f4.r2.dev/static-img/4.webp"
}, {
    title: "ARREGLOS FLORALES",
    description: "Flores que hablan por ti. Cada bouquet transmite tus sentimientos de la manera más hermosa.",
    image: "https://pub-2c0010c6ef454c3a8dd9b573f70a17f4.r2.dev/static-img/2.webp"
}, {
    title: "CHOCOLATES CON FRESAS",
    description: "La combinación perfecta. Dulzura y elegancia en cada bocado para conquistar corazones.",
    image: "https://pub-2c0010c6ef454c3a8dd9b573f70a17f4.r2.dev/static-img/3.webp"
}]
  , carousel = document.getElementById("carousel");
let interval, slides = [], dots = [], activeIndex = 0;
function createSlides() {
    let e = "";
    slidesData.forEach(( (t, o) => {
        e += `\n  <div class="slide4 ${0 === o ? "active4" : ""}">\n    <div class="image-container4">\n      <img src="${t.image}" alt="${t.title}">\n    </div>\n    <div class="content-container4">\n      <h2 class="main-title4">${t.title}</h2>\n      <p class="description4">${t.description}</p>\n   \n    </div>\n  </div>\n`
    }
    )),
    e += '<div class="dot-indicator4">';
    for (let t = 0; t < slidesData.length; t++)
        e += `<div class="dot4 ${0 === t ? "active4" : ""}" data-index="${t}"></div>`;
    e += "</div>",
    carousel.innerHTML = e,
    slides = document.querySelectorAll(".slide4"),
    dots = document.querySelectorAll(".dot4"),
    dots.forEach((e => {
        e.addEventListener("click", ( () => goToSlide(parseInt(e.getAttribute("data-index")))))
    }
    )),
    startAutoSlide()
}
function goToSlide(e) {
    slides[activeIndex].classList.remove("active4"),
    dots[activeIndex].classList.remove("active4"),
    activeIndex = e,
    slides[activeIndex].classList.add("active4"),
    dots[activeIndex].classList.add("active4")
}
function startAutoSlide() {
    clearInterval(interval),
    interval = setInterval(( () => {
        goToSlide((activeIndex + 1) % slides.length)
    }
    ), 3e3)
}
createSlides();
const testimonialData8 = [{
    name: "Cata Imbernon",
    type: "Box mujer",
    image: "https://randomuser.me/api/portraits/women/1.jpg",
    rating: 5,
    text: "Los mejores desayunos, muchísimas gracias por el servicio, todo llegó perfecto."
}, {
    name: "Manuela Forero",
    type: "Canasta",
    image: "https://randomuser.me/api/portraits/women/2.jpg",
    rating: 5,
    text: "Hermoso desayuno, me encantó, muchas graciaaas 😊"
}, {
    name: "Valeria R.",
    type: "Gold pro",
    image: "https://randomuser.me/api/portraits/women/3.jpg",
    rating: 5,
    text: "Estoy fuera del país y buscarlos a uds para hacerle llegar un detalle a mi mejor amiga fue la mejor decisión, ya que además de profesionales, llega tal cual como lo publican, mi amiga me contó que estuvo delicioso y divino. Muchas gracias ya tienen una cliente permanente. 🌸"
}, {
    name: "Carlos Mendoza",
    type: "Box especial",
    image: "https://randomuser.me/api/portraits/men/4.jpg",
    rating: 5,
    text: "Excelente servicio y puntualidad. El desayuno superó mis expectativas, muy recomendado."
}, {
    name: "Laura Gómez",
    type: "Canasta premium",
    image: "https://randomuser.me/api/portraits/women/5.jpg",
    rating: 5,
    text: "Mi esposo quedó encantado con su desayuno de cumpleaños. Gracias por hacer de este día algo especial."
}, {
    name: "Miguel Ángel",
    type: "Box sorpresa",
    image: "https://randomuser.me/api/portraits/men/6.jpg",
    rating: 5,
    text: "Increíble desayuno y presentación. Todo estaba muy fresco y delicioso. Definitivamente repetiré."
}, {
    name: "Sofia Herrera",
    type: "Gold premium",
    image: "https://randomuser.me/api/portraits/women/7.jpg",
    rating: 5,
    text: "La sorpresa perfecta para mi madre. La calidad de los productos es excepcional y el servicio es impecable."
}, {
    name: "Javier Ruiz",
    type: "Box pareja",
    image: "https://randomuser.me/api/portraits/men/8.jpg",
    rating: 5,
    text: "Celebramos nuestro aniversario con su desayuno especial. Fue una experiencia maravillosa que nunca olvidaremos."
}];
function createStars8(e) {
    let t = "";
    for (let o = 0; o < e; o++)
        t += "★";
    return t
}
let currentIndex8 = 0
  , visibleSlides8 = 3
  , totalSlides8 = testimonialData8.length
  , isTransitioning8 = !1
  , autoSlideInterval8 = null
  , isDragging8 = !1
  , startPos8 = 0
  , currentTranslate8 = 0
  , prevTranslate8 = 0;
function createTestimonialSlide8(e, t, o=!1) {
    const n = document.createElement("div");
    return n.className = "testimonial-slide8 " + (o ? "clone8" : ""),
    n.setAttribute("data-index", t),
    n.innerHTML = `\n    <div class="testimonial-card8">\n        <div class="quote-mark8">"</div>\n        <div class="customer-info8">\n            <div class="customer-img8">\n                <img src="${e.image}" alt="${e.name}">\n            </div>\n            <div class="customer-details8">\n                <h4>${e.name}</h4>\n                <div class="rating8">${createStars8(e.rating)}</div>\n                <div class="customer-type8">${e.type}</div>\n            </div>\n        </div>\n        <div class="testimonial-text8">\n            ${e.text.replace(/😊/g, '<span class="emoji8">😊</span>').replace(/🌸/g, '<span class="flower-icon8">🌸</span>')}\n        </div>\n    </div>\n`,
    n
}
function initCarousel8() {
    const e = document.getElementById("testimonialsTrack8")
      , t = document.getElementById("carouselDots8");
    e.innerHTML = "",
    t.innerHTML = "",
    updateVisibleSlides8(),
    testimonialData8.forEach(( (o, n) => {
        const a = createTestimonialSlide8(o, n);
        e.appendChild(a);
        const r = document.createElement("div");
        r.className = "dot8",
        r.setAttribute("data-index", n),
        r.addEventListener("click", ( () => {
            isTransitioning8 || goToSlide8(n)
        }
        )),
        t.appendChild(r)
    }
    )),
    goToSlide8(0, !1),
    setupEventListeners8()
}
function setupEventListeners8() {
    const e = document.getElementById("testimonialsTrack8");
    e.addEventListener("mousedown", dragStart8),
    e.addEventListener("mouseup", dragEnd8),
    e.addEventListener("mouseleave", dragEnd8),
    e.addEventListener("mousemove", drag8),
    e.addEventListener("touchstart", dragStart8),
    e.addEventListener("touchend", dragEnd8),
    e.addEventListener("touchmove", drag8),
    window.addEventListener("resize", handleResize8)
}
function handleResize8() {
    const e = visibleSlides8;
    updateVisibleSlides8(),
    e !== visibleSlides8 && goToSlide8(currentIndex8, !1)
}
function updateVisibleSlides8() {
    visibleSlides8 = window.innerWidth < 768 ? 1 : window.innerWidth < 992 ? 2 : 3
}
function updateCarouselPosition8(e=!0) {
    const t = document.getElementById("testimonialsTrack8")
      , o = -currentIndex8 * (100 / visibleSlides8);
    t.style.transition = e ? "transform 0.8s ease-in-out" : "none",
    t.style.transform = `translateX(${o}%)`,
    updateActiveDot8()
}
function updateActiveDot8() {
    const e = document.querySelectorAll(".dot8")
      , t = currentIndex8 % totalSlides8;
    e.forEach(( (e, o) => {
        o === t ? e.classList.add("active8") : e.classList.remove("active8")
    }
    ))
}
function goToSlide8(e, t=!0) {
    currentIndex8 = e,
    currentIndex8 < 0 ? currentIndex8 = totalSlides8 - 1 : currentIndex8 >= totalSlides8 && (currentIndex8 = 0),
    updateCarouselPosition8(t)
}
function nextSlide8() {
    isTransitioning8 || (isTransitioning8 = !0,
    goToSlide8(currentIndex8 + 1),
    setTimeout(( () => {
        isTransitioning8 = !1
    }
    ), 800))
}
function prevSlide8() {
    isTransitioning8 || (isTransitioning8 = !0,
    goToSlide8(currentIndex8 - 1),
    setTimeout(( () => {
        isTransitioning8 = !1
    }
    ), 800))
}
function dragStart8(e) {
    isTransitioning8 || (isDragging8 = !0,
    startPos8 = getPositionX8(e),
    pauseAutoSlide8())
}
function dragEnd8() {
    if (!isDragging8)
        return;
    isDragging8 = !1;
    const e = currentTranslate8 - prevTranslate8;
    e < -50 ? nextSlide8() : e > 50 ? prevSlide8() : goToSlide8(currentIndex8),
    startAutoSlide8()
}
function drag8(e) {
    if (!isDragging8)
        return;
    const t = getPositionX8(e) - startPos8;
    currentTranslate8 = prevTranslate8 + t;
    const o = document.getElementById("testimonialsTrack8")
      , n = -currentIndex8 * (100 / visibleSlides8)
      , a = t / window.innerWidth * 100;
    o.style.transition = "none",
    o.style.transform = `translateX(${n + a}%)`
}
function getPositionX8(e) {
    return e.type.includes("mouse") ? e.pageX : e.touches[0].clientX
}
function startAutoSlide8() {
    pauseAutoSlide8(),
    autoSlideInterval8 = setInterval(( () => {
        nextSlide8()
    }
    ), 5e3)
}
function pauseAutoSlide8() {
    autoSlideInterval8 && (clearInterval(autoSlideInterval8),
    autoSlideInterval8 = null)
}
window.addEventListener("load", ( () => {
    initCarousel8(),
    startAutoSlide8()
}
));
const images12 = ["https://pub-2c0010c6ef454c3a8dd9b573f70a17f4.r2.dev/Sorprende-a-los-que-quieres-fotos/1.jpg", "https://pub-2c0010c6ef454c3a8dd9b573f70a17f4.r2.dev/Sorprende-a-los-que-quieres-fotos/10.jpg", "https://pub-2c0010c6ef454c3a8dd9b573f70a17f4.r2.dev/Sorprende-a-los-que-quieres-fotos/11.jpg", "https://pub-2c0010c6ef454c3a8dd9b573f70a17f4.r2.dev/Sorprende-a-los-que-quieres-fotos/12.jpg", "https://pub-2c0010c6ef454c3a8dd9b573f70a17f4.r2.dev/Sorprende-a-los-que-quieres-fotos/2.jpg", "https://pub-2c0010c6ef454c3a8dd9b573f70a17f4.r2.dev/Sorprende-a-los-que-quieres-fotos/3.jpg", "https://pub-2c0010c6ef454c3a8dd9b573f70a17f4.r2.dev/Sorprende-a-los-que-quieres-fotos/4.jpg", "https://pub-2c0010c6ef454c3a8dd9b573f70a17f4.r2.dev/Sorprende-a-los-que-quieres-fotos/5.jpg", "https://pub-2c0010c6ef454c3a8dd9b573f70a17f4.r2.dev/Sorprende-a-los-que-quieres-fotos/6.jpg", "https://pub-2c0010c6ef454c3a8dd9b573f70a17f4.r2.dev/Sorprende-a-los-que-quieres-fotos/7.jpg", "https://pub-2c0010c6ef454c3a8dd9b573f70a17f4.r2.dev/Sorprende-a-los-que-quieres-fotos/8.jpg", "https://pub-2c0010c6ef454c3a8dd9b573f70a17f4.r2.dev/Sorprende-a-los-que-quieres-fotos/9.jpg"]
  , carousel12 = document.getElementById("clientCarousel12")
  , dotsContainer12 = document.getElementById("dotsContainer12")
  , prevButton12 = document.querySelector(".prev12")
  , nextButton12 = document.querySelector(".next12");
let autoScrollInterval12, currentIndex12 = 0, isAutoScrolling12 = !0, itemsVisible12 = getVisibleItems12(), touchStartX12 = 0, touchEndX12 = 0;
function createCarouselItems12() {
    carousel12.innerHTML = "",
    dotsContainer12.innerHTML = "",
    images12.forEach(( (e, t) => {
        const o = document.createElement("div");
        o.className = "carousel-item12";
        const n = document.createElement("img");
        n.src = e,
        n.alt = `Cliente satisfecho ${t + 1}`,
        o.appendChild(n),
        carousel12.appendChild(o);
        const a = document.createElement("div");
        a.className = "dot12",
        0 === t && a.classList.add("active12"),
        a.addEventListener("click", ( () => {
            navigateTo12(t),
            resetAutoScroll12()
        }
        )),
        dotsContainer12.appendChild(a)
    }
    ))
}
function getVisibleItems12() {
    return window.innerWidth < 480 ? 1 : window.innerWidth < 768 ? 2 : 3
}
function navigateTo12(e) {
    e < 0 && (e = 0),
    e > images12.length - itemsVisible12 && (e = images12.length - itemsVisible12),
    currentIndex12 = e;
    const t = document.querySelector(".carousel-item12").offsetWidth + 15;
    carousel12.scrollLeft = e * t,
    document.querySelectorAll(".dot12").forEach(( (t, o) => {
        t.classList.toggle("active12", o === e)
    }
    ))
}
function startAutoScroll12() {
    isAutoScrolling12 = !0,
    clearInterval(autoScrollInterval12),
    autoScrollInterval12 = setInterval(( () => {
        isAutoScrolling12 && (currentIndex12 >= images12.length - itemsVisible12 ? navigateTo12(0) : navigateTo12(currentIndex12 + 1))
    }
    ), 1800)
}
function stopAutoScroll12() {
    isAutoScrolling12 = !1,
    clearInterval(autoScrollInterval12)
}
function resetAutoScroll12() {
    stopAutoScroll12(),
    startAutoScroll12()
}
function handleSwipe12() {
    const e = touchStartX12 - touchEndX12;
    Math.abs(e) > 50 && navigateTo12(e > 0 ? currentIndex12 + 1 : currentIndex12 - 1)
}
prevButton12.addEventListener("click", ( () => {
    navigateTo12(currentIndex12 - 1),
    resetAutoScroll12()
}
)),
nextButton12.addEventListener("click", ( () => {
    navigateTo12(currentIndex12 + 1),
    resetAutoScroll12()
}
)),
carousel12.addEventListener("touchstart", (e => {
    touchStartX12 = e.changedTouches[0].screenX,
    stopAutoScroll12()
}
), {
    passive: !0
}),
carousel12.addEventListener("touchend", (e => {
    touchEndX12 = e.changedTouches[0].screenX,
    handleSwipe12(),
    startAutoScroll12()
}
), {
    passive: !0
}),
carousel12.addEventListener("mouseenter", stopAutoScroll12),
carousel12.addEventListener("mouseleave", startAutoScroll12),
prevButton12.addEventListener("mouseenter", stopAutoScroll12),
prevButton12.addEventListener("mouseleave", startAutoScroll12),
nextButton12.addEventListener("mouseenter", stopAutoScroll12),
nextButton12.addEventListener("mouseleave", startAutoScroll12),
window.addEventListener("resize", ( () => {
    const e = getVisibleItems12();
    e !== itemsVisible12 && (itemsVisible12 = e,
    createCarouselItems12(),
    navigateTo12(0),
    resetAutoScroll12())
}
)),
createCarouselItems12(),
startAutoScroll12(),
document.addEventListener("visibilitychange", ( () => {
    "visible" === document.visibilityState ? startAutoScroll12() : stopAutoScroll12()
}
));
