document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('calcularBtn').addEventListener('click', function() {
        // Ocultar as instruções
        document.getElementById('instructions').style.display = 'none';
        calcular();
    });

    document.getElementById('inflacaoCheck').addEventListener('change', function() {
        document.getElementById('inflacao').disabled = !this.checked;
    });

    document.getElementById('limparBtn').addEventListener('click', function() {
        limparCampos();
    });

    document.getElementById('mostrarGrafico').addEventListener('click', function() {
        mostrarGrafico();
    });

    document.getElementById('mostrarTabela').addEventListener('click', function() {
        document.getElementById('tabelaContainer').style.display = 'block';
        document.getElementById('graficoContainer').style.display = 'none';
    });
});

function limparCampos() {
    // Limpar os campos de entrada
    document.getElementById('valorFinal').value = '';
    document.getElementById('aporteInicial').value = '';
    document.getElementById('anos').value = '';
    document.getElementById('meses').value = '';
    document.getElementById('periodoJuros').value = 'ano';
    document.getElementById('inflacao').value = '';
    document.getElementById('inflacaoCheck').checked = false;

    // Limpar os campos de resultado
    document.getElementById('aporteMensalNecessario').innerText = '';
    document.getElementById('valorFinalResult').innerText = '';
    document.getElementById('valorInvestidoResult').innerText = '';
    document.getElementById('totalJurosResult').innerText = '';

    // Limpar a tabela de juros
    const tabela = document.getElementById('tabelaJuros');
    if (tabela) {
        tabela.innerHTML = ''; // Limpa o conteúdo da tabela
    }

    // Ocultar resultados
    document.getElementById('resultadosTitle').classList.add('hidden');
    document.getElementById('resultados').classList.add('hidden');
}

function formatarMoeda(value) {
    return `R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}`;
}

function moedaParaFloat(valor) {
    if (!valor) {
        return 0;
    }
    return parseFloat(valor.replace(/\./g, '').replace(',', '.'));
}

function calcularAporteMensalNecessario(valorFinal, aporteInicial, jurosMensal, periodo, inflacaoMensal = 0) {
    if (inflacaoMensal === 0) {
        // Cálculo sem inflação
        if (jurosMensal === 0) {
            return (valorFinal - aporteInicial) / periodo;
        } else {
            let valorFuturoDescontado = valorFinal - (aporteInicial * Math.pow((1 + jurosMensal), periodo));
            return valorFuturoDescontado * jurosMensal / (Math.pow((1 + jurosMensal), periodo) - 1);
        }
    } else {
        if (jurosMensal <= inflacaoMensal) {
            alert("A taxa de juros deve ser maior que a inflação. O cálculo será realizado, mas a inflação pode impactar negativamente.");
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
    const valorFinal = moedaParaFloat(document.getElementById('valorFinal').value);
    const aporteInicial = moedaParaFloat(document.getElementById('aporteInicial').value);
    const anos = parseInt(document.getElementById('anos').value) || 0;
    const meses = parseInt(document.getElementById('meses').value) || 0;
    const periodo = (anos * 12) + meses;

    let jurosAno = parseFloat(document.getElementById('jurosAno').value.replace(/,/g, '.')) || 0;
    let jurosMensal;
    const periodoJuros = document.getElementById('periodoJuros').value;

    if (periodoJuros === "ano") {
        jurosMensal = Math.pow(1 + (jurosAno / 100), 1 / 12) - 1; // Conversão de taxa anual para mensal
    } else {
        jurosMensal = jurosAno / 100; // Taxa já está em termos mensais
    }

    let inflacaoMensal = 0;
    if (document.getElementById('inflacaoCheck').checked) {
        let inflacaoAno = parseFloat(document.getElementById('inflacao').value.replace(/,/g, '.')) || 0;
        inflacaoMensal = Math.pow(1 + (inflacaoAno / 100), 1 / 12) - 1; // Conversão de inflação anual para mensal
        document.getElementById('inflacaoColuna').style.display = '';
    } else {
        document.getElementById('inflacaoColuna').style.display = 'none';
    }

    const aporteMensalNecessario = calcularAporteMensalNecessario(valorFinal, aporteInicial, jurosMensal, periodo, inflacaoMensal);

    // Atualizar resultados de valor total final, valor total investido e total em juros
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
        alert("Houve um erro no cálculo do aporte mensal necessário.");
    }

    document.querySelector('.resultado').scrollIntoView({
        behavior: 'smooth'
    });

}

function calcularResultados(aporteInicial, aporteMensal, jurosMensal, periodo, inflacaoMensal, valorFinal) {
    let totalInvestido = aporteInicial;
    let totalJuros = 0;
    let totalAcumulado = aporteInicial;

    for (let mes = 0; mes <= periodo; mes++) {
        let juros = totalAcumulado * jurosMensal;
        if (mes > 0) { // Adiciona o aporte mensal a partir do mês 1
            totalAcumulado += juros + aporteMensal;
            totalInvestido += aporteMensal;
            totalJuros += juros;
        }

        let totalCorrigido = totalAcumulado;
        if (inflacaoMensal > 0) {
            // Corrigir o valor acumulado com base na inflação
            totalCorrigido = totalAcumulado / Math.pow(1 + inflacaoMensal, mes);
        }

        // Atualizar o valor final considerando a inflação
        valorFinalCorrigido = totalCorrigido;
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

    let totalInvestido = aporteInicial;
    let totalJuros = 0;
    let totalAcumulado = aporteInicial;

    let labels = [];
    let dadosJuros = [];
    let dadosInvestido = [];
    let dadosTotalAcumulado = [];
    let dadosTotalCorrigido = [];

    for (let mes = 0; mes <= periodo; mes++) { // Começa a contagem dos meses a partir de 0
        let juros = totalAcumulado * jurosMensal;
        if (mes > 0) { // Adiciona o aporte mensal a partir do mês 1
            totalAcumulado += juros + aporteMensal;
            totalInvestido += aporteMensal;
            totalJuros += juros;
        }

        let totalCorrigido = totalAcumulado;
        if (inflacaoMensal > 0) {
            // Corrigir o valor acumulado com base na inflação
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

    mostrarGrafico(labels, dadosJuros, dadosInvestido, dadosTotalAcumulado, dadosTotalCorrigido);
}

function mostrarGrafico(labels, dadosJuros, dadosInvestido, dadosTotalAcumulado) {
    document.getElementById('tabelaContainer').style.display = 'none';
    document.getElementById('graficoContainer').style.display = 'block';

    const ctx = document.getElementById('grafico').getContext('2d');

    // Destroy previous chart if it exists
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
                    backgroundColor: 'rgba(54, 162, 235, 0.5)', // Adjust transparency for overlapping effect
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Total em Juros',
                    data: dadosJuros,
                    backgroundColor: 'rgba(75, 192, 192, 0.5)', // Adjust transparency for overlapping effect
                    borderColor: 'rgba(75, 192, 192, 1)',
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

