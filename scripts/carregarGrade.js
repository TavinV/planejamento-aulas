const scheduleData = {
    "id": "I1PB",
    "nome": "Técnico em Desenvolvimento de Sistemas",
    "qtdAlunos": 16,
    "horarios": {
        "segunda-feira": [
            { "inicio": "07:30", "fim": "11:15", "qtdAulas": 5, "disciplina": "LOPAL", "professor": "Ismael", "local": "LAB INF SL1 SUP" },
            { "inicio": "13:00", "fim": "17:00", "qtdAulas": 5, "disciplina": "SOP", "professor": "C. Ferreira", "local": "LAB PROGRAM" }
        ],
        "quinta-feira": [
            { "inicio": "07:30", "fim": "11:15", "qtdAulas": 5, "disciplina": "ARI", "professor": "Silas", "local": "LAB REDES" },
            { "inicio": "13:00", "fim": "13:45", "qtdAulas": 1, "disciplina": "SOP", "professor": "C. Ferreira", "local": "LAB PROGRAM" },
            { "inicio": "13:45", "fim": "17:00", "qtdAulas": 4, "disciplina": "LER", "professor": "Bruno", "local": "LAB INF - SL7" }
        ]
    }
};

const diasSemana = ["segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];

function gerarHorarios(aulas) {
    let horarios = [];
    aulas.forEach(aula => {
        let horaAtual = aula.inicio;
        for (let i = 0; i < aula.qtdAulas; i++) {
            horarios.push({ horario: horaAtual, disciplina: aula.disciplina, professor: aula.professor, local: aula.local });
            horaAtual = incrementarHorario(horaAtual);
        }
    });
    return horarios;
}

function incrementarHorario(horario) {
    let [hora, minuto] = horario.split(':').map(Number);
    minuto += 45;
    if (minuto >= 60) {
        hora += 1;
        minuto -= 60;
    }
    return `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
}

function criarTabela(turma) {
    let todosHorarios = new Set();
    diasSemana.forEach(dia => {
        if (turma.horarios[dia]) {
            turma.horarios[dia].forEach(aula => {
                let horario = aula.inicio;
                for (let i = 0; i < aula.qtdAulas; i++) {
                    todosHorarios.add(horario);
                    horario = incrementarHorario(horario);
                }
            });
        }
    });
    let horariosOrdenados = Array.from(todosHorarios).sort();

    const table = document.createElement("table");
    table.innerHTML = `<tr>
        <th>Período</th>
        ${diasSemana.map(dia => `<th>${dia.charAt(0).toUpperCase() + dia.slice(1)}</th>`).join("")}
    </tr>`;

    horariosOrdenados.forEach(horario => {
        const linha = document.createElement("tr");
        linha.innerHTML = `<td>${horario}</td>`;

        diasSemana.forEach(dia => {
            let celula = "";
            if (turma.horarios[dia]) {
                let aula = turma.horarios[dia].find(a => gerarHorarios([a]).some(h => h.horario === horario));
                if (aula) {
                    celula = aula.disciplina;
                }
            }
            linha.innerHTML += `<td>${celula}</td>`;
        });
        table.appendChild(linha);
    });

    document.body.appendChild(table);
}

criarTabela(scheduleData);