// ========== SALDO.JS - VERSÃO FINAL CORRIGIDA ==========

document.addEventListener('DOMContentLoaded', function() {
    console.log('💰 Sistema de saldo iniciado');
    garantirUsuarioNoBanco();
    atualizarSaldoNaTela();
});

// ========== GARANTIR QUE USUÁRIO ESTÁ NO BANCO ==========
function garantirUsuarioNoBanco() {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuario_logado'));
    
    if (!usuarioLogado) return;

    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    
    const emailLogado = (usuarioLogado.email || '').toLowerCase().trim();
    const emailEmpresaLogado = (usuarioLogado.emailEmpresa || '').toLowerCase().trim();
    
    const jaExiste = usuarios.some(u => {
        const emailBanco = (u.email || '').toLowerCase().trim();
        const emailEmpresaBanco = (u.emailEmpresa || '').toLowerCase().trim();
        
        return emailBanco === emailLogado || 
               emailEmpresaBanco === emailEmpresaLogado ||
               emailBanco === emailEmpresaLogado ||
               emailEmpresaBanco === emailLogado;
    });

    if (!jaExiste) {
        console.log('⚠️ Usuário não está no banco, adicionando...');
        
        const novoUsuario = {
            nome: usuarioLogado.nome || usuarioLogado.razaoSocial || 'Usuário',
            email: usuarioLogado.email || '',
            emailEmpresa: usuarioLogado.emailEmpresa || '',
            cargo: usuarioLogado.cargo || 'comum',
            saldo: parseFloat(usuarioLogado.saldo || 0),
            dataCadastro: new Date().toISOString()
        };

        usuarios.push(novoUsuario);
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        
        console.log('✅ Usuário adicionado:', novoUsuario.nome);
    }
}

// ========== ATUALIZAR SALDO NA TELA ==========
function atualizarSaldoNaTela() {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuario_logado'));
    
    if (!usuarioLogado) {
        console.warn('⚠️ Nenhum usuário logado');
        return;
    }

    const saldoReal = buscarSaldoNoBanco(usuarioLogado);
    
    console.log('💵 Atualizando saldo na tela:', saldoReal, 'EC para', usuarioLogado.nome);
    
    const elementoSaldo = document.getElementById('valor_saldo');
    if (elementoSaldo) {
        elementoSaldo.textContent = saldoReal;
    }

    // Sincroniza a sessão
    if (usuarioLogado.saldo !== saldoReal) {
        usuarioLogado.saldo = saldoReal;
        localStorage.setItem('usuario_logado', JSON.stringify(usuarioLogado));
    }
}

// ========== BUSCAR SALDO NO BANCO ==========
function buscarSaldoNoBanco(usuarioLogado) {
    const usuariosBanco = JSON.parse(localStorage.getItem('usuarios')) || [];
    
    const emailBusca = (usuarioLogado.email || '').toLowerCase().trim();
    const emailEmpresaBusca = (usuarioLogado.emailEmpresa || '').toLowerCase().trim();
    
    const usuarioEncontrado = usuariosBanco.find(u => {
        const emailBanco = (u.email || '').toLowerCase().trim();
        const emailEmpresaBanco = (u.emailEmpresa || '').toLowerCase().trim();
        
        return emailBanco === emailBusca || 
               emailEmpresaBanco === emailEmpresaBusca ||
               emailBanco === emailEmpresaBusca ||
               emailEmpresaBanco === emailBusca;
    });

    if (usuarioEncontrado) {
        if (usuarioEncontrado.saldo === undefined) {
            usuarioEncontrado.saldo = 0;
            localStorage.setItem('usuarios', JSON.stringify(usuariosBanco));
        }
        return parseFloat(usuarioEncontrado.saldo || 0);
    }

    console.warn('⚠️ Usuário não encontrado no banco');
    return parseFloat(usuarioLogado.saldo || 0);
}

// ========== CREDITAR PONTOS (VERSÃO CORRIGIDA FINAL) ==========
function creditarPontos(emailUsuario, valor) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💳 CREDITANDO PONTOS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (!emailUsuario) {
        console.error("❌ Email não definido");
        return false;
    }

    console.log(`📧 Para: ${emailUsuario}`);
    console.log(`💰 Valor: ${valor} EC`);

    // 1. CARREGAR BANCO DE DADOS
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const emailAlvo = emailUsuario.toLowerCase().trim();

    // 2. ENCONTRAR O USUÁRIO QUE VAI RECEBER
    let index = usuarios.findIndex(u => {
        const uEmail = (u.email || '').toLowerCase().trim();
        const uEmpresa = (u.emailEmpresa || '').toLowerCase().trim();
        return uEmail === emailAlvo || uEmpresa === emailAlvo;
    });

    if (index === -1) {
        console.error(`❌ Usuário ${emailUsuario} NÃO encontrado no banco!`);
        console.table(usuarios.map(u => ({ nome: u.nome, email: u.email, saldo: u.saldo })));
        return false;
    }

    // 3. ATUALIZAR SALDO NO BANCO DE DADOS
    let saldoAnterior = parseFloat(usuarios[index].saldo || 0);
    let novoSaldo = saldoAnterior + parseFloat(valor);
    
    console.log(`\n📊 OPERAÇÃO:`);
    console.log(`   Beneficiário: ${usuarios[index].nome}`);
    console.log(`   Saldo anterior: ${saldoAnterior} EC`);
    console.log(`   + Crédito: ${valor} EC`);
    console.log(`   = Novo saldo: ${novoSaldo} EC`);
    
    usuarios[index].saldo = novoSaldo;
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    console.log('✅ Banco atualizado');
    
    // 4. ATUALIZAR SESSÃO/TELA APENAS SE FOR O USUÁRIO LOGADO
    const sessao = JSON.parse(localStorage.getItem('usuario_logado'));
    
    if (sessao) {
        const emailSessao = (sessao.email || '').toLowerCase().trim();
        const emailEmpresaSessao = (sessao.emailEmpresa || '').toLowerCase().trim();
        
        const isUsuarioLogado = emailSessao === emailAlvo || emailEmpresaSessao === emailAlvo;
        
        console.log(`\n🔐 Usuário logado: ${sessao.nome} (${emailSessao || emailEmpresaSessao})`);
        console.log(`🎯 É o beneficiário? ${isUsuarioLogado ? 'SIM ✅' : 'NÃO ❌'}`);
        
        if (isUsuarioLogado) {
            console.log('🔄 Atualizando sessão e tela...');
            
            // Atualizar sessão
            sessao.saldo = novoSaldo;
            localStorage.setItem('usuario_logado', JSON.stringify(sessao));
            
            // ❌ NÃO ATUALIZA A TELA AQUI!
            // A tela será atualizada manualmente no validacao-descarte.js
            // para evitar mostrar o saldo errado
            
            console.log('✅ Sessão atualizada (tela será atualizada manualmente)');
        } else {
            console.log('ℹ️ Crédito para outro usuário - sessão não alterada');
        }
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    return true;
}

// ========== DIAGNÓSTICO ==========
function diagnosticarSaldo() {
    console.log('\n🔍 === DIAGNÓSTICO COMPLETO ===\n');
    
    const logado = JSON.parse(localStorage.getItem('usuario_logado'));
    console.log('👤 USUÁRIO LOGADO:');
    console.log('   Nome:', logado?.nome);
    console.log('   Email:', logado?.email);
    console.log('   Email Empresa:', logado?.emailEmpresa);
    console.log('   Cargo:', logado?.cargo);
    console.log('   Saldo na sessão:', logado?.saldo);
    
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    console.log(`\n📊 BANCO DE DADOS (${usuarios.length} usuários):`);
    console.table(usuarios.map(u => ({
        nome: u.nome,
        email: u.email,
        emailEmpresa: u.emailEmpresa,
        saldo: u.saldo,
        cargo: u.cargo
    })));
    
    if (logado) {
        const emailBusca = (logado.email || '').toLowerCase().trim();
        const emailEmpresaBusca = (logado.emailEmpresa || '').toLowerCase().trim();
        
        const userBanco = usuarios.find(u => {
            const emailBanco = (u.email || '').toLowerCase().trim();
            const emailEmpresaBanco = (u.emailEmpresa || '').toLowerCase().trim();
            return emailBanco === emailBusca || 
                   emailEmpresaBanco === emailEmpresaBusca ||
                   emailBanco === emailEmpresaBusca ||
                   emailEmpresaBanco === emailBusca;
        });
        
        if (userBanco) {
            console.log('\n✅ USUÁRIO ENCONTRADO NO BANCO:');
            console.log('   Saldo no banco:', userBanco.saldo);
            console.log('   Saldo na sessão:', logado.saldo);
            
            if (userBanco.saldo !== logado.saldo) {
                console.warn('⚠️ INCONSISTÊNCIA DETECTADA! Saldos diferentes.');
            } else {
                console.log('✅ Saldos sincronizados corretamente');
            }
        } else {
            console.log('\n❌ USUÁRIO NÃO ENCONTRADO NO BANCO');
        }
    }
    
    console.log('\n==============================\n');
}

// ========== EXPOR FUNÇÕES ==========
window.recarregarSaldo = atualizarSaldoNaTela;
window.creditarPontos = creditarPontos;
window.diagnosticarSaldo = diagnosticarSaldo;
window.garantirUsuarioNoBanco = garantirUsuarioNoBanco;