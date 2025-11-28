// ========== DADOS GLOBAIS ==========
let pedidosResgate = [];
let pedidoSelecionado = null;
let usuarioParceiro = null;

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', function() {
    verificarAcessoParceiro();
    carregarPedidos();
    renderizarTelas();
});

// 1. Segurança e Identificação
function verificarAcessoParceiro() {
    const logado = JSON.parse(localStorage.getItem('usuario_logado'));
    
    // Apenas Parceiro ou Admin
    if (!logado || (logado.cargo !== 'Parceiro' && logado.cargo !== 'Admin' && logado.cargo !== 'administrador')) {
        alert('Acesso restrito para Parceiros.');
        window.location.href = '../home/home-ini.html';
        return;
    }
    usuarioParceiro = logado;
    
    const elNome = document.getElementById('nomeParceiro');
    if (elNome) elNome.textContent = logado.nome || logado.razaoSocial || 'Parceiro';
}

// 2. Carregar Dados do Storage
function carregarPedidos() {
    // Essa chave 'validacoesResgate' é criada quando o usuário clica em "Resgatar" na loja
    const dados = localStorage.getItem('validacoesResgate');
    pedidosResgate = dados ? JSON.parse(dados) : [];
}

// 3. Renderizar Grid
function renderizarTelas() {
    const gridPendentes = document.getElementById('gridPendentes');
    const gridConcluidos = document.getElementById('gridConcluidos');
    const msgVazio = document.getElementById('msgVazioPendentes');
    
    gridPendentes.innerHTML = '';
    gridConcluidos.innerHTML = '';
    
    let temPendentes = false;

    // Ordena mais recentes primeiro
    pedidosResgate.reverse().forEach(item => {
        // Filtro opcional: Mostrar apenas produtos deste parceiro?
        // Se quiser ver tudo, remova o if abaixo. Se quiser restrito:
        // if (item.parceiro !== usuarioParceiro.email) return;

        if (item.status === 'pendente') {
            temPendentes = true;
            gridPendentes.appendChild(criarCardPendente(item));
        } else if (item.status === 'concluido' || item.status === 'entregue') {
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

// --- Card Pendente ---
function criarCardPendente(item) {
    const div = document.createElement('div');
    div.className = 'bg-white/5 border border-white/20 rounded-2xl p-6 hover:border-[#cbff58] transition-all group flex flex-col justify-between';
    
    const dataFormatada = new Date(item.data).toLocaleDateString('pt-BR');

    div.innerHTML = `
        <div>
            <div class="flex justify-between items-start mb-4">
                <span class="text-xs font-mono text-[#cbff58] bg-[#cbff58]/10 px-2 py-1 rounded">#${item.id.slice(-4)}</span>
                <span class="material-symbols-outlined text-yellow-500">hourglass_top</span>
            </div>
            
            <h3 class="text-xl font-bold text-white mb-1 truncate">${item.usuarioNome || item.usuario}</h3>
            <p class="text-sm text-white/70 mb-4">Item: <span class="text-white font-semibold">${item.produtoNome}</span></p>
            
            <div class="flex items-center gap-2 mb-4 bg-black/20 p-2 rounded-lg">
                <span class="material-symbols-outlined text-[#cbff58] text-sm">payments</span>
                <span class="font-bold text-[#cbff58]">EC ${item.valor}</span>
            </div>
        </div>

        <button onclick="abrirValidacao('${item.id}')" 
            class="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-[#cbff58] transition-colors flex items-center justify-center gap-2">
            Verificar Retirada
        </button>
    `;
    return div;
}

// --- Card Concluído ---
function criarCardConcluido(item) {
    const div = document.createElement('div');
    div.className = 'bg-black/40 border border-white/10 rounded-2xl p-6 opacity-75 hover:opacity-100 transition-all';
    
    const dataVal = item.dataValidacao ? new Date(item.dataValidacao).toLocaleDateString('pt-BR') : '-';

    div.innerHTML = `
        <div class="flex justify-between items-start mb-2">
            <span class="text-xs font-mono text-white/30">#${item.id.slice(-4)}</span>
            <span class="material-symbols-outlined text-green-500">check_circle</span>
        </div>
        <h3 class="text-lg font-bold text-white">${item.usuarioNome || item.usuario}</h3>
        <p class="text-white/50 text-sm mt-1">${item.produtoNome}</p>
        
        <div class="mt-4 pt-3 border-t border-white/10 flex justify-between items-center">
            <span class="text-xs text-white/40">Entregue em: ${dataVal}</span>
            <span class="text-[#cbff58] font-bold text-sm">EC ${item.valor}</span>
        </div>
    `;
    return div;
}

// 4. ABRIR MODAL
function abrirValidacao(id) {
    pedidoSelecionado = pedidosResgate.find(p => p.id === id);
    if (!pedidoSelecionado) return;

    // Preencher Modal
    document.getElementById('valIdResgate').textContent = `ID: #${id.slice(-6)}`;
    document.getElementById('valNomeUsuario').textContent = pedidoSelecionado.usuarioNome || pedidoSelecionado.usuario;
    document.getElementById('valNomeProduto').textContent = pedidoSelecionado.produtoNome;
    document.getElementById('valValorProduto').textContent = pedidoSelecionado.valor;
    
    // Mostrar Modal
    document.getElementById('modalValidacao').classList.remove('hidden');
}

// 5. CONFIRMAR ENTREGA
document.getElementById('btnConfirmarEntrega').addEventListener('click', () => {
    if (!pedidoSelecionado) return;

    // Atualizar status
    pedidoSelecionado.status = 'concluido';
    pedidoSelecionado.dataValidacao = new Date().toISOString();
    pedidoSelecionado.parceiroResponsavel = usuarioParceiro.nome || usuarioParceiro.razaoSocial;

    // Salvar no Storage
    // Nota: O saldo JÁ FOI descontado na Loja. Aqui só confirmamos a entrega física.
    localStorage.setItem('validacoesResgate', JSON.stringify(pedidosResgate));

    // Feedback
    alert(`Entrega confirmada!\nProduto ${pedidoSelecionado.produtoNome} entregue para ${pedidoSelecionado.usuarioNome}.`);
    
    fecharModal('modalValidacao');
    renderizarTelas();
});

// Utilitários
window.fecharModal = function(id) {
    document.getElementById(id).classList.add('hidden');
    pedidoSelecionado = null;
}
window.abrirValidacao = abrirValidacao;