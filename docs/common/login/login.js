// 1️⃣ ADMIN FIXO
const adminFixos = [
    {
        email: 'yvital@dtech.com',
        senha: 'admin@dtech',
        nome: 'Yuri Vital',
        cargo: 'Admin',
        fixo: true
    },
    {
        email: 'sramara@dtech.com',
        senha: 'admin@dtech',
        nome: 'Sophia Ramara',
        cargo: 'Admin',
        fixo: true
    },
    {
        email: 'gmarques@dtech.com',
        senha: 'admin@dtech',
        nome: 'Gustavo Marques',
        cargo: 'Admin',
        fixo: true
    },
];

const coletech = [
    {
        email: 'fchicout@dtech.com',
        senha: 'coletech@dtech',
        nome: 'Fábio Chicout',
        cargo: 'ColeTech',
        fixo: true
    }
];

// 2️⃣ PEGAR TODOS OS USUÁRIOS (Inclui fixos + storage)
function getUsuarios() {
    const dados = localStorage.getItem('usuarios');
    const usuariosStorage = dados ? JSON.parse(dados) : [];

    return [...adminFixos, ...usuariosStorage, ...coletech];
}

// 3️⃣ BUSCAR USUÁRIO (Corrigido para aceitar email OU emailEmpresa)
function buscarUsuario(emailDigitado) {
    const usuarios = getUsuarios();

    // Procura se o email digitado bate com 'email' OU 'emailEmpresa'
    return usuarios.find(u =>
        (u.email === emailDigitado) || (u.emailEmpresa === emailDigitado)
    );
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

    const emailInput = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;
    const lembrar = document.getElementById('lembrarLogin').checked;

    // Validações
    if (!emailInput || !senha) {
        mostrarMensagem('Preencha todos os campos!', 'erro');
        return;
    }

    const usuario = buscarUsuario(emailInput);

    if (!usuario) {
        mostrarMensagem('Usuário não encontrado!', 'erro');
        return;
    }

    if (usuario.senha !== senha) {
        mostrarMensagem('Senha incorreta!', 'erro');
        return;
    }

    const nomeExibicao = usuario.nome || usuario.razaoSocial;

    mostrarMensagem(`Bem-vindo(a), ${nomeExibicao}!`, 'sucesso');

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
                window.location.href = '../home/home-ini.html'; //alterar conforme a página certa estiver configurada
                break;
            case 'DescarTech':
            case 'ColeTech':
            case 'Parceiro':
            default:
                window.location.href = '../home/home-ini.html';
                break;
        }
    }, 1000);
});