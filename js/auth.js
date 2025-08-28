// Configuración de Firebase (la misma en todos lados)
if (typeof firebaseConfig === 'undefined') {
    const firebaseConfig = {
  apiKey: "AIzaSyBoRNOrpueYTJVeqxZwMtUsyAYArEHvgVU",
  authDomain: "morenita0ficial.firebaseapp.com",
  databaseURL: "https://morenita0ficial-default-rtdb.firebaseio.com",
  projectId: "morenita0ficial",
  storageBucket: "morenita0ficial.firebasestorage.app",
  messagingSenderId: "867231481408",
  appId: "1:867231481408:web:50512d7709d3b9d4e7a9a5"
};
    
    // Inicializar Firebase solo si no está inicializado
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
}

const auth = firebase.auth();

// Función para verificar sesión y redirigir
function checkAuth() {
    return new Promise((resolve) => {
        auth.onAuthStateChanged((user) => {
            if (user) {
                resolve(user);
            } else {
                resolve(null);
            }
        });
    });
}

// Función para mostrar mensaje de error y redirigir
function showUnauthorizedMessage() {
    alert('No intentes saltar las reglas. Por favor inicia sesión y verifica tu correo electrónico.');
    window.location.href = 'login.html';
}

// Manejar clic en icono de perfil
async function handleProfileClick() {
    const user = await checkAuth();
    if (user && user.emailVerified) {
        window.location.href = 'perfil.html';
    } else if (user && !user.emailVerified) {
        alert('Por favor verifica tu correo electrónico antes de acceder a tu perfil.');
        window.location.href = 'login.html';
    } else {
        window.location.href = 'login.html';
    }
}

// Protección inmediata para páginas protegidas (antes de que cargue el DOM)
const protectedPages = ['perfil.html'];
if (protectedPages.some(page => window.location.pathname.includes(page))) {
    // Ocultar contenido inmediatamente
    document.documentElement.style.visibility = 'hidden';
    
    // Verificar autenticación
    auth.onAuthStateChanged((user) => {
        if (!user) {
            // Usuario no autenticado
            showUnauthorizedMessage();
            return;
        }
        
        if (!user.emailVerified) {
            // Usuario autenticado pero no verificado
            showUnauthorizedMessage();
            return;
        }
        
        // Usuario verificado - mostrar contenido
        document.documentElement.style.visibility = 'visible';
    });
}

// Asignar evento al icono de perfil cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    const profileIcons = document.querySelectorAll('[href="perfil.html"], .fa-user');
    profileIcons.forEach(icon => {
        icon.addEventListener('click', function(e) {
            e.preventDefault();
            handleProfileClick();
        });
    });
});

// Función para cerrar sesión (usada en perfil.html)
function logout() {
    auth.signOut().then(() => {
        window.location.href = 'index.html';
    });
}