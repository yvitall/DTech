// cadastro.js
document.getElementById('formCadastro').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Limpa mensagens anteriores
    document.getElementById('mensagem-erro').classList.add('hidden');
    document.getElementById('mensagem-sucesso').classList.add('hidden');
    
    // Pega os valores dos campos
    const nomeCompleto = document.getElementById('nomeCompleto').value.trim();
    const emailInstitucional = document.getElementById('emailInstitucional').value.trim();
    const senha = document.getElementById('senha').value;
    const confirmaSenha = document.getElementById('confirmaSenha').value;
    const perguntaRecuperacao = document.getElementById('perguntaRecuperacao').value;
    const respostaPergunta = document.getElementById('respostaPergunta').value.trim();
    
    // Validações
    if (nomeCompleto.length < 3) {
        mostrarErro('Nome completo deve ter pelo menos 3 caracteres');
        return;
    }
    
    if (!emailInstitucional.includes('@esuda.edu.br')) {
        mostrarErro('Use um email institucional válido (@esuda.edu.br)');
        return;
    }
    
    if (senha.length < 6) {
        mostrarErro('A senha deve ter pelo menos 6 caracteres');
        return;
    }
    
    if (senha !== confirmaSenha) {
        mostrarErro('As senhas não coincidem');
        return;
    }
    
    if (!perguntaRecuperacao) {
        mostrarErro('Selecione uma pergunta de segurança');
        return;
    }
    
    if (respostaPergunta.length < 2) {
        mostrarErro('Resposta da pergunta deve ter pelo menos 2 caracteres');
        return;
    }
    
    // Verifica se o email já está cadastrado
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const emailExiste = usuarios.find(user => user.email === emailInstitucional);
    
    if (emailExiste) {
        mostrarErro('Este email já está cadastrado');
        return;
    }
    
    // Cria o objeto do usuário
    const novoUsuario = {
        nome: nomeCompleto,
        email: emailInstitucional,
        senha: senha,
        cargo: 'DescarTech',
        perguntaRecuperacao: perguntaRecuperacao,
        respostaRecuperacao: respostaPergunta.toLowerCase() // Salva em minúsculo para facilitar comparação
    };
    
    // Adiciona o novo usuário ao array
    usuarios.push(novoUsuario);
    
    // Salva no localStorage
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    
    // Mostra mensagem de sucesso
    mostrarSucesso('Cadastro realizado com sucesso! Redirecionando para login...');
    
    // Limpa o formulário
    document.getElementById('formCadastro').reset();
    
    // Redireciona para login após 2 segundos
    setTimeout(() => {
        window.location.href = '../login/login-uni.html';
    }, 2000);
});

function mostrarErro(mensagem) {
    const divErro = document.getElementById('mensagem-erro');
    divErro.textContent = mensagem;
    divErro.classList.remove('hidden');
    
    // Scroll suave para a mensagem
    divErro.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function mostrarSucesso(mensagem) {
    const divSucesso = document.getElementById('mensagem-sucesso');
    divSucesso.textContent = mensagem;
    divSucesso.classList.remove('hidden');
    
    // Scroll suave para a mensagem
    divSucesso.scrollIntoView({ behavior: 'smooth', block: 'center' });
}