/* === O COFRE (Local Storage) === */
// Pega os dados salvos no navegador ou cria uma lista vazia se não achar nada
const getData = (key) => JSON.parse(localStorage.getItem(key)) || [];
// Transforma os dados em texto e guarda no navegador
const setData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

/* === GESTÃO DE SALAS === */
function criarSala() {
    // Pega o nome da sala e tira os espaços sobrando
    const nome = document.getElementById("nomeSala").value.trim();
    // Se o nome estiver vazio, avisa e para por aqui
    if (!nome) return alert("Dá um nome pra essa sala, né? 😅");

    // Busca a lista de salas que já existem
    const salas = getData("salas");
    // Se já existir uma sala com esse nome, avisa e para
    if (salas.some(s => s.nome.toLowerCase() === nome.toLowerCase())) return alert("Essa sala já tá no esquema!");

    // Adiciona a nova sala com um ID baseado na hora atual
    salas.push({ id: Date.now(), nome });
    // Salva a lista atualizada no navegador
    setData("salas", salas);

    // Atualiza as caixinhas de seleção na tela
    atualizarSelectSala();
    atualizarFiltroSala();

    // Limpa o campo de texto depois de salvar
    document.getElementById("nomeSala").value = "";
}

/* === MENUS DE ESCOLHA (SELECTS) === */
function atualizarSelectSala() {
    // Pega o menu de seleção de salas do cadastro
    const select = document.getElementById("selectSala");
    // Reseta o menu com a opção inicial
    select.innerHTML = `<option value="" selected disabled>Escolha a sala</option>`;
    // Coloca cada sala salva como uma opção no menu
    getData("salas").forEach(s => select.innerHTML += `<option value="${s.id}">${s.nome}</option>`);
}

function atualizarFiltroSala() {
    // Pega o menu de seleção de salas da parte de chamada
    const select = document.getElementById("filtroSala");
    // Reseta o menu com a opção inicial
    select.innerHTML = `<option value="" selected disabled>Escolha a sala</option>`;
    // Coloca cada sala salva como uma opção no menu
    getData("salas").forEach(s => select.innerHTML += `<option value="${s.id}">${s.nome}</option>`);
}

/* === GESTÃO DE ALUNOS === */
function cadastrarAlunos() {
    // Pega o nome do aluno digitado
    const nome = document.getElementById("nomeAluno").value;
    // Pega o ID da sala que foi selecionada
    const selectId = document.getElementById("selectSala").value;

    // Se não digitar o nome ou não escolher a sala, avisa e para
    if (!nome.trim() || !selectId) return alert("Preencha o nome e a sala do jovem!");

    // Busca a lista de alunos já salvos
    const alunos = getData("alunos");

    // Verifica se esse aluno já existe nessa mesma sala específica
    const alunoexistente = alunos.some(a =>
        a.nome.toLowerCase() == nome.toLowerCase() && a.selectId === selectId
    );
    // Se o aluno já estiver lá, avisa o professor
    if (alunoexistente) {
        return alert("esse Aluno ja ta ai na sala professor 😬")
    }

    // Adiciona o aluno novo com nome e o ID da sala dele
    alunos.push({ id: Date.now(), nome, selectId });
    // Salva a lista de alunos no navegador
    setData("alunos", alunos);
    // Atualiza a lista visual de alunos
    listarAlunos();

    // Limpa o campo de nome do aluno
    document.getElementById("nomeAluno").value = "";
}

function listarAlunos() {
    // Pega o lugar onde a lista de alunos aparece
    const lista = document.getElementById("listaAlunos");
    // Pega a lista de salas para saber os nomes
    const salas = getData("salas");
    // Limpa a lista na tela antes de mostrar de novo
    lista.innerHTML = ``;
    // Para cada aluno, cria um item na lista visual
    getData("alunos").forEach(a => {
        // Acha a sala do aluno comparando o ID
        const sala = salas.find(s => s.id == a.selectId);
        // Coloca o nome do aluno e o nome da sala dele na tela
        lista.innerHTML += `<li class="list-group-item d-flex justify-content-between">${a.nome} <span class="badge bg-secondary">${sala?.nome || 'Sem sala'}</span></li>`;
    });
}

/* === MATEMÁTICA DOS RELATÓRIOS === */
function media() {
    // Pega a sala que o usuário quer ver a média
    const salaId = document.getElementById("filtroSala").value;
    // Se não escolher sala, dá erro
    if (!salaId) return alert("Selecione a sala pra eu calcular! 🧐");

    // Pega só os alunos que pertencem a essa sala escolhida
    const alunosSala = getData("alunos").filter(a => a.selectId == salaId);
    // Pega todas as presenças marcadas até hoje
    const presencas = getData("presencas");

    // Se a sala estiver vazia, avisa o usuário
    if (alunosSala.length === 0) return alert("Tem ninguém nessa sala não...");

    // Variáveis para somar o total de dias e quantos presentes
    let total = 0, presentes = 0;
    // Olha aluno por aluno daquela sala específica
    alunosSala.forEach(aluno => {
        // Pega as marcações de presença desse aluno
        const p = presencas.filter(pr => pr.alunoId == aluno.id);
        // Soma na contagem total
        total += p.length;
        // Soma só se ele estiver marcado como presente (true)
        presentes += p.filter(pr => pr.presente).length;
    });

    // Faz a conta matemática da porcentagem
    const calc = total > 0 ? (presentes / total) * 100 : 0;
    // Mostra o resultado final com 2 casas decimais
    alert(`Média da Turma: ${calc.toFixed(2)}% de presença!`);
}

function alunoindividual(){
    // Pega as listas de alunos e presenças
    const alunos = getData("alunos");
    const presencas = getData("presencas");
    
    // Cria uma nova lista com os cálculos para cada aluno
    const resumo = alunos.map(aluno => {
        // Filtra as presenças só desse aluno
        const suasPresencas = presencas.filter(p => p.alunoId == aluno.id);
        // Conta quantos dias de aula ele teve
        const total = suasPresencas.length;
        // Conta quantos dias ele veio
        const presentes = suasPresencas.filter(p => p.presente).length;
        // Diminui os presentes do total para saber as faltas
        const faltas = total - presentes;
        
        // Pega só as datas em que ele estava presente
        const diasPresente = suasPresencas.filter(p => p.presente).map(p => p.data);
        // Organiza as datas e pega a última (mais recente)
        const ultimoDia = diasPresente.length > 0 ? diasPresente.sort().reverse()[0] : "Nunca";

        // Devolve as informações organizadas
        return {
            nome: aluno.nome,
            porcentagem: total > 0 ? ((presentes / total) * 100).toFixed(2) : 0,
            faltas: faltas,
            ultimo: ultimoDia
        };
    });

    // Mostra os dados organizados em tabela no painel do desenvolvedor
    console.table(resumo); 
    // Avisa o usuário onde olhar os dados
    alert("Relatório individual gerado no console (F12 ou Inspecionar)!!!");
}

/* === SISTEMA DE CHAMADA === */
function carregarChamada() {
    // Pega a sala e a data que o professor quer marcar
    const salaId = document.getElementById("filtroSala").value;
    const data = document.getElementById("dataChamada").value;
    // Pega o lugar onde a lista de chamada vai aparecer
    const container = document.getElementById("chamada");

    // Se faltar sala ou data, avisa e para
    if (!salaId || !data) return alert("Escolha a sala e o dia primeiro!");

    // Pega as presenças do navegador
    const presencas = getData("presencas");
    // Limpa a tela antes de mostrar a chamada do dia
    container.innerHTML = ``;

    // Filtra os alunos daquela sala e cria o item de cada um
    getData("alunos").filter(a => a.selectId == salaId).forEach(a => {
        // Vê se já tem marcação pra esse aluno nesse dia
        const reg = presencas.find(p => p.alunoId == a.id && p.data == data);
        // Se já tiver marcado, deixa o checkbox acionado
        const check = reg?.presente ? "checked" : "";
        // Se já estiver marcado, escolhe a cor (verde pra presente, vermelho pra falta)
        const cor = reg ? (reg.presente ? "bg-success-subtle" : "bg-danger-subtle") : "";

        // Adiciona a linha do aluno com o checkbox na tela
        container.innerHTML += `
            <div class="d-flex justify-content-between align-items-center border p-2 mb-2 rounded ${cor}">
                ${a.nome} <input type="checkbox" ${check} onchange="marcarPresenca(${a.id}, this)">
            </div>`;
    });
}

/* === O FISCAL (MARCAR PRESENÇA) === */
function marcarPresenca(alunoId, checkbox) {
    // Pega a data que está selecionada no sistema
    const data = document.getElementById("dataChamada").value;
    // Pega a data de hoje de verdade
    const hoje = new Date().toISOString().split("T")[0];
    // Variável para guardar a justificativa se precisar
    let justificativa = "";

    // Se a data da chamada for antes de hoje, pede explicação
    if (data < hoje) {
        // Abre uma caixinha para o professor escrever
        justificativa = prompt("Mudar o passado exige uma explicação:");
        // Se o professor cancelar ou não escrever nada, ignora a mudança
        if (!justificativa) {
            alert("Sem justificativa, sem mudança! 😡");
            checkbox.checked = !checkbox.checked;
            return;
        }
    }

    // Pega a lista de presenças do navegador
    let presencas = getData("presencas");
    // Procura se já existe marcação desse aluno nessa data
    let existente = presencas.find(p => p.alunoId == alunoId && p.data == data);

    // Cria o objeto com a marcação, o horário atual e a justificativa
    const novoLog = { presente: checkbox.checked, tempo: new Date().toISOString(), justificativa };

    if (existente) {
        // Se já tinha marcação, adiciona essa nova mudança no histórico (array hist)
        existente.hist.push(novoLog);
        // Atualiza o estado atual do aluno
        existente.presente = checkbox.checked;
    } else {
        // Se é a primeira vez marcando, cria o registro do zero com o histórico inicial
        presencas.push({ alunoId, data, presente: checkbox.checked, hist: [novoLog] });
    }

    // Salva tudo no navegador
    setData("presencas", presencas);
    // Atualiza as cores da tela sem precisar recarregar tudo
    carregarChamada();
}

// --- BACKUP DOS DADOS (Exportar arquivo) ---
function baixarBackup() {
    // Organiza salas, alunos e presenças em um único lugar
    const dados = {
        salas: getData("salas"),
        alunos: getData("alunos"),
        presencas: getData("presencas")
    };
    
    // Transforma os dados em um arquivo de texto tipo JSON
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
    // Cria um link temporário para o arquivo
    const url = URL.createObjectURL(blob);
    // Cria um elemento de "link" invisível
    const a = document.createElement("a");
    // Aponta o link para o arquivo criado
    a.href = url;
    // Dá o nome para o arquivo que será baixado
    a.download = "backup_chamada_escolar.json";
    // Clica no link automaticamente para baixar
    a.click();
    // Avisa que deu tudo certo
    alert("Backup gerado com sucesso! Guarde seu arquivo JSON. ✅");
}

/* === START === */
// Quando o site abre, carrega as salas nos menus e a lista de alunos
atualizarSelectSala();
atualizarFiltroSala();
listarAlunos();