// ==========================================
// SISTEMA DE SALDO - DTech
// Versão Limpa e Funcional
// ==========================================

// ========== 1. INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', function() {
    inicializarSistema();
});

function inicializarSistema() {
    console.log('💰 Sistema de Saldo Iniciado');
    
    // Garante que o usuário logado está no banco
    const usuarioLogado = obterUsuarioLogado();
    if (usuarioLogado) {
        garantirUsuarioNoBanco(usuarioLogado);
        exibirSaldo();
    }
}

// ========== 2. OBTER USUÁRIO LOGADO ==========
function obterUsuarioLogado() {
    const usuarioString = localStorage.getItem('usuario_logado');
    if (!usuarioString) {
        console.warn('⚠️ Nenhum usuário logado');
        return null;
    }
    
    try {
        return JSON.parse(usuarioString);
    } catch (e) {
        console.error('❌ Erro ao parsear usuário logado:', e);
        return null;
    }
}

// ========== 3. GARANTIR USUÁRIO NO BANCO ==========
function garantirUsuarioNoBanco(usuarioLogado) {
    let usuarios = obterTodosUsuarios();
    
    // Busca se o usuário já existe
    const emailLogado = normalizarEmail(usuarioLogado.email || usuarioLogado.emailEmpresa);
    const existe = usuarios.some(u => 
        normalizarEmail(u.email) === emailLogado || 
        normalizarEmail(u.emailEmpresa) === emailLogado
    );
    
    if (existe) {
        console.log('✅ Usuário já está no banco');
        return;
    }
    
    // Se não existe, adiciona
    console.log('📝 Adicionando usuário ao banco:', usuarioLogado.nome);
    
    usuarios.push({
        nome: usuarioLogado.nome || usuarioLogado.razaoSocial || 'Usuário',
        email: usuarioLogado.email || '',
        emailEmpresa: usuarioLogado.emailEmpresa || '',
        cargo: usuarioLogado.cargo || 'comum',
        saldo: 0, // Saldo inicial
        dataCadastro: new Date().toISOString()
    });
    
    salvarTodosUsuarios(usuarios);
    console.log('✅ Usuário adicionado ao banco');
}

// ========== 4. EXIBIR SALDO NA TELA ==========
function exibirSaldo() {
    const usuarioLogado = obterUsuarioLogado();
    if (!usuarioLogado) return;
    
    const saldo = obterSaldo(usuarioLogado);
    
    const elementoSaldo = document.getElementById('valor_saldo');
    if (elementoSaldo) {
        elementoSaldo.textContent = saldo;
        console.log(`💵 Saldo exibido: EC ${saldo}`);
    }
}

// ========== 5. OBTER SALDO DO USUÁRIO ==========
function obterSaldo(usuarioLogado) {
    const usuarios = obterTodosUsuarios();
    
    const emailBusca = normalizarEmail(usuarioLogado.email || usuarioLogado.emailEmpresa);
    
    const usuario = usuarios.find(u => 
        normalizarEmail(u.email) === emailBusca || 
        normalizarEmail(u.emailEmpresa) === emailBusca
    );
    
    if (usuario) {
        const saldo = parseFloat(usuario.saldo || 0);
        console.log(`💰 Saldo de ${usuario.nome}: EC ${saldo}`);
        return saldo;
    }
    
    console.warn('⚠️ Usuário não encontrado no banco');
    return 0;
}

// ========== 6. ADICIONAR SALDO (GENÉRICO) ==========
/**
 * Adiciona saldo para um usuário
 * @param {string} email - Email do usuário (pode ser email ou emailEmpresa)
 * @param {number} valor - Valor a ser adicionado
 * @param {string} motivo - Motivo da adição (para log)
 * @returns {boolean} - True se sucesso, False se erro
 */
function adicionarSaldo(email, valor, motivo = 'Crédito') {
    console.log(`\n💳 === ADICIONANDO SALDO ===`);
    console.log(`📧 Email: ${email}`);
    console.log(`💰 Valor: EC ${valor}`);
    console.log(`📝 Motivo: ${motivo}`);
    
    if (!email || !valor) {
        console.error('❌ Email ou valor inválido');
        return false;
    }
    
    let usuarios = obterTodosUsuarios();
    const emailBusca = normalizarEmail(email);
    
    // Busca o usuário no banco
    const index = usuarios.findIndex(u => 
        normalizarEmail(u.email) === emailBusca || 
        normalizarEmail(u.emailEmpresa) === emailBusca
    );
    
    if (index === -1) {
        console.error(`❌ Usuário com email ${email} não encontrado no banco`);
        console.log('📋 Usuários disponíveis:', usuarios.map(u => u.email || u.emailEmpresa));
        return false;
    }
    
    // Atualiza o saldo
    const saldoAtual = parseFloat(usuarios[index].saldo || 0);
    const novoSaldo = saldoAtual + parseFloat(valor);
    
    usuarios[index].saldo = novoSaldo;
    
    // Salva no localStorage
    salvarTodosUsuarios(usuarios);
    
    console.log(`✅ Saldo atualizado com sucesso!`);
    console.log(`   Usuário: ${usuarios[index].nome}`);
    console.log(`   Saldo Anterior: EC ${saldoAtual}`);
    console.log(`   Valor Adicionado: EC ${valor}`);
    console.log(`   Novo Saldo: EC ${novoSaldo}\n`);
    
    // Se for o usuário logado, atualiza a sessão e a tela
    atualizarSessaoSeNecessario(email, novoSaldo);
    
    return true;
}

// ========== 7. REMOVER SALDO (PARA RESGATES NA LOJA) ==========
/**
 * Remove saldo de um usuário
 * @param {string} email - Email do usuário
 * @param {number} valor - Valor a ser removido
 * @param {string} motivo - Motivo da remoção (para log)
 * @returns {boolean} - True se sucesso, False se erro
 */
function removerSaldo(email, valor, motivo = 'Débito') {
    console.log(`\n💳 === REMOVENDO SALDO ===`);
    console.log(`📧 Email: ${email}`);
    console.log(`💰 Valor: EC ${valor}`);
    console.log(`📝 Motivo: ${motivo}`);
    
    if (!email || !valor) {
        console.error('❌ Email ou valor inválido');
        return false;
    }
    
    let usuarios = obterTodosUsuarios();
    const emailBusca = normalizarEmail(email);
    
    const index = usuarios.findIndex(u => 
        normalizarEmail(u.email) === emailBusca || 
        normalizarEmail(u.emailEmpresa) === emailBusca
    );
    
    if (index === -1) {
        console.error(`❌ Usuário não encontrado`);
        return false;
    }
    
    const saldoAtual = parseFloat(usuarios[index].saldo || 0);
    
    // Verifica se tem saldo suficiente
    if (saldoAtual < valor) {
        console.error(`❌ Saldo insuficiente! Atual: EC ${saldoAtual}, Necessário: EC ${valor}`);
        return false;
    }
    
    const novoSaldo = saldoAtual - parseFloat(valor);
    usuarios[index].saldo = novoSaldo;
    
    salvarTodosUsuarios(usuarios);
    
    console.log(`✅ Saldo removido com sucesso!`);
    console.log(`   Usuário: ${usuarios[index].nome}`);
    console.log(`   Saldo Anterior: EC ${saldoAtual}`);
    console.log(`   Valor Removido: EC ${valor}`);
    console.log(`   Novo Saldo: EC ${novoSaldo}\n`);
    
    atualizarSessaoSeNecessario(email, novoSaldo);
    
    return true;
}

// ========== 8. VALIDAR DESCARTE (FUNÇÃO ESPECÍFICA) ==========
/**
 * Processa a validação de descarte, creditando para DescarTech e ColeTech
 * @param {string} emailDescarTech - Email do usuário que fez o descarte
 * @param {string} emailColeTech - Email do coletor que validou
 * @param {number} peso - Peso do lixo em kg
 * @returns {Object} - {sucesso: boolean, pontosDescarTech: number, pontosColeTech: number}
 */
function validarDescarte(emailDescarTech, emailColeTech, peso) {
    console.log(`\n🗑️ === VALIDAÇÃO DE DESCARTE ===`);
    console.log(`⚖️ Peso: ${peso}kg`);
    
    // Cálculo dos pontos
    const pontosDescarTech = Math.floor(peso * 10); // 1kg = 10 EC
    const pontosColeTech = 5; // Fixo
    
    console.log(`\n💰 Distribuição de Pontos:`);
    console.log(`   DescarTech: EC ${pontosDescarTech} (${peso}kg × 10)`);
    console.log(`   ColeTech: EC ${pontosColeTech} (comissão fixa)`);
    
    // Credita para o DescarTech
    const sucessoDescarTech = adicionarSaldo(
        emailDescarTech, 
        pontosDescarTech, 
        `Descarte validado (${peso}kg)`
    );
    
    if (!sucessoDescarTech) {
        console.error('❌ Falha ao creditar para DescarTech');
        return {
            sucesso: false,
            pontosDescarTech: 0,
            pontosColeTech: 0,
            erro: 'Falha ao creditar para DescarTech'
        };
    }
    
    // Credita para o ColeTech
    const sucessoColeTech = adicionarSaldo(
        emailColeTech, 
        pontosColeTech, 
        'Comissão por validação'
    );
    
    if (!sucessoColeTech) {
        console.warn('⚠️ Falha ao creditar para ColeTech');
    }
    
    console.log(`\n✅ VALIDAÇÃO CONCLUÍDA COM SUCESSO!\n`);
    
    return {
        sucesso: true,
        pontosDescarTech: pontosDescarTech,
        pontosColeTech: pontosColeTech
    };
}

// ========== 9. PROCESSAR RESGATE (FUNÇÃO ESPECÍFICA) ==========
/**
 * Processa um resgate na loja
 * @param {string} emailUsuario - Email do usuário
 * @param {number} valorProduto - Valor do produto em EC
 * @param {string} nomeProduto - Nome do produto (para log)
 * @returns {Object} - {sucesso: boolean, novoSaldo: number}
 */
function processarResgate(emailUsuario, valorProduto, nomeProduto = 'Produto') {
    console.log(`\n🛒 === PROCESSANDO RESGATE ===`);
    console.log(`🏷️ Produto: ${nomeProduto}`);
    console.log(`💰 Valor: EC ${valorProduto}`);
    
    const sucesso = removerSaldo(
        emailUsuario, 
        valorProduto, 
        `Resgate: ${nomeProduto}`
    );
    
    if (!sucesso) {
        return {
            sucesso: false,
            novoSaldo: obterSaldo(obterUsuarioLogado())
        };
    }
    
    const usuarioLogado = obterUsuarioLogado();
    const novoSaldo = obterSaldo(usuarioLogado);
    
    console.log(`✅ RESGATE CONCLUÍDO!\n`);
    
    return {
        sucesso: true,
        novoSaldo: novoSaldo
    };
}

// ========== 10. FUNÇÕES AUXILIARES ==========

// Normaliza email para comparação
function normalizarEmail(email) {
    if (!email) return '';
    return email.toLowerCase().trim();
}

// Obtém todos os usuários do banco
function obterTodosUsuarios() {
    const usuariosString = localStorage.getItem('usuarios');
    if (!usuariosString) return [];
    
    try {
        return JSON.parse(usuariosString);
    } catch (e) {
        console.error('❌ Erro ao parsear usuários:', e);
        return [];
    }
}

// Salva todos os usuários no banco
function salvarTodosUsuarios(usuarios) {
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    
    // Dispara evento para atualizar outras abas
    window.dispatchEvent(new Event('storage'));
}

// Atualiza a sessão do usuário logado se necessário
function atualizarSessaoSeNecessario(emailModificado, novoSaldo) {
    const usuarioLogado = obterUsuarioLogado();
    if (!usuarioLogado) return;
    
    const emailLogado = normalizarEmail(usuarioLogado.email || usuarioLogado.emailEmpresa);
    const emailMod = normalizarEmail(emailModificado);
    
    // Se é o usuário logado que teve o saldo modificado
    if (emailLogado === emailMod) {
        // Atualiza a sessão
        usuarioLogado.saldo = novoSaldo;
        localStorage.setItem('usuario_logado', JSON.stringify(usuarioLogado));
        
        // Atualiza a tela
        const elementoSaldo = document.getElementById('valor_saldo');
        if (elementoSaldo) {
            elementoSaldo.textContent = novoSaldo;
        }
        
        console.log('🔄 Sessão e tela atualizadas');
    }
}

// ========== 11. DIAGNÓSTICO (PARA DEBUG) ==========
function diagnosticarSaldo() {
    console.log('\n🔍 === DIAGNÓSTICO DE SALDO ===\n');
    
    const logado = obterUsuarioLogado();
    if (logado) {
        console.log('👤 Usuário Logado:');
        console.log('   Nome:', logado.nome);
        console.log('   Email:', logado.email);
        console.log('   Email Empresa:', logado.emailEmpresa);
        console.log('   Saldo na Sessão:', logado.saldo);
    } else {
        console.log('❌ Nenhum usuário logado');
        return;
    }
    
    const usuarios = obterTodosUsuarios();
    console.log('\n📊 Banco de Dados:');
    console.log('   Total de Usuários:', usuarios.length);
    
    if (usuarios.length > 0) {
        console.log('\n   Usuários cadastrados:');
        usuarios.forEach((u, i) => {
            console.log(`   ${i + 1}. ${u.nome}`);
            console.log(`      Email: ${u.email}`);
            console.log(`      Cargo: ${u.cargo}`);
            console.log(`      Saldo: EC ${u.saldo}`);
        });
    }
    
    if (logado) {
        const saldoReal = obterSaldo(logado);
        console.log('\n💰 Saldo Real do Usuário Logado:', saldoReal);
    }
    
    console.log('\n=================================\n');
}

// ========== 12. EXPOR FUNÇÕES GLOBALMENTE ==========
window.SaldoDTech = {
    // Funções de consulta
    obterSaldo: obterSaldo,
    exibirSaldo: exibirSaldo,
    obterUsuarioLogado: obterUsuarioLogado,
    
    // Funções de modificação
    adicionarSaldo: adicionarSaldo,
    removerSaldo: removerSaldo,
    
    // Funções específicas de negócio
    validarDescarte: validarDescarte,
    processarResgate: processarResgate,
    
    // Debug
    diagnosticar: diagnosticarSaldo
};

// Compatibilidade com código antigo
window.creditarPontos = adicionarSaldo;
window.diagnosticarSaldo = diagnosticarSaldo;
window.recarregarSaldo = exibirSaldo;