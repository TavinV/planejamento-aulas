import { Turma, Sala } from '../modules/Turmas.js'

// Expulsa usuários não logados
const token = localStorage.getItem('token');
if (!token || token !== 'adm') {
    localStorage.clear()
    window.location.href = '../index.html';
}

// Criando uma turma
const formCriar = document.getElementById('form-turma-post');

formCriar.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(formCriar);
    const id = formData.get("id").trim();
    const nome = formData.get("nome").trim();
    const qtd = parseInt(formData.get("qtd").trim());

    // Criando a turma
    Turma.criarTurma(id, nome, qtd);
});


//Adicionar horários / aulas a uma turma.
// Carregando as options do select
const selectSala = document.getElementById('select-sala');

(async () => {
    const salas = await Sala.getSalas()
    for (let i = 0; i < salas.length; i++) {
        const option = document.createElement('option');
        option.value = salas[i].id;
        option.text = salas[i].nome;
        selectSala.appendChild(option);
    }
})()


const formHorarios = document.getElementById("form-horarios-post")
formHorarios.addEventListener('submit', async (e) => {
    e.preventDefault()
    const formData = new FormData(formHorarios)
    const turmaId = formData.get("id").trim()
    const dia = formData.get("dia").trim()
    const qtdAulas = formData.get("qtd-aulas").trim()
    const horarioInicio = formData.get("inicio").trim()
    const disciplina = formData.get("disciplina").trim()
    const professor = formData.get("professor").trim()
    const sala = formData.get("sala").trim()

    await Turma.adicionarHorario(turmaId, dia, horarioInicio, qtdAulas, disciplina, professor, sala)

})


// Excluindo um horário
const formExcluir = document.getElementById("form-horarios-excluir");
formExcluir.addEventListener('submit', async (e) => {
    e.preventDefault()

    const formData = new FormData(formExcluir)

    const turmaId = formData.get("id").trim()
    const dia = formData.get("dia").trim()
    const horarioInicio = formData.get("inicio").trim()

    await Turma.excluirHorario(turmaId, dia, horarioInicio)
})