// ========== DADOS GLOBAIS ==========
let agendamentos = [];
let agendamentoSelecionado = null;
let usuarioColeTech = null; // Quem está validando

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', function() {
    verificarAcessoColeTech();
    carregarDadosReais(); // Agora carrega do localStorage
    renderizarTelas();
    configurarInputs();
});

function verificarAcessoColeTech() {
    const logado = JSON.parse(localStorage.getItem('usuario_logado'));
    // Apenas ColeTech ou Admin podem entrar aqui
    if (!logado || (logado.cargo !== 'ColeTech' && logado.cargo !== 'Admin')) {
        alert('Acesso restrito para ColeTech.');
        window.location.href = '../home/home-ini.html';
        return;
    }
    usuarioColeTech = logado;
    
    // Atualiza nome no header
    const elNome = document.getElementById('nomeColeTech');
    if (elNome) elNome.textContent = logado.nome || 'ColeTech';
}

// 1. CARREGAR DADOS (REAIS)
function carregarDadosReais() {
    // Busca os agendamentos feitos pelos usuários DescarTech
    const dadosStorage = localStorage.getItem('agendamentos');
    agendamentos = dadosStorage ? JSON.parse(dadosStorage) : [];
}

// 2. RENDERIZAÇÃO (Idêntico ao anterior, mas usando a lista real)
function renderizarTelas() {
    const gridPendentes = document.getElementById('gridPendentes');
    const gridConcluidos = document.getElementById('gridConcluidos');
    const msgVazio = document.getElementById('msgVazioPendentes');
    
    gridPendentes.innerHTML = '';
    gridConcluidos.innerHTML = '';
    
    let temPendentes = false;

    // Ordena: Pendentes primeiro, depois os mais novos
    agendamentos.reverse().forEach(item => {
        if (item.status === 'pendente') {
            temPendentes = true;
            gridPendentes.appendChild(criarCardPendente(item));
        } else if (item.status === 'concluido') {
            gridConcluidos.appendChild(criarCardConcluido(item));
        }
    });

    if (!temPendentes) {
        msgVazio.classList.remove('hidden');
        msgVazio.classList.add('flex');
    } else {
        msgVazio.classList.add('hidden');
        msgVazio.classList.remove('flex');
    }
}

// Funções de criar card (Pendente e Concluído) mantêm-se iguais às do design anterior
// (Vou omitir o HTML interno dos cards aqui para economizar espaço, 
//  use o mesmo da resposta anterior, apenas certifique-se que chama abrirValidacao(item.id))

function criarCardPendente(item) {
    // ... Use o código HTML do card pendente da resposta anterior ...
    const div = document.createElement('div');
    div.className = 'bg-white/5 border border-white/20 rounded-2xl p-6 hover:border-[#cbff58] transition-all';
    div.innerHTML = `
        <div class="flex justify-between items-start mb-4">
            <span class="text-xs font-mono text-[#cbff58] bg-[#cbff58]/10 px-2 py-1 rounded">#${item.id.slice(-4)}</span>
            <span class="material-symbols-outlined text-yellow-500">pending</span>
        </div>
        <h3 class="text-xl font-bold text-white mb-1">${item.usuarioNome}</h3>
        <p class="text-xs text-white/50 mb-4">Itens: ${item.itens.length}</p>
        <div class="text-sm text-white/70 mb-4">${item.data} às ${item.hora}</div>
        <button onclick="abrirValidacao('${item.id}')" class="w-full py-2 bg-white text-black font-bold rounded-lg hover:bg-[#cbff58]">Verificar</button>
    `;
    return div;
}

function criarCardConcluido(item) {
    // ... Use o código HTML do card concluído da resposta anterior ...
    const div = document.createElement('div');
    div.className = 'bg-black/40 border border-white/10 rounded-2xl p-6 opacity-75';
    div.innerHTML = `
        <div class="flex justify-between items-start mb-2">
            <span class="text-xs font-mono text-white/30">#${item.id.slice(-4)}</span>
            <span class="material-symbols-outlined text-green-500">check_circle</span>
        </div>
        <h3 class="text-lg font-bold text-white">${item.usuarioNome}</h3>
        <p class="text-[#cbff58] font-bold mt-2">Gerou: EC ${item.pontosGerados}</p>
        <button onclick="abrirComprovante('${item.id}')" class="text-xs underline text-white/60 mt-2">Ver Detalhes</button>
    `;
    return div;
}

// 3. ABRIR MODAL
function abrirValidacao(id) {
    agendamentoSelecionado = agendamentos.find(a => a.id === id);
    if (!agendamentoSelecionado) return;

    document.getElementById('valIdAgendamento').textContent = `ID: #${id.slice(-6)}`;
    document.getElementById('valNomeUsuario').textContent = agendamentoSelecionado.usuarioNome;
    
    // Preenche lista
    const lista = document.getElementById('valListaItens');
    lista.innerHTML = agendamentoSelecionado.itens.map(i => `<li class="border-b border-gray-100 py-1">${i}</li>`).join('');

    document.getElementById('inputPeso').value = '';
    document.getElementById('previewPontos').textContent = '0';
    document.getElementById('modalValidacao').classList.remove('hidden');
}

function configurarInputs() {
    document.getElementById('inputPeso').addEventListener('input', (e) => {
        const peso = parseFloat(e.target.value) || 0;
        document.getElementById('previewPontos').textContent = Math.floor(peso * 10);
    });
}

// 4. CONFIRMAR VALIDAÇÃO E DISTRIBUIR PONTOS
document.getElementById('btnConfirmarValidacao').addEventListener('click', () => {
    const peso = parseFloat(document.getElementById('inputPeso').value);
    
    if (!peso || peso <= 0) {
        alert("Insira um peso válido!");
        return;
    }

    if (!agendamentoSelecionado) return;

    const pontosLixo = Math.floor(peso * 10); // 1kg = 10 EC (Para o DescarTech)
    const comissaoColeTech = 5; // Fixo 5 EC (Para o ColeTech)

    // A) Pagar o DescarTech (Dono do Lixo)
    creditarPontos(agendamentoSelecionado.usuarioEmail, pontosLixo);

    // B) Pagar o ColeTech (Pelo serviço) - Atendendo ao seu pedido
    if (usuarioColeTech && usuarioColeTech.email) {
        creditarPontos(usuarioColeTech.email, comissaoColeTech);
    }

    // C) Atualizar o Agendamento
    agendamentoSelecionado.status = 'concluido';
    agendamentoSelecionado.peso = peso;
    agendamentoSelecionado.pontosGerados = pontosLixo;
    agendamentoSelecionado.validadoPor = usuarioColeTech.nome;
    agendamentoSelecionado.dataValidacao = new Date().toISOString();

    // D) Salvar tudo no Storage
    localStorage.setItem('agendamentos', JSON.stringify(agendamentos));

    alert(`Sucesso!\n- ${agendamentoSelecionado.usuarioNome} recebeu EC ${pontosLixo}.\n- Você recebeu EC ${comissaoColeTech} pelo serviço.`);
    
    fecharModal('modalValidacao');
    renderizarTelas();
});

// 5. FUNÇÃO DE CREDITAR SALDO (Genérica)
function creditarPontos(emailUsuario, valor) {
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    
    // Procura usuário no banco
    let index = usuarios.findIndex(u => u.email === emailUsuario || u.emailEmpresa === emailUsuario);

    if (index !== -1) {
        // Atualiza banco
        usuarios[index].saldo = (usuarios[index].saldo || 0) + valor;
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
    } 
    
    // Se o usuário beneficiado for quem está logado agora, atualiza a sessão também
    const sessao = JSON.parse(localStorage.getItem('usuario_logado'));
    if (sessao && (sessao.email === emailUsuario || sessao.emailEmpresa === emailUsuario)) {
        sessao.saldo = (sessao.saldo || 0) + valor;
        localStorage.setItem('usuario_logado', JSON.stringify(sessao));
    }
}

// Utilitários de modal
window.fecharModal = function(id) { document.getElementById(id).classList.add('hidden'); }
window.abrirComprovante = function(id) { /* Mesma lógica do anterior */ }