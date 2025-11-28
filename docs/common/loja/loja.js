// ========== VARIÁVEIS GLOBAIS ==========
let usuarioAtual = null;
let produtos = [];
let produtoSelecionado = null;

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', function() {
    if (carregarUsuario()) {
        carregarProdutos();
        carregarSaldo();
        configurarBusca();
    }
});

// ========== MENU HAMBÚRGUER ==========
const menuLateral = document.getElementById('menuLateral');
const menuOverlay = document.getElementById('menuOverlay');
const btnMenuHamb = document.getElementById('btnMenuHamb');
const btnFecharMenu = document.getElementById('btnFecharMenu');

if (btnMenuHamb && menuLateral && menuOverlay) {
    btnMenuHamb.addEventListener('click', () => {
        menuLateral.classList.remove('-translate-x-full');
        menuOverlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    });
}

function fecharMenu() {
    if (menuLateral && menuOverlay) {
        menuLateral.classList.add('-translate-x-full');
        menuOverlay.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

if (btnFecharMenu) btnFecharMenu.addEventListener('click', fecharMenu);
if (menuOverlay) menuOverlay.addEventListener('click', fecharMenu);

// ========== LÓGICA DE USUÁRIO ==========
function carregarUsuario() {
    const usuarioLogadoString = localStorage.getItem('usuario_logado');
    if (!usuarioLogadoString) {
        window.location.href = '../login/login-uni.html';
        return false;
    }

    try {
        const userData = JSON.parse(usuarioLogadoString);
        let rawTipo = userData.cargo || userData.tipo || userData.role || 'comum';
        let tipoUsuario = rawTipo.toLowerCase();
        let nomeExibicao = userData.nome || userData.razaoSocial || userData.email || 'Usuário';
        
        usuarioAtual = { ...userData, tipo: tipoUsuario, nome: nomeExibicao };

        const elementoNome = document.getElementById('user_account');
        if (elementoNome) {
            const primeiroNome = nomeExibicao.split(' ')[0];
            elementoNome.textContent = `Olá, ${primeiroNome}`;
        }

        const elementoTipo = document.getElementById('tipoUsuarioMenu');
        if (elementoTipo) {
            const nomesCargos = {
                'admin': 'Administrador',
                'parceiro': 'Parceiro',
                'coletech': 'ColeTech',
                'comum': 'DescarTech'
            };
            elementoTipo.textContent = nomesCargos[tipoUsuario] || 'Usuário';
        }

        configurarMenu(tipoUsuario);
        return true;

    } catch (e) {
        console.error("Erro ao processar usuário:", e);
        window.location.href = '../login/login-uni.html';
        return false;
    }
}

function configurarMenu(tipo) {
    const menusParaEsconder = ['menu-painel-admin', 'menu-validacao-resgate', 'menu-cadastrar-produto', 'menu-validacao-descarte', 'btnAbrirCadastro'];
    menusParaEsconder.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });

    switch (tipo) {
        case 'admin':
        case 'administrador':
            mostrarElemento('menu-painel-admin');
            mostrarElemento('menu-validacao-resgate');
            mostrarElemento('menu-cadastrar-produto');
            mostrarElemento('menu-validacao-descarte');
            mostrarElemento('btnAbrirCadastro');
            break;
        case 'parceiro':
            mostrarElemento('menu-validacao-resgate');
            mostrarElemento('menu-cadastrar-produto');
            mostrarElemento('btnAbrirCadastro');
            break;
        case 'coletech':
            mostrarElemento('menu-validacao-descarte');
            break;
    }
}

function mostrarElemento(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
}

function getSaldo() {

    const usuarioLogado = usuarioAtual || JSON.parse(localStorage.getItem('usuario_logado'));
    if (!usuarioLogado) return 0;


    const usuariosBanco = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuarioEncontrado = usuariosBanco.find(u => 
        (u.email === usuarioLogado.email) || (u.emailEmpresa === usuarioLogado.emailEmpresa)
    );

    if (usuarioEncontrado && usuarioEncontrado.saldo !== undefined) {
        return parseFloat(usuarioEncontrado.saldo);
    }

    return parseFloat(usuarioLogado.saldo || 0);
}

function atualizarSaldo(novoSaldo) {
    const usuarioLogado = usuarioAtual || JSON.parse(localStorage.getItem('usuario_logado'));
    if (!usuarioLogado) return;

    let usuariosBanco = JSON.parse(localStorage.getItem('usuarios')) || [];
    
    const index = usuariosBanco.findIndex(u => 
        (u.email === usuarioLogado.email) || (u.emailEmpresa === usuarioLogado.emailEmpresa)
    );

    if (index !== -1) {
        usuariosBanco[index].saldo = novoSaldo;
        localStorage.setItem('usuarios', JSON.stringify(usuariosBanco));
    }

    usuarioLogado.saldo = novoSaldo;
    localStorage.setItem('usuario_logado', JSON.stringify(usuarioLogado));
    usuarioAtual.saldo = novoSaldo; // Atualiza variável global

    // 3. Atualiza na Tela Agora
    const elSaldo = document.getElementById('valor_saldo');
    if (elSaldo) elSaldo.textContent = novoSaldo;
}

function carregarSaldo() {
    const saldo = getSaldo();
    const elSaldo = document.getElementById('valor_saldo');
    if (elSaldo) elSaldo.textContent = saldo;
}

// ========== PRODUTOS ==========
function carregarProdutos() {
    produtos = JSON.parse(localStorage.getItem('produtos')) || [];
    renderizarProdutos(produtos);
}

function renderizarProdutos(listaProdutos) {
    const grid = document.getElementById('gridProdutos');
    const mensagemVazia = document.getElementById('mensagemVazia');
    if (!grid) return;
    grid.innerHTML = '';
    
    if (listaProdutos.length === 0) {
        if (mensagemVazia) mensagemVazia.classList.remove('hidden');
        return;
    }
    if (mensagemVazia) mensagemVazia.classList.add('hidden');
    
    listaProdutos.forEach(produto => {
        const card = criarCardProduto(produto);
        grid.appendChild(card);
    });
}

function criarCardProduto(produto) {
    const div = document.createElement('div');
    div.className = 'bg-white/5 border-2 border-white/30 rounded-2xl p-4 hover:border-[#cbff58] hover:scale-105 transition-all flex flex-col justify-between';
    
    const esgotado = produto.estoque <= 0;
    const limiteAtingido = verificarLimiteUsuario(produto.id, produto.qtdPorUsuario);
    
    div.innerHTML = `
        <div>
            <div class="relative">
                <img src="${produto.imagem}" alt="${produto.titulo}" class="w-full h-48 object-cover rounded-xl mb-4 ${esgotado ? 'grayscale opacity-50' : ''}">
                ${esgotado ? '<div class="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg font-bold text-sm">ESGOTADO</div>' : ''}
                ${!esgotado && limiteAtingido ? '<div class="absolute top-2 right-2 bg-yellow-500 text-black px-3 py-1 rounded-lg font-bold text-sm">LIMITE ATINGIDO</div>' : ''}
            </div>
            <h3 class="text-xl font-bold mb-2 text-white truncate">${produto.titulo}</h3>
            <div class="flex items-center justify-between mb-4">
                <div><p class="text-sm text-white/50">Valor</p><p class="text-2xl font-bold text-[#cbff58]">EC ${produto.valor}</p></div>
                <div class="text-right"><p class="text-sm text-white/50">Estoque</p><p class="text-lg font-semibold">${produto.estoque} un.</p></div>
            </div>
            <p class="text-xs text-white/50 mb-4">Limite: ${produto.qtdPorUsuario} por usuário</p>
        </div>
        <button onclick="abrirModalResgate('${produto.id}')" ${esgotado || limiteAtingido ? 'disabled' : ''} class="w-full py-3 ${esgotado || limiteAtingido ? 'bg-gray-500 cursor-not-allowed text-white/50' : 'bg-[#cbff58] hover:bg-[#cbff58]/90 active:scale-95 text-black'} font-bold rounded-xl transition-all">
            ${esgotado ? 'Esgotado' : limiteAtingido ? 'Limite Atingido' : 'Resgatar'}
        </button>
    `;
    return div;
}

function verificarLimiteUsuario(produtoId, limite) {
    if (!usuarioAtual || !usuarioAtual.email) return false;
    const resgates = JSON.parse(localStorage.getItem('resgatesUsuario')) || {};
    const resgatesUsuario = resgates[usuarioAtual.email] || {};
    const qtdResgatada = resgatesUsuario[produtoId] || 0;
    return qtdResgatada >= limite;
}

// ========== MODAIS DE RESGATE (COM CORREÇÃO DE LÓGICA) ==========
const modalResgate = document.getElementById('modalResgate');
const btnFecharResgate = document.getElementById('btnFecharResgate');
const btnCancelarResgate = document.getElementById('btnCancelarResgate');
const btnConfirmarResgate = document.getElementById('btnConfirmarResgate');

function abrirModalResgate(produtoId) {
    const produto = produtos.find(p => p.id === produtoId);
    if (!produto) return;
    
    const saldoAtual = getSaldo();
    
    // CORREÇÃO 1: Se não tem saldo, avisa e IMPEDE de abrir o modal
    if (saldoAtual < produto.valor) {
        mostrarNotificacao('erro', 'Saldo Insuficiente', `Você precisa de mais EC ${produto.valor - saldoAtual} para resgatar.`);
        return; // Retorna para parar a execução
    }
    
    produtoSelecionado = produto;
    
    document.getElementById('resgateImagem').src = produto.imagem;
    document.getElementById('resgateTitulo').textContent = produto.titulo;
    document.getElementById('resgateValor').textContent = `EC ${produto.valor}`;
    document.getElementById('resgateSaldo').textContent = `EC ${saldoAtual}`;
    document.getElementById('resgateNovoSaldo').textContent = `EC ${saldoAtual - produto.valor}`;
    
    if (modalResgate) {
        modalResgate.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function fecharModalResgate() {
    if (modalResgate) {
        modalResgate.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
    produtoSelecionado = null;
}

if (btnFecharResgate) btnFecharResgate.addEventListener('click', fecharModalResgate);
if (btnCancelarResgate) btnCancelarResgate.addEventListener('click', fecharModalResgate);

if (btnConfirmarResgate) {
    btnConfirmarResgate.addEventListener('click', () => {
        if (!produtoSelecionado) return;
        
        const saldoAtual = getSaldo();
        
        // CORREÇÃO 2: Verificação de segurança no clique final
        if (saldoAtual < produtoSelecionado.valor) {
            mostrarNotificacao('erro', 'Erro no Resgate', 'Seu saldo é insuficiente para completar a transação.');
            fecharModalResgate();
            return;
        }

        // === EXECUÇÃO DO DÉBITO ===
        const novoSaldo = saldoAtual - produtoSelecionado.valor;
        
        // 1. Desconta o saldo IMEDIATAMENTE (Reserva o valor)
        atualizarSaldo(novoSaldo);
        
        // 2. Atualiza Estoque
        const index = produtos.findIndex(p => p.id === produtoSelecionado.id);
        if (index !== -1) {
            produtos[index].estoque--;
            localStorage.setItem('produtos', JSON.stringify(produtos));
        }
        
        // 3. Registra limite
        const resgates = JSON.parse(localStorage.getItem('resgatesUsuario')) || {};
        const email = usuarioAtual.email;
        if (!resgates[email]) resgates[email] = {};
        resgates[email][produtoSelecionado.id] = (resgates[email][produtoSelecionado.id] || 0) + 1;
        localStorage.setItem('resgatesUsuario', JSON.stringify(resgates));
        
        // 4. Cria Validação Pendente
        const validacoesPendentes = JSON.parse(localStorage.getItem('validacoesResgate')) || [];
        validacoesPendentes.push({
            id: 'VAL' + Date.now(),
            produtoId: produtoSelecionado.id,
            produtoNome: produtoSelecionado.titulo,
            usuarioNome: usuarioAtual.nome,
            usuarioEmail: usuarioAtual.email,
            valor: produtoSelecionado.valor,
            data: new Date().toISOString(),
            status: 'pendente', // Parceiro verá isso
            parceiroResponsavel: produtoSelecionado.parceiro
        });
        localStorage.setItem('validacoesResgate', JSON.stringify(validacoesPendentes));
        
        fecharModalResgate();
        carregarProdutos();
        
        mostrarNotificacao(
            'sucesso', 
            'Resgate Realizado!', 
            'O valor foi descontado. Apresente seu ID ao parceiro para retirar o produto.',
            `Novo Saldo: EC ${novoSaldo}`
        );
    });
}

// ========== SISTEMA DE NOTIFICAÇÃO ==========
function mostrarNotificacao(tipo, titulo, mensagem, detalheExtra = null) {
    const modal = document.getElementById('modalNotificacao');
    const elTitulo = document.getElementById('modalTitulo');
    const elMensagem = document.getElementById('modalMensagem');
    const elDetalhes = document.getElementById('modalDetalhes');
    const elIcone = document.getElementById('modalIconeContainer');
    
    elTitulo.textContent = titulo;
    elMensagem.textContent = mensagem;
    
    if (detalheExtra) {
        elDetalhes.textContent = detalheExtra;
        elDetalhes.classList.remove('hidden');
    } else {
        elDetalhes.classList.add('hidden');
    }

    const icones = {
        sucesso: `<svg class="w-20 h-20 text-[#cbff58]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
        erro: `<svg class="w-20 h-20 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
    };

    elIcone.innerHTML = icones[tipo] || icones.sucesso;
    if(modal) modal.classList.remove('hidden');
}

document.getElementById('btnFecharNotificacao')?.addEventListener('click', () => {
    document.getElementById('modalNotificacao')?.classList.add('hidden');
});

// Cadastro (Mantido simples)
const modalCadastro = document.getElementById('modalCadastro');
const btnAbrirCadastro = document.getElementById('btnAbrirCadastro');
const btnFecharCadastro = document.getElementById('btnFecharCadastro');
const formCadastro = document.getElementById('formCadastro');

if (btnAbrirCadastro) {
    btnAbrirCadastro.addEventListener('click', () => {
        if (modalCadastro) modalCadastro.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    });
}

if (btnFecharCadastro) {
    btnFecharCadastro.addEventListener('click', () => {
        if (modalCadastro) modalCadastro.classList.add('hidden');
        document.body.style.overflow = 'auto';
        if (formCadastro) formCadastro.reset();
    });
}

if (formCadastro) {
    formCadastro.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const produto = {
            id: 'PROD' + Date.now(),
            titulo: document.getElementById('tituloProduto').value,
            valor: parseInt(document.getElementById('valorProduto').value),
            estoque: parseInt(document.getElementById('qtdEstoque').value),
            qtdPorUsuario: parseInt(document.getElementById('qtdPorUsuario').value),
            imagem: document.getElementById('imagemProduto').value,
            dataCadastro: new Date().toISOString(),
            parceiro: usuarioAtual.email
        };
        
        produtos.push(produto);
        localStorage.setItem('produtos', JSON.stringify(produtos));
        
        modalCadastro.classList.add('hidden');
        document.body.style.overflow = 'auto';
        formCadastro.reset();
        
        carregarProdutos();
        mostrarNotificacao('sucesso', 'Produto Cadastrado', 'O item já está disponível na loja.');
    });
}

// BUSCA
function configurarBusca() {
    const inputBusca = document.getElementById('inputBusca');
    if (!inputBusca) return;
    
    inputBusca.addEventListener('input', (e) => {
        const termo = e.target.value.toLowerCase();
        
        if (termo === '') {
            renderizarProdutos(produtos);
            return;
        }
        
        const produtosFiltrados = produtos.filter(p => 
            p.titulo.toLowerCase().includes(termo)
        );
        
        renderizarProdutos(produtosFiltrados);
    });
}
window.abrirModalResgate = abrirModalResgate;