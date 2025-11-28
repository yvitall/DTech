// ========== DADOS GLOBAIS ==========
let agendamentos = [];
let agendamentoSelecionado = null;
let usuarioColeTech = null;

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('🟢 Página de validação carregada');
    verificarAcessoColeTech();
    carregarDadosReais();
    renderizarTelas();
    configurarInputs();
    configurarBotaoConfirmar();
});

function verificarAcessoColeTech() {
    const logado = JSON.parse(localStorage.getItem('usuario_logado'));
    
    if (!logado || (logado.cargo !== 'ColeTech' && logado.cargo !== 'Admin')) {
        alert('Acesso restrito para ColeTech.');
        window.location.href = '../common/home/home-ini.html';
        return;
    }
    
    usuarioColeTech = logado;
    console.log('✅ ColeTech identificado:', usuarioColeTech.nome);
    console.log('📧 Email ColeTech:', usuarioColeTech.email);
    
    const elNome = document.getElementById('nomeColeTech');
    if (elNome) elNome.textContent = logado.nome || 'ColeTech';
}

// ========== CARREGAR DADOS ==========
function carregarDadosReais() {
    const dadosStorage = localStorage.getItem('agendamentos');
    agendamentos = dadosStorage ? JSON.parse(dadosStorage) : [];
    console.log(`📦 Carregados ${agendamentos.length} agendamentos`);
}

// ========== RENDERIZAÇÃO ==========
function renderizarTelas() {
    const gridPendentes = document.getElementById('gridPendentes');
    const gridConcluidos = document.getElementById('gridConcluidos');
    const msgVazio = document.getElementById('msgVazioPendentes');
    
    if (!gridPendentes || !gridConcluidos) {
        console.error('❌ Elementos de grid não encontrados');
        return;
    }
    
    gridPendentes.innerHTML = '';
    gridConcluidos.innerHTML = '';
    
    let temPendentes = false;

    agendamentos.slice().reverse().forEach(item => {
        if (item.status === 'pendente') {
            temPendentes = true;
            gridPendentes.appendChild(criarCardPendente(item));
        } else if (item.status === 'concluido') {
            gridConcluidos.appendChild(criarCardConcluido(item));
        }
    });

    if (msgVazio) {
        if (!temPendentes) {
            msgVazio.classList.remove('hidden');
            msgVazio.classList.add('flex');
        } else {
            msgVazio.classList.add('hidden');
            msgVazio.classList.remove('flex');
        }
    }
}

// ========== CRIAR CARDS ==========
function criarCardPendente(item) {
    const div = document.createElement('div');
    div.className = 'bg-white/5 border border-white/20 rounded-2xl p-6 hover:border-[#cbff58] transition-all cursor-pointer';
    
    const dataFormatada = item.data ? new Date(item.data + 'T00:00:00').toLocaleDateString('pt-BR') : 'Data não definida';
    
    div.innerHTML = `
        <div class="flex justify-between items-start mb-4">
            <span class="text-xs font-mono text-[#cbff58] bg-[#cbff58]/10 px-2 py-1 rounded">#${item.id.slice(-6)}</span>
            <span class="material-symbols-outlined text-yellow-500">pending</span>
        </div>
        <h3 class="text-xl font-bold text-white mb-1">${item.usuarioNome || 'Usuário'}</h3>
        <p class="text-xs text-white/50 mb-2">ID: ${item.id}</p>
        <p class="text-xs text-white/50 mb-4">Componentes: ${item.itens?.length || item.componentes?.length || 0}</p>
        <div class="text-sm text-white/70 mb-4">${dataFormatada} às ${item.hora || '--:--'}</div>
        <button 
            onclick="abrirValidacao('${item.id}')" 
            class="w-full py-2 bg-[#cbff58] text-black font-bold rounded-lg hover:bg-[#cbff58]/90 active:scale-95 transition-all"
        >
            Verificar
        </button>
    `;
    return div;
}

function criarCardConcluido(item) {
    const div = document.createElement('div');
    div.className = 'bg-black/40 border border-white/10 rounded-2xl p-6 opacity-75';
    
    div.innerHTML = `
        <div class="flex justify-between items-start mb-2">
            <span class="text-xs font-mono text-white/30">#${item.id.slice(-6)}</span>
            <span class="material-symbols-outlined text-green-500">check_circle</span>
        </div>
        <h3 class="text-lg font-bold text-white">${item.usuarioNome || 'Usuário'}</h3>
        <p class="text-[#cbff58] font-bold mt-2">Gerou: EC ${item.pontosGerados || 0}</p>
        <p class="text-xs text-white/50 mt-1">Validado por: ${item.validadoPor || 'Sistema'}</p>
        <p class="text-xs text-white/50">Peso: ${item.peso || 0}kg</p>
    `;
    return div;
}

// ========== ABRIR MODAL ==========
function abrirValidacao(id) {
    console.log('🔍 Abrindo validação para ID:', id);
    
    agendamentoSelecionado = agendamentos.find(a => a.id === id);
    
    if (!agendamentoSelecionado) {
        console.error('❌ Agendamento não encontrado:', id);
        alert('Erro: Agendamento não encontrado!');
        return;
    }

    console.log('✅ Agendamento encontrado:', agendamentoSelecionado);
    console.log('📧 Email do DescarTech no agendamento:', agendamentoSelecionado.usuarioEmail);

    // Preencher dados do modal
    const elId = document.getElementById('valIdAgendamento');
    const elNome = document.getElementById('valNomeUsuario');
    const elCurso = document.getElementById('valCursoUsuario');
    const elLista = document.getElementById('valListaItens');
    
    if (elId) elId.textContent = `ID: #${id.slice(-6)}`;
    if (elNome) elNome.textContent = agendamentoSelecionado.usuarioNome || 'Usuário';
    if (elCurso) elCurso.textContent = agendamentoSelecionado.curso || 'Curso não informado';
    
    // Lista de componentes
    if (elLista) {
        const componentes = agendamentoSelecionado.itens || agendamentoSelecionado.componentes || [];
        elLista.innerHTML = componentes.length > 0 
            ? componentes.map(c => `<li class="border-b border-gray-700 py-2 text-white/80">${c}</li>`).join('')
            : '<li class="text-white/50">Nenhum componente listado</li>';
    }

    // Limpar input e preview
    const inputPeso = document.getElementById('inputPeso');
    if (inputPeso) inputPeso.value = '';
    
    const previewPontos = document.getElementById('previewPontos');
    if (previewPontos) previewPontos.textContent = '0';

    // Mostrar modal
    const modal = document.getElementById('modalValidacao');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        console.log('✅ Modal aberto');
    } else {
        console.error('❌ Modal não encontrado');
    }
}

// ========== CONFIGURAR INPUTS ==========
function configurarInputs() {
    const inputPeso = document.getElementById('inputPeso');
    const previewPontos = document.getElementById('previewPontos');
    
    if (inputPeso && previewPontos) {
        inputPeso.addEventListener('input', (e) => {
            const peso = parseFloat(e.target.value) || 0;
            const pontos = Math.floor(peso * 10);
            previewPontos.textContent = pontos;
            console.log(`⚖️ Peso: ${peso}kg = ${pontos} EC para o DescarTech`);
        });
    }
}

// ========== CONFIGURAR BOTÃO CONFIRMAR ==========
function configurarBotaoConfirmar() {
    const btnConfirmar = document.getElementById('btnConfirmarValidacao');
    
    if (!btnConfirmar) {
        console.error('❌ Botão de confirmação não encontrado');
        return;
    }

    console.log('✅ Botão de confirmação configurado');
    
    // Remove listeners anteriores
    const novoBotao = btnConfirmar.cloneNode(true);
    btnConfirmar.parentNode.replaceChild(novoBotao, btnConfirmar);
    
    // Adiciona novo listener
    novoBotao.addEventListener('click', function() {
        console.log('🖱️ Botão confirmar clicado');
        confirmarValidacao();
    });
}
function confirmarValidacao() {
    const peso = parseFloat(document.getElementById('inputPeso').value);
    
    if (!peso || peso <= 0) {
        mostrarModalErro('Peso Inválido', 'Por favor, insira um peso válido.');
        return;
    }

    if (!agendamentoSelecionado) {
        mostrarModalErro('Erro', 'Nenhum agendamento selecionado.');
        return;
    }

    // Obter emails
    const emailDescarTech = agendamentoSelecionado.usuarioEmail;
    const emailColeTech = usuarioColeTech.email;

    if (!emailDescarTech) {
        mostrarModalErro('Erro', 'Email do usuário não encontrado no agendamento.');
        return;
    }

    // ========== USAR A FUNÇÃO DO SISTEMA DE SALDO ==========
    const resultado = window.SaldoDTech.validarDescarte(
        emailDescarTech,  // Email do DescarTech
        emailColeTech,    // Email do ColeTech
        peso              // Peso em kg
    );

    if (!resultado.sucesso) {
        mostrarModalErro('Erro ao Validar', resultado.erro || 'Não foi possível creditar os pontos.');
        return;
    }

    // Atualizar o agendamento
    agendamentoSelecionado.status = 'concluido';
    agendamentoSelecionado.peso = peso;
    agendamentoSelecionado.pontosGerados = resultado.pontosDescarTech;
    agendamentoSelecionado.validadoPor = usuarioColeTech.nome;
    agendamentoSelecionado.dataValidacao = new Date().toISOString();

    // Salvar no localStorage
    localStorage.setItem('agendamentos', JSON.stringify(agendamentos));

    // ========== MOSTRAR MODAL DE SUCESSO ==========
    mostrarModalSucesso(
        'Validação Concluída!',
        `<div class="space-y-3">
            <p class="text-lg">Descarte validado com sucesso!</p>
            
            <div class="bg-white/5 rounded-xl p-4 space-y-2">
                <div class="flex justify-between">
                    <span class="text-white/70">Peso:</span>
                    <span class="font-bold">${peso}kg</span>
                </div>
                <div class="border-t border-white/20 pt-2">
                    <div class="flex justify-between mb-1">
                        <span class="text-white/70">DescarTech:</span>
                        <span class="font-bold text-[#cbff58]">+EC ${resultado.pontosDescarTech}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-white/70">Você (ColeTech):</span>
                        <span class="font-bold text-[#cbff58]">+EC ${resultado.pontosColeTech}</span>
                    </div>
                </div>
            </div>
            
            <p class="text-sm text-white/50">${agendamentoSelecionado.usuarioNome} recebeu os pontos em sua conta.</p>
        </div>`
    );

    fecharModal('modalValidacao');
    renderizarTelas();
}

// ========== FUNÇÕES DE MODAL (EXEMPLO) ==========
function mostrarModalSucesso(titulo, conteudoHtml) {
    // Cria ou atualiza o modal
    let modal = document.getElementById('modalSucesso');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modalSucesso';
        modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
        <div class="bg-[#0A0A0A] border-2 border-[#cbff58] rounded-3xl p-8 max-w-md w-full relative animate-bounce-in">
            <div class="flex justify-center mb-6">
                <div class="bg-[#cbff58] rounded-full p-4">
                    <span class="material-symbols-outlined text-[#0A0A0A]" style="font-size: 4rem;">check_circle</span>
                </div>
            </div>
            
            <h2 class="text-3xl font-bold text-center mb-4 text-white">${titulo}</h2>
            
            <div class="text-white mb-6">
                ${conteudoHtml}
            </div>
            
            <button 
                onclick="document.getElementById('modalSucesso').remove()" 
                class="w-full py-3 bg-[#cbff58] text-black font-bold rounded-xl hover:bg-[#cbff58]/90 active:scale-95 transition-all"
            >
                Entendi
            </button>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

function mostrarModalErro(titulo, mensagem) {
    let modal = document.getElementById('modalErro');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modalErro';
        modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
        <div class="bg-[#0A0A0A] border-2 border-red-500 rounded-3xl p-8 max-w-md w-full relative animate-bounce-in">
            <div class="flex justify-center mb-6">
                <div class="bg-red-500 rounded-full p-4">
                    <span class="material-symbols-outlined text-white" style="font-size: 4rem;">error</span>
                </div>
            </div>
            
            <h2 class="text-3xl font-bold text-center mb-4 text-white">${titulo}</h2>
            <p class="text-center text-white/70 mb-6">${mensagem}</p>
            
            <button 
                onclick="document.getElementById('modalErro').remove()" 
                class="w-full py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-500/90 active:scale-95 transition-all"
            >
                Fechar
            </button>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

// ========== FECHAR MODAL ==========
function fecharModal(idModal) {
    const modal = document.getElementById(idModal);
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
        agendamentoSelecionado = null;
        console.log('✅ Modal fechado');
    }
}

// ========== EXPOR FUNÇÕES GLOBAIS ==========
window.abrirValidacao = abrirValidacao;
window.fecharModal = fecharModal;
