// ==========================================================
// URL DO GOOGLE APPS SCRIPT
// ==========================================================

const SCRIPT_URL =
    'https://script.google.com/macros/s/AKfycbzNuiTFLSr35QZCgrvD3jAAI0VuVKWuAe3TjZ_r4jw-mTjQRc5lc-kz01C6KsofWkve/exec';


// ==========================================================
// DADOS GLOBAIS
// ==========================================================

let dadosGlobaisSistema = {
    cadastro: [],
    frequencia: [],
    atividade: [],
    desempenho: [],
    resumo: {
        presencas: {}
    }
};

let paginaAtual = 1;
let itensPorPagina = 10;


// ==========================================================
// INICIALIZAÇÃO
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {

    const hoje =
        new Date().toISOString().split('T')[0];

    const freqData =
        document.getElementById('freq_data');

    const ativData =
        document.getElementById('ativ_data');

    const desData =
        document.getElementById('des_data');

    if (freqData) {
        freqData.value = hoje;
    }

    if (ativData) {
        ativData.value = hoje;
    }

    if (desData) {
        desData.value = hoje;
    }

    carregarDadosSistema();
});


// ==========================================================
// TROCA DE ABA
// ==========================================================

function switchTab(tabId) {

    document
        .querySelectorAll('.form-section')
        .forEach(sec =>
            sec.classList.remove('active')
        );

    document
        .querySelectorAll('.tab-btn')
        .forEach(btn =>
            btn.classList.remove('active')
        );

    const aba =
        document.getElementById(tabId);

    if (aba) {
        aba.classList.add('active');
    }

    if (
        typeof event !== 'undefined' &&
        event.currentTarget
    ) {
        event.currentTarget.classList.add('active');
    }

    carregarDadosSistema();
}


// ==========================================================
// CALCULAR IDADE
// ==========================================================

function calcularIdade() {

    const nasc =
        document.getElementById(
            'cad_nascimento'
        ).value;

    if (!nasc) {
        return;
    }

    const anoNasc =
        new Date(nasc).getFullYear();

    const anoAtual =
        new Date().getFullYear();

    document.getElementById(
        'cad_idade'
    ).value =
        anoAtual - anoNasc;
}


// ==========================================================
// CARREGAR DADOS DO APPS SCRIPT
// ==========================================================

function carregarDadosSistema() {

    fetch(SCRIPT_URL)

        .then(response => {

            if (!response.ok) {
                throw new Error(
                    'Erro HTTP: ' +
                    response.status
                );
            }

            return response.json();
        })

        .then(data => {

            console.log(
                'JSON UNIFICADO:',
                data
            );

            dadosGlobaisSistema = data;

            // ------------------------------
            // ID DO ATLETA
            // ------------------------------

            const cadId =
                document.getElementById(
                    'cad_id'
                );

            if (cadId) {

                cadId.value =
                    data.proximoIdAtleta || 1;
            }


            // ------------------------------
            // ID DA ATIVIDADE
            // ------------------------------

            const ativId =
                document.getElementById(
                    'ativ_id'
                );

            if (ativId) {

                ativId.value =
                    data.proximoIdAtividade || 1;
            }


            // ------------------------------
            // POPULAR SELECTS
            // ------------------------------

            popularSelects(
                data.cadastro || []
            );

            popularSelectAtividades(
                data.atividade || []
            );


            // ------------------------------
            // TABELA
            // ------------------------------

            renderizarTabelaAtletas();

            // ------------------------------
            // TABELA DE FREQUÊNCIA DO DIA
            // ------------------------------
            carregarFrequenciaDoDia();

        })

        .catch(error => {

            console.error(
                'Erro ao carregar dados:',
                error
            );

        });
}


// ==========================================================
// POPULAR SELECTS DE ATLETAS
// ==========================================================

function popularSelects(atletas) {
    const selectDes = document.getElementById('des_select_atleta');
    const selectDash = document.getElementById('dash_select_atleta'); // <--- ADICIONE ESTA LINHA

    let options = '<option value="">Selecione um atleta...</option>';

    atletas.forEach(atleta => {
        const id = atleta.id_atleta || atleta.id;
        const nome = atleta.nome;

        if (id && nome) {
            options += `<option value="${id}">${nome}</option>`;
        }
    });

    if (selectDes) selectDes.innerHTML = options;
    if (selectDash) selectDash.innerHTML = options; // <--- ADICIONE ESTA LINHA
}


// ==========================================================
// POPULAR SELECT DE ATIVIDADES
// ==========================================================

function popularSelectAtividades(
    atividades
) {

    const select =
        document.getElementById(
            'des_select_atividade'
        );

    if (!select) {
        return;
    }


    let options =
        '<option value="">Selecione uma atividade...</option>';


    atividades.forEach(atividade => {

        const id =
            atividade.id_atividade ||
            atividade.id;

        const nome =
            atividade.nome_atividade ||
            atividade.nome ||
            '-';


        if (id) {

            options +=
                `<option value="${id}">
                    ${nome}
                </option>`;
        }

    });


    select.innerHTML =
        options;
}


// ==========================================================
// ATUALIZAR ATIVIDADE SELECIONADA
// ==========================================================

function atualizarAtividadeSelecionada() {

    const select =
        document.getElementById(
            'des_select_atividade'
        );

    const campoId =
        document.getElementById(
            'des_id_atividade'
        );

    if (
        select &&
        campoId
    ) {

        campoId.value =
            select.value;
    }
}


// ==========================================================
// ATUALIZAR ATLETA DO DESEMPENHO
// ==========================================================

function atualizarAtletaDesempenho() {

    const select =
        document.getElementById(
            'des_select_atleta'
        );

    const campoId =
        document.getElementById(
            'des_id_atleta'
        );

    if (
        select &&
        campoId
    ) {

        campoId.value =
            select.value;
    }
}


// ==========================================================
// RENDERIZAR TABELA DE FREQUÊNCIA POR DATA
// ==========================================================

function carregarFrequenciaDoDia() {
    const tbody = document.getElementById('tabela_frequencia_corpo');
    if (!tbody) return;

    const atletas = dadosGlobaisSistema.cadastro || [];
    const frequencias = dadosGlobaisSistema.frequencia || [];
    const dataInput = document.getElementById('freq_data');
    
    if (!dataInput) return;
    const dataSelecionada = dataInput.value;

    tbody.innerHTML = '';

    if (atletas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Nenhum atleta cadastrado.</td></tr>`;
        return;
    }

    atletas.forEach(atleta => {
        const idAtleta = String(atleta.id_atleta || atleta.id || '').trim();
        const nomeAtleta = atleta.nome || '-';

        // Procura se já existe registro de frequência para este atleta nesta data
        const registroExistente = frequencias.find(f => {
            const fId = String(f.id_atleta || '').trim();
            const fData = String(f.data || '').split('T')[0];
            return fId === idAtleta && fData === dataSelecionada;
        });

        const situacaoAtual = registroExistente ? registroExistente.situacao : 'P';
        const justificativaAtual = registroExistente ? (registroExistente.justificativa || '') : '';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${idAtleta}</td>
            <td><strong>${nomeAtleta}</strong></td>
            <td>
                <select class="freq-situacao-item" data-id="${idAtleta}" style="padding: 6px; width: 100%;">
                    <option value="P" ${situacaoAtual === 'P' ? 'selected' : ''}>P - Presente</option>
                    <option value="F" ${situacaoAtual === 'F' ? 'selected' : ''}>F - Faltou</option>
                </select>
            </td>
            <td>
                <input type="text" class="freq-justificativa-item" data-id="${idAtleta}" value="${justificativaAtual}" placeholder="Motivo da falta..." style="padding: 6px; width: 100%;">
            </td>
        `;
        tbody.appendChild(tr);
    });
}


// ==========================================================
// ENVIAR FREQUÊNCIA EM LOTE (COM BLOQUEIO DE DUPLICIDADE)
// ==========================================================

function enviarFrequenciaLote(event) {
    event.preventDefault();

    const dataSelecionada = document.getElementById('freq_data').value;
    const linhas = document.querySelectorAll('#tabela_frequencia_corpo tr');
    const frequenciasExistentes = dadosGlobaisSistema.frequencia || [];
    
    if (linhas.length === 0) {
        alert('Nenhum atleta para salvar.');
        return;
    }

    let itensParaEnviar = [];
    let atletasDuplicados = [];

    linhas.forEach(tr => {
        const selectSituacao = tr.querySelector('.freq-situacao-item');
        const inputJustificativa = tr.querySelector('.freq-justificativa-item');

        if (selectSituacao && inputJustificativa) {
            const idAtleta = selectSituacao.getAttribute('data-id');
            const atleta = dadosGlobaisSistema.cadastro.find(a => String(a.id_atleta || a.id) === String(idAtleta));
            const nomeAtleta = atleta ? atleta.nome : 'Atleta';

            // VERIFICAÇÃO DE DUPLICIDADE NA MESMA DATA
            const jaExisteNaData = frequenciasExistentes.some(f => {
                const fId = String(f.id_atleta || '').trim();
                const fData = String(f.data || '').split('T')[0];
                return fId === String(idAtleta) && fData === dataSelecionada;
            });

            if (jaExisteNaData) {
                atletasDuplicados.push(nomeAtleta);
            }

            itensParaEnviar.push({
                acao: 'frequencia',
                id_atleta: idAtleta,
                nome: nomeAtleta,
                data: dataSelecionada,
                situacao: selectSituacao.value,
                justificativa: inputJustificativa.value
            });
        }
    });

    // Se já houver registros para algum atleta nesta data, bloqueia o envio
    if (atletasDuplicados.length > 0) {
        alert(`❌ Bloqueio de Segurança:\n\nJá existe um registro de frequência lançado para a data ${dataSelecionada.split('-').reverse().join('/')} para o(s) seguinte(s) atleta(s):\n\n• ${atletasDuplicados.join('\n• ')}\n\nPara alterar, edite diretamente na planilha ou selecione outra data.`);
        return;
    }

    mostrarLoading(true);

    let promessas = itensParaEnviar.map(item => {
        return fetch(SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(item)
        }).then(res => res.json());
    });

    Promise.all(promessas)
        .then(() => {
            alert('Frequências salvas com sucesso!');
            carregarDadosSistema();
        })
        .catch(error => {
            console.error('Erro ao salvar frequências:', error);
            alert('Erro ao salvar algumas frequências.');
        })
        .finally(() => {
            mostrarLoading(false);
        });
}


// ==========================================================
// ENVIAR DADOS (OUTROS FORMULÁRIOS)
// ==========================================================

function enviarDados(event, tipo) {

    event.preventDefault();


    let dados = {};


    // ======================================================
    // CADASTRO
    // ======================================================

    if (tipo === 'cadastro') {

        dados = {

            acao: 'cadastro',

            id_atleta:
                document.getElementById(
                    'cad_id'
                ).value,

            nome:
                document.getElementById(
                    'cad_nome'
                ).value,

            nascimento:
                document.getElementById(
                    'cad_nascimento'
                ).value,

            idade:
                document.getElementById(
                    'cad_idade'
                ).value,

            responsavel:
                document.getElementById(
                    'cad_responsavel'
                ).value,

            contato:
                document.getElementById(
                    'cad_contato'
                ).value
        };
    }


    // ======================================================
    // CRIAR ATIVIDADE
    // ======================================================

    else if (
        tipo === 'criar_atividade'
    ) {

        dados = {

            acao: 'atividade',

            id_atividade:
                document.getElementById(
                    'ativ_id'
                ).value,

            nome_atividade:
                document.getElementById(
                    'ativ_nome_atividade'
                ).value,

            data:
                document.getElementById(
                    'ativ_data'
                ).value,

            situacao:
                document.getElementById(
                    'ativ_situacao'
                ).value,

            tipo:
                document.getElementById(
                    'ativ_tipo'
                ).value
        };
    }


    // ======================================================
    // DESEMPENHO
    // ======================================================

    else if (
        tipo === 'desempenho'
    ) {

        const idAtleta =
            document.getElementById(
                'des_select_atleta'
            ).value;

        const atleta =
            dadosGlobaisSistema.cadastro.find(
                a =>
                    String(
                        a.id_atleta || a.id
                    ) ===
                    String(idAtleta)
            );


        dados = {

            acao: 'desempenho',

            id_desempenho:
                dadosGlobaisSistema
                    .proximoIdDesempenho || 1,

            id_atividade:
                document.getElementById(
                    'des_select_atividade'
                ).value,

            id_atleta:
                idAtleta,

            nome:
                atleta
                    ? atleta.nome
                    : '',

            desempenho:
                document.getElementById(
                    'des_desempenho'
                ).value,

            data:
                document.getElementById(
                    'des_data'
                ).value
        };
    }


    else {

        alert(
            'Tipo de operação não reconhecido.'
        );

        return;
    }


    console.log(
        'ENVIANDO:',
        dados
    );


    mostrarLoading(true);


    fetch(
        SCRIPT_URL,
        {
            method: 'POST',

            headers: {
                'Content-Type':
                    'text/plain;charset=utf-8'
            },

            body:
                JSON.stringify(dados)
        }
    )

    .then(response =>
        response.json()
    )

    .then(resultado => {

        console.log(
            'RESPOSTA:',
            resultado
        );


        if (
            resultado.result !==
            'success'
        ) {

            throw new Error(
                resultado.error ||
                'Erro desconhecido'
            );
        }


        alert(
            'Dados salvos com sucesso!'
        );


        // Limpa o formulário
        limparFormulario(tipo);


        // Recarrega os dados
        carregarDadosSistema();

    })

    .catch(error => {

        console.error(
            'Erro ao enviar:',
            error
        );

        alert(
            'Erro ao salvar os dados:\n' +
            error.message
        );

    })

    .finally(() => {

        mostrarLoading(false);

    });
}


// ==========================================================
// LIMPAR FORMULÁRIO
// ==========================================================

function limparFormulario(tipo) {

    let formId = '';


    if (tipo === 'cadastro') {
        formId = 'formCadastro';
    }

    else if (
        tipo === 'criar_atividade'
    ) {
        formId =
            'formCriarAtividade';
    }

    else if (
        tipo === 'desempenho'
    ) {
        formId =
            'formDesempenho';
    }


    const form =
        document.getElementById(
            formId
        );


    if (form) {
        form.reset();
    }


    // Recalcula IDs depois de recarregar
    setTimeout(
        carregarDadosSistema,
        300
    );
}


// ==========================================================
// LOADING
// ==========================================================

function mostrarLoading(
    mostrar
) {

    const loading =
        document.getElementById(
            'loading'
        );

    if (!loading) {
        return;
    }

    loading.style.display =
        mostrar
            ? 'block'
            : 'none';
}


// ==========================================================
// TABELA DE ATLETAS
// ==========================================================

// ==========================================================
// TABELA DE ATLETAS (COM FILTRO DE MÊS E ANO ESPECÍFICO)
// ==========================================================

function renderizarTabelaAtletas() {

    const atletas = dadosGlobaisSistema.cadastro || [];
    const frequencias = dadosGlobaisSistema.frequencia || [];
    const desempenhos = dadosGlobaisSistema.desempenho || [];

    const tbody = document.getElementById('tabela_atletas_corpo');
    if (!tbody) {
        return;
    }

    tbody.innerHTML = '';

    if (atletas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;">
                    Nenhum atleta cadastrado.
                </td>
            </tr>
        `;
        return;
    }

    // ======================================================
    // CAPTURAR FILTROS DE MÊS E ANO
    // ======================================================
    const selectMes = document.getElementById('filtro_mes');
    const selectAno = document.getElementById('filtro_ano');

    const mesSelecionado = selectMes ? selectMes.value : 'todos'; // Ex: '01', '02', etc.
    const anoSelecionado = selectAno ? selectAno.value : 'todos'; // Ex: '2026', '2027', etc.


    // ======================================================
    // FILTRAR E MONTAR DADOS
    // ======================================================

    const linhas = atletas.map(atleta => {

        const idAtleta = String(atleta.id_atleta || atleta.id || '').trim();
        const nomeAtleta = atleta.nome || '-';
        const idadeAtleta = atleta.idade || '-';
        const respAtleta = atleta.responsavel || '-';


        // ----------------------------------------------
        // FILTRAR FREQUÊNCIAS DO ATLETA POR MÊS/ANO
        // ----------------------------------------------
        let freqAtleta = frequencias.filter(f => {
            if (!f.data) return false;
            const idF = String(f.id_atleta || '').trim();
            return idF === idAtleta;
        });

        if (mesSelecionado !== 'todos' || anoSelecionado !== 'todos') {
            freqAtleta = freqAtleta.filter(f => {
                // Formato esperado da data: 'YYYY-MM-DD' ou 'YYYY-MM-DDTHH:mm:ss'
                const partesData = String(f.data).split('T')[0].split('-');
                if (partesData.length < 3) return false;

                const anoReg = partesData[0];
                const mesReg = partesData[1];

                const matchAno = (anoSelecionado === 'todos' || anoReg === anoSelecionado);
                const matchMes = (mesSelecionado === 'todos' || mesReg === mesSelecionado);

                return matchAno && matchMes;
            });
        }

        const presencas = freqAtleta.filter(
            f => String(f.situacao || '').trim().toUpperCase() === 'P'
        ).length;


        // ----------------------------------------------
        // FILTRAR DESEMPENHOS DO ATLETA POR MÊS/ANO
        // ----------------------------------------------
        let desempenhoAtleta = desempenhos.filter(d => {
            if (!d.data) return false;
            const idD = String(d.id_atleta || '').trim();
            return idD === idAtleta;
        });

        if (mesSelecionado !== 'todos' || anoSelecionado !== 'todos') {
            desempenhoAtleta = desempenhoAtleta.filter(d => {
                const partesData = String(d.data).split('T')[0].split('-');
                if (partesData.length < 3) return false;

                const anoReg = partesData[0];
                const mesReg = partesData[1];

                const matchAno = (anoSelecionado === 'todos' || anoReg === anoSelecionado);
                const matchMes = (mesSelecionado === 'todos' || mesReg === mesSelecionado);

                return matchAno && matchMes;
            });
        }

        const totalAtividades = desempenhoAtleta.length;


        return {
            idAtleta,
            nomeAtleta,
            idadeAtleta,
            respAtleta,
            presencas,
            totalAtividades
        };

    });


    // ======================================================
    // PAGINAÇÃO
    // ======================================================

    const totalPaginas = Math.max(1, Math.ceil(linhas.length / itensPorPagina));

    if (paginaAtual > totalPaginas) {
        paginaAtual = totalPaginas;
    }

    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const linhasPagina = linhas.slice(inicio, fim);


    // ======================================================
    // RENDERIZAR NA TABELA
    // ======================================================

    linhasPagina.forEach(linha => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>${linha.idAtleta}</td>
            <td><strong>${linha.nomeAtleta}</strong></td>
            <td>${linha.idadeAtleta}</td>
            <td>${linha.respAtleta}</td>
            <td>
                <span style="color:#2e7d32; font-weight:bold;">
                    ${linha.presencas}
                </span>
            </td>
            <td>
                <span style="color:#1565c0; font-weight:bold;">
                    ${linha.totalAtividades}
                </span>
            </td>
        `;

        tbody.appendChild(tr);
    });


    // ======================================================
    // CONTROLES DE PAGINAÇÃO
    // ======================================================

    const info = document.getElementById('info_paginacao');
    if (info) {
        info.textContent = `Página ${paginaAtual} de ${totalPaginas}`;
    }

    const btnAnterior = document.getElementById('btn_anterior');
    const btnProximo = document.getElementById('btn_proximo');

    if (btnAnterior) btnAnterior.disabled = paginaAtual <= 1;
    if (btnProximo) btnProximo.disabled = paginaAtual >= totalPaginas;
}


// ==========================================================
// MUDAR QUANTIDADE POR PÁGINA
// ==========================================================

function mudarItensPorPagina() {

    const select =
        document.getElementById(
            'filtro_itens_pagina'
        );

    if (select) {

        itensPorPagina =
            Number(
                select.value
            ) || 10;

    }

    paginaAtual = 1;

    renderizarTabelaAtletas();
}


// ==========================================================
// PÁGINA ANTERIOR
// ==========================================================

function paginaAnterior() {

    if (paginaAtual > 1) {

        paginaAtual--;

        renderizarTabelaAtletas();

    }
}


// ==========================================================
// PRÓXIMA PÁGINA
// ==========================================================

function proximaPagina() {

    const atletas =
        dadosGlobaisSistema.cadastro || [];

    const totalPaginas =
        Math.max(
            1,
            Math.ceil(
                atletas.length /
                itensPorPagina
            )
        );


    if (
        paginaAtual <
        totalPaginas
    ) {

        paginaAtual++;

        renderizarTabelaAtletas();

    }
}

// ==========================================================
// FUNÇÕES DO DASHBOARD DO ATLETA
// ==========================================================

let graficoFreqInstancia = null;
let graficoAtivInstancia = null;

function toggleFiltroPeriodoDash() {
    const tipoPeriodo = document.getElementById('dash_filtro_periodo').value;
    const blocoMesAno = document.getElementById('dash_bloco_mes_ano');
    
    if (tipoPeriodo === 'especifico') {
        blocoMesAno.style.display = 'flex';
    } else {
        blocoMesAno.style.display = 'none';
    }
    renderizarDashboard();
}

function renderizarDashboard() {
    const idAtletaSelecionado = document.getElementById('dash_select_atleta').value;
    const tipoPeriodo = document.getElementById('dash_filtro_periodo').value;
    const mesSelecionado = document.getElementById('dash_mes').value;
    const anoSelecionado = document.getElementById('dash_ano').value;

    const frequencias = dadosGlobaisSistema.frequencia || [];
    const desempenhos = dadosGlobaisSistema.desempenho || [];
    const atividadesLista = dadosGlobaisSistema.atividade || [];

    // Elementos de cards
    const elPresencas = document.getElementById('dash_total_presencas');
    const elFaltas = document.getElementById('dash_total_faltas');
    const elAtividades = document.getElementById('dash_total_atividades');
    const tbodyFaltas = document.getElementById('tabela_dash_faltas');
    const tbodyDesempenho = document.getElementById('tabela_dash_desempenho');

    if (!idAtletaSelecionado) {
        if (elPresencas) elPresencas.textContent = '0';
        if (elFaltas) elFaltas.textContent = '0';
        if (elAtividades) elAtividades.textContent = '0';
        if (tbodyFaltas) tbodyFaltas.innerHTML = `<tr><td colspan="2" style="text-align:center;">Selecione um atleta.</td></tr>`;
        if (tbodyDesempenho) tbodyDesempenho.innerHTML = `<tr><td colspan="3" style="text-align:center;">Selecione um atleta.</td></tr>`;
        return;
    }

    // 1. Filtrar Frequências do Atleta
    let freqAtleta = frequencias.filter(f => String(f.id_atleta || '').trim() === String(idAtletaSelecionado));
    
    if (tipoPeriodo === 'especifico') {
        freqAtleta = freqAtleta.filter(f => {
            if (!f.data) return false;
            const partes = String(f.data).split('T')[0].split('-');
            return partes[0] === anoSelecionado && partes[1] === mesSelecionado;
        });
    }

    const totalPresencas = freqAtleta.filter(f => String(f.situacao || '').trim().toUpperCase() === 'P').length;
    const faltasLista = freqAtleta.filter(f => String(f.situacao || '').trim().toUpperCase() === 'F');
    const totalFaltas = faltasLista.length;

    if (elPresencas) elPresencas.textContent = totalPresencas;
    if (elFaltas) elFaltas.textContent = totalFaltas;

    // Preencher Tabela de Justificativas de Faltas
    if (tbodyFaltas) {
        tbodyFaltas.innerHTML = '';
        if (faltasLista.length === 0) {
            tbodyFaltas.innerHTML = `<tr><td colspan="2" style="text-align:center;">Nenhuma falta registrada no período.</td></tr>`;
        } else {
            faltasLista.forEach(f => {
                const dataFmt = f.data ? String(f.data).split('T')[0].split('-').reverse().join('/') : '-';
                const justificativa = f.justificativa || 'Sem justificativa informada';
                tbodyFaltas.innerHTML += `<tr><td>${dataFmt}</td><td>${justificativa}</td></tr>`;
            });
        }
    }

    // 2. Filtrar Desempenhos do Atleta
    let despAtleta = desempenhos.filter(d => String(d.id_atleta || '').trim() === String(idAtletaSelecionado));

    if (tipoPeriodo === 'especifico') {
        despAtleta = despAtleta.filter(d => {
            if (!d.data) return false;
            const partes = String(d.data).split('T')[0].split('-');
            return partes[0] === anoSelecionado && partes[1] === mesSelecionado;
        });
    }

    if (elAtividades) elAtividades.textContent = despAtleta.length;

    // Preencher Tabela de Desempenho
    if (tbodyDesempenho) {
        tbodyDesempenho.innerHTML = '';
        if (despAtleta.length === 0) {
            tbodyDesempenho.innerHTML = `<tr><td colspan="3" style="text-align:center;">Nenhum desempenho registrado no período.</td></tr>`;
        } else {
            despAtleta.forEach(d => {
                const dataFmt = d.data ? String(d.data).split('T')[0].split('-').reverse().join('/') : '-';
                
                // Encontrar nome da atividade
                const ativObj = atividadesLista.find(a => String(a.id_atividade || a.id) === String(d.id_atividade));
                const nomeAtividade = ativObj ? (ativObj.nome_atividade || ativObj.nome) : 'Atividade #' + d.id_atividade;
                const resultado = d.desempenho || '-';

                tbodyDesempenho.innerHTML += `
                    <tr>
                        <td>${dataFmt}</td>
                        <td><strong>${nomeAtividade}</strong></td>
                        <td>${resultado}</td>
                    </tr>
                `;
            });
        }
    }

    // 3. Renderizar Gráficos Chart.js
    atualizarGraficosDashboard(totalPresencas, totalFaltas, despAtleta, atividadesLista);
}

function atualizarGraficosDashboard(presencas, faltas, despAtleta, atividadesLista) {
    // Gráfico de Frequência (Pizza / Rosca)
    const ctxFreq = document.getElementById('graficoFrequencia');
    if (ctxFreq) {
        if (graficoFreqInstancia) graficoFreqInstancia.destroy();
        graficoFreqInstancia = new Chart(ctxFreq, {
            type: 'doughnut',
            data: {
                labels: ['Presenças', 'Faltas'],
                datasets: [{
                    data: [presencas, faltas],
                    backgroundColor: ['#2e7d32', '#c62828']
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    }

    // Gráfico de Atividades Realizadas por Categoria/Nome
    const contagemAtiv = {};
    despAtleta.forEach(d => {
        const ativObj = atividadesLista.find(a => String(a.id_atividade || a.id) === String(d.id_atividade));
        const nome = ativObj ? (ativObj.nome_atividade || ativObj.nome) : 'Outras';
        contagemAtiv[nome] = (contagemAtiv[nome] || 0) + 1;
    });

    const labelsAtiv = Object.keys(contagemAtiv);
    const dadosAtiv = Object.values(contagemAtiv);

    const ctxAtiv = document.getElementById('graficoAtividades');
    if (ctxAtiv) {
        if (graficoAtivInstancia) graficoAtivInstancia.destroy();
        graficoAtivInstancia = new Chart(ctxAtiv, {
            type: 'bar',
            data: {
                labels: labelsAtiv.length > 0 ? labelsAtiv : ['Nenhuma atividade'],
                datasets: [{
                    label: 'Realizações',
                    data: dadosAtiv.length > 0 ? dadosAtiv : [0],
                    backgroundColor: '#1565c0'
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
            }
        });
    }
}