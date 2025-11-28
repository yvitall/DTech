// ========== VARIÁVEIS GLOBAIS ==========
let usuarios = [];
let agendamentos = [];
let filtroAtivo = 'todos';

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Painel Admin iniciado');

    if (!verificarAcessoAdmin()) {
        return;
    }

    carregarDados();
    calcularEstatisticas();
    renderizarUsuarios();
    renderizarCargos();
});

// ========== VERIFICAR ACESSO ADMIN ==========
function verificarAcessoAdmin() {
    const usuarioLogadoString = localStorage.getItem('usuario_logado');
    const elementoNome = document.getElementById('user_account');

    // Se não tiver usuário logado, manda pro login
    if (!usuarioLogadoString) {
        alert('❌ Você precisa estar logado!');
        window.location.href = '../login/login-uni.html';
        return false;
    }

    const usuario = JSON.parse(usuarioLogadoString);

    // Verificar se é Admin
    const cargo = (usuario.cargo || '').toLowerCase();

    if (cargo !== 'admin' && cargo !== 'administrador') {
        alert('❌ Acesso restrito para Administradores!');
        window.location.href = '../common/home/home-ini.html';
        return false;
    }

    console.log('✅ Admin identificado:', usuario.nome);

    // Exibir nome do admin
    if (elementoNome) {
        const nomeParaExibir = usuario.nome || usuario.razaoSocial || 'Admin';
        const primeiroNome = nomeParaExibir.split(' ')[0];
        elementoNome.textContent = `Olá, ${primeiroNome}`;
    }

    return true;
}

// ========== CARREGAR DADOS ==========
function carregarDados() {
    // 1️⃣ USUÁRIOS FIXOS (mesmo do login)
    const adminFixos = [
        {
            email: 'yvital@dtech.com',
            senha: 'admin@dtech',
            nome: 'Yuri Vital',
            cargo: 'Admin',
            saldo: 0,
            fixo: true
        },
        {
            email: 'sramara@dtech.com',
            senha: 'admin@dtech',
            nome: 'Sophia Ramara',
            cargo: 'Admin',
            saldo: 0,
            fixo: true
        },
        {
            email: 'gmarques@dtech.com',
            senha: 'admin@dtech',
            nome: 'Gustavo Marques',
            cargo: 'Admin',
            saldo: 0,
            fixo: true
        }
    ];

    const coletechFixos = [
        {
            email: 'fchicout@dtech.com',
            senha: 'coletech@dtech',
            nome: 'Fábio Chicout',
            cargo: 'ColeTech',
            saldo: 0,
            fixo: true
        }
    ];

    // 2️⃣ USUÁRIOS DO STORAGE
    const usuariosStorage = JSON.parse(localStorage.getItem('usuarios')) || [];

    // 3️⃣ COMBINAR TODOS (fixos + storage)
    usuarios = [...adminFixos, ...coletechFixos, ...usuariosStorage];

    // 4️⃣ CARREGAR AGENDAMENTOS
    agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];

    console.log(`📦 Carregados ${usuarios.length} usuários (${adminFixos.length + coletechFixos.length} fixos + ${usuariosStorage.length} storage)`);
    console.log(`📦 Carregados ${agendamentos.length} agendamentos`);
}

// ========== CALCULAR ESTATÍSTICAS ==========
function calcularEstatisticas() {
    // Total de usuários
    const totalUsuarios = usuarios.length;

    // Total de descartes (todos os agendamentos)
    const totalDescartes = agendamentos.length;

    // Total de lixo descartado (apenas concluídos)
    const agendamentosConcluidos = agendamentos.filter(a => a.status === 'concluido');
    const totalPeso = agendamentosConcluidos.reduce((acc, a) => acc + (parseFloat(a.peso) || 0), 0);

    // Total de coletas (agendamentos concluídos)
    const totalColetas = agendamentosConcluidos.length;

    // Total de moedas geradas
    const totalMoedas = agendamentosConcluidos.reduce((acc, a) => acc + (parseFloat(a.pontosGerados) || 0), 0);

    // Atualizar na tela
    document.getElementById('statUsuarios').textContent = totalUsuarios;
    document.getElementById('statDescartes').textContent = totalDescartes;
    document.getElementById('statPeso').textContent = totalPeso.toFixed(1);
    document.getElementById('statColetas').textContent = totalColetas;
    document.getElementById('statMoedas').textContent = totalMoedas;

    console.log('\n📊 ESTATÍSTICAS:');
    console.log(`   Usuários: ${totalUsuarios}`);
    console.log(`   Descartes: ${totalDescartes}`);
    console.log(`   Peso: ${totalPeso.toFixed(1)} kg`);
    console.log(`   Coletas: ${totalColetas}`);
    console.log(`   Moedas: ${totalMoedas} EC\n`);
}

// ========== NAVEGAÇÃO ENTRE ABAS ==========
function mostrarAba(aba) {
    const abaUsuarios = document.getElementById('abaUsuarios');
    const abaCargos = document.getElementById('abaCargos');
    const btnAbaUsuarios = document.getElementById('btnAbaUsuarios');
    const btnAbaCargos = document.getElementById('btnAbaCargos');

    if (aba === 'usuarios') {
        // Mostrar aba de usuários
        abaUsuarios.classList.remove('hidden');
        abaCargos.classList.add('hidden');

        // Estilizar botões
        btnAbaUsuarios.classList.remove('bg-[#d9d9d9]');
        btnAbaUsuarios.classList.add('bg-[#cbff58]');

        btnAbaCargos.classList.remove('bg-[#cbff58]');
        btnAbaCargos.classList.add('bg-[#d9d9d9]');

    } else if (aba === 'cargos') {
        // Mostrar aba de cargos
        abaUsuarios.classList.add('hidden');
        abaCargos.classList.remove('hidden');

        // Estilizar botões
        btnAbaCargos.classList.remove('bg-[#d9d9d9]');
        btnAbaCargos.classList.add('bg-[#cbff58]');

        btnAbaUsuarios.classList.remove('bg-[#cbff58]');
        btnAbaUsuarios.classList.add('bg-[#d9d9d9]');
    }
}

// ========== RENDERIZAR USUÁRIOS ==========
function renderizarUsuarios() {
    const tabela = document.getElementById('tabelaUsuarios');
    if (!tabela) return;

    tabela.innerHTML = '';

    // Contar por tipo
    const countComum = usuarios.filter(u => (u.cargo || '').toLowerCase() === 'comum').length;
    const countColeTech = usuarios.filter(u => (u.cargo || '').toLowerCase() === 'coletech').length;
    const countParceiro = usuarios.filter(u => (u.cargo || '').toLowerCase() === 'parceiro').length;
    const countTodos = usuarios.length;

    document.getElementById('countTodos').textContent = countTodos;
    document.getElementById('countComum').textContent = countComum;
    document.getElementById('countColeTech').textContent = countColeTech;
    document.getElementById('countParceiro').textContent = countParceiro;

    // Filtrar usuários
    let usuariosFiltrados = usuarios;

    if (filtroAtivo !== 'todos') {
        usuariosFiltrados = usuarios.filter(u =>
            (u.cargo || '').toLowerCase() === filtroAtivo
        );
    }

    if (usuariosFiltrados.length === 0) {
        tabela.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-8 text-white/50">
                    <span class="material-symbols-outlined text-6xl mb-2">folder_off</span>
                    <p>Nenhum usuário encontrado</p>
                </td>
            </tr>
        `;
        return;
    }

    usuariosFiltrados.forEach(usuario => {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-white/10 hover:bg-white/5 transition-all';

        const cargo = (usuario.cargo || 'comum').toLowerCase();
        const cargoNomes = {
            'comum': 'DescarTech',
            'coletech': 'ColeTech',
            'parceiro': 'Parceiro',
            'admin': 'Administrador'
        };

        const cargoCores = {
            'comum': 'bg-blue-500/30 text-blue-300',
            'coletech': 'bg-yellow-400/30 text-yellow-300',
            'parceiro': 'bg-purple-500/30 text-purple-300',
            'admin': 'bg-red-500/30 text-red-300'
        };

        const dataCadastro = usuario.dataCadastro
            ? new Date(usuario.dataCadastro).toLocaleDateString('pt-BR')
            : 'N/A';

        tr.innerHTML = `
            <td class="p-4 text-white font-semibold">${usuario.nome || 'N/A'}</td>
            <td class="p-4 text-white/70">${usuario.email || usuario.emailEmpresa || 'N/A'}</td>
            <td class="p-4">
                <span class="px-3 py-1 rounded-full text-xs font-bold ${cargoCores[cargo]}">
                    ${cargoNomes[cargo] || cargo}
                </span>
            </td>
            <td class="p-4 text-[#cbff58] font-bold">${usuario.saldo || 0} EC</td>
            <td class="p-4 text-white/50 text-sm">${dataCadastro}</td>
        `;

        tabela.appendChild(tr);
    });
}

// ========== FILTRAR USUÁRIOS ==========
function filtrarUsuarios(tipo) {
    filtroAtivo = tipo;

    // Atualizar botões
    const botoes = {
        'todos': 'filtroTodos',
        'comum': 'filtroComum',
        'coletech': 'filtroColeTech',
        'parceiro': 'filtroParceiro'
    };

    Object.entries(botoes).forEach(([key, id]) => {
        const btn = document.getElementById(id);
        if (btn) {
            if (key === tipo) {
                btn.classList.remove('bg-[#d9d9d9]');
                btn.classList.add('bg-[#cbff58]');
            } else {
                btn.classList.remove('bg-[#cbff58]');
                btn.classList.add('bg-[#d9d9d9]');
            }
        }
    });

    renderizarUsuarios();
}

// ========== RENDERIZAR GERENCIAMENTO DE CARGOS ==========
function renderizarCargos() {
    const tabela = document.getElementById('tabelaCargos');
    if (!tabela) return;

    tabela.innerHTML = '';

    if (usuarios.length === 0) {
        tabela.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-8 text-white/50">
                    <span class="material-symbols-outlined text-6xl mb-2">folder_off</span>
                    <p>Nenhum usuário cadastrado</p>
                </td>
            </tr>
        `;
        return;
    }

    usuarios.forEach((usuario, index) => {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-white/10 hover:bg-white/5 transition-all';

        const cargoAtual = (usuario.cargo || 'comum').toLowerCase();
        const cargoNomes = {
            'comum': 'DescarTech',
            'coletech': 'ColeTech',
            'parceiro': 'Parceiro',
            'admin': 'Administrador'
        };

        const isFixo = usuario.fixo === true;

        // Se for usuário fixo, desabilita a edição
        if (isFixo) {
            tr.innerHTML = `
                <td class="p-4 text-white font-semibold">${usuario.nome || 'N/A'}</td>
                <td class="p-4 text-white/70">${usuario.email || usuario.emailEmpresa || 'N/A'}</td>
                <td class="p-4">
                    <span class="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white">
                        ${cargoNomes[cargoAtual] || cargoAtual}
                    </span>
                </td>
                <td class="p-4 text-white/50 italic" colspan="2">
                    <span class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-sm">lock</span>
                        Usuário do sistema (não editável)
                    </span>
                </td>
            `;
        } else {
            tr.innerHTML = `
                <td class="p-4 text-white font-semibold">${usuario.nome || 'N/A'}</td>
                <td class="p-4 text-white/70">${usuario.email || usuario.emailEmpresa || 'N/A'}</td>
                <td class="p-4">
                    <span class="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white">
                        ${cargoNomes[cargoAtual] || cargoAtual}
                    </span>
                </td>
                <td class="p-4">
                    <select 
                        id="select-${index}" 
                        class="bg-white/10 text-white border-2 border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-[#cbff58] transition-all"
                    >
                        <option value="comum" ${cargoAtual === 'comum' ? 'selected' : ''}>DescarTech</option>
                        <option value="coletech" ${cargoAtual === 'coletech' ? 'selected' : ''}>ColeTech</option>
                        <option value="parceiro" ${cargoAtual === 'parceiro' ? 'selected' : ''}>Parceiro</option>
                        <option value="admin" ${cargoAtual === 'admin' ? 'selected' : ''}>Administrador</option>
                    </select>
                </td>
                <td class="p-4 text-center">
                    <button 
                        onclick="alterarCargo(${index})"
                        class="px-6 py-2 bg-[#cbff58] text-black font-bold rounded-lg hover:bg-[#cbff58]/80 hover:scale-105 active:scale-95 transition-all"
                    >
                        Salvar
                    </button>
                </td>
            `;
        }

        tabela.appendChild(tr);
    });
}

// ========== ALTERAR CARGO ==========
function alterarCargo(index) {
    // Verificar se é usuário fixo
    if (usuarios[index].fixo === true) {
        alert('❌ Este usuário faz parte do sistema e não pode ser editado!');
        return;
    }

    const select = document.getElementById(`select-${index}`);
    const novoCargo = select.value;

    console.log(`\n🔄 Alterando cargo do usuário ${index}`);
    console.log(`   Usuário: ${usuarios[index].nome}`);
    console.log(`   Cargo atual: ${usuarios[index].cargo}`);
    console.log(`   Novo cargo: ${novoCargo}`);

    // Atualizar no array
    usuarios[index].cargo = novoCargo;

    // Salvar apenas usuários NÃO FIXOS no localStorage
    const usuariosParaSalvar = usuarios.filter(u => u.fixo !== true);
    localStorage.setItem('usuarios', JSON.stringify(usuariosParaSalvar));

    // Verificar se o usuário alterado está logado
    const usuarioLogado = JSON.parse(localStorage.getItem('usuario_logado'));
    if (usuarioLogado) {
        const emailLogado = (usuarioLogado.email || '').toLowerCase().trim();
        const emailAlterado = (usuarios[index].email || '').toLowerCase().trim();

        if (emailLogado === emailAlterado) {
            console.log('⚠️ Usuário alterado está logado, atualizando sessão...');
            usuarioLogado.cargo = novoCargo;
            localStorage.setItem('usuario_logado', JSON.stringify(usuarioLogado));
        }
    }

    console.log('✅ Cargo alterado com sucesso!\n');

    // Atualizar tabelas
    renderizarUsuarios();
    renderizarCargos();

    // Mostrar alerta de sucesso
    const cargoNomes = {
        'comum': 'DescarTech',
        'coletech': 'ColeTech',
        'parceiro': 'Parceiro',
        'admin': 'Administrador'
    };

    alert(`✅ Cargo Alterado!\n\n${usuarios[index].nome} agora é ${cargoNomes[novoCargo]}.`);
}

// ========== EXPOR FUNÇÕES GLOBAIS ==========
window.mostrarAba = mostrarAba;
window.filtrarUsuarios = filtrarUsuarios;
window.alterarCargo = alterarCargo;

console.log("bug: duplicando yurivital (user), mostrando saldo incorreto e data de criação")