document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Elementos do Menu (Lógica de Abrir/Fechar)
    const menuLateral = document.getElementById('menuLateral');
    const menuOverlay = document.getElementById('menuOverlay');
    const btnMenuHamb = document.getElementById('btnMenuHamb');
    const btnFecharMenu = document.getElementById('btnFecharMenu');

    function abrirMenu() {
        menuLateral.classList.remove('-translate-x-full');
        menuOverlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Impede rolagem
    }

    function fecharMenu() {
        menuLateral.classList.add('-translate-x-full');
        menuOverlay.classList.add('hidden');
        document.body.style.overflow = 'auto'; // Libera rolagem
    }

    if(btnMenuHamb) btnMenuHamb.addEventListener('click', abrirMenu);
    if(btnFecharMenu) btnFecharMenu.addEventListener('click', fecharMenu);
    if(menuOverlay) menuOverlay.addEventListener('click', fecharMenu);

    // Fecha com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !menuLateral.classList.contains('-translate-x-full')) {
            fecharMenu();
        }
    });

    // 2. Lógica de Cargos (Lógica de Exibição)
    const usuarioLogado = localStorage.getItem('usuario_logado');
    
    if (usuarioLogado) {
        const usuario = JSON.parse(usuarioLogado);
        
        // Exibe o tipo de conta no rodapé do menu
        const tipoContaElement = document.getElementById('tipoUsuarioMenu');
        if (tipoContaElement) {
            tipoContaElement.textContent = usuario.cargo || 'Visitante';
        }

        // IDs dos itens restritos no HTML
        const menuAdmin = document.getElementById('menu-painel-admin');
        const menuColetech = document.getElementById('menu-validacao-descarte');
        const menuResgate = document.getElementById('menu-validacao-resgate');
        const menuProduto = document.getElementById('menu-cadastrar-produto');

        // Mostra itens baseado no cargo
        switch (usuario.cargo) {
            case 'Admin':
                if(menuAdmin) menuAdmin.classList.remove('hidden');
                break;
            
            case 'ColeTech':
                if(menuColetech) menuColetech.classList.remove('hidden');
                break;
            
            case 'Parceiro':
                if(menuResgate) menuResgate.classList.remove('hidden');
                if(menuProduto) menuProduto.classList.remove('hidden');
                break;
        }
    }
});