let totalInvestido = 0;
let totalJuros = 0;
let totalAcumulado = 0;

let labels = [];
let dadosJuros = [];
let dadosInvestido = [];
let dadosTotalAcumulado = [];
let dadosTotalCorrigido = [];

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('calcularBtn').addEventListener('click', function () {
        document.getElementById('instructions').style.display = 'none';
        calcular();
    });

    document.getElementById('inflacaoCheck').addEventListener('change', function () {
        document.getElementById('inflacao').disabled = !this.checked;
    });

    document.getElementById('limparBtn').addEventListener('click', function () {
        limparCampos();
    });

    document.getElementById('mostrarGrafico').addEventListener('click', function () {
        mostrarGrafico();
    });

    document.getElementById('mostrarTabela').addEventListener('click', function () {
        document.getElementById('tabelaContainer').style.display = 'block';
        document.getElementById('graficoContainer').style.display = 'none';
    });
});

function limparCampos() {
    // Limpar campos de entrada
    document.getElementById('valorFinal').value = '';
    document.getElementById('aporteInicial').value = '';
    document.getElementById('anos').value = '1';
    document.getElementById('meses').value = '';
    document.getElementById('periodoJuros').value = 'ano';
    document.getElementById('inflacao').value = '';
    document.getElementById('inflacaoCheck').checked = false;

    // Limpar campos de resultado
    document.getElementById('aporteMensalNecessario').innerText = '';
    document.getElementById('valorFinalResult').innerText = '';
    document.getElementById('valorInvestidoResult').innerText = '';
    document.getElementById('totalJurosResult').innerText = '';

    // Limpar a tabela de juros
    document.getElementById('tabelaJuros').innerHTML = '';

    // Ocultar resultados
    document.getElementById('resultadosTitle').classList.add('hidden');
    document.getElementById('resultados').classList.add('hidden');

    // Resetar dados
    totalInvestido = 0;
    totalJuros = 0;
    totalAcumulado = 0;
    labels = [];
    dadosJuros = [];
    dadosInvestido = [];
    dadosTotalAcumulado = [];
    dadosTotalCorrigido = [];
}

function formatarMoeda(value) {
    return `R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}`;
}

function moedaParaFloat(valor) {
    if (!valor) return 0;
    return parseFloat(valor.replace(/\./g, '').replace(',', '.'));
}

function calcularAporteMensalNecessario(valorFinal, aporteInicial, jurosMensal, periodo, inflacaoMensal = 0) {
    if (inflacaoMensal === 0) {
        if (jurosMensal === 0) {
            return (valorFinal - aporteInicial) / periodo;
        } else {
            let valorFuturoDescontado = valorFinal - (aporteInicial * Math.pow((1 + jurosMensal), periodo));
            return valorFuturoDescontado * jurosMensal / (Math.pow((1 + jurosMensal), periodo) - 1);
        }
    } else {
        if (jurosMensal <= inflacaoMensal) {
            //alert("A taxa de juros deve ser maior que a inflação. O cálculo será realizado, mas a inflação pode impactar negativamente.");
        }

        let valorFinalAjustado = valorFinal * Math.pow(1 + inflacaoMensal, periodo);
        if (jurosMensal === 0) {
            return (valorFinalAjustado - aporteInicial) / periodo;
        } else {
            let valorFuturoDescontado = valorFinalAjustado - (aporteInicial * Math.pow((1 + jurosMensal), periodo));
            return valorFuturoDescontado * jurosMensal / (Math.pow((1 + jurosMensal), periodo) - 1);
        }
    }
}

function calcular() {
    // Resetar dados globais antes de realizar novos cálculos
    totalInvestido = 0;
    totalJuros = 0;
    totalAcumulado = 0;

    labels = [];
    dadosJuros = [];
    dadosInvestido = [];
    dadosTotalAcumulado = [];
    dadosTotalCorrigido = [];

    // Limpar tabela de juros
    const tabela = document.getElementById('tabelaJuros');
    tabela.innerHTML = ''; // Limpa o conteúdo da tabela

    const valorFinal = moedaParaFloat(document.getElementById('valorFinal').value);
    const aporteInicial = moedaParaFloat(document.getElementById('aporteInicial').value);
    const anos = parseInt(document.getElementById('anos').value) || 0;
    const meses = parseInt(document.getElementById('meses').value) || 0;
    const periodo = (anos * 12) + meses;

    let jurosAno = parseFloat(document.getElementById('jurosAno').value.replace(/,/g, '.')) || 0;
    let jurosMensal;
    const periodoJuros = document.getElementById('periodoJuros').value;

    if (periodoJuros === "ano") {
        jurosMensal = Math.pow(1 + (jurosAno / 100), 1 / 12) - 1;
    } else {
        jurosMensal = jurosAno / 100;
    }

    let inflacaoMensal = 0;
    if (document.getElementById('inflacaoCheck').checked) {
        let inflacaoAno = parseFloat(document.getElementById('inflacao').value.replace(/,/g, '.')) || 0;
        inflacaoMensal = Math.pow(1 + (inflacaoAno / 100), 1 / 12) - 1;
        document.getElementById('inflacaoColuna').style.display = '';
    } else {
        document.getElementById('inflacaoColuna').style.display = 'none';
    }

    const aporteMensalNecessario = calcularAporteMensalNecessario(valorFinal, aporteInicial, jurosMensal, periodo, inflacaoMensal);

    // Atualizar resultados
    const resultados = calcularResultados(aporteInicial, aporteMensalNecessario, jurosMensal, periodo, inflacaoMensal, valorFinal);
    document.getElementById('valorFinalResult').innerText = formatarMoeda(resultados.valorFinal);
    document.getElementById('valorInvestidoResult').innerText = formatarMoeda(resultados.valorInvestido);
    document.getElementById('totalJurosResult').innerText = formatarMoeda(resultados.totalJuros);

    if (!isNaN(aporteMensalNecessario)) {
        document.getElementById('resultadosTitle').classList.remove('hidden');
        document.getElementById('resultados').classList.remove('hidden');
        document.getElementById('aporteMensalNecessario').innerText = formatarMoeda(aporteMensalNecessario);
        calcularJuros(aporteInicial, aporteMensalNecessario, jurosMensal, periodo, inflacaoMensal, valorFinal);
    } else {
        //alert("Houve um erro no cálculo do aporte mensal necessário.");
        //ADICIONAR AQUI POSSIVEIS MENSAGENS DE ERRO
        /*
        Adicionar valor inicial.*
        Adicione o período.*
        Adicionar valor mensal.*
        */
    }

    document.querySelector('.resultado').scrollIntoView({ behavior: 'smooth' });
}


function calcularResultados(aporteInicial, aporteMensal, jurosMensal, periodo, inflacaoMensal, valorFinal) {
    totalInvestido = aporteInicial;
    totalJuros = 0;
    totalAcumulado = aporteInicial; 

    for (let mes = 0; mes <= periodo; mes++) {
        let juros = totalAcumulado * jurosMensal;
        if (mes > 0) {
            totalAcumulado += juros + aporteMensal;
            totalInvestido += aporteMensal;
            totalJuros += juros;
        }

        let totalCorrigido = totalAcumulado;
        if (inflacaoMensal > 0) {
            totalCorrigido = totalAcumulado / Math.pow(1 + inflacaoMensal, mes);
        }
    }

    return {
        valorFinal: totalAcumulado,
        valorInvestido: totalInvestido,
        totalJuros: totalAcumulado - totalInvestido
    };
}

function calcularJuros(aporteInicial, aporteMensal, jurosMensal, periodo, inflacaoMensal, valorFinal) {
    let tabela = document.getElementById('tabelaJuros');
    tabela.innerHTML = ''; // Limpa o conteúdo da tabela

    totalInvestido = aporteInicial;
    totalJuros = 0;
    totalAcumulado = aporteInicial;

    for (let mes = 0; mes <= periodo; mes++) {
        let juros = totalAcumulado * jurosMensal;
        if (mes > 0) {
            totalAcumulado += juros + aporteMensal;
            totalInvestido += aporteMensal;
            totalJuros += juros;
        }

        let totalCorrigido = totalAcumulado;
        if (inflacaoMensal > 0) {
            totalCorrigido = totalAcumulado / Math.pow(1 + inflacaoMensal, mes);
        }

        let row = tabela.insertRow();
        row.insertCell(0).innerText = mes;
        row.insertCell(1).innerText = formatarMoeda(juros);
        row.insertCell(2).innerText = formatarMoeda(totalInvestido);
        row.insertCell(3).innerText = formatarMoeda(totalJuros);
        row.insertCell(4).innerText = formatarMoeda(totalAcumulado);
        if (document.getElementById('inflacaoCheck').checked) {
            row.insertCell(5).innerText = formatarMoeda(totalCorrigido);
        }

        labels.push(mes.toString());
        dadosJuros.push(totalJuros);
        dadosInvestido.push(totalInvestido);
        dadosTotalAcumulado.push(totalAcumulado);
        if (document.getElementById('inflacaoCheck').checked) {
            dadosTotalCorrigido.push(totalCorrigido);
        }
    }

    mostrarGrafico();
}

function mostrarGrafico() {
    document.getElementById('tabelaContainer').style.display = 'none';
    document.getElementById('graficoContainer').style.display = 'block';

    const ctx = document.getElementById('grafico').getContext('2d');

    // Destruir o gráfico anterior se existir
    if (window.myChart) {
        window.myChart.destroy();
    }

    window.myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Valor Investido',
                    data: dadosInvestido,
                    backgroundColor: 'rgb(37, 74, 109)',
                    borderColor: 'rgb(3, 30, 56)',
                    borderWidth: 1
                },
                {
                    
                    label: 'Total em Juros',
                    data: dadosJuros,
                    backgroundColor: 'rgb(223, 22, 25)',
                    borderColor: 'rgb(133, 18, 20)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Mês'
                    },
                    stacked: true // Enable stacking for x-axis
                },
                y: {
                    title: {
                        display: true,
                        text: 'Valor (R$)'
                    },
                    beginAtZero: true,
                    stacked: true // Enable stacking for y-axis
                }
            },
            plugins: {
                legend: {
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            }
        }
    });
}
