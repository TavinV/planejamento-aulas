const API_BASE_URL = `http://localhost:3000`
const TURMAS_URL = API_BASE_URL + "/turmas"
const SALAS_URL = API_BASE_URL + "/salas"


class Sala {
    static async getSala(id) {
        try {
            const response = await fetch(`${SALAS_URL}/${id}`);
            return await response.json();
        } catch (error) {
            console.error("Erro ao buscar sala:", error);
            return null;
        }
    }

    static async getSalas() {
        try {
            const response = await fetch(`${SALAS_URL}`);
            return await response.json();
        } catch (error) {
            console.error("Erro ao buscar salas:", error);
            return null;
        }
    }

    static async atualizarSala(id, novosDados) {
        try {
            await fetch(`${SALAS_URL}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(novosDados),
            });
            console.log(`Sala ${id} atualizada com sucesso!`);
        } catch (error) {
            console.error("Erro ao atualizar sala:", error);
        }
    }

    static async adicionarHorario(idSala, dia, inicio, fim, qtdAulas, idTurma) {
        const sala = await this.getSala(idSala);
        if (!sala) return;

        if (!sala.horarios[dia]) sala.horarios[dia] = [];
        sala.horarios[dia].push({ inicio, fim, qtdAulas, turma: idTurma });

        await this.atualizarSala(idSala, sala);
    }

    static async excluirHorario(idSala, dia, inicio) {
        const sala = await this.getSala(idSala);

        if (!sala || !sala.horarios[dia]) {
            console.log("NÃO ACHEI A SALA");
            return;
        }

        // Remove o horário desejado
        sala.horarios[dia] = sala.horarios[dia].filter(h => h.inicio !== inicio);

        // Se o dia ficar sem horários, mantemos o array vazio em vez de deletar a chave
        if (sala.horarios[dia].length === 0) {
            sala.horarios[dia] = [];
        }

        await this.atualizarSala(idSala, sala);
    }

    static async alterarHorario(idSala, dia, novosDados) {
        const sala = await this.getSala(idSala);
        if (!sala || !sala.horarios[dia]) return;

        const horario = sala.horarios[dia].find(h => h.inicio === novosDados.antigoInicio);
        if (!horario) return;

        Object.assign(horario, novosDados);
        await this.atualizarSala(idSala, sala);
    }
}

class Turma {
    static async criarTurma(id, nome, qtdAlunos) {
        try {
            await fetch(TURMAS_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, nome, qtdAlunos, horarios: {} }),
            });
            console.log(`Turma ${this.id} criada com sucesso!`);
        } catch (error) {
            console.error("Erro ao criar turma:", error);
        }
    }

    static async getTurma(id) {
        try {
            const response = await fetch(`${TURMAS_URL}/${id}`);
            return await response.json();
        } catch (error) {
            console.error("Erro ao buscar turma:", error);
            return null;
        }
    }

    static async getTurmas() {
        try {
            const response = await fetch(`${TURMAS_URL}`);
            return await response.json();
        } catch (error) {
            console.error("Erro ao buscar turmas:", error);
            return null;
        }
    }

    static async atualizarTurma(id, novosDados) {
        try {
            await fetch(`${TURMAS_URL}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(novosDados),
            });
            console.log(`Turma ${id} atualizada com sucesso!`);
        } catch (error) {
            console.error("Erro ao atualizar turma:", error);
        }
    }

    static async adicionarHorario(idTurma, dia, inicio, qtdAulas, disciplina, professor, local) {
        const turma = await this.getTurma(idTurma);
        if (!turma) return;

        if (!turma.horarios[dia]) turma.horarios[dia] = [];

        // Verifica se a sala está disponível
        const sala = await Sala.getSala(local);
        if (sala.horarios[dia]?.some(horario => horario.inicio === inicio)) {
            console.error(`Sala ${local} já está ocupada nesse horário.`);
            return;
        }

        // Calcula horário de término
        const horarioFim = this.calcularHorarioFim(inicio, qtdAulas);

        // Cria o novo horário
        const novoHorario = { inicio, fim: horarioFim, qtdAulas, disciplina, professor, local };
        turma.horarios[dia].push(novoHorario);

        await this.atualizarTurma(idTurma, turma);
        await Sala.adicionarHorario(local, dia, inicio, horarioFim, qtdAulas, idTurma);
    }

    // Função auxiliar para calcular o horário de fim
    static calcularHorarioFim(horarioInicio, qtdAulas) {
        const [hora, minuto] = horarioInicio.split(":").map(Number);
        const duracaoTotal = qtdAulas * 45; // Tempo total em minutos

        // Soma os minutos ao horário de início
        let minutosFinais = minuto + duracaoTotal;
        let horasFinais = hora + Math.floor(minutosFinais / 60);
        minutosFinais = minutosFinais % 60;

        // Formata o horário final como HH:MM
        const horarioFim = `${String(horasFinais).padStart(2, "0")}:${String(minutosFinais).padStart(2, "0")}`;
        return horarioFim;
    }

    static async excluirHorario(idTurma, dia, inicio) {
        const turma = await this.getTurma(idTurma);
        if (!turma || !turma.horarios[dia]) return;

        const horarioExcluir = turma.horarios[dia].find(h => h.inicio == inicio);
        const salaDesocupar = horarioExcluir.local

        turma.horarios[dia] = turma.horarios[dia].filter(h => h.inicio !== inicio);
        if (turma.horarios[dia].length === 0) delete turma.horarios[dia];

        await this.atualizarTurma(idTurma, turma);
        await Sala.excluirHorario(salaDesocupar, dia, inicio);
    }

    static async alterarHorario(idTurma, dia, novosDados) {
        const turma = await this.getTurma(idTurma);
        if (!turma || !turma.horarios[dia]) return;

        const horario = turma.horarios[dia].find(h => h.inicio === novosDados.inicio || h.inicio === novosDados.antigoInicio);
        if (!horario) return;

        Object.assign(horario, novosDados);
        await this.atualizarTurma(idTurma, turma);
        await Sala.alterarHorario(horario.local, dia, novosDados);
    }
}





// Criando todas as salas

async function criarSalas() {
    const salas = [
        new Sala('ofic-eletricas-1-2025', 'Oficina INSTALAÇÕES ELETRICAS 1 2025'),
        new Sala('ofic-eletricas-2-2025', 'Oficina INSTALAÇÕES ELETRICAS 2 2025'),
        new Sala('lab-maquinas-2025', 'LABORATORIO DE MÁQUINAS 2025'),
        new Sala('lab-clp-2025-1', 'Laborátorio CLP 2025'),
        new Sala('lab-eletronica', 'Laborátorio ELETRÔNICA'),
        new Sala('lab-clp-2025-2', 'Laborátorio CLP 2025'),
        new Sala('lab-automacao-2025', 'Laboratório de Automação Predial - 2025'),
        new Sala('lab-mecatronica-robo', 'Lab Mecatronica Robo'),
        new Sala('lab-sensores-clp-2025', 'Laboratorio Sensores CLP - 2025'),
        new Sala('auditorio', 'AUDITORIO'),
        new Sala('sala-aula-1', 'Sala de Aula 1'),
        new Sala('sala-aula-2-2025', 'Sala de Aula 2 - 2025'),
        new Sala('sala-aula-3', 'Sala de Aula 3'),
        new Sala('sala-aula-4', 'Sala de Aula 4'),
        new Sala('sala-aula-5', 'Sala de Aula 5'),
        new Sala('sala-aula-6', 'Sala de Aula 6'),
        new Sala('ofic-mecanica-1', 'Oficina Mecânica - Setor 1'),
        new Sala('ofic-mecanica-2', 'Oficina Mecânica - Setor 2'),
        new Sala('ofic-cnc-maquinas', 'Oficina de CNC - Maquinas'),
        new Sala('ofic-manutencao-2025', 'OFICINA MANUTENÇÃO -2025'),
        new Sala('ofic-cnc-mecatronica', 'Oficina de CNC - Mecatronica'),
        new Sala('ofic-soldagem', 'Oficina de Soldagem'),
        new Sala('sala-aula-28-metrologia', 'Sala de Aula 28 - Metrologia'),
        new Sala('lab-hidraulica-29-2025', 'Laboratorio Hidraulica- Sala 29 -2025'),
        new Sala('lab-pneumatica-30', 'Laboratorio Pneumatica - Sala 30'),
        new Sala('lab-1-piso-b-2025', 'LABORATÓRIO 1 - PISO SUPERIOR B 2025'),
        new Sala('lab-programacao-1-2025', 'LABORATÓRIO PROGRAMAÇÃO 1 2025'),
        new Sala('lab-redes-2025', 'LABORATÓRIO REDES 2025'),
        new Sala('lab-cad-inf-1-2025', 'Laboratorio CAD/INF 1 2025'),
        new Sala('lab-cam-inf-2', 'Laboratorio CAM/INF- 2'),
        new Sala('new-lab-sala-7-2025', 'NEW LAB SALA 7 2025')
    ];

    salas.forEach(sala => sala.salvarNoBanco());
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
