document.addEventListener('DOMContentLoaded', function () {

    // 1️⃣ RECUPERAR DADOS E ELEMENTOS (CORREÇÃO DE ESCOPO/DEFINIÇÃO!)
    const usuarioLogadoString = localStorage.getItem('usuario_logado');
    const elementoNome = document.getElementById('user_account');
    const gridContainer = document.getElementById('grid_container'); // O ID do contêiner do grid

    // --- DEFINIÇÃO DAS VARIÁVEIS DOS BOTÕES ---
    // Estas precisam ser definidas aqui, antes de serem usadas.
    const adminPanelBtn = document.getElementById('admin_panel_btn');
    const coletechValidateBtn = document.getElementById('coletech_validate');
    const resgateValidateBtn = document.getElementById('resgate_validate');
    const addProductBtn = document.getElementById('add_product'); 
    
    // Se não tiver usuário logado, manda pro login
    if (!usuarioLogadoString) {
        window.location.href = '../login/login.html';
        return;
    }

    const usuario = JSON.parse(usuarioLogadoString);

    // 2️⃣ EXIBIÇÃO DO NOME
    if (elementoNome) {
        const nomeParaExibir = usuario.nome || usuario.razaoSocial || 'Visitante';
        const primeiroNome = nomeParaExibir.split(' ')[0];
        elementoNome.textContent = `Olá, ${primeiroNome}`;
    }

    // 3️⃣ LÓGICA DE CARGOS, BOTÕES E GRID (CONSOLIDADO E CORRIGIDO)
    if (gridContainer) {
        // Removemos a lógica if(botaoParaMostrar) e consolidamos a lógica do Grid aqui.
        
        // Remove a classe padrão de 4 colunas em telas maiores para que o switch possa aplicar a correta
        gridContainer.classList.remove('md:grid-cols-4');

        switch (usuario.cargo) {
            case 'Admin':
                // MOSTRAR BOTÕES: (Os elementos já estão definidos agora)
                if (adminPanelBtn) adminPanelBtn.classList.remove('hidden');
                if (coletechValidateBtn) coletechValidateBtn.classList.remove('hidden');
                if (resgateValidateBtn) resgateValidateBtn.classList.remove('hidden');
                if (addProductBtn) addProductBtn.classList.remove('hidden');
                
                // AJUSTAR GRID:
                gridContainer.classList.add('md:grid-cols-5');
                break;
                
            case 'ColeTech':
                // MOSTRAR BOTÃO:
                if (coletechValidateBtn) coletechValidateBtn.classList.remove('hidden');
                
                // AJUSTAR GRID:
                gridContainer.classList.add('md:grid-cols-5');
                break;

            case 'Parceiro':
                // MOSTRAR BOTÕES:
                if (resgateValidateBtn) resgateValidateBtn.classList.remove('hidden');
                if (addProductBtn) addProductBtn.classList.remove('hidden'); // Usa addProductBtn

                // AJUSTAR GRID:
                gridContainer.classList.add('md:grid-cols-6');
                break;
        }
    }
    // Opcional: Se nenhum cargo for detectado, o gridContainer manterá o padrão original (grid-cols-2 md:grid-cols-4)
    // Se você removeu o padrão (como feito acima), mas nenhum cargo é válido, o gridContainer pode ficar sem classes 'md:grid-cols-X'.
    // Uma abordagem mais segura é manter a classe padrão no HTML e removê-la/adicioná-la apenas para os casos que precisam de ajuste.
});

// No final do arquivo home.js, adicione:

// Atualiza saldo automaticamente quando localStorage mudar
window.addEventListener('storage', function(e) {
    if (e.key === 'usuarios' || e.key === 'usuario_logado') {
        if (typeof recarregarSaldo === 'function') {
            recarregarSaldo();
        }
    }
});

console.log("bug: mesmo saldo pra todos os usuarios")