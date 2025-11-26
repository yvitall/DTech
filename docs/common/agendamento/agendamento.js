document.addEventListener('DOMContentLoaded', function () {

    let userData = null;
    let nomeUsuario = '';

    const usuario_logado = localStorage.getItem('usuario_logado');
    
    if (usuario_logado) {
        userData = JSON.parse(usuario_logado);
        
        // CORREÇÃO AQUI: Verifica nome OU razaoSocial e insere no HTML
        const nomeParaExibir = userData.nome || userData.razaoSocial || userData.email || 'Usuário';
        const primeiroNome = nomeParaExibir.split(' ')[0];
        
        const elementoNome = document.getElementById('user_account');
        if (elementoNome) {
            elementoNome.textContent = `Olá, ${primeiroNome}`;
        }
        
        // Preenche o input de nome automaticamente também (opcional, mas útil)
        const inputNome = document.getElementById('nome');
        if (inputNome) inputNome.value = nomeParaExibir;
    }
    else {
        console.log('Nenhum usuário encontrado. Redirecionando...');
        window.location.href = '../login/login-uni.html';
    }

    const today = new Date().toISOString().split('T')[0];
    document.getElementById('data').setAttribute('min', today);
});

// Gerenciar campo "Outro"
const outroInput = document.getElementById('outro');
let outroCheckbox = null;

outroInput.addEventListener('blur', function () {
    const valor = this.value.trim();

    // Remove checkbox anterior se existir
    if (outroCheckbox) {
        outroCheckbox.remove();
        outroCheckbox = null;
    }

    // Cria novo checkbox se houver valor
    if (valor) {
        const label = document.createElement('label');
        label.className = 'flex items-center gap-3 cursor-pointer group';
        label.innerHTML = `
                    <input 
                        type="checkbox" 
                        name="componente" 
                        value="${valor}"
                        checked
                        class="w-5 h-5 accent-[#cbff58] cursor-pointer focus:ring-2 focus:ring-[#cbff58]/50"
                    >
                    <span class="text-white group-hover:text-[#cbff58] transition-colors">${valor}</span>
                `;

        const container = document.getElementById('componentesContainer');
        container.appendChild(label);
        outroCheckbox = label;

        this.value = '';
    }
});

// Função para gerar ID único
function gerarIdAgendamento() {
    return 'DT' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 5).toUpperCase();
}

document.getElementById('btnAgendar').addEventListener('click', function () {
    const form = document.getElementById('formAgendamento');

    // Validar formulário
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const nome = document.getElementById('nome').value;
    const curso = document.getElementById('curso').value;
    const data = document.getElementById('data').value;
    const hora = document.getElementById('hora').value;

    // Verificar componentes selecionados
    const componentesSelecionados = Array.from(document.querySelectorAll('input[name="componente"]:checked'))
        .map(cb => cb.value);

    if (componentesSelecionados.length === 0) {
        alert('Por favor, selecione pelo menos um componente eletrônico!');
        return;
    }

    // Gerar ID do agendamento
    const idAgendamento = gerarIdAgendamento();

    // Criar objeto do agendamento
    const agendamento = {
        id: idAgendamento,
        nome: nome,
        curso: curso,
        data: data,
        hora: hora,
        componentes: componentesSelecionados,
        timestamp: new Date().toISOString()
    };

    // Salvar no localStorage
    let agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
    agendamentos.push(agendamento);
    localStorage.setItem('agendamentos', JSON.stringify(agendamentos));

    // Formatar data para exibição
    const dataFormatada = new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');

    // Preencher modal
    document.getElementById('modalId').textContent = idAgendamento;
    document.getElementById('modalData').textContent = dataFormatada;
    document.getElementById('modalHora').textContent = hora;

    // Mostrar modal
    document.getElementById('modalConfirmacao').classList.remove('hidden');

    // Limpar formulário (exceto nome)
    document.getElementById('curso').value = '';
    document.getElementById('data').value = '';
    document.getElementById('hora').value = '';
    document.querySelectorAll('input[name="componente"]').forEach(cb => cb.checked = false);

    // Remover checkbox "outro" se existir
    if (outroCheckbox) {
        outroCheckbox.remove();
        outroCheckbox = null;
    }
});

// Fechar modal
document.getElementById('btnFecharModal').addEventListener('click', function () {
    document.getElementById('modalConfirmacao').classList.add('hidden');
});

document.getElementById('btnEntendi').addEventListener('click', function () {
    document.getElementById('modalConfirmacao').classList.add('hidden');
});

// Fechar modal clicando fora
document.getElementById('modalConfirmacao').addEventListener('click', function (e) {
    if (e.target === this) {
        this.classList.add('hidden');
    }
});