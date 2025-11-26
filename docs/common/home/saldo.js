// saldo.js

document.addEventListener('DOMContentLoaded', function() {
    atualizarSaldoNaTela();
});

// Função principal que gerencia o saldo
function atualizarSaldoNaTela() {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuario_logado'));
    
    // Se não tiver ninguém logado, para a execução
    if (!usuarioLogado) return;

    // 1. Busca o saldo atualizado do banco de dados principal (garantia de dados frescos)
    const saldoAtual = buscarSaldoNoBanco(usuarioLogado);

    // 2. Atualiza o HTML (procure onde está o número 300 e coloque id="valor_saldo")
    const elementoSaldo = document.getElementById('valor_saldo');
    if (elementoSaldo) {
        elementoSaldo.textContent = saldoAtual;
    }
}

// Função auxiliar para buscar/criar o saldo no "Banco de Dados"
function buscarSaldoNoBanco(usuarioLogado) {
    let usuariosBanco = JSON.parse(localStorage.getItem('usuarios')) || [];
    
    // Procura o usuário no banco pelo email (ou emailEmpresa)
    let usuarioIndex = usuariosBanco.findIndex(u => 
        (u.email === usuarioLogado.email) || (u.emailEmpresa === usuarioLogado.emailEmpresa)
    );

    // Se encontrou o usuário
    if (usuarioIndex !== -1) {
        // Se ele ainda não tem saldo definido, define como 0
        if (usuariosBanco[usuarioIndex].saldo === undefined) {
            usuariosBanco[usuarioIndex].saldo = 0; // Saldo inicial
            localStorage.setItem('usuarios', JSON.stringify(usuariosBanco));
        }
        return usuariosBanco[usuarioIndex].saldo;
    }
    
    // Se for Admin fixo ou usuário não salvo no banco, retorna 0 ou um valor padrão
    return usuarioLogado.saldo || 0;
}

// EXTRAS: Função para adicionar pontos (Use isso nos botões de reciclar)
function adicionarPontos(pontos) {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuario_logado'));
    if (!usuarioLogado) return;

    let usuariosBanco = JSON.parse(localStorage.getItem('usuarios')) || [];
    
    let usuarioIndex = usuariosBanco.findIndex(u => 
        (u.email === usuarioLogado.email) || (u.emailEmpresa === usuarioLogado.emailEmpresa)
    );

    if (usuarioIndex !== -1) {
        // Soma os pontos
        let saldoAtual = usuariosBanco[usuarioIndex].saldo || 0;
        usuariosBanco[usuarioIndex].saldo = saldoAtual + pontos;
        
        // Salva no banco
        localStorage.setItem('usuarios', JSON.stringify(usuariosBanco));
        
        // Atualiza a tela
        atualizarSaldoNaTela();
        alert(`Parabéns! Você ganhou ${pontos} EsudaCoins!`);
    }
}