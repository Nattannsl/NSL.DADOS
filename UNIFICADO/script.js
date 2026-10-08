let tipoChamado = 'entrada'; // padrão: entrada

const conteudos = {
    firewall: `ESPECIFICAÇÕES DO FIREWALL:

Verifique a configuração das rotas de saída da sua conexão à internet. Libere o tráfego UDP na porta 5060 para comunicação SIP e permita o tráfego UDP nas portas 10000 a 20000 para áudio. Por questões de segurança, ajuste as regras do firewall para direcionar o tráfego exclusivamente ao nosso IP: 45.4.32.145`,

    especificacoesAudioKip: `ESPECIFICAÇÕES DE ÁUDIO KIP:

FORMATO: WAV
TAXA: 8000 Hz
Canais: 1 (Mono)

Encaminhar ao e-mail:
suporte@krolik.com.br
nattan@krolik.com.br`,

    kipNovo: `EMPRESA:              - SERVIDOR:   - CÓD:

Rota Criada e Apontada (SAIDAS_SBC)
Alias Criados
Regras Criadas
Grupo de Captura Criado (GRUP_CAPTURA)
Grupo de Chamada Criado (GRUP_CHAMADA)

QNTD. RAMAIS:

DDR cadastrado (        )

QRD. RAMAIS (   ) + 1 Ramal de teste criados
SENHA:
DNS:

USUÁRIO CRIADO:
LOGIN:
SENHA: `,

    glpiKipNovo: `CLIENTE NOVO_KIP_[EMPRESA]

[EMPRESA][+COD]

CONTATO(s):

PRODUTOS:
KIP | RAMAL CONSUMÍVEL -
KIP | SERVIÇO NÚMERO MÓVEL (DID)
KIP | PORTABILIDADE (XX XXXX-XXXX)
KIP | NÚMERO NOVO   (XX XXXX-XXXX)

Considerações:`,

    idIpTelefone: `IDENTIFICAÇÃO IP DO TELEFONE : (TIP 125i)

Botão: Menu
Opção: Status
Opção: Gerais

Informações gerais
Me informe o numero que aparece em:
1-IPV4   000.000.0.000
Com todos os Pontos (  ...  ) Por favor.

Ou se possível, me enviar uma foto da numeração.`,

    checklist: `CHECKLIST DE IMPLANTAÇÃO:

Razão Social:             (Serv.)
CNPJ:
Técnico Responsável pela Implantação:
Contato Principal:
Vendedor:
Data Prevista para Implantação:
OBS:
----------------------------------------
1. Em quais dispositivos os ramais serão configurados?
(  ) Computador/Notbook
(  ) Softphone celular
(  ) Telefone

2. Será implementado o sistema de atendimento automatizado (URA)?
(  ) Sim
(  ) Não

3. O áudio para a URA será fornecido pelo cliente ou nós?
(  ) Cliente
(  ) Empresa

4. Para qual Ramal as ligações serão transferidas?

5. Os equipamentos de telefonia estão prontos para a implantação?
(  ) Sim
(  ) Não

6. Qual é o horário de funcionamento da empresa?

7. Quantos links de internet estão contratados e qual a velocidade de cada um? (Especificar a quantidade e a velocidade)


8. A empresa possui IP fixo?
(  ) Sim
(  ) Não
(Especificar):
Teste de Velocidade:
(Anexar resultados de teste)

9. A empresa possui firewall; Mikrotik? Se sim, qual modelo?

10. Print do ping da rede do cliente.
(Print do teste de ping)

11. Caso o cliente possua mais de dois números, qual número será configurado para a BINA?
Número:

12. (Se possuir mais de 07 Ramais, será presencial.)
(  ) Presencial
(  ) Remota
Endereço de instalação:`
};

// Abre o Checklist KIP Comercial no Google Docs.
function abrirChecklistKipComercial() {
    const url = 'https://docs.google.com/document/d/1J570_Fc90Qz_JACOZX1zpfuwl6na5XWsZWJJ8e2Py2k/edit?tab=t.0#heading=h.j0tqt33oqdfu';

    // Abre o documento em uma nova aba para manter o portal aberto.
    window.open(url, '_blank', 'noopener,noreferrer');
}
// Abre o Checklist KIP Técnico no Google Docs.
function abrirChecklistKipTecnico() {
    const url = 'https://docs.google.com/document/d/1CWKE1cgr1vgWbOK0OPoh-Hd4v16mbBaoMP8Ps0s1aYU/edit?tab=t.0#heading=h.9i6zy2tqeoea';

    // Abre o documento em uma nova aba para manter o portal aberto.
    window.open(url, '_blank', 'noopener,noreferrer');
}

function carregarConteudo(tipo) {
    const painelOperadora = document.getElementById('painelOperadora');
    const painelPadrao = document.getElementById('painelPadrao');
    const btnOrganizarOp = document.getElementById('btnOrganizarOp');
    const editor = document.getElementById('editor');

    if (tipo === 'chamadoOperadora') {
        painelOperadora.style.display = 'block';
        painelPadrao.style.display = 'none';
        btnOrganizarOp.style.display = 'inline-block';
    } else {
        painelOperadora.style.display = 'none';
        painelPadrao.style.display = 'block';
        btnOrganizarOp.style.display = 'none';
        if (conteudos[tipo]) {
            editor.value = conteudos[tipo];
        }
    }
}

function selecionarTipo(tipo) {
    tipoChamado = tipo;
    const btnEntrada = document.getElementById('btnEntrada');
    const btnSaida = document.getElementById('btnSaida');

    if (tipo === 'entrada') {
        btnEntrada.classList.add('ativo');
        btnSaida.classList.remove('ativo');
        document.getElementById('lblDestino').innerText = "Número Destino (Recebe a ligação):";
        document.getElementById('lblOrigens').innerText = "Origens dos Testes (Quem ligou):";
    } else {
        btnSaida.classList.add('ativo');
        btnEntrada.classList.remove('ativo');
        document.getElementById('lblDestino').innerText = "Número Origem (Ramal/Linha de Saída):";
        document.getElementById('lblOrigens').innerText = "Destinos dos Testes (Números chamados):";
    }
}

function processarLinhasTestes(textoBruto, rotuloLinha) {
    const linhas = textoBruto.split('\n');
    let resultados = [];

    const regexTelefone = /(\(?\d{2}\)?\s?\d{4,5}[-\s]?\d{4}|\d{8,11})/;
    const regexHora = /(\d{1,2}[h:]\d{0,2}|\d{1,2}\s?h)/i;
    const operadoras = ['vivo', 'claro', 'tim', 'oi', 'algar', 'embratel', 'nextel'];

    linhas.forEach(linha => {
        if (!linha.trim()) return;
        let lLower = linha.toLowerCase();

        let numMatch = linha.match(regexTelefone);
        let horaMatch = linha.match(regexHora);
        let opEncontrada = 'N/I';

        operadoras.forEach(op => {
            if (lLower.includes(op)) opEncontrada = op.toUpperCase();
        });

        if (numMatch) {
            let num = numMatch[0].trim();
            let hora = horaMatch ? horaMatch[0].trim() : 'N/I';
            resultados.push(`${rotuloLinha}: ${num} - ${opEncontrada} - ${hora}`);
        } else {
            // Caso cole uma linha fora do padrão, mantém o texto básico
            resultados.push(`${rotuloLinha}: ${linha.trim()}`);
        }
    });

    if (resultados.length === 0) {
        resultados.push(`${rotuloLinha}: [numero] - [OPERADORA] - [h]`);
        resultados.push(`${rotuloLinha}: [numero] - [OPERADORA] - [h]`);
    }

    return resultados.join('\n');
}

function gerarChamadoOperadora() {
    const destino = document.getElementById('inputDestino').value.trim() || '[NÚMERO]';
    const origensBrutas = document.getElementById('inputOrigens').value.trim();
    const problemaRaw = document.getElementById('inputProblema').value.trim();

    // Formata problemas para ficarem em linhas separadas caso estejam separados por "|"
    let problemaFormatado = problemaRaw.split('|').map(p => p.trim()).join('\n');

    let cabecalho = '';
    let corpoTestes = '';
    let campoSecundario = '';

    if (tipoChamado === 'entrada') {
        cabecalho = `Ao ligar para o número destino ocorre os seguintes problemas abaixo: (Segue os testes)\n`;
        corpoTestes = processarLinhasTestes(origensBrutas, 'ORIGEM');
        campoSecundario = `DESTINO: ${destino}`;
    } else {
        cabecalho = `Ao realizar ligações a partir da origem ocorrem os seguintes problemas abaixo: (Segue os testes)\n`;
        campoSecundario = `ORIGEM: ${destino}`;
        corpoTestes = processarLinhasTestes(origensBrutas, 'DESTINO');
    }

    let resultadoFinal = `${cabecalho}\n${corpoTestes}\n\n${campoSecundario}\n\nPROBLEMA/INFO. COMPLEMENTARES:\n${problemaFormatado}`;

    // Alterna para o editor principal para exibir o resultado final gerado
    document.getElementById('painelOperadora').style.display = 'none';
    document.getElementById('painelPadrao').style.display = 'block';
    document.getElementById('btnOrganizarOp').style.display = 'none';

    const editor = document.getElementById('editor');
    editor.value = resultadoFinal;
}

async function copiarTexto() {
    let textoParaCopiar = "";

    // Se o painel da operadora estiver visível no momento em que clicar em copiar, gera o texto antes
    if (document.getElementById('painelOperadora').style.display === 'block') {
        gerarChamadoOperadora();
    }

    const editor = document.getElementById('editor');
    textoParaCopiar = editor.value;

    if (!textoParaCopiar.trim()) {
        alert("Não há texto para copiar!");
        return;
    }

    try {
        await navigator.clipboard.writeText(textoParaCopiar);
        const msg = document.getElementById('msg');
        msg.style.display = 'block';
        setTimeout(() => {
            msg.style.display = 'none';
        }, 3000);
    } catch (err) {
        alert("Erro ao copiar o texto.");
    }
}

// ==========================================
// SISTEMA DE TEMAS E PERSONALIZAÇÃO DE CORES
// ==========================================
const temasPredefinidos = {
    verde: {
        nome: 'Verde Esmeralda',
        primaria: '#00a859',
        rgb: '0, 168, 89',
        destaque: '#00ff88',
        body: '#121816',
        cardIni: '#1b2622',
        cardFim: '#0d1210',
        botao: '#1f2c27',
        input: '#0a0e0d'
    },
    azul: {
        nome: 'Azul Cibernético',
        primaria: '#0070f3',
        rgb: '0, 112, 243',
        destaque: '#00d4ff',
        body: '#0a111a',
        cardIni: '#111e2f',
        cardFim: '#080e16',
        botao: '#132439',
        input: '#060b12'
    },
    roxo: {
        nome: 'Roxo Cyberpunk',
        primaria: '#8b5cf6',
        rgb: '139, 92, 246',
        destaque: '#c084fc',
        body: '#130f1d',
        cardIni: '#201633',
        cardFim: '#0d0916',
        botao: '#291b42',
        input: '#0a0612'
    },
    laranja: {
        nome: 'Laranja Sunset',
        primaria: '#f97316',
        rgb: '249, 115, 22',
        destaque: '#fb923c',
        body: '#18110b',
        cardIni: '#291b10',
        cardFim: '#110a05',
        botao: '#352213',
        input: '#0d0703'
    },
    vermelho: {
        nome: 'Vermelho Carmim',
        primaria: '#ef4444',
        rgb: '239, 68, 68',
        destaque: '#f87171',
        body: '#180d10',
        cardIni: '#2a1318',
        cardFim: '#110609',
        botao: '#36161d',
        input: '#0d0406'
    },
    ciano: {
        nome: 'Ciano Matrix',
        primaria: '#06b6d4',
        rgb: '6, 182, 212',
        destaque: '#38bdf8',
        body: '#091418',
        cardIni: '#10222a',
        cardFim: '#060e12',
        botao: '#142d38',
        input: '#04090d'
    },
    dourado: {
        nome: 'Dourado Cyber',
        primaria: '#eab308',
        rgb: '234, 179, 8',
        destaque: '#fef08a',
        body: '#161408',
        cardIni: '#27220c',
        cardFim: '#100e04',
        botao: '#352e0f',
        input: '#0c0b02'
    }
};

function hexParaRGB(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    return `${r}, ${g}, ${b}`;
}

function hexParaHSL(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const r = (parseInt(hex.substring(0, 2), 16) || 0) / 255;
    const g = (parseInt(hex.substring(2, 4), 16) || 0) / 255;
    const b = (parseInt(hex.substring(4, 6), 16) || 0) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

function aplicarEstilosCSS(valores) {
    const r = document.documentElement.style;
    r.setProperty('--cor-primaria', valores.primaria);
    r.setProperty('--cor-primaria-rgb', valores.rgb);
    r.setProperty('--cor-destaque', valores.destaque);
    r.setProperty('--bg-body', valores.body);
    r.setProperty('--bg-card-ini', valores.cardIni);
    r.setProperty('--bg-card-fim', valores.cardFim);
    r.setProperty('--bg-botao', valores.botao);
    r.setProperty('--bg-input', valores.input);
    r.setProperty('--borda-card', valores.primaria);
    r.setProperty('--borda-botao', valores.primaria);
    r.setProperty('--sombra-card', `rgba(${valores.rgb}, 0.22)`);
}

function selecionarTema(idTema, salvar = true) {
    const tema = temasPredefinidos[idTema];
    if (!tema) return;

    aplicarEstilosCSS(tema);

    // Atualiza botões ativos
    document.querySelectorAll('.btn-tema').forEach(btn => {
        btn.classList.toggle('ativo', btn.dataset.tema === idTema);
    });
    const btnCustomCor = document.getElementById('btnCustomCor');
    if (btnCustomCor) btnCustomCor.classList.remove('ativo');

    const inputCorCustom = document.getElementById('inputCorCustom');
    if (inputCorCustom) inputCorCustom.value = tema.primaria;

    if (salvar) {
        localStorage.setItem('infor_dados_tema', JSON.stringify({
            tipo: 'preset',
            id: idTema,
            valores: tema
        }));
    }
}

function selecionarCorLivre(hex, salvar = true) {
    if (!hex || !hex.startsWith('#')) return;

    const rgb = hexParaRGB(hex);
    const hsl = hexParaHSL(hex);

    // Gera tons escuros harmoniosos e equilibrados derivados da cor escolhida
    const destaque = `hsl(${hsl.h}, ${Math.min(100, Math.max(60, hsl.s))}%, ${Math.min(75, Math.max(55, hsl.l + 12))}%)`;
    const body = `hsl(${hsl.h}, ${Math.min(22, Math.max(8, Math.round(hsl.s * 0.22)))}%, 8%)`;
    const cardIni = `hsl(${hsl.h}, ${Math.min(28, Math.max(10, Math.round(hsl.s * 0.28)))}%, 13%)`;
    const cardFim = `hsl(${hsl.h}, ${Math.min(22, Math.max(8, Math.round(hsl.s * 0.22)))}%, 6%)`;
    const botao = `hsl(${hsl.h}, ${Math.min(32, Math.max(12, Math.round(hsl.s * 0.32)))}%, 16%)`;
    const input = `hsl(${hsl.h}, ${Math.min(22, Math.max(8, Math.round(hsl.s * 0.22)))}%, 4%)`;

    const valores = {
        primaria: hex,
        rgb: rgb,
        destaque: destaque,
        body: body,
        cardIni: cardIni,
        cardFim: cardFim,
        botao: botao,
        input: input
    };

    aplicarEstilosCSS(valores);

    // Remove estado ativo dos presets e ativa o custom
    document.querySelectorAll('.btn-tema').forEach(btn => btn.classList.remove('ativo'));
    const btnCustomCor = document.getElementById('btnCustomCor');
    if (btnCustomCor) btnCustomCor.classList.add('ativo');

    if (salvar) {
        localStorage.setItem('infor_dados_tema', JSON.stringify({
            tipo: 'custom',
            hex: hex,
            valores: valores
        }));
    }
}

function restaurarTemaSalvo() {
    try {
        const salvo = localStorage.getItem('infor_dados_tema');
        if (salvo) {
            const dados = JSON.parse(salvo);
            if (dados.tipo === 'preset' && dados.id) {
                selecionarTema(dados.id, false);
                return;
            } else if (dados.tipo === 'custom' && dados.hex) {
                const inputCorCustom = document.getElementById('inputCorCustom');
                if (inputCorCustom) inputCorCustom.value = dados.hex;
                selecionarCorLivre(dados.hex, false);
                return;
            }
        }
    } catch (e) { }

    // Padrão: Verde Esmeralda
    selecionarTema('verde', false);
}

// ==========================================
// GESTÃO DO WIDGET FLUTUANTE DE ANOTAÇÕES
// ==========================================
let timeoutSalvarAnotacoes = null;

function togglePainelAnotacoes() {
    const janela = document.getElementById('janelaAnotacoesFlutuante');
    if (!janela) return;
    const aberta = janela.classList.toggle('aberta');
    if (aberta) {
        const campo = document.getElementById('campoAnotacoes');
        if (campo) campo.focus();
    }
}

function fecharPainelAnotacoes() {
    const janela = document.getElementById('janelaAnotacoesFlutuante');
    if (janela) janela.classList.remove('aberta');
}

function atualizarIndicadorBadge(texto) {
    const badge = document.getElementById('badgeIndicadorAnotacoes');
    if (badge) {
        badge.style.display = texto.trim() ? 'block' : 'none';
    }
}

function atualizarMetaAnotacoes(texto) {
    const contagem = document.getElementById('contagemAnotacoes');
    if (!contagem) return;
    const chars = texto.length;
    const linhas = texto ? texto.split('\n').length : 0;
    contagem.innerText = `${chars} chars • ${linhas} ${linhas === 1 ? 'linha' : 'linhas'}`;
    atualizarIndicadorBadge(texto);
}

function salvarAnotacoes() {
    const campo = document.getElementById('campoAnotacoes');
    if (!campo) return;
    const texto = campo.value;
    localStorage.setItem('infor_dados_anotacoes', texto);

    const agora = new Date();
    const horaFormatada = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    localStorage.setItem('infor_dados_anotacoes_data', horaFormatada);

    const elemData = document.getElementById('ultimaModificacaoAnotacoes');
    if (elemData) elemData.innerText = `Salvo às ${horaFormatada}`;

    atualizarIndicadorBadge(texto);

    const badge = document.getElementById('badgeStatusSalvo');
    if (badge) {
        badge.style.opacity = '1';
        badge.style.transform = 'scale(1.05)';
        setTimeout(() => {
            badge.style.transform = 'scale(1)';
        }, 200);
    }
}

function onInputAnotacoes() {
    const campo = document.getElementById('campoAnotacoes');
    if (!campo) return;
    atualizarMetaAnotacoes(campo.value);

    const badge = document.getElementById('badgeStatusSalvo');
    if (badge) badge.style.opacity = '0.6';

    clearTimeout(timeoutSalvarAnotacoes);
    timeoutSalvarAnotacoes = setTimeout(salvarAnotacoes, 350);
}

async function copiarAnotacoes() {
    const campo = document.getElementById('campoAnotacoes');
    if (!campo || !campo.value.trim()) {
        alert("O campo de anotações está vazio!");
        return;
    }

    try {
        await navigator.clipboard.writeText(campo.value);
        const msg = document.getElementById('msgAnotacoes');
        if (msg) {
            msg.style.display = 'block';
            setTimeout(() => {
                msg.style.display = 'none';
            }, 2500);
        }
    } catch (err) {
        alert("Erro ao copiar as anotações.");
    }
}

function limparAnotacoes() {
    const campo = document.getElementById('campoAnotacoes');
    if (!campo) return;
    if (!campo.value.trim()) {
        campo.focus();
        return;
    }

    const confirmar = window.confirm('Apagar todas as anotações? Esta ação não pode ser desfeita.');
    if (!confirmar) return;

    campo.value = '';
    localStorage.setItem('infor_dados_anotacoes', '');
    atualizarMetaAnotacoes('');

    const elemData = document.getElementById('ultimaModificacaoAnotacoes');
    if (elemData) elemData.innerText = '';

    const badge = document.getElementById('badgeStatusSalvo');
    if (badge) {
        badge.style.opacity = '1';
        badge.style.transform = 'scale(1.05)';
        setTimeout(() => { badge.style.transform = 'scale(1)'; }, 200);
    }
}

function baixarAnotacoesTxt() {
    const campo = document.getElementById('campoAnotacoes');
    if (!campo || !campo.value.trim()) {
        alert("Não há anotações para baixar!");
        return;
    }

    const blob = new Blob([campo.value], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dataStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `anotacoes-infor-dados-${dataStr}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function carregarAnotacoesSalvas() {
    const campo = document.getElementById('campoAnotacoes');
    if (!campo) return;
    const salvo = localStorage.getItem('infor_dados_anotacoes') || '';
    campo.value = salvo;
    atualizarMetaAnotacoes(salvo);

    const horaSalva = localStorage.getItem('infor_dados_anotacoes_data');
    const elemData = document.getElementById('ultimaModificacaoAnotacoes');
    if (elemData && horaSalva) {
        elemData.innerText = `Salvo às ${horaSalva}`;
    }

    campo.addEventListener('input', onInputAnotacoes);

    // Atalho Esc para fechar o painel flutuante
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            fecharPainelAnotacoes();
        }
    });
}

// ==========================================
// SISTEMA DE ABAS: TEXTO / CHECKLIST
// ==========================================
let abaAtiva = 'txt'; // 'txt' ou 'chk'

function mudarAba(aba) {
    abaAtiva = aba;
    const painelTxt = document.getElementById('painelTextoNota');
    const painelChk = document.getElementById('painelChecklistNota');
    const footerTxt = document.getElementById('footerTextoNota');
    const abaTxt = document.getElementById('abaTxt');
    const abaChk = document.getElementById('abaChk');

    if (aba === 'txt') {
        painelTxt.style.display = 'flex';
        painelChk.style.display = 'none';
        if (footerTxt) footerTxt.style.display = 'flex';
        abaTxt.classList.add('ativa');
        abaChk.classList.remove('ativa');
        const campo = document.getElementById('campoAnotacoes');
        if (campo) campo.focus();
    } else {
        painelTxt.style.display = 'none';
        painelChk.style.display = 'flex';
        if (footerTxt) footerTxt.style.display = 'none';
        abaTxt.classList.remove('ativa');
        abaChk.classList.add('ativa');
        document.getElementById('inputNovaTask').focus();
    }
}

// ==========================================
// CHECKLIST LOGIC
// ==========================================
let checklistItems = [];
let editingChecklistIdx = null;
let draggingChecklistItem = null;
let resizingAnotacoes = null;
let ignoreChecklistClickUntil = 0;

const LIMIAR_ARRASTO_CHECKLIST = 6; // px de movimento antes de virar drag (deixa o clique de marcar tarefa intacto)

function iniciarArrastarTarefaChecklist(event, item, element) {
    if (editingChecklistIdx !== null) return;
    if (event.target.closest('button, input')) return; // deixa editar/remover/renomear funcionarem normal
    event.preventDefault(); // bloqueia seleção de texto nativa, que sequestra o drag no meio do caminho

    const pointerId = event.pointerId;
    const startX = event.clientX;
    const startY = event.clientY;
    const lista = element.parentElement;

    element.classList.add('segurando'); // feedback visual imediato ao segurar, antes mesmo de mover

    if (element.setPointerCapture) {
        element.setPointerCapture(pointerId);
    }

    let placeholder = null;
    let offsetX = 0;
    let offsetY = 0;
    let rafId = null;
    let ultimoX = startX;
    let ultimoY = startY;

    function ativarArrasto() {
        const retangulo = element.getBoundingClientRect();
        offsetX = startX - retangulo.left;
        offsetY = startY - retangulo.top;

        placeholder = document.createElement('div');
        placeholder.className = 'checklist-placeholder';
        placeholder.style.height = retangulo.height + 'px';
        element.after(placeholder);

        element.style.width = retangulo.width + 'px';
        element.classList.remove('segurando');
        element.classList.add('flutuando'); // vira um card fixo que segue o ponteiro, o placeholder marca onde ele vai cair

        draggingChecklistItem = { item, element, pointerId };
        ignoreChecklistClickUntil = Date.now() + 300;
    }

    function atualizarPosicaoFlutuante() {
        rafId = null;
        if (!placeholder) return;

        element.style.left = (ultimoX - offsetX) + 'px';
        element.style.top = (ultimoY - offsetY) + 'px';

        // .flutuando tem pointer-events:none, então elementFromPoint já enxerga o item embaixo
        const alvo = document.elementFromPoint(ultimoX, ultimoY)?.closest('.checklist-item');
        if (alvo && alvo !== element && lista.contains(alvo)) {
            const retAlvo = alvo.getBoundingClientRect();
            const antesDoAlvo = ultimoY < retAlvo.top + retAlvo.height / 2;
            lista.insertBefore(placeholder, antesDoAlvo ? alvo : alvo.nextSibling);
        }
    }

    const mover = (moveEvent) => {
        if (moveEvent.pointerId !== pointerId) return;
        ultimoX = moveEvent.clientX;
        ultimoY = moveEvent.clientY;

        if (!draggingChecklistItem) {
            const dx = ultimoX - startX;
            const dy = ultimoY - startY;
            if (Math.hypot(dx, dy) < LIMIAR_ARRASTO_CHECKLIST) return;
            ativarArrasto();
        }

        moveEvent.preventDefault();
        if (rafId === null) rafId = requestAnimationFrame(atualizarPosicaoFlutuante);
    };

    const finalizar = (endEvent) => {
        if (endEvent.pointerId !== pointerId) return;

        element.removeEventListener('pointermove', mover);
        element.removeEventListener('pointerup', finalizar);
        element.removeEventListener('pointercancel', finalizar);
        element.classList.remove('segurando');
        if (rafId !== null) cancelAnimationFrame(rafId);

        if (draggingChecklistItem) {
            // Ordem final = posição do placeholder entre os demais itens (ignora #checklistVazio e outros nós que não são tarefas)
            const irmaos = Array.from(lista.children).filter(el =>
                el === placeholder || (el.classList.contains('checklist-item') && el !== element)
            );
            const indicePlaceholder = irmaos.indexOf(placeholder);
            const novaOrdem = irmaos.filter(el => el !== placeholder).map(el => el._checklistItem);
            novaOrdem.splice(indicePlaceholder, 0, item);
            checklistItems = novaOrdem;

            placeholder.remove();
            element.classList.remove('flutuando');
            element.style.left = '';
            element.style.top = '';
            element.style.width = '';

            salvarChecklist();
            renderChecklist();
            draggingChecklistItem = null;
        }
    };

    element.addEventListener('pointermove', mover);
    element.addEventListener('pointerup', finalizar);
    element.addEventListener('pointercancel', finalizar);
}

function iniciarRedimensionamentoAnotacoes(event) {
    event.preventDefault();
    event.stopPropagation();

    const janela = document.getElementById('janelaAnotacoesFlutuante');
    const resizer = event.currentTarget;
    if (!janela) return;

    resizingAnotacoes = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        width: janela.offsetWidth,
        height: janela.offsetHeight
    };

    if (resizer.setPointerCapture) {
        resizer.setPointerCapture(event.pointerId);
    }
    document.body.classList.add('redimensionando-anotacoes');

    const mover = (moveEvent) => {
        if (!resizingAnotacoes || moveEvent.pointerId !== resizingAnotacoes.pointerId) return;
        moveEvent.preventDefault();

        const larguraMaxima = Math.max(300, Math.min(window.innerWidth - 24, 720));
        const alturaMaxima = Math.max(300, Math.min(window.innerHeight - 24, 760));
        const novaLargura = Math.max(300, Math.min(resizingAnotacoes.width + moveEvent.clientX - resizingAnotacoes.startX, larguraMaxima));
        const novaAltura = Math.max(300, Math.min(resizingAnotacoes.height + moveEvent.clientY - resizingAnotacoes.startY, alturaMaxima));

        janela.style.width = `${novaLargura}px`;
        janela.style.height = `${novaAltura}px`;
    };

    const finalizar = (endEvent) => {
        if (!resizingAnotacoes || endEvent.pointerId !== resizingAnotacoes.pointerId) return;

        resizer.removeEventListener('pointermove', mover);
        resizer.removeEventListener('pointerup', finalizar);
        resizer.removeEventListener('pointercancel', finalizar);
        document.body.classList.remove('redimensionando-anotacoes');
        resizingAnotacoes = null;
    };

    resizer.addEventListener('pointermove', mover);
    resizer.addEventListener('pointerup', finalizar);
    resizer.addEventListener('pointercancel', finalizar);
}

function salvarChecklist() {
    localStorage.setItem('infor_dados_checklist', JSON.stringify(checklistItems));
}

function carregarChecklist() {
    try {
        const salvo = localStorage.getItem('infor_dados_checklist');
        if (salvo) checklistItems = JSON.parse(salvo);
    } catch (e) { checklistItems = []; }
    renderChecklist();
}

function atualizarContagemChecklist() {
    const total = checklistItems.length;
    const concluidas = checklistItems.filter(i => i.feito).length;
    const elem = document.getElementById('contagemChecklist');
    if (elem) elem.textContent = `${concluidas}/${total} concluídas`;

    // Badge indicador: mostra se há itens no checklist OU no texto
    const campo = document.getElementById('campoAnotacoes');
    const temTexto = campo && campo.value.trim().length > 0;
    const temChecklist = checklistItems.length > 0;
    const badge = document.getElementById('badgeIndicadorAnotacoes');
    if (badge) badge.style.display = (temTexto || temChecklist) ? 'block' : 'none';
}

function renderChecklist() {
    const lista = document.getElementById('listaChecklist');
    const vazio = document.getElementById('checklistVazio');
    if (!lista) return;

    // Remove itens antigos, mantém o placeholder de vazio
    const itensAntigos = lista.querySelectorAll('.checklist-item');
    itensAntigos.forEach(el => el.remove());

    if (checklistItems.length === 0) {
        if (vazio) vazio.style.display = 'flex';
        atualizarContagemChecklist();
        return;
    }
    if (vazio) vazio.style.display = 'none';

    checklistItems.forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = 'checklist-item' + (item.feito ? ' concluida' : '') + (editingChecklistIdx === idx ? ' editando' : '');
        div.dataset.idx = idx;
        div._checklistItem = item;
        div.onpointerdown = (event) => iniciarArrastarTarefaChecklist(event, item, div);

        const dragHandle = document.createElement('div');
        dragHandle.className = 'checklist-drag-handle';
        dragHandle.textContent = '⋮⋮';
        dragHandle.title = 'Arrastar para organizar';
        dragHandle.setAttribute('aria-label', 'Organizar tarefa');
        div.appendChild(dragHandle);

        const bolinha = document.createElement('span');
        bolinha.className = 'checklist-bolinha';
        bolinha.innerHTML = `
            <svg viewBox="0 0 12 12">
                <polyline points="2,6 5,9 10,3"/>
            </svg>
        `;
        div.appendChild(bolinha);

        if (editingChecklistIdx === idx) {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'checklist-edit-input';
            input.value = item.texto;
            input.setAttribute('data-checklist-edit-input', String(idx));
            input.setAttribute('aria-label', 'Editar tarefa');
            input.onmousedown = (event) => event.stopPropagation();
            input.onclick = (event) => event.stopPropagation();
            input.onkeydown = (event) => {
                event.stopPropagation();
                if (event.key === 'Enter') {
                    event.preventDefault();
                    salvarEdicaoChecklist(idx);
                } else if (event.key === 'Escape') {
                    event.preventDefault();
                    cancelarEdicaoChecklist();
                }
            };
            input.onblur = () => {
                if (editingChecklistIdx === idx) salvarEdicaoChecklist(idx);
            };
            div.appendChild(input);
        } else {
            const texto = document.createElement('span');
            texto.className = 'checklist-texto';
            texto.textContent = item.texto;
            div.appendChild(texto);
            div.onclick = () => {
                if (Date.now() < ignoreChecklistClickUntil) return;
                toggleTaskChecklist(idx);
            };
        }

        const btnEditar = document.createElement('button');
        btnEditar.type = 'button';
        btnEditar.className = 'btn-editar-item';
        btnEditar.textContent = '✎';
        btnEditar.title = 'Editar tarefa';
        btnEditar.setAttribute('aria-label', 'Editar tarefa');
        btnEditar.onclick = (event) => {
            event.stopPropagation();
            iniciarEdicaoChecklist(idx);
        };
        div.appendChild(btnEditar);

        const btnRemover = document.createElement('button');
        btnRemover.type = 'button';
        btnRemover.className = 'btn-remover-item';
        btnRemover.textContent = '✕';
        btnRemover.title = 'Remover tarefa';
        btnRemover.setAttribute('aria-label', 'Remover tarefa');
        btnRemover.onclick = (event) => {
            event.stopPropagation();
            removerItemChecklist(idx);
        };
        div.appendChild(btnRemover);

        lista.appendChild(div);
    });

    atualizarContagemChecklist();
}

function iniciarEdicaoChecklist(idx) {
    if (checklistItems[idx] === undefined) return;
    editingChecklistIdx = idx;
    renderChecklist();
    const input = document.querySelector('[data-checklist-edit-input="' + idx + '"]');
    if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
    }
}

function salvarEdicaoChecklist(idx) {
    const input = document.querySelector('[data-checklist-edit-input="' + idx + '"]');
    if (!input) return;

    const texto = input.value.trim();
    if (!texto) {
        input.focus();
        input.select();
        return;
    }

    checklistItems[idx].texto = texto;
    editingChecklistIdx = null;
    salvarChecklist();
    renderChecklist();
}

function cancelarEdicaoChecklist() {
    editingChecklistIdx = null;
    renderChecklist();
}

// Detecta colagem de múltiplas linhas no input e converte cada linha em uma tarefa
function onColarTaskChecklist(event) {
    const clipboardData = event.clipboardData || window.clipboardData;
    const textoColar = clipboardData ? clipboardData.getData('text') : '';

    // Só intercepta se houver múltiplas linhas
    const linhas = textoColar.split(/\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (linhas.length <= 1) return; // deixa o comportamento padrão para linha única

    event.preventDefault(); // bloqueia o paste padrão

    // Monta preview das primeiras 5 tarefas
    const preview = linhas.slice(0, 5).map((l, i) => `  ${i + 1}. ${l}`).join('\n');
    const extra = linhas.length > 5 ? `\n  ... e mais ${linhas.length - 5}` : '';

    const confirmar = window.confirm(
        `Detectei ${linhas.length} tarefa${linhas.length > 1 ? 's' : ''} na lista colada:\n\n${preview}${extra}\n\nDeseja adicionar todas ao checklist?`
    );

    if (!confirmar) {
        // Devolve o texto ao campo para o usuário editar manualmente
        const input = document.getElementById('inputNovaTask');
        if (input) {
            input.value = textoColar.trim();
            input.focus();
        }
        return;
    }

    let adicionadas = 0;
    linhas.forEach(linha => {
        if (linha) {
            checklistItems.push({ texto: linha, feito: false });
            adicionadas++;
        }
    });

    if (adicionadas > 0) {
        salvarChecklist();
        renderChecklist();

        // Feedback visual no input
        const input = document.getElementById('inputNovaTask');
        if (input) {
            input.value = '';
            input.placeholder = `✓ ${adicionadas} tarefa${adicionadas > 1 ? 's adicionadas' : ' adicionada'}!`;
            setTimeout(() => {
                input.placeholder = 'Cole uma lista ou digite e pressione Enter...';
            }, 2500);
            input.focus();
        }
    }
}

function adicionarTaskChecklist() {
    const input = document.getElementById('inputNovaTask');
    if (!input) return;
    const texto = input.value.trim();
    if (!texto) { input.focus(); return; }

    // Verifica se o texto digitado tem múltiplas linhas (via quebra manual \n)
    const linhas = texto.split(/\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (linhas.length > 1) {
        linhas.forEach(l => checklistItems.push({ texto: l, feito: false }));
    } else {
        checklistItems.push({ texto: texto, feito: false });
    }

    input.value = '';
    salvarChecklist();
    renderChecklist();
    input.focus();
}

function toggleTaskChecklist(idx) {
    if (checklistItems[idx] === undefined) return;
    checklistItems[idx].feito = !checklistItems[idx].feito;
    salvarChecklist();
    renderChecklist();
}

function removerItemChecklist(idx) {
    checklistItems.splice(idx, 1);
    salvarChecklist();
    renderChecklist();
}

function limparConcluidasChecklist() {
    const antes = checklistItems.length;
    checklistItems = checklistItems.filter(i => !i.feito);
    if (checklistItems.length === antes) return;
    salvarChecklist();
    renderChecklist();
}

// Executa a inicialização do tema e das anotações
window.addEventListener('DOMContentLoaded', () => {
    restaurarTemaSalvo();
    carregarAnotacoesSalvas();
    carregarChecklist();
});