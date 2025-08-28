// checkout-auth.js - Script modificado (OBLIGATORIO tener cuenta)
document.addEventListener('DOMContentLoaded', async function() {
    const user = await checkAuth();
    
    if (!user) {
        showStrictAuthModal(); // Modal sin opción de invitado
    }
});

function showStrictAuthModal() {
    const modalHTML = `
        <div id="auth-modal" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            font-family: 'Segoe UI', Roboto, sans-serif;
            backdrop-filter: blur(3px);
        ">
            <div style="
                background: #fff;
                padding: 40px;
                border-radius: 12px;
                width: 100%;
                max-width: 380px;
                text-align: center;
                box-shadow: 0 10px 25px rgba(0,0,0,0.08);
                border: 1px solid #e0e0e0;
                animation: fadeIn 0.3s ease-out;
            ">
                <div style="margin-bottom: 25px;">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 17C11.45 17 11 16.55 11 16V12C11 11.45 11.45 11 12 11C12.55 11 13 11.45 13 12V16C13 16.55 12.55 17 12 17ZM13 9H11V7H13V9Z" fill="#1976D2"/>
                    </svg>
                </div>
                
                <h3 style="
                    color: #2d3748;
                    font-size: 20px;
                    font-weight: 600;
                    margin-bottom: 15px;
                ">Acceso Requerido</h3>
                
                <p style="
                    color: #4a5568;
                    font-size: 15px;
                    line-height: 1.5;
                    margin-bottom: 30px;
                ">Para completar tu compra, necesitamos que inicies sesión o crees una cuenta.</p>
                
                <div style="display: grid; gap: 12px;">
                    <button id="go-to-login" style="
                        padding: 14px;
                        width: 100%;
                        background: #1976D2;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: 500;
                        font-size: 15px;
                        transition: background 0.2s;
                    ">Iniciar Sesión</button>
                    
                    <button id="go-to-register" style="
                        padding: 14px;
                        width: 100%;
                        background: white;
                        color: #1976D2;
                        border: 1px solid #1976D2;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: 500;
                        font-size: 15px;
                        transition: all 0.2s;
                    ">Crear Cuenta</button>
                </div>
            </div>
        </div>

        <style>
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            #go-to-login:hover { background: #1565C0 !important; }
            #go-to-register:hover { 
                background: #f5f9ff !important; 
                border-color: #1565C0 !important;
            }
        </style>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Eventos (igual que antes)
    document.getElementById('go-to-login').addEventListener('click', () => {
        window.location.href = 'login.html?redirect=checkout';
    });
    
    document.getElementById('go-to-register').addEventListener('click', () => {
        window.location.href = 'register.html?redirect=checkout';
    });
}