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
    const t = document.getElementById("productos");
    t && (t.innerHTML = "<p>Cargando todos los productos...</p>");
    
    // Categorías de carrusel que queremos excluir
    const categoriasExcluidas = ['carrusel1', 'carrusel2', 'carrusel3'];
    
    firebase.database().ref("productos").once("value").then((snapshot => {
        let productos = [];
        
        snapshot.forEach((categoriaSnapshot => {
            const nombreCategoria = categoriaSnapshot.key;
            
            // Excluir las categorías de carrusel
            if (categoriasExcluidas.includes(nombreCategoria)) {
                console.log(`Excluyendo categoría: ${nombreCategoria}`);
                return; // Saltar esta categoría
            }
            
            categoriaSnapshot.forEach((productoSnapshot => {
                let producto = productoSnapshot.val();
                producto.id = productoSnapshot.key;
                producto.categoria = nombreCategoria;
                productos.push(producto);
            }));
        }));
        
        // Actualizar ambos arrays globales
        todosProductos = productos;
        productosFiltrados = productos; // ¡ESTO ES LO QUE FALTABA!
        categoriaActual = "todos"; // Marcar que estamos viendo todos los productos
        
        mostrarProductos(productos);
    })).catch((error => {
        console.error("Error al cargar los productos:", error);
        t && (t.innerHTML = "<p>Error al cargar los productos.</p>");
    }));
}

function buscarProductos(termino) {
    if (!termino) return [];
    
    termino = termino.toLowerCase().trim();
    const categoriasExcluidas = ['carrusel1', 'carrusel2', 'carrusel3'];
    
    return todosProductos.filter(producto => {
        // Excluir productos de categorías de carrusel
        if (categoriasExcluidas.includes(producto.categoria)) {
            return false;
        }
        
        return producto.nombre && producto.nombre.toLowerCase().includes(termino);
    });
}

const mobileCarritoIcon = document.getElementById("mobileCarritoIcon");
function mostrarResultados(t) {
    productsContainer.innerHTML = "";
    
    if (0 === t.length) {
        resultsCount.textContent = "No se encontraron productos";
        productsContainer.innerHTML = '<div class="no-results">No se encontraron productos que coincidan con tu búsqueda</div>';
        return;
    }
    
    resultsCount.textContent = `Se encontraron ${t.length} productos`;
    
    t.forEach((producto => {
        const precioFormateado = formatearPrecio(producto.precio);
        
        productsContainer.innerHTML += `
            <div class="product-card">
                <img src="${producto.imagen || "img/placeholder.jpg"}" alt="${producto.nombre}" class="product-image">
                <div class="product-info">
                    <div class="product-name">${producto.nombre}</div>
                    <div class="product-price">$${precioFormateado}</div>
                    <button class="product-button" onclick="window.location.href='detalles.html?id=${producto.id}&categoria=${producto.categoria}'">Ver detalles</button>
                </div>
            </div>
        `;
    }));
}
function openSearchModal(t) {
    t.preventDefault(),
    searchModal.style.display = "block",
    document.body.style.overflow = "hidden",
    searchInput.focus()
}
function cargarProductos(categoria) {
    // Verificar si la categoría es un carrusel
    const categoriasExcluidas = ['carrusel1', 'carrusel2', 'carrusel3'];
    
    if (categoriasExcluidas.includes(categoria)) {
        console.log(`Categoría ${categoria} excluida - no se cargarán productos`);
        const e = document.getElementById("productos");
        e && (e.innerHTML = "<p>Esta categoría no está disponible.</p>");
        return;
    }
    
    categoriaActual = categoria;
    const o = document.getElementById("categoriaActiva");
    o && (o.innerText = `Categoría: ${categoria.charAt(0).toUpperCase() + categoria.slice(1)}`);
    
    const e = document.getElementById("productos");
    e && (e.innerHTML = "<p>Cargando...</p>");
    
    firebase.database().ref("productos/" + categoria).once("value").then((snapshot => {
        productosFiltrados = [];
        
        if (snapshot.exists()) {
            snapshot.forEach((productoSnapshot => {
                let producto = productoSnapshot.val();
                producto.id = productoSnapshot.key;
                producto.categoria = categoria;
                productosFiltrados.push(producto);
            }));
            ordenarPorFavoritos();
        } else {
            e && (e.innerHTML = "<p>No hay productos en esta categoría.</p>");
        }
    })).catch((error => {
        console.error("Error al cargar productos:", error);
        e && (e.innerHTML = "<p>Error al cargar los productos.</p>");
    }));
}

function obtenerCategoriasValidas() {
    const categoriasExcluidas = ['carrusel1', 'carrusel2', 'carrusel3'];
    
    return firebase.database().ref("productos").once("value").then(snapshot => {
        const categorias = [];
        
        snapshot.forEach(categoriaSnapshot => {
            const nombreCategoria = categoriaSnapshot.key;
            
            if (!categoriasExcluidas.includes(nombreCategoria)) {
                categorias.push(nombreCategoria);
            }
        });
        
        return categorias;
    });
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
    
    t.forEach((producto => {
        let r = document.createElement("div");
        r.classList.add("producto"),
        r.setAttribute("data-precio", producto.precio);
        
        const a = e.some((fav => fav.id === producto.id && fav.categoria === producto.categoria))
          , n = `favoritos-contador-${producto.id}`;
        
        // Formatear el precio para mostrarlo
        const precioFormateado = formatearPrecio(producto.precio);
        
        // Usar la categoría del producto en lugar de categoriaActual
        const categoriaProducto = producto.categoria || categoriaActual;
        
        let c = `
            <div class="img-container" onclick="window.location.href='detalles.html?categoria=${categoriaProducto}&id=${producto.id}'">
                <img src="${producto.imagen}" alt="${producto.nombre}" class="img-normal" loading="lazy">
                <img src="${producto.imagen2 || producto.imagen}" alt="${producto.nombre}" class="img-hover" loading="lazy">
            </div>
            
            <!-- Iconos de compartir y favoritos -->
            <div class="producto-iconos">
                <button class="icon-btn" onclick="compartirProducto(event, '${producto.id}', '${producto.nombre}')">
                    <i class="fas fa-share"></i>
                </button>
                <button class="icon-btn ${a ? "favorito" : ""}" onclick="toggleFavorito(event, '${producto.id}', '${categoriaProducto}')">
                    <i class="${a ? "fas" : "far"} fa-heart"></i>
                    <span id="${n}" class="favoritos-count">${producto.favoritos || 0}</span>
                </button>
            </div>
            
            <h3 onclick="window.location.href='detalles.html?categoria=${categoriaProducto}&id=${producto.id}'">${producto.nombre}</h3>
            <p>$${precioFormateado}</p>
            <button class="comprar" onclick="agregarAlCarrito('${producto.id}', '${producto.nombre}', ${producto.precio}, '${producto.imagen}', '${categoriaProducto}')">Comprar</button>
        `;
        
        r.innerHTML = c,
        o.appendChild(r),
        escucharFavoritos(producto.id, categoriaProducto, n)
    }))
}

// Función opcional para verificar si una categoría es válida
function esCategoriaValida(categoria) {
    const categoriasExcluidas = ['carrusel1', 'carrusel2', 'carrusel3'];
    return !categoriasExcluidas.includes(categoria);
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
    
    // Usar el array correcto según el contexto
    const productosParaFiltrar = productosFiltrados.length > 0 ? productosFiltrados : todosProductos;
    mostrarProductos(productosParaFiltrar.filter((t => parseInt(t.precio) <= o)));
    
    const e = document.getElementById("filtersModal");
    e && window.innerWidth < 768 && (e.style.display = "none")
}
function reiniciarFiltros() {
    const t = document.getElementById("precio");
    if (!t)
        return;
    
    // Usar el array correcto según el contexto
    const productosParaFiltrar = productosFiltrados.length > 0 ? productosFiltrados : todosProductos;
    const o = Math.max(...productosParaFiltrar.map((t => parseInt(t.precio))));
    t.value = o,
    actualizarPrecio(),
    mostrarProductos(productosParaFiltrar),
    console.log("Filtros reiniciados")
}
function ordenarPorFavoritos() {
    const t = document.getElementById("ordenFavoritos");
    if (!t)
        return;
    const o = t.value;
    
    // Verificar que tenemos productos para ordenar
    if (productosFiltrados.length === 0) {
        console.log("No hay productos para ordenar");
        return;
    }
    
    let e = [...productosFiltrados];
    
    if ("favoritos" === o) {
        console.log("Ordenando por favoritos...");
        console.log("Productos antes del ordenamiento:", e.map(p => ({
            nombre: p.nombre,
            favoritos: p.favoritos || 0
        })));
        
        e.sort((a, b) => {
            const favoritosA = a.favoritos || 0;
            const favoritosB = b.favoritos || 0;
            console.log(`Comparando ${a.nombre} (${favoritosA}) con ${b.nombre} (${favoritosB})`);
            return favoritosB - favoritosA; // Mayor a menor
        });
        
        console.log("Productos después del ordenamiento:", e.map(p => ({
            nombre: p.nombre,
            favoritos: p.favoritos || 0
        })));
    } else if ("precio-asc" === o) {
        e.sort((a, b) => parseInt(a.precio) - parseInt(b.precio));
    } else if ("precio-desc" === o) {
        e.sort((a, b) => parseInt(b.precio) - parseInt(a.precio));
    }
    
    mostrarProductos(e);
}

// Función corregida para mobile
function ordenarPorFavoritos2(elemento) {
    const valorSeleccionado = elemento ? elemento.value : 'normal';
    
    console.log('Ordenando por:', valorSeleccionado);
    
    // Verificar que tenemos productos para ordenar
    if (productosFiltrados.length === 0) {
        console.log("No hay productos para ordenar en mobile");
        return;
    }
    
    let productosOrdenados = [...productosFiltrados];
    
    if (valorSeleccionado === "favoritos") {
        console.log("Mobile - Ordenando por favoritos...");
        console.log("Mobile - Productos antes del ordenamiento:", productosOrdenados.map(p => ({
            nombre: p.nombre,
            favoritos: p.favoritos || 0
        })));
        
        productosOrdenados.sort((a, b) => {
            const favoritosA = a.favoritos || 0;
            const favoritosB = b.favoritos || 0;
            console.log(`Mobile - Comparando ${a.nombre} (${favoritosA}) con ${b.nombre} (${favoritosB})`);
            return favoritosB - favoritosA; // Mayor a menor
        });
        
        console.log("Mobile - Productos después del ordenamiento:", productosOrdenados.map(p => ({
            nombre: p.nombre,
            favoritos: p.favoritos || 0
        })));
    } else if (valorSeleccionado === "precio-asc") {
        productosOrdenados.sort((a, b) => parseInt(a.precio) - parseInt(b.precio));
    } else if (valorSeleccionado === "precio-desc") {
        productosOrdenados.sort((a, b) => parseInt(b.precio) - parseInt(a.precio));
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
    cargarTodosProductos()
}
));