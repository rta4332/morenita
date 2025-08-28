/**
 * Script de Verificación de Admin - Versión Mejorada Sin Conflictos
 * Archivo: js/verificacion.js
 * 
 * Si es admin: deja ver el contenido
 * Si no es admin: redirige al index
 * Usa localStorage para no molestar cada vez
 */

(function() {
    'use strict';
    
    // Configuración del caché
    const ADMIN_CACHE_KEY = 'admin_verified_morenita';
    const CACHE_TIME = 5 * 60 * 1000; // 5 minutos para verificación silenciosa
    const FORCE_CHECK_KEY = 'admin_force_check';
    
    // Variables para controlar los listeners
    let devToolsBlocked = false;
    let devToolsListeners = [];
    let devToolsIntervals = [];
    let isKickingOut = false; // Evitar múltiples kicks
    
    // Función para verificar caché (solo para verificación silenciosa)
    function shouldSkipLoading(userEmail) {
        try {
            const cached = localStorage.getItem(ADMIN_CACHE_KEY);
            if (!cached) return false;
            
            const data = JSON.parse(cached);
            const now = Date.now();
            
            // Verificar que el email coincida
            if (data.email !== userEmail) {
                localStorage.removeItem(ADMIN_CACHE_KEY);
                return false;
            }
            
            // Solo salta loading si el caché es muy reciente (5 min)
            if (now - data.timestamp < CACHE_TIME && data.isAdmin) {
                return true;
            }
            
            return false;
        } catch (error) {
            localStorage.removeItem(ADMIN_CACHE_KEY);
            return false;
        }
    }
    
    // Función para guardar en caché que es admin
    function cacheAdminStatus(userEmail, isAdmin) {
        try {
            const data = {
                email: userEmail,
                isAdmin: isAdmin,
                timestamp: Date.now()
            };
            localStorage.setItem(ADMIN_CACHE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Error guardando caché:', error);
        }
    }
    
    // Función simple para redirigir al index
    function redirectToIndex() {
        window.location.href = 'index.html';
    }
    
    // Función para crear modal bloqueante
    function createBlockingModal() {
        // Crear overlay oscuro
        const overlay = document.createElement('div');
        overlay.id = 'admin-block-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.9);
            z-index: 999999;
            display: flex;
            justify-content: center;
            align-items: center;
            backdrop-filter: blur(5px);
            user-select: none;
        `;
        
        // Crear modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white;
            border-radius: 15px;
            padding: 40px;
            text-align: center;
            max-width: 450px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            animation: modalBounce 0.5s ease-out;
            user-select: none;
        `;
        
        // Agregar animación
        const style = document.createElement('style');
        style.textContent = `
            @keyframes modalBounce {
                0% { transform: scale(0.3); opacity: 0; }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); opacity: 1; }
            }
            
            .admin-deny-title {
                color: #dc3545;
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 20px;
                font-family: Arial, sans-serif;
            }
            
            .admin-deny-text {
                color: #666;
                font-size: 16px;
                line-height: 1.5;
                margin-bottom: 25px;
                font-family: Arial, sans-serif;
            }
            
            .admin-deny-btn {
                background: linear-gradient(45deg, #dc3545, #c82333);
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                transition: transform 0.2s;
                font-family: Arial, sans-serif;
            }
            
            .admin-deny-btn:hover {
                transform: scale(1.05);
            }
        `;
        document.head.appendChild(style);
        
        // Contenido del modal
        modal.innerHTML = `
            <div class="admin-deny-title">🚫 Acceso Denegado</div>
            <div class="admin-deny-text">
                No tienes permisos de administrador para acceder a esta página.<br><br>
                <strong>Razones posibles:</strong><br>
                • No eres administrador del sistema<br>
                • Tus permisos han sido revocados<br>
                • Tu sesión ha expirado<br><br>
                Contacta al administrador si crees que es un error.
            </div>
            <button class="admin-deny-btn" onclick="window.location.href='index.html'">
                Volver al Inicio
            </button>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Bloquear scroll del body
        document.body.style.overflow = 'hidden';
        
        // Prevenir clicks fuera del modal
        overlay.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (e.target === overlay) {
                modal.style.animation = 'modalBounce 0.3s ease-out';
            }
        });
        
        return overlay;
    }
    
    // Función mejorada para detectar DevTools - SIN DEBUGGER
    function detectDevTools() {
        try {
            // Método 1: Detectar por diferencia de tamaño de ventana
            const threshold = 160;
            if (window.outerHeight - window.innerHeight > threshold || 
                window.outerWidth - window.innerWidth > threshold) {
                return true;
            }
            
            // Método 2: Detectar usando performance timing (SIN debugger)
            let start = performance.now();
            // En lugar de debugger, usamos console.log con timing
            console.log('%c', 'color: transparent');
            let end = performance.now();
            if (end - start > 5) {
                return true;
            }
            
            // Método 3: Detectar con toString override
            let devtools_open = false;
            let element = new Image();
            element.__defineGetter__('id', function() {
                devtools_open = true;
            });
            
            console.log('%c', element);
            console.clear && console.clear();
            
            if (devtools_open) {
                return true;
            }
            
            // Método 4: Detectar por firebug
            if (window.Firebug && window.Firebug.chrome && window.Firebug.chrome.isInitialized) {
                return true;
            }
            
            return false;
        } catch (error) {
            // Si hay error, asumir que DevTools podría estar abierto
            return true;
        }
    }
    
    // Función mejorada para detectar DevTools con múltiples métodos - SIN DEBUGGER
    function advancedDevToolsDetection() {
        try {
            // Método de detección por console.log timing
            let isOpen = false;
            let element = new Image();
            Object.defineProperty(element, 'id', {
                get: function() {
                    isOpen = true;
                    return '';
                }
            });
            
            console.log(element);
            console.clear();
            
            if (isOpen) {
                return true;
            }
            
            // Método de detección por tamaño
            return detectDevTools();
        } catch (error) {
            return false;
        }
    }
    
    // Función para detectar extensiones de DevTools
    function detectDevToolExtensions() {
        try {
            // Detectar extensiones comunes de DevTools
            const extensions = [
                'chrome-extension://', 
                'moz-extension://',
                'safari-extension://',
                'edge-extension://'
            ];
            
            extensions.forEach(ext => {
                if (window.location.href.includes(ext)) {
                    return true;
                }
            });
            
            // Detectar React DevTools
            if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
                return true;
            }
            
            // Detectar Vue DevTools
            if (window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
                return true;
            }
            
            // Detectar otras herramientas
            if (window.devtools || window.__devtoolsFormatters) {
                return true;
            }
            
            return false;
        } catch (error) {
            return false;
        }
    }
    
    // Función para limpiar bloqueos de DevTools (para admins)
    function removeDevToolsBlocking() {
        // Remover todos los event listeners
        devToolsListeners.forEach(listener => {
            document.removeEventListener(listener.type, listener.func);
        });
        devToolsListeners = [];
        
        // Limpiar todos los intervals
        devToolsIntervals.forEach(interval => {
            clearInterval(interval);
        });
        devToolsIntervals = [];
        
        // Restaurar funcionalidades
        document.body.style.userSelect = '';
        document.body.style.webkitUserSelect = '';
        document.body.style.msUserSelect = '';
        document.body.style.overflow = '';
        
        devToolsBlocked = false;
        isKickingOut = false;
        console.log('Restricciones de DevTools removidas para admin');
    }
    
    // Función para sacar inmediatamente al usuario - MEJORADA
    function kickOutUser() {
        // Evitar múltiples ejecuciones
        if (isKickingOut) return;
        isKickingOut = true;
        
        // Limpiar todos los intervals primero
        devToolsIntervals.forEach(interval => clearInterval(interval));
        devToolsIntervals = [];
        
        // Mostrar AMBOS: modal Y mensaje del navegador
        // Primero crear el modal
        if (!document.getElementById('admin-block-overlay')) {
            showAccessDenied();
        }
        
        // Después mostrar el alert del navegador (encima del modal)
        setTimeout(() => {
            alert('🚨 Herramientas de desarrollador detectadas!\n\n' +
                  'Esto incluye:\n' +
                  '• DevTools abierto en esta o otra pestaña\n' + 
                  '• Extensiones de desarrollador activas\n' +
                  '• Herramientas de inspección\n\n' +
                  'Serás redirigido por razones de seguridad.');
            
            // Después del alert, redirigir
            window.location.href = 'index.html';
        }, 100);
    }
    
    // Función para verificar constantemente si DevTools está abierto
    function continuousDevToolsCheck() {
        const checkInterval = setInterval(function() {
            // Solo verificar si NO es admin y no estamos ya expulsando
            if (devToolsBlocked && !isKickingOut) {
                try {
                    // Múltiples métodos de detección sin debugger
                    if (advancedDevToolsDetection() || detectDevToolExtensions()) {
                        kickOutUser();
                        return;
                    }
                    
                    // Detectar por timing de console.log
                    let before = performance.now();
                    console.log(new Image());
                    let after = performance.now();
                    
                    if (after - before > 10) {
                        kickOutUser();
                        return;
                    }
                    
                } catch (e) {
                    // Si hay error, asumir que DevTools está abierto
                    kickOutUser();
                }
            }
        }, 2000); // Verificar cada 2 segundos (menos agresivo)
        
        devToolsIntervals.push(checkInterval);
    }
    
    // Función para bloquear herramientas de desarrollador (SOLO para NO-admins)
    function blockDevTools() {
        if (devToolsBlocked) return; // Ya está bloqueado
        devToolsBlocked = true;
        
        // Detectar teclas (SOLO para no-admins)
        const keydownHandler = function(e) {
            // F12
            if (e.keyCode === 123) {
                e.preventDefault();
                e.stopPropagation();
                kickOutUser();
                return false;
            }
            
            // Ctrl+Shift+I (Chrome DevTools)
            if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
                e.preventDefault();
                e.stopPropagation();
                kickOutUser();
                return false;
            }
            
            // Ctrl+Shift+C (Inspect Element)
            if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
                e.preventDefault();
                e.stopPropagation();
                kickOutUser();
                return false;
            }
            
            // Ctrl+Shift+J (Console)
            if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
                e.preventDefault();
                e.stopPropagation();
                kickOutUser();
                return false;
            }
            
            // Ctrl+U (View Source)
            if (e.ctrlKey && e.keyCode === 85) {
                e.preventDefault();
                e.stopPropagation();
                kickOutUser();
                return false;
            }
            
            // F5 y Ctrl+R (refresh) - permitir solo estos
            if (e.keyCode === 116 || (e.ctrlKey && e.keyCode === 82)) {
                return true;
            }
        };
        
        // Detectar click derecho (SOLO para no-admins)
        const contextmenuHandler = function(e) {
            e.preventDefault();
            kickOutUser();
            return false;
        };
        
        // Agregar listeners
        document.addEventListener('keydown', keydownHandler);
        document.addEventListener('contextmenu', contextmenuHandler);
        
        // Guardar referencias para poder removerlos después
        devToolsListeners.push(
            { type: 'keydown', func: keydownHandler },
            { type: 'contextmenu', func: contextmenuHandler }
        );
        
        // Detectar apertura de DevTools por cambio de tamaño
        const sizeCheckInterval = setInterval(function() {
            if (!isKickingOut) {
                const threshold = 160;
                if (window.outerHeight - window.innerHeight > threshold || 
                    window.outerWidth - window.innerWidth > threshold) {
                    kickOutUser();
                }
            }
        }, 1000);
        
        devToolsIntervals.push(sizeCheckInterval);
        
        // Detectar console abierto
        const consoleCheckInterval = setInterval(function() {
            if (!isKickingOut) {
                try {
                    console.clear();
                    console.log('%cAcceso Denegado', 'color: red; font-size: 50px; font-weight: bold;');
                    
                    let element = new Image();
                    Object.defineProperty(element, 'id', {
                        get: function() {
                            if (!isKickingOut) {
                                kickOutUser();
                            }
                            return '';
                        }
                    });
                    console.log(element);
                } catch (error) {
                    // Si hay error al acceder a console, DevTools podría estar abierto
                    if (!isKickingOut) {
                        kickOutUser();
                    }
                }
            }
        }, 3000);
        
        devToolsIntervals.push(consoleCheckInterval);
        
        // Iniciar detección continua
        continuousDevToolsCheck();
        
        // Verificar al cargar la página si ya están abiertos los DevTools
        setTimeout(() => {
            if (!isKickingOut && advancedDevToolsDetection()) {
                kickOutUser();
            }
        }, 1000);
        
        // Verificación inicial más suave (sin la super agresiva)
        setTimeout(() => {
            if (!isKickingOut && (detectDevToolExtensions() || advancedDevToolsDetection())) {
                kickOutUser();
            }
        }, 2000);
    }
    
    // Función para mostrar modal de acceso denegado CON todas las protecciones
    function showAccessDeniedWithProtection() {
        // Primero verificar si DevTools ya está abierto
        if (advancedDevToolsDetection() || detectDevToolExtensions()) {
            kickOutUser();
            return;
        }
        
        // Mostrar el modal bloqueante
        showAccessDenied();
        
        // Activar TODAS las protecciones para no-admins
        blockDevTools();
    }
    
    // Función para mostrar modal de acceso denegado (solo visual)
    function showAccessDenied() {
        // Evitar crear múltiples modales
        if (document.getElementById('admin-block-overlay')) {
            return;
        }
        
        // Ocultar todo el contenido de la página
        const allElements = document.querySelectorAll('body > *');
        allElements.forEach(el => {
            if (el.id !== 'admin-block-overlay') {
                el.style.display = 'none';
            }
        });
        
        // Crear y mostrar modal bloqueante
        createBlockingModal();
        
        // Bloquear selección de texto
        document.body.style.userSelect = 'none';
        document.body.style.webkitUserSelect = 'none';
        document.body.style.msUserSelect = 'none';
        
        // Mensaje en consola
        console.clear();
        console.log('%cACCESO DENEGADO', 'color: red; font-size: 30px; font-weight: bold;');
        console.log('%cNo tienes permisos para estar aquí', 'color: red; font-size: 16px;');
    }

    // Función para verificar si es admin en la base de datos
    async function checkIfAdmin(userEmail, database) {
        try {
            const snapshot = await database.ref('mad').once('value');
            const admins = snapshot.val();
            
            if (!admins) return false;
            
            // Buscar el email en los administradores
            for (const adminKey in admins) {
                const admin = admins[adminKey];
                if (admin.email && admin.email.toLowerCase() === userEmail.toLowerCase()) {
                    return true;
                }
            }
            
            return false;
        } catch (error) {
            console.error('Error verificando admin:', error);
            return false;
        }
    }
    
    // Función principal de verificación
    async function verifyAdmin() {
        // Verificar que Firebase esté disponible
        if (typeof firebase === 'undefined') {
            console.error('Firebase no está cargado. Asegúrate de incluir los scripts de Firebase antes que este script.');
            return;
        }
        
        const auth = firebase.auth();
        const database = firebase.database();
        
        return new Promise((resolve) => {
            auth.onAuthStateChanged(async (user) => {
                if (!user) {
                    // No hay usuario autenticado, mostrar modal Y activar protecciones
                    console.log('Usuario no autenticado, mostrando modal...');
                    showAccessDeniedWithProtection();
                    return;
                }
                
                // Verificar si podemos hacer verificación silenciosa (sin mostrar loading)
                const skipLoading = shouldSkipLoading(user.email);
                
                // SIEMPRE verificar en la base de datos (seguridad primero)
                const isAdmin = await checkIfAdmin(user.email, database);
                
                if (isAdmin) {
                    // Es admin, guardar en caché y permitir acceso SIN restricciones
                    cacheAdminStatus(user.email, true);
                    console.log('Admin verificado desde BD:', user.email);
                    // Limpiar cualquier restricción previa si la había
                    removeDevToolsBlocking();
                    resolve(true);
                } else {
                    // No es admin, mostrar modal bloqueante CON restricciones Y verificar DevTools
                    localStorage.removeItem(ADMIN_CACHE_KEY);
                    console.log('Acceso denegado para:', user.email, '- Verificado en BD');
                    showAccessDeniedWithProtection();
                }
            });
        });
    }
    
    // Función para limpiar caché (útil para desarrollo)
    function clearAdminCache() {
        localStorage.removeItem(ADMIN_CACHE_KEY);
        localStorage.removeItem(FORCE_CHECK_KEY);
        console.log('Caché de admin limpiado');
    }
    
    // Función para forzar verificación en la próxima carga
    function forceAdminCheck() {
        localStorage.setItem(FORCE_CHECK_KEY, 'true');
        console.log('Próxima verificación será forzada desde la base de datos');
    }
    
    // Función para verificar admin ahora (sin caché)
    function recheckAdminNow() {
        localStorage.removeItem(ADMIN_CACHE_KEY);
        location.reload();
    }
    
    // Función para cerrar sesión
    function adminSignOut() {
        if (typeof firebase !== 'undefined' && firebase.auth) {
            localStorage.removeItem(ADMIN_CACHE_KEY);
            firebase.auth().signOut().then(() => {
                redirectToIndex();
            }).catch((error) => {
                console.error('Error cerrando sesión:', error);
                redirectToIndex();
            });
        } else {
            localStorage.removeItem(ADMIN_CACHE_KEY);
            redirectToIndex();
        }
    }
    
    // Función para inicializar cuando esté todo listo
    function initAdminVerification() {
        // Verificar que Firebase esté cargado
        if (typeof firebase === 'undefined') {
            console.log('Esperando a que Firebase se cargue...');
            setTimeout(initAdminVerification, 500);
            return;
        }
        
        // Inicializar Firebase si no está inicializado
        if (!firebase.apps.length) {
            // Solo inicializar si no hay apps de Firebase
            const adminFirebaseConfig = {
                apiKey: "AIzaSyBoRNOrpueYTJVeqxZwMtUsyAYArEHvgVU",
                authDomain: "morenita0ficial.firebaseapp.com",
                databaseURL: "https://morenita0ficial-default-rtdb.firebaseio.com",
                projectId: "morenita0ficial",
                storageBucket: "morenita0ficial.firebasestorage.app",
                messagingSenderId: "867231481408",
                appId: "1:867231481408:web:50512d7709d3b9d4e7a9a5"
            };
            firebase.initializeApp(adminFirebaseConfig);
        }
        
        // Ejecutar verificación
        verifyAdmin();
    }
    
    // Exponer funciones globales
    window.clearAdminCache = clearAdminCache;
    window.adminSignOut = adminSignOut;
    window.forceAdminCheck = forceAdminCheck;
    window.recheckAdminNow = recheckAdminNow;
    
    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAdminVerification);
    } else {
        initAdminVerification();
    }
    
})(); 