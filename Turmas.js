const API_BASE_URL = `http://localhost:3000`
const TURMAS_URL = API_BASE_URL + "/turmas"
const SALAS_URL = API_BASE_URL + "/salas"

class Sala {
    constructor (id, nome){
        this.id = id
        this.nome = nome
        this.horarios = {"segunda-feira": [],"terça-feira": [],"quarta-feira": [],"quinta-feira": [],"sexta-feira": [], "sábado": []}
    }

    adicionarHorario (diaSemana, horarioInicio, qtdAulas, turma,){
        this.horarios[diaSemana].push({
            "horario-inicio": horarioInicio,
            "horario-fim": this.calcularFim(horarioInicio, qtdAulas),
            "turma": turma 
        })
    }

    calcularFim(inicio, qtdAulas) {
        let [horas, minutos] = inicio.split(":").map(Number);
        let totalMinutos = horas * 60 + minutos + qtdAulas * 45;
        let fimHoras = Math.floor(totalMinutos / 60);
        let fimMinutos = totalMinutos % 60;
        return `${fimHoras.toString().padStart(2, "0")}:${fimMinutos.toString().padStart(2, "0")}`;
    }

    getSalas = async () => {
        try {
            const response = await fetch(SALAS_URL)
            const salas = await response.json()
    
            return salas
        } catch (error) {
            console.error(error)
            return null
        }
    }

    static fromJson(json) {
        // Cria uma nova instância da classe Sala com base no JSON fornecido
        const sala = new sala(json.id, json.nome);
        
        // Preenche os horários com base no JSON
        sala.horarios = json.horarios;
        return sala;
    }

    static async getSala(id) {
        try {
            const response = await fetch(SALAS_URL + `/${id}`)
            const sala = await response.json()
    
            return sala
        } catch (error) {
            console.error(error)
            return null
        }
    }
    

    async salvarNoBanco() {
        const salas = await this.getSalas();

        if (salas) {
            let method = 'POST'; // Default: Criar nova sala

            salas.forEach(element => {
                if (element.id === this.id) {
                    method = 'PUT'; // Se já existe, então atualiza
                }
            });

            const fetchURL = method === 'POST' ? SALAS_URL : SALAS_URL + "/" + this.id;

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

    static fromJson(json) {
        // Cria uma nova instância da classe Turma com base no JSON fornecido
        const turma = new Turma(json.id, json.nome, json.qtdAlunos);
        
        // Preenche os horários com base no JSON
        turma.horarios = json.horarios;
        return turma;
    }

    static async getTurma(id) {
        try {
            const response = await fetch(TURMAS_URL + `/${id}`)
            const turmas = await response.json()
    
            return turmas
        } catch (error) {
            console.error(error)
            return null
        }
    }

    getTurmas = async () => {
        try {
            const response = await fetch(TURMAS_URL)
            const turmas = await response.json()
    
            return turmas
        } catch (error) {
            console.error(error)
            return null
        }
    }
    

    async adicionarHorario(dia, inicio, qtdAulas, disciplina, professor, local) {
        if (!this.horarios[dia]) {
            this.horarios[dia] = [];
        }
        let novoHorario = new Horario(dia, inicio, qtdAulas, disciplina, professor, local, this.horarios[dia]);
        this.horarios[dia].push(novoHorario);


        const salaJson = await Sala.getSala(local)
        const salaObject = new Sala(salaJson.id, salaJson.nome)

        salaObject.adicionarHorario(dia,inicio,qtdAulas,this.id)
        salaObject.salvarNoBanco()
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
        const turmas = await this.getTurmas();

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



// 🔹 Criando uma Turma
async function addTurmaB() {
    const turmaBInfo = await Turma.getTurma("I1P1B")
    const turmaB = Turma.fromJson(turmaBInfo)

    if (turmaB) {
        console.log(turmaB.getHorarios())
        turmaB.adicionarHorario("quinta-feira", "7:30", "3", "ARIOT", "Flávio", "sala7")
        turmaB.adicionarHorario("quarta-feira", "13:00", 5, "Javascript", "Bruno", "sala7")
        document.write(turmaB.getHorarios())
    }

    turmaB.salvarNoBanco()
}

// Criando uma Sala

async function criarSala7(){
    const sala7 = new Sala('sala7', "Sala 7")
    sala7.adicionarHorario("segunda-feira", "7:30", 5,"I1PB")
    sala7.adicionarHorario("segunda-feira", "14:45", 3, "LREQ", 'I1PB')
    console.log(sala7.horarios)
    sala7.salvarNoBanco()
}