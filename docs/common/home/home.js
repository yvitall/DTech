document.addEventListener('DOMContentLoaded', function () {
    
    // 1️⃣ RECUPERAR DADOS DO LOCALSTORAGE
    const usuarioLogadoString = localStorage.getItem('usuario_logado');
    const elementoNome = document.getElementById('user_account');
    const gridContainer = document.getElementById('grid_container');

    // Se não tiver usuário logado, manda pro login
    if (!usuarioLogadoString) {
        window.location.href = '../login/login.html'; 
        return;
    }

    const usuario = JSON.parse(usuarioLogadoString);

    // 2️⃣ CORREÇÃO DO BUG DO NOME (AQUI ESTAVA O ERRO)
    if (elementoNome) {
        // Tenta pegar 'nome'. Se não existir (é parceiro), pega 'razaoSocial'.
        const nomeParaExibir = usuario.nome || usuario.razaoSocial || 'Visitante';
        
        // Pega apenas a primeira palavra para não quebrar o layout
        const primeiroNome = nomeParaExibir.split(' ')[0]; 
        
        elementoNome.textContent = `Olá, ${primeiroNome}`;
    }

    // 3️⃣ LÓGICA DE CARGOS E BOTÕES (Tudo em um lugar só)
    let botaoParaMostrar = null;

    switch (usuario.cargo) {
        case 'Admin':
            botaoParaMostrar = document.getElementById('admin_panel_btn');
            break;
            
        case 'ColeTech':
            botaoParaMostrar = document.getElementById('coletech_validate'); 
            break;
            
        case 'Parceiro':
            botaoParaMostrar = document.getElementById('resgate_validate');
            break;
    }

    // 4️⃣ APLICAR AS MUDANÇAS NO GRID E MOSTRAR BOTÃO
    if (botaoParaMostrar) {
        // Mostra o botão específico do cargo
        botaoParaMostrar.classList.remove('hidden');

        // Ajusta o Grid para 5 colunas
        if (gridContainer) {
            gridContainer.classList.remove('md:grid-cols-4');
            gridContainer.classList.add('md:grid-cols-5');
        }
    }
});

//gemini entender depois