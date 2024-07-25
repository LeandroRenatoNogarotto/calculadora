document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('calcularBtn').addEventListener('click', function() {
        // Ocultar as instruções
        document.getElementById('instructions').style.display = 'none';
        calcular();
    });
    document.getElementById('inflacaoCheck').addEventListener('change', function() {
        document.getElementById('inflacao').disabled = !this.checked;
    });
});

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
            // Se a taxa de juros é 0, o cálculo é simplesmente o valor final menos o aporte inicial dividido pelo período
            return (valorFinal - aporteInicial) / periodo;
        } else {
            let valorFuturoDescontado = valorFinal - (aporteInicial * Math.pow((1 + jurosMensal), periodo));
            return valorFuturoDescontado * jurosMensal / (Math.pow((1 + jurosMensal), periodo) - 1);
        }
    } else {
        // Cálculo com inflação
        if (jurosMensal <= inflacaoMensal) {
            alert("A taxa de juros deve ser maior que a inflação. O cálculo será realizado, mas a inflação pode impactar negativamente.");
        }

        // Calcula o valor final ajustado pela inflação
        let valorFinalAjustado = valorFinal * Math.pow(1 + inflacaoMensal, periodo);

        if (jurosMensal === 0) {
            // Se a taxa de juros é 0, o cálculo é simplesmente o valor final ajustado menos o aporte inicial dividido pelo período
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

    if (!isNaN(aporteMensalNecessario)) {
        document.getElementById('aporteMensalNecessario').innerText = formatarMoeda(aporteMensalNecessario);
        gerarTabelaJuros(aporteInicial, aporteMensalNecessario, jurosMensal, periodo, inflacaoMensal, valorFinal);
    } else {
        alert("Houve um erro no cálculo do aporte mensal necessário.");
    }

    document.querySelector('.resultado').scrollIntoView({
        behavior: 'smooth'
    });
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
