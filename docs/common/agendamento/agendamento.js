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
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 INICIANDO VALIDAÇÃO DE DESCARTE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const inputPeso = document.getElementById('inputPeso');
    const peso = parseFloat(inputPeso?.value || 0);
    
    if (!peso || peso <= 0) {
        alert("⚠️ Insira um peso válido!");
        return;
    }

    if (!agendamentoSelecionado) {
        alert("❌ Erro: Nenhum agendamento selecionado!");
        return;
    }

    const emailDescarTech = agendamentoSelecionado.usuarioEmail || agendamentoSelecionado.userEmail;
    
    if (!emailDescarTech) {
        console.error('❌ Email do DescarTech não encontrado no agendamento!');
        alert('❌ Erro: Email do usuário não encontrado no agendamento!');
        return;
    }

    if (!usuarioColeTech || !usuarioColeTech.email) {
        console.error('❌ Email do ColeTech não encontrado!');
        alert('❌ Erro: Dados do ColeTech não encontrados!');
        return;
    }

    // ========== LOGS DE IDENTIFICAÇÃO ==========
    console.log('👤 DescarTech:', agendamentoSelecionado.usuarioNome);
    console.log('📧 Email DescarTech:', emailDescarTech);
    console.log('👷 ColeTech logado:', usuarioColeTech.nome);
    console.log('📧 Email ColeTech:', usuarioColeTech.email);
    console.log('⚖️ Peso:', peso, 'kg');

    // ========== CÁLCULO DE PONTOS ==========
    const pontosDescarTech = Math.floor(peso * 10);
    const comissaoColeTech = 5;

    console.log(`\n💰 DISTRIBUIÇÃO:`);
    console.log(`   → ${agendamentoSelecionado.usuarioNome} receberá: ${pontosDescarTech} EC`);
    console.log(`   → ${usuarioColeTech.nome} receberá: ${comissaoColeTech} EC`);

    // ========== VERIFICAÇÃO DE SEGURANÇA ==========
    if (emailDescarTech.toLowerCase().trim() === usuarioColeTech.email.toLowerCase().trim()) {
        console.error('🚨 ERRO: DescarTech e ColeTech são a mesma pessoa!');
        alert('❌ Erro: Você não pode validar seu próprio descarte!');
        return;
    }

    // ========== CREDITAR PONTOS ==========
// ========== CREDITAR PONTOS ==========
console.log('\n💳 Iniciando créditos...');

if (typeof window.creditarPontos !== 'function') {
    console.error('❌ A função creditarPontos (de saldo.js) não está disponível!');
    alert('❌ Erro de Sistema: Função de crédito não encontrada. Verifique o saldo.js.');
    return;
}

// 1. Creditar para o DescarTech (dono do lixo)
console.log(`\n1️⃣ Creditando para DescarTech (${emailDescarTech})...`);
const sucessoDescarTech = window.creditarPontos(emailDescarTech, pontosDescarTech);
// ... (restante do código)
    
    if (!sucessoDescarTech) {
        console.error('❌ Falha ao creditar para DescarTech');
        alert('❌ Erro ao creditar pontos para o DescarTech!');
        return;
    }
    console.log('✅ DescarTech creditado com sucesso');

    // 2. Creditar para o ColeTech (quem validou)
    console.log(`\n2️⃣ Creditando para ColeTech (${usuarioColeTech.email})...`);
    const sucessoColeTech = window.creditarPontos(usuarioColeTech.email, comissaoColeTech);
    
    if (!sucessoColeTech) {
        console.warn('⚠️ Falha ao creditar comissão do ColeTech (não crítico)');
    } else {
        console.log('✅ ColeTech creditado com sucesso');
    }

    // ========== ATUALIZAR AGENDAMENTO ==========
    console.log('\n📝 Atualizando status do agendamento...');
    
    agendamentoSelecionado.status = 'concluido';
    agendamentoSelecionado.peso = peso;
    agendamentoSelecionado.pontosGerados = pontosDescarTech;
    agendamentoSelecionado.validadoPor = usuarioColeTech.nome;
    agendamentoSelecionado.dataValidacao = new Date().toISOString();
    agendamentoSelecionado.comissaoColeTech = comissaoColeTech;

    localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
    console.log('✅ Agendamento atualizado');

    // ========== ATUALIZAR APENAS O SALDO DO COLETECH NA TELA ==========
    console.log('\n🔄 Atualizando saldo do ColeTech na tela...');
    
    // Buscar o saldo REAL do ColeTech no banco
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const emailColeTech = usuarioColeTech.email.toLowerCase().trim();
    
    const coletechNoBanco = usuarios.find(u => 
        (u.email || '').toLowerCase().trim() === emailColeTech ||
        (u.emailEmpresa || '').toLowerCase().trim() === emailColeTech
    );

    if (coletechNoBanco) {
        const saldoColeTechAtualizado = parseFloat(coletechNoBanco.saldo || 0);
        console.log(`💰 Novo saldo do ColeTech: ${saldoColeTechAtualizado} EC`);
        
        // Atualizar sessão
        usuarioColeTech.saldo = saldoColeTechAtualizado;
        localStorage.setItem('usuario_logado', JSON.stringify(usuarioColeTech));
        
        // Atualizar tela
        const elSaldo = document.getElementById('valor_saldo');
        if (elSaldo) {
            elSaldo.textContent = saldoColeTechAtualizado;
            console.log('✅ Saldo atualizado na tela');
        }
    } else {
        console.warn('⚠️ ColeTech não encontrado no banco para atualizar tela');
    }

    // ========== MENSAGEM DE SUCESSO ==========
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ VALIDAÇÃO CONCLUÍDA COM SUCESSO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    alert(`✅ Validação Concluída!\n\n` +
          `📦 ${agendamentoSelecionado.usuarioNome} recebeu: EC ${pontosDescarTech}\n` +
          `💼 Você recebeu: EC ${comissaoColeTech}\n\n` +
          `Peso validado: ${peso}kg`);
    
    fecharModal('modalValidacao');
    renderizarTelas();
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
