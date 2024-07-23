function formatarMoeda(value) {
    return `R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}`;
}

function moedaParaFloat(valor) {
    if (!valor) {
        return 0;
    }
    return parseFloat(valor.replace(/\./g, '').replace(',', '.'));
}

function calcularAporteMensalNecessario(valorFinal, aporteInicial, jurosMensal, periodo) {
    if (jurosMensal === 0) {
        return (valorFinal - aporteInicial) / periodo;
    }
    let valorFuturoDescontado = valorFinal - (aporteInicial * Math.pow((1 + jurosMensal), periodo));
    return valorFuturoDescontado * jurosMensal / (Math.pow((1 + jurosMensal), periodo) - 1);
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

    console.log('jurosAno:', jurosAno);
    console.log('jurosMensal:', jurosMensal);

    const aporteMensalNecessario = calcularAporteMensalNecessario(valorFinal, aporteInicial, jurosMensal, periodo);

    document.getElementById('aporteMensalNecessario').innerText = formatarMoeda(aporteMensalNecessario);
    gerarTabelaJuros(aporteInicial, aporteMensalNecessario, jurosMensal, periodo);

    document.querySelector('.resultado').scrollIntoView({
        behavior: 'smooth'
    });
}

function gerarTabelaJuros(aporteInicial, aporteMensal, jurosMensal, periodo) {
    let tabela = document.getElementById('tabelaJuros');
    tabela.innerHTML = ''; // Limpa o conteúdo da tabela

    let totalInvestido = aporteInicial;
    let totalJuros = 0;
    let totalAcumulado = aporteInicial;

    for (let i = 0; i <= periodo; i++) {
        let juros = totalAcumulado * jurosMensal;
        if (i > 0) { // Adiciona o aporte mensal a partir do mês 1
            totalAcumulado += juros + aporteMensal;
            totalInvestido += aporteMensal;
            totalJuros += juros;
        }

        let row = tabela.insertRow();
        row.insertCell(0).innerText = i;
        row.insertCell(1).innerText = i > 0 ? formatarMoeda(juros) : '--'; // Não exibe juros no mês 0
        row.insertCell(2).innerText = formatarMoeda(totalInvestido);
        row.insertCell(3).innerText = i > 0 ? formatarMoeda(totalJuros) : '--'; // Não exibe total de juros no mês 0
        row.insertCell(4).innerText = formatarMoeda(totalAcumulado);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('calcularBtn').addEventListener('click', calcular);
});
