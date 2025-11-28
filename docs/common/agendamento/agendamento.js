document.addEventListener('DOMContentLoaded', function () {
    // 1. CARREGAR USUÁRIO
    let userData = null;
    const usuario_logado = localStorage.getItem('usuario_logado');
    
    if (usuario_logado) {
        userData = JSON.parse(usuario_logado);
        
        // Exibir Nome
        const nomeParaExibir = userData.nome || userData.razaoSocial || userData.email || 'Usuário';
        const primeiroNome = nomeParaExibir.split(' ')[0];
        
        const elementoNome = document.getElementById('user_account');
        if (elementoNome) elementoNome.textContent = `Olá, ${primeiroNome}`;
        
        // Preencher input (Readonly)
        const inputNome = document.getElementById('nome');
        if (inputNome) inputNome.value = nomeParaExibir;

        // Configurar Menu com base no Cargo
        configurarMenu(userData);
    } else {
        window.location.href = '../login/login-uni.html';
    }

    // Definir data mínima como hoje
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('data').setAttribute('min', today);
});

// ========== LÓGICA DO MENU (Integrada) ==========
function configurarMenu(usuario) {
    const tipo = (usuario.cargo || usuario.tipo || 'comum').toLowerCase();
    
    // Texto do Cargo
    const nomesCargos = {
        'admin': 'Admin',
        'parceiro': 'Parceiro',
        'coletech': 'ColeTech',
        'comum': 'DescarTech'
    };
    document.getElementById('tipoUsuarioMenu').textContent = nomesCargos[tipo] || 'Usuário';

    // Mostrar opções específicas
    if (tipo === 'parceiro') {
        document.getElementById('menu-validacao-resgate').classList.remove('hidden');
        document.getElementById('menu-cadastrar-produto').classList.remove('hidden');
    } else if (tipo === 'coletech') {
        document.getElementById('menu-validacao-descarte').classList.remove('hidden');
    } else if (tipo === 'admin') {
        document.getElementById('menu-painel-admin').classList.remove('hidden');
        document.getElementById('menu-validacao-resgate').classList.remove('hidden');
        document.getElementById('menu-cadastrar-produto').classList.remove('hidden');
        document.getElementById('menu-validacao-descarte').classList.remove('hidden');
    }
}

// Menu Hambúrguer
const menuLateral = document.getElementById('menuLateral');
const menuOverlay = document.getElementById('menuOverlay');

document.getElementById('btnMenuHamb').addEventListener('click', () => {
    menuLateral.classList.remove('-translate-x-full');
    menuOverlay.classList.remove('hidden');
});

function fecharMenu() {
    menuLateral.classList.add('-translate-x-full');
    menuOverlay.classList.add('hidden');
}

document.getElementById('btnFecharMenu').addEventListener('click', fecharMenu);
menuOverlay.addEventListener('click', fecharMenu);


// ========== LÓGICA DE AGENDAMENTO ==========

// Campo "Outro" dinâmico
const outroInput = document.getElementById('outro');
let outroCheckbox = null;

outroInput.addEventListener('change', function () { // Mudado para 'change' para melhor UX
    const valor = this.value.trim();
    if (outroCheckbox) {
        outroCheckbox.remove();
        outroCheckbox = null;
    }
    if (valor) {
        const container = document.getElementById('componentesContainer');
        const label = document.createElement('label');
        label.className = 'flex items-center gap-3 cursor-pointer group mt-2 animate-bounce-in';
        label.innerHTML = `
            <input type="checkbox" name="componente" value="${valor}" checked class="w-5 h-5 accent-[#cbff58]">
            <span class="text-white group-hover:text-[#cbff58]">${valor}</span>
        `;
        container.appendChild(label);
        outroCheckbox = label;
        this.value = ''; // Limpa o input
    }
});

document.getElementById('btnAgendar').addEventListener('click', function () {
    const form = document.getElementById('formAgendamento');
    const usuarioLogado = JSON.parse(localStorage.getItem('usuario_logado'));

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Coletar Itens
    const componentesSelecionados = Array.from(document.querySelectorAll('input[name="componente"]:checked'))
        .map(cb => cb.value);

    if (componentesSelecionados.length === 0) {
        alert('Selecione pelo menos um componente!');
        return;
    }

    // CRIAR OBJETO (Estrutura compatível com ColeTech)
    const idAgendamento = 'AGD' + Date.now();
    
    const novoAgendamento = {
        id: idAgendamento,
        // DADOS PARA EXIBIÇÃO
        usuarioNome: usuarioLogado.nome || usuarioLogado.razaoSocial,
        curso: document.getElementById('curso').value,
        data: document.getElementById('data').value,
        hora: document.getElementById('hora').value,
        itens: componentesSelecionados, // Mapeado para 'itens'
        
        // DADOS PARA O SISTEMA DE PONTOS
        usuarioEmail: usuarioLogado.email || usuarioLogado.emailEmpresa, // CRUCIAL para o saldo
        status: 'pendente', // CRUCIAL para aparecer no ColeTech
        peso: 0,
        pontosGerados: 0,
        timestamp: new Date().toISOString()
    };

    // Salvar
    let agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
    agendamentos.push(novoAgendamento);
    localStorage.setItem('agendamentos', JSON.stringify(agendamentos));

    // Mostrar Modal
    const dataFormatada = new Date(novoAgendamento.data + 'T00:00:00').toLocaleDateString('pt-BR');
    document.getElementById('modalId').textContent = '#' + idAgendamento.slice(-6);
    document.getElementById('modalData').textContent = dataFormatada;
    document.getElementById('modalHora').textContent = novoAgendamento.hora;
    document.getElementById('modalConfirmacao').classList.remove('hidden');
});

// Fechar Modais
document.getElementById('btnFecharModal').addEventListener('click', () => {
    document.getElementById('modalConfirmacao').classList.add('hidden');
    window.location.href = '../home/home-ini.html'; // Redireciona após sucesso
});

document.getElementById('btnEntendi').addEventListener('click', () => {
    document.getElementById('modalConfirmacao').classList.add('hidden');
    window.location.href = '../home/home-ini.html';
});