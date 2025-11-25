// 1️⃣ ADMIN FIXO
const adminFixos = [
    {
        email: '17252398@esuda.edu.br',
        senha: '123456',
        nome: 'Yuri Vital',
        cargo: 'Admin',
        fixo: true
    }
];

// 2️⃣ PEGAR TODOS OS USUÁRIOS (Inclui fixos + storage)
function getUsuarios() {
    const dados = localStorage.getItem('usuarios');
    const usuariosStorage = dados ? JSON.parse(dados) : [];

    return [...adminFixos, ...usuariosStorage];
}

// 3️⃣ BUSCAR USUÁRIO POR EMAIL
function buscarUsuario(email) {
    const usuarios = getUsuarios();

    return usuarios.find(u => u.email === email); //apanhei pra caralho
}

// 4️⃣ VERIFICAR SE TEM LOGIN SALVO
window.addEventListener('load', function () {
    const emailSalvo = localStorage.getItem('lembrar_email');
    const senhaSalva = localStorage.getItem('lembrar_senha');

    if (emailSalvo && senhaSalva) {
        document.getElementById('email').value = emailSalvo;
        document.getElementById('senha').value = senhaSalva;
        document.getElementById('lembrarLogin').checked = true;
    }
});

// 5️⃣ MOSTRAR MENSAGENS
function mostrarMensagem(texto, tipo) {
    const div = document.getElementById('mensagem');
    div.textContent = texto;

    if (tipo === 'sucesso') {
        div.className = 'mb-4 p-3 rounded-lg text-center text-sm bg-green-500/20 text-green-300 border border-green-500/50';
    } else {
        div.className = 'mb-4 p-3 rounded-lg text-center text-sm bg-red-500/20 text-red-300 border border-red-500/50';
    }

    div.classList.remove('hidden');
    setTimeout(() => div.classList.add('hidden'), 3000);
}

// 6️⃣ PROCESSAR LOGIN
document.getElementById('formLogin').addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;
    const lembrar = document.getElementById('lembrarLogin').checked;

    // Validações
    if (!email || !senha) {
        mostrarMensagem('Preencha todos os campos!', 'erro');
        return;
    }

    const usuario = buscarUsuario(email);

    if (!usuario) {
        mostrarMensagem('Usuário não encontrado!', 'erro');
        return;
    }

    if (usuario.senha !== senha) {
        mostrarMensagem('Senha incorreta!', 'erro');
        return;
    }

    mostrarMensagem(`Bem-vindo(a), ${usuario.nome}!`, 'sucesso');

    localStorage.setItem('usuario_logado', JSON.stringify(usuario));

    if (lembrar) {
        localStorage.setItem('lembrar_email', email);
        localStorage.setItem('lembrar_senha', senha);
    } else {
        localStorage.removeItem('lembrar_email');
        localStorage.removeItem('lembrar_senha');
    }

    setTimeout(() => {
        switch (usuario.cargo) {
            case 'Admin':
                window.location.href = '../../admin/admin-page.html'; //alterar conforme a página certa estiver configurada
                break;
            case 'DescarTech':
            case 'ColeTech':
            case 'Parceiro':
            default:
                window.location.href = '../home/home.html';
                break;
        }
    }, 1000);
});