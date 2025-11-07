// Auth functions
async function login(email, senha) {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, senha })
        });
        const data = await response.json();
        if (data.success) {
            window.location.href = '/home';
        } else {
            alert(data.message || 'Erro ao fazer login');
        }
    } catch (error) {
        console.error('Erro no login:', error);
        alert('Erro ao fazer login');
    }
}

async function register(userData) {
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        const data = await response.json();
        if (data.success) {
            window.location.href = '/login';
        } else {
            alert(data.message || 'Erro ao cadastrar');
        }
    } catch (error) {
        console.error('Erro no cadastro:', error);
        alert('Erro ao cadastrar');
    }
}

// CIAP functions
async function getGruposCiap() {
    try {
        const response = await fetch('/api/ciap/grupos');
        const raw = await response.json();
        // normalize: always return { success, data, message }
        const data = raw.data || { grupos: raw.grupos || raw };
        return { success: raw.success, data, message: raw.message };
    } catch (error) {
        console.error('Erro ao buscar grupos CIAP:', error);
        return { success: false, message: 'Erro ao buscar grupos' };
    }
}

async function getItensCiap(grupoId) {
    try {
        const response = await fetch(`/api/ciap/itens/${grupoId}`);
        const raw = await response.json();
        const data = raw.data || { itens: raw.itens || raw };
        return { success: raw.success, data, message: raw.message };
    } catch (error) {
        console.error('Erro ao buscar itens CIAP:', error);
        return { success: false, message: 'Erro ao buscar itens' };
    }
}

async function getDetalhesCiap(codigo) {
    try {
        const response = await fetch(`/api/ciap/detalhes/${codigo}`);
        const raw = await response.json();
        const data = raw.data || { detalhes: raw.detalhes || raw };
        return { success: raw.success, data, message: raw.message };
    } catch (error) {
        console.error('Erro ao buscar detalhes:', error);
        return { success: false, message: 'Erro ao buscar detalhes' };
    }
}

async function getSintomasPuros() {
    try {
        const response = await fetch('/api/ciap/sintomas');
        const raw = await response.json();
        const data = raw.data || { sintomas: raw.sintomas || raw };
        return { success: raw.success, data, message: raw.message };
    } catch (error) {
        console.error('Erro ao buscar sintomas:', error);
        return { success: false, message: 'Erro ao buscar sintomas' };
    }
}

async function verificarSintomas(sintomas) {
    try {
        const response = await fetch('/api/ciap/verificar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sintomas })
        });
        const raw = await response.json();
        const data = raw.data || { enfermidades: raw.enfermidades || raw };
        return { success: raw.success, data, message: raw.message };
    } catch (error) {
        console.error('Erro ao verificar sintomas:', error);
        return { success: false, message: 'Erro ao verificar sintomas' };
    }
}

// Emergency functions
async function getTelefonesUteis() {
    try {
        const response = await fetch('/api/emergencia/telefones');
        const raw = await response.json();
        const data = raw.data || { telefones: raw.telefones || raw };
        return { success: raw.success, data, message: raw.message };
    } catch (error) {
        console.error('Erro ao buscar telefones:', error);
        return { success: false, message: 'Erro ao buscar telefones úteis' };
    }
}

async function logout() {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (data.success) {
            window.location.href = '/login';
        } else {
            window.location.href = '/login';
        }
    } catch (err) {
        console.error('Erro no logout:', err);
        window.location.href = '/login';
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Login form
    const loginForm = document.querySelector('#loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.querySelector('#email').value;
            const senha = document.querySelector('#senha').value;
            await login(email, senha);
        });
    }

    // Register form
    const registerForm = document.querySelector('#registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(registerForm);
            const userData = Object.fromEntries(formData.entries());
            await register(userData);
        });
    }
});