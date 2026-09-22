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

    const selectFreq =
        document.getElementById(
            'freq_select_atleta'
        );

    const selectDes =
        document.getElementById(
            'des_select_atleta'
        );


    let options =
        '<option value="">Selecione um atleta...</option>';


    atletas.forEach(atleta => {

        const id =
            atleta.id_atleta ||
            atleta.id;

        const nome =
            atleta.nome;


        if (id && nome) {

            options +=
                `<option value="${id}">
                    ${nome}
                </option>`;
        }

    });


    if (selectFreq) {
        selectFreq.innerHTML =
            options;
    }

    if (selectDes) {
        selectDes.innerHTML =
            options;
    }
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
// ATUALIZAR ATLETA SELECIONADO
// ==========================================================

function atualizarAtletaSelecionado(tipo) {

    const select =
        document.getElementById(
            `${tipo}_select_atleta`
        );

    const campoId =
        document.getElementById(
            `${tipo}_id`
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
// ENVIAR DADOS
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
    // FREQUÊNCIA
    // ======================================================

    else if (tipo === 'frequencia') {

        const select =
            document.getElementById(
                'freq_select_atleta'
            );

        const idAtleta =
            select.value;

        const atleta =
            dadosGlobaisSistema.cadastro.find(
                a =>
                    String(
                        a.id_atleta || a.id
                    ) ===
                    String(idAtleta)
            );


        dados = {

            acao: 'frequencia',

            id_atleta:
                idAtleta,

            nome:
                atleta
                    ? atleta.nome
                    : '',

            data:
                document.getElementById(
                    'freq_data'
                ).value,

            situacao:
                document.getElementById(
                    'freq_situacao'
                ).value,

            justificativa:
                document.getElementById(
                    'freq_justificativa'
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

    else if (tipo === 'frequencia') {
        formId = 'formFrequencia';
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

function renderizarTabelaAtletas() {

    const atletas =
        dadosGlobaisSistema.cadastro || [];

    const frequencias =
        dadosGlobaisSistema.frequencia || [];

    const desempenhos =
        dadosGlobaisSistema.desempenho || [];

    const resumo =
        dadosGlobaisSistema
            .resumo
            ?.presencas || {};


    const tbody =
        document.getElementById(
            'tabela_atletas_corpo'
        );

    if (!tbody) {
        return;
    }


    tbody.innerHTML = '';


    if (atletas.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6"
                    style="text-align:center;">
                    Nenhum atleta cadastrado.
                </td>
            </tr>
        `;

        return;
    }


    // ======================================================
    // FILTRO DE PERÍODO
    // ======================================================

    const filtro =
        document.getElementById(
            'filtro_periodo'
        );

    const periodo =
        filtro
            ? filtro.value
            : 'todos';


    // ======================================================
    // CALCULAR DATA LIMITE
    // ======================================================

    let dataLimite = null;

    const hoje =
        new Date();


    if (periodo === 'semana') {

        dataLimite =
            new Date();

        dataLimite.setDate(
            hoje.getDate() - 7
        );
    }

    else if (periodo === 'mes') {

        dataLimite =
            new Date();

        dataLimite.setMonth(
            hoje.getMonth() - 1
        );
    }

    else if (periodo === 'ano') {

        dataLimite =
            new Date();

        dataLimite.setFullYear(
            hoje.getFullYear() - 1
        );
    }


    // ======================================================
    // FILTRAR E MONTAR DADOS
    // ======================================================

    const linhas =
        atletas.map(atleta => {

            const idAtleta =
                String(
                    atleta.id_atleta ||
                    atleta.id ||
                    ''
                ).trim();


            const nomeAtleta =
                atleta.nome || '-';

            const idadeAtleta =
                atleta.idade || '-';

            const respAtleta =
                atleta.responsavel || '-';


            // ----------------------------------------------
            // FREQUÊNCIAS DO ATLETA
            // ----------------------------------------------

            let freqAtleta =
                frequencias.filter(
                    f =>
                        String(
                            f.id_atleta || ''
                        ).trim() ===
                        idAtleta
                );


            if (dataLimite) {

                freqAtleta =
                    freqAtleta.filter(f => {

                        if (!f.data) {
                            return false;
                        }

                        return new Date(
                            f.data
                        ) >= dataLimite;

                    });
            }


            const presencas =
                freqAtleta.filter(
                    f =>
                        String(
                            f.situacao || ''
                        )
                        .trim()
                        .toUpperCase() === 'P'
                ).length;


            // ----------------------------------------------
            // DESEMPENHOS DO ATLETA
            // ----------------------------------------------

            let desempenhoAtleta =
                desempenhos.filter(
                    d =>
                        String(
                            d.id_atleta || ''
                        ).trim() ===
                        idAtleta
                );


            if (dataLimite) {

                desempenhoAtleta =
                    desempenhoAtleta.filter(
                        d => {

                            if (!d.data) {
                                return false;
                            }

                            return new Date(
                                d.data
                            ) >= dataLimite;

                        }
                    );
            }


            const totalAtividades =
                desempenhoAtleta.length;


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

    const totalPaginas =
        Math.max(
            1,
            Math.ceil(
                linhas.length /
                itensPorPagina
            )
        );


    if (
        paginaAtual >
        totalPaginas
    ) {
        paginaAtual =
            totalPaginas;
    }


    const inicio =
        (paginaAtual - 1) *
        itensPorPagina;

    const fim =
        inicio +
        itensPorPagina;


    const linhasPagina =
        linhas.slice(
            inicio,
            fim
        );


    // ======================================================
    // RENDERIZAR
    // ======================================================

    linhasPagina.forEach(
        linha => {

            const tr =
                document.createElement(
                    'tr'
                );


            tr.innerHTML = `

                <td>
                    ${linha.idAtleta}
                </td>

                <td>
                    <strong>
                        ${linha.nomeAtleta}
                    </strong>
                </td>

                <td>
                    ${linha.idadeAtleta}
                </td>

                <td>
                    ${linha.respAtleta}
                </td>

                <td>
                    <span
                        style="
                            color:#2e7d32;
                            font-weight:bold;
                        "
                    >
                        ${linha.presencas}
                    </span>
                </td>

                <td>
                    <span
                        style="
                            color:#1565c0;
                            font-weight:bold;
                        "
                    >
                        ${linha.totalAtividades}
                    </span>
                </td>

            `;


            tbody.appendChild(tr);

        }
    );


    // ======================================================
    // INFORMAÇÃO DA PAGINAÇÃO
    // ======================================================

    const info =
        document.getElementById(
            'info_paginacao'
        );

    if (info) {

        info.textContent =
            `Página ${paginaAtual} de ${totalPaginas}`;

    }


    const btnAnterior =
        document.getElementById(
            'btn_anterior'
        );

    const btnProximo =
        document.getElementById(
            'btn_proximo'
        );


    if (btnAnterior) {

        btnAnterior.disabled =
            paginaAtual <= 1;

    }


    if (btnProximo) {

        btnProximo.disabled =
            paginaAtual >= totalPaginas;

    }
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