
document.addEventListener('DOMContentLoaded', function () {

    const usuarioLogadoString = localStorage.getItem('usuario_logado');
    const elementoNome = document.getElementById('user_account');


    if (usuarioLogadoString && elementoNome) {

        const usuarioObj = JSON.parse(usuarioLogadoString);


        const ultimoNome = usuarioObj.nome.split(' ')[1];

        elementoNome.textContent = `Olá, ${ultimoNome}!`;
    } else {
        window.location.href = '../login/login.html'; 
    }
});
