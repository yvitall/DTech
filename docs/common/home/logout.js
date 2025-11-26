document.addEventListener('DOMContentLoaded', function() {
    
    const containerLogout = document.getElementById('logout');

    if (containerLogout) {

        const botaoSair = containerLogout.querySelector('a');
        
        if (botaoSair) {
            botaoSair.addEventListener('click', function() {

                localStorage.removeItem('usuario_logado');
            });
        }
    }
});