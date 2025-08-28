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




function formatearPrecio(precio) {
    // Si ya es un número, lo formateamos directamente
    if (typeof precio === 'number') {
        return precio.toLocaleString('es-CO');
    }
    
    // Si es un string, lo convertimos a número primero
    const numero = parseFloat(precio);
    return isNaN(numero) ? precio : numero.toLocaleString('es-CO');
}

const mobileCarritoIcon = document.getElementById("mobileCarritoIcon");
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
        productsContainer.innerHTML += `\n                <div class="product-card">\n                    <img src="${t.imagen || "img/placeholder.jpg"}" alt="${t.nombre}" class="product-image">\n                    <div class="product-info">\n                        <div class="product-name">${t.nombre}</div>\n                        <div class="product-price">$${o}</div>\n                        <button class="product-button">Ver detalles</button>\n                    </div>\n                </div>\n            `
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
function openSearchModal(t) {
    t.preventDefault(),
    searchModal.style.display = "block",
    document.body.style.overflow = "hidden",
    searchInput.focus()
}
function cargarProductos(t) {
    categoriaActual = t;
    const categoriaElement = document.getElementById("categoria-actual");
    
    // Actualiza el texto de la categoría (ej: "CATEGORÍA: DESAYUNOS")
    if (categoriaElement) {
        categoriaElement.textContent = ` ${t.toUpperCase()}`;
    }

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
function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito))
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
      , s = i.querySelector("i");
    n ? (i.classList.remove("favorito"),
    s.classList.remove("fas"),
    s.classList.add("far")) : (i.classList.add("favorito"),
    s.classList.remove("far"),
    s.classList.add("fas"))
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
    }),
    actualizarContadorCarrito(),
    renderizarCarrito(),
    guardarCarrito(),
    mostrarNotificacion(`${o} AGREGADO AL CARRITO`)
}
function actualizarContadorCarrito() {
    const t = document.getElementById("carritoContador")
      , o = document.getElementById("mobileCarritoContador")
      , e = carrito.reduce(( (t, o) => t + o.cantidad), 0);
    t && (t.textContent = e),
    o && (o.textContent = e)
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
    const t = document.getElementById("carritoModal");
    t && (t.style.display = "block",
    document.body.style.overflow = "hidden")
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

// Función ajustada que busca el elemento correcto
function ordenarPorFavoritos2() {
    // Buscar el elemento que realmente disparó el evento
    // Como ambos tienen el mismo ID, buscaremos todos los selectores
    const selectores = document.querySelectorAll('#ordenFavoritos');
    let valorSeleccionado = 'normal';
    
    // Encontrar cuál selector se cambió (el que tiene focus o el último que cambió)
    selectores.forEach(select => {
        if (select.value !== 'normal') {
            valorSeleccionado = select.value;
        }
    });
    
    // Si no encontramos valor específico, usar el del primer selector
    if (valorSeleccionado === 'normal') {
        valorSeleccionado = selectores[0]?.value || 'normal';
    }
    
    console.log('Ordenando por:', valorSeleccionado);
    
    let productosOrdenados = [...productosFiltrados];
    
    if (valorSeleccionado === "favoritos") {
        productosOrdenados.sort((a, b) => {
            const favoritosA = a.favoritos || 0;
            const favoritosB = b.favoritos || 0;
            return favoritosB - favoritosA;
        });
    } else if (valorSeleccionado === "precio-asc") {
        productosOrdenados.sort((a, b) => a.precio - b.precio);
    } else if (valorSeleccionado === "precio-desc") {
        productosOrdenados.sort((a, b) => b.precio - a.precio);
    }
    // Si es "normal", no se ordena
    
    mostrarProductos(productosOrdenados);
}

// Versión alternativa más simple: pasar el elemento directamente
function ordenarPorFavoritos2(elemento) {
    const valorSeleccionado = elemento ? elemento.value : 'normal';
    
    console.log('Ordenando por:', valorSeleccionado);
    
    let productosOrdenados = [...productosFiltrados];
    
    if (valorSeleccionado === "favoritos") {
        productosOrdenados.sort((a, b) => {
            const favoritosA = a.favoritos || 0;
            const favoritosB = b.favoritos || 0;
            return favoritosB - favoritosA;
        });
    }
    // Si es "normal", no se ordena
    
    mostrarProductos(productosOrdenados);
}

mobileCarritoIcon && mobileCarritoIcon.addEventListener("click", (function(t) {
    t.preventDefault(),
    abrirCarrito()
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
            mostrarResultados(buscarProductos(t))
        }
    }
    )),
    searchInput && searchInput.addEventListener("keypress", (function(t) {
        if ("Enter" === t.key) {
            const t = searchInput.value.trim();
            if (t) {
                mostrarResultados(buscarProductos(t))
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
      , s = document.getElementById("finalizarCompra");
    n && n.addEventListener("click", abrirCarrito),
    c && c.addEventListener("click", cerrarCarrito),
    i && i.addEventListener("click", vaciarCarrito),
    s && s.addEventListener("click", finalizarCompra);
    const d = document.getElementById("showFilters");
    d && d.addEventListener("click", (function() {
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
    cargarProductos("frutales")
}
));
