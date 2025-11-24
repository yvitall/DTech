// login.js

// Verifica se há login salvo ao carregar a página
window.addEventListener('load', function() {
    const loginSalvo = localStorage.getItem('loginSalvo');
    if (loginSalvo) {
        const dadosLogin = JSON.parse(loginSalvo);
        document.getElementById('emailLogin').value = dadosLogin.email;
        document.getElementById('senhaLogin').value = dadosLogin.senha;
        document.getElementById('lembrarSenha').checked = true;
    }
});

document.getElementById('formLogin').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Limpa mensagens anteriores
    document.getElementById('mensagem-erro').classList.add('hidden');
    document.getElementById('mensagem-sucesso').classList.add('hidden');
    
    // Pega os valores dos campos
    const email = document.getElementById('emailLogin').value.trim();
    const senha = document.getElementById('senhaLogin').value;
    const lembrarLogin = document.getElementById('lembrarSenha').checked;
    
    // Validações básicas
    if (!email || !senha) {
        mostrarErro('Por favor, preencha todos os campos');
        return;
    }
    
    // Busca os usuários cadastrados
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    
    if (usuarios.length === 0) {
        mostrarErro('Nenhum usuário cadastrado. Faça seu cadastro primeiro!');
        return;
    }
    
    // Procura o usuário
    const usuario = usuarios.find(user => user.email === email && user.senha === senha);
    
    if (!usuario) {
        mostrarErro('Email ou senha incorretos');
        return;
    }
    
    // Login bem-sucedido
    mostrarSucesso(`Bem-vindo(a), ${usuario.nome}!`);
    
    // Salva o usuário logado
    localStorage.setItem('usuarioLogado', JSON.stringify({
        nome: usuario.nome,
        email: usuario.email
    }));
    
    // Se marcou "Lembrar Login", salva os dados
    if (lembrarLogin) {
        localStorage.setItem('loginSalvo', JSON.stringify({
            email: email,
            senha: senha
        }));
    } else {
        // Remove login salvo se desmarcar
        localStorage.removeItem('loginSalvo');
    }
    
    // Redireciona para a home após 1.5 segundos
    setTimeout(() => {
        window.location.href = '../home/home.html';
    }, 1500);
});

function mostrarErro(mensagem) {
    const divErro = document.getElementById('mensagem-erro');
    divErro.textContent = mensagem;
    divErro.classList.remove('hidden');
}

function mostrarSucesso(mensagem) {
    const divSucesso = document.getElementById('mensagem-sucesso');
    divSucesso.textContent = mensagem;
    divSucesso.classList.remove('hidden');
}