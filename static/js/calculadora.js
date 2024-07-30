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
        gerarTabelaJuros(aporteInicial, aporteMensalNecessario, jurosMensal, periodo, inflacaoMensal, valorFinal);
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

function gerarTabelaJuros(aporteInicial, aporteMensal, jurosMensal, periodo, inflacaoMensal, valorFinal) {
    let tabela = document.getElementById('tabelaJuros');
    tabela.innerHTML = ''; // Limpa o conteúdo da tabela

    let totalInvestido = aporteInicial;
    let totalJuros = 0;
    let totalAcumulado = aporteInicial;

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
        row.insertCell(0).innerText = mes; // Exibe o mês corretamente
        row.insertCell(1).innerText = mes > 0 ? formatarMoeda(juros) : '--'; // Não exibe juros no mês 0
        row.insertCell(2).innerText = formatarMoeda(totalInvestido);
        row.insertCell(3).innerText = mes > 0 ? formatarMoeda(totalJuros) : '--'; // Não exibe total de juros no mês 0
        row.insertCell(4).innerText = formatarMoeda(totalAcumulado);
        if (document.getElementById('inflacaoCheck').checked) {
            row.insertCell(5).innerText = formatarMoeda(totalCorrigido);
        }
    }
}

function mostrarGrafico() {
    const ctx = document.getElementById('grafico').getContext('2d');
    const labels = [];
    const dadosJuros = [];
    const dadosInvestido = [];
    const dadosTotalAcumulado = [];
    const dadosTotalCorrigido = [];

    const tabela = document.getElementById('tabelaJuros').rows;
    for (let i = 1; i < tabela.length; i++) { // Começa de 1 para pular o cabeçalho
        const cells = tabela[i].cells;
        labels.push(cells[0].innerText);
        dadosJuros.push(moedaParaFloat(cells[1].innerText));
        dadosInvestido.push(moedaParaFloat(cells[2].innerText));
        dadosTotalAcumulado.push(moedaParaFloat(cells[4].innerText));
        if (document.getElementById('inflacaoCheck').checked) {
            dadosTotalCorrigido.push(moedaParaFloat(cells[5].innerText));
        }
    }

    const datasets = [
        {
            label: 'Total Investido',
            data: dadosInvestido,
            backgroundColor: 'rgba(0, 123, 255, 0.2)',
            borderColor: 'rgba(0, 123, 255, 1)',
            borderWidth: 1
        },
        {
            label: 'Total Acumulado',
            data: dadosTotalAcumulado,
            backgroundColor: 'rgba(40, 167, 69, 0.2)',
            borderColor: 'rgba(40, 167, 69, 1)',
            borderWidth: 1
        }
    ];

    if (document.getElementById('inflacaoCheck').checked) {
        datasets.push({
            label: 'Total Corrigido',
            data: dadosTotalCorrigido,
            backgroundColor: 'rgba(255, 193, 7, 0.2)',
            borderColor: 'rgba(255, 193, 7, 1)',
            borderWidth: 1
        });
    }

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    document.getElementById('graficoContainer').style.display = 'block';
    document.getElementById('tabelaContainer').style.display = 'none';
}

