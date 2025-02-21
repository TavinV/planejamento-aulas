const API_BASE_URL = `http://localhost:3000`
const TURMAS_URL = API_BASE_URL + "/turmas"

const getTurmas = async () => {
    try {
        const response = await fetch(TURMAS_URL)
        const turmas = await response.json()

        return turmas
    } catch (error) {
        console.error(error)
        return null
    }
}


class Horario {
    constructor(dia, inicio, qtdAulas, disciplina, professor, local, horariosDoDia) {
        // Se o início for null, assume o fim da última aula cadastrada no mesmo dia
        if (inicio === null && horariosDoDia.length > 0) {
            inicio = horariosDoDia[horariosDoDia.length - 1].fim;
        } else if (inicio === null) {
            inicio = "07:30"; // Se for a primeira aula do dia, começa às 07:30
        }

        this.inicio = inicio;
        this.qtdAulas = qtdAulas;
        this.fim = this.calcularFim(inicio, qtdAulas);
        this.disciplina = disciplina;
        this.professor = professor;
        this.local = local;
    }

    calcularFim(inicio, qtdAulas) {
        let [horas, minutos] = inicio.split(":").map(Number);
        let totalMinutos = horas * 60 + minutos + qtdAulas * 45;
        let fimHoras = Math.floor(totalMinutos / 60);
        let fimMinutos = totalMinutos % 60;
        return `${fimHoras.toString().padStart(2, "0")}:${fimMinutos.toString().padStart(2, "0")}`;
    }
}

class Turma {
    constructor(id, nome, qtdAlunos) {
        this.id = id;
        this.nome = nome;
        this.qtdAlunos = qtdAlunos;
        this.horarios = {};
    }

    adicionarHorario(dia, inicio, qtdAulas, disciplina, professor, local) {
        if (!this.horarios[dia]) {
            this.horarios[dia] = [];
        }
        let novoHorario = new Horario(dia, inicio, qtdAulas, disciplina, professor, local, this.horarios[dia]);
        this.horarios[dia].push(novoHorario);
    }

    excluirHorario(dia, inicio) {
        if (this.horarios[dia]) {
            this.horarios[dia] = this.horarios[dia].filter(horario => horario.inicio !== inicio);
            if (this.horarios[dia].length === 0) {
                delete this.horarios[dia]; // Remove o dia caso não haja mais aulas
            }
        }
    }

    alterarHorario(dia, inicio, novosDados) {
        if (this.horarios[dia]) {
            let horario = this.horarios[dia].find(horario => horario.inicio === inicio);
            if (horario) {
                Object.assign(horario, novosDados);
                horario.fim = horario.calcularFim(horario.inicio, horario.qtdAulas);
            }
        }
    }

    getHorarios() {
        return this.horarios;
    }

    async salvarNoBanco() {
        const turmas = await getTurmas();

        if (turmas) {
            let method = 'POST'; // Default: Criar nova turma

            turmas.forEach(element => {
                if (element.id === this.id) {
                    method = 'PUT'; // Se já existe, então atualiza
                }
            });

            const fetchURL = method === 'POST' ? TURMAS_URL : TURMAS_URL + "/" + this.id;

            fetch(fetchURL,
                {
                    method: method,
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify(this)
                });
        } else {
            console.log('Erro ao buscar as turmas');
        }
    }
}

/*

// 🔹 Criando uma Turma
const turmaA = new Turma("i1p1-A", "I1P1 - Turma A", 16);

turmaA.adicionarHorario("segunda-feira", '7:30', 3, "ARIOT", "Flávio", "Lab Redes")
turmaA.adicionarHorario("segunda-feira", null, 2, "SOP", "Carlos F.", "Lab Redes") // Ao usar null como argumento, o início da aula é o fim da anterior.
turmaA.adicionarHorario("segunda-feira", '13:00', 5, "LREQ", "Bruno", "Sala 7")

// turmaA.alterarHorario("segunda-feira", '13:00', { disciplina: "PBE", professor: "Silas" })
// turmaA.excluirHorario("segunda-feira", '13:00')

const horarios = turmaA.getHorarios()
console.log(horarios)

async function addTurmaB() {
    // alert("Turma B Adicionada.")
    console.log(turmaA.getHorarios())

    turmaA.salvarNoBanco()

}

*/