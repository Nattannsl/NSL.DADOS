let bancoDeDados = JSON.parse(localStorage.getItem('minhas_planilhas')) || {};
let estadoEdicao = {};

window.onload = function () {
    atualizarSelectDocs();
    buscar();
};

function atualizarNomeArquivo(input) {
    const label = document.getElementById('fileLabel');
    if (input.files.length > 0) {
        label.innerText = '📄 ' + input.files[0].name;
        label.style.color = 'var(--accent)';
    } else {
        label.innerText = '📁 Selecionar Ficheiro';
        label.style.color = '';
    }
}

function importarPlanilha() {
    const nameInput = document.getElementById('docName');
    const fileInput = document.getElementById('excelFile');
    const docName = nameInput.value.trim();

    if (!docName || !fileInput.files.length) {
        alert("Preencha o nome e selecione um ficheiro.");
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], { defval: "" });

        if (jsonData.length === 0) {
            alert("Planilha vazia.");
            return;
        }

        bancoDeDados[docName] = jsonData;
        localStorage.setItem('minhas_planilhas', JSON.stringify(bancoDeDados));

        nameInput.value = '';
        fileInput.value = '';
        document.getElementById('fileLabel').innerText = '📁 Selecionar Ficheiro';
        atualizarSelectDocs();
        document.getElementById('docSelect').value = docName;
        buscar();
    };

    reader.readAsArrayBuffer(file);
}

function atualizarSelectDocs() {
    const select = document.getElementById('docSelect');
    select.innerHTML = '';
    const keys = Object.keys(bancoDeDados);

    if (keys.length === 0) {
        select.innerHTML = '<option value="">Nenhuma base salva</option>';
        return;
    }

    keys.forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = key;
        select.appendChild(option);
    });
}

function obterChaveECampo(item, palavrasChave) {
    const chave = Object.keys(item).find(key => {
        const kClean = key.toLowerCase().trim();
        return palavrasChave.some(p => kClean === p.toLowerCase().trim() || kClean.includes(p.toLowerCase().trim()));
    });
    return { chave: chave || null, valor: chave ? item[chave] : "" };
}

function alternarCadeado(indexReal) {
    estadoEdicao[indexReal] = !estadoEdicao[indexReal];
    buscar();
}

function salvarEdicao(docSelected, indexReal) {
    const itemAtual = bancoDeDados[docSelected][indexReal];
    const replicar = document.getElementById(`replicate_chk_${indexReal}`)?.checked || false;

    const novosValores = {};

    document.querySelectorAll(`[data-card-index="${indexReal}"]`).forEach(input => {
        const campoChave = input.getAttribute('data-field-key');
        if (campoChave) {
            novosValores[campoChave] = input.value;
            itemAtual[campoChave] = input.value;
        }
    });

    if (replicar) {
        bancoDeDados[docSelected].forEach(row => {
            Object.keys(novosValores).forEach(chave => {
                row[chave] = novosValores[chave];
            });
        });
    }

    localStorage.setItem('minhas_planilhas', JSON.stringify(bancoDeDados));
    estadoEdicao[indexReal] = false;
    buscar();
}

function buscar() {
    const docSelected = document.getElementById('docSelect').value;
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    const container = document.getElementById('resultsContainer');
    const totalCount = document.getElementById('totalCount');

    container.innerHTML = '';

    if (!docSelected || !bancoDeDados[docSelected]) {
        totalCount.textContent = '0';
        container.innerHTML = '<div class="empty-state">Nenhuma base selecionada.</div>';
        return;
    }

    const registros = bancoDeDados[docSelected];

    const filtradosComIndex = registros.map((item, indexReal) => ({ item, indexReal }))
        .filter(({ item }) => Object.keys(item).some(k => !k.startsWith('__EMPTY') && String(item[k]).toLowerCase().includes(query)));

    totalCount.textContent = filtradosComIndex.length;

    if (filtradosComIndex.length === 0) {
        container.innerHTML = '<div class="empty-state">Nenhum registro encontrado.</div>';
        return;
    }

    filtradosComIndex.forEach(({ item, indexReal }) => {
        const card = document.createElement('div');
        card.className = 'row-card';

        const isEditando = estadoEdicao[indexReal] || false;

        const codObj = obterChaveECampo(item, ['cod', 'código', 'codigo', 'id']);
        const clienteObj = obterChaveECampo(item, ['empresa', 'cliente', 'clientes', 'nome', 'razão social', 'razao social']);
        const servObj = obterChaveECampo(item, ['servidor', 'serv', 'tipo servidor', 'tipo', 'kip', 'sistema']);
        const dnsObj = obterChaveECampo(item, ['dns', 'host', 'ip', 'domain', 'url', 'ip servidor']);
        const senhaObj = obterChaveECampo(item, ['senha', 'password', 'pass']);

        const chavesMapeadas = [
            codObj.chave,
            clienteObj.chave,
            servObj.chave,
            dnsObj.chave,
            senhaObj.chave
        ].filter(Boolean);

        const keyCod = codObj.chave || 'CODIGO';
        const keyServ = servObj.chave || 'SERV';
        const keyCliente = clienteObj.chave || 'CLIENTE';
        const keyDns = dnsObj.chave || 'DNS';
        const keySenha = senhaObj.chave || 'SENHA';

        let textoBlocoLines = [];
        if (codObj.valor) textoBlocoLines.push(`COD: ${codObj.valor}`);
        if (servObj.valor) textoBlocoLines.push(`SERV: ${servObj.valor}`);
        if (clienteObj.valor) textoBlocoLines.push(`CLIENTE: ${clienteObj.valor}`);
        if (dnsObj.valor) textoBlocoLines.push(`DNS: ${dnsObj.valor}`);
        if (senhaObj.valor) textoBlocoLines.push(`SENHA: ${senhaObj.valor}`);

        Object.keys(item).forEach(k => {
            if (!k.startsWith('__EMPTY') && item[k] !== "" && !chavesMapeadas.includes(k)) {
                textoBlocoLines.push(`${k}: ${item[k]}`);
            }
        });

        const textoBlocoCompleto = textoBlocoLines.join('\n');

        let extrasHtml = '';
        Object.keys(item).forEach(coluna => {
            if (!coluna.startsWith('__EMPTY') && (item[coluna] !== "" || isEditando) && !chavesMapeadas.includes(coluna)) {
                extrasHtml += `
          <div class="field-item">
            <span class="field-label">${coluna}</span>
            ${isEditando ?
                        `<input type="text" class="edit-input" data-card-index="${indexReal}" data-field-key="${coluna}" value="${item[coluna]}">` :
                        `<button class="value-box-btn" onclick="copiarComFeedback(this, '${encodeURIComponent(item[coluna])}')">
                <span class="val-text">${item[coluna]}</span>
              </button>`
                    }
          </div>
        `;
            }
        });

        card.innerHTML = `
      <div class="card-header-actions">
        ${isEditando ? `
          <label style="font-size:0.75rem; color: var(--text-muted); cursor:pointer;">
            <input type="checkbox" id="replicate_chk_${indexReal}"> Replicar para toda a base
          </label>
        ` : ''}
        <button class="btn-lock ${isEditando ? 'unlocked' : ''}" onclick="alternarCadeado(${indexReal})">
          ${isEditando ? '🔓 Cancelar' : '🔒 Editar'}
        </button>
      </div>

      <div class="row-main-fields">
        <div class="field-item col-cod">
          <span class="field-label">CÓDIGO</span>
          ${isEditando ?
                `<input type="text" class="edit-input" data-card-index="${indexReal}" data-field-key="${keyCod}" value="${codObj.valor}">` :
                `<div class="badge-code" title="Clique para copiar" onclick="copiarComFeedback(this, '${encodeURIComponent(codObj.valor)}')">${codObj.valor || '—'}</div>`
            }
        </div>

        <div class="field-item col-serv">
          <span class="field-label">SERV.</span>
          ${isEditando ?
                `<input type="text" class="edit-input" data-card-index="${indexReal}" data-field-key="${keyServ}" value="${servObj.valor}">` :
                `<div class="badge-serv" title="${servObj.valor}" onclick="copiarComFeedback(this, '${encodeURIComponent(servObj.valor)}')">${servObj.valor || '—'}</div>`
            }
        </div>

        <div class="field-item col-cliente">
          <span class="field-label">NOME DO CLIENTE</span>
          ${isEditando ?
                `<input type="text" class="edit-input" data-card-index="${indexReal}" data-field-key="${keyCliente}" value="${clienteObj.valor}">` :
                `<button class="value-box-btn" onclick="copiarComFeedback(this, '${encodeURIComponent(clienteObj.valor)}')">
              <span class="val-text" title="${clienteObj.valor}">${clienteObj.valor || '—'}</span>
            </button>`
            }
        </div>

        <div class="field-item col-dns">
          <span class="field-label">DNS / DOMÍNIO</span>
          ${isEditando ?
                `<input type="text" class="edit-input" data-card-index="${indexReal}" data-field-key="${keyDns}" value="${dnsObj.valor}">` :
                `<button class="value-box-btn" onclick="copiarComFeedback(this, '${encodeURIComponent(dnsObj.valor)}')">
              <span class="val-text" title="${dnsObj.valor}">${dnsObj.valor || '—'}</span>
            </button>`
            }
        </div>

        <div class="field-item col-senha">
          <span class="field-label">SENHA</span>
          ${isEditando ?
                `<input type="text" class="edit-input" data-card-index="${indexReal}" data-field-key="${keySenha}" value="${senhaObj.valor}">` :
                `<button class="value-box-btn" onclick="copiarComFeedback(this, '${encodeURIComponent(senhaObj.valor)}')">
              <span class="val-text" title="${senhaObj.valor}">${senhaObj.valor || '—'}</span>
            </button>`
            }
        </div>

        ${isEditando ?
                `<button class="btn-save-edit" onclick="salvarEdicao('${docSelected}',${indexReal})">💾 Salvar</button>` :
                `<button class="btn-copy-all" onclick="copiarBlocoFeedback(this, '${encodeURIComponent(textoBlocoCompleto)}')">Copiar Bloco</button>`
            }
      </div>

      ${extrasHtml ? `<div class="extra-fields">${extrasHtml}</div>` : ''}
    `;

        container.appendChild(card);
    });
}

function copiarComFeedback(elemento, textoCodificado) {
    const texto = decodeURIComponent(textoCodificado);
    if (!texto || texto === '—') return;

    navigator.clipboard.writeText(texto).then(() => {
        const spanTexto = elemento.querySelector('.val-text') || elemento;
        const textoOriginal = spanTexto.innerText;

        spanTexto.innerText = "Copiado! ✓";
        spanTexto.style.color = "var(--success)";

        setTimeout(() => {
            spanTexto.innerText = textoOriginal;
            spanTexto.style.color = "";
        }, 1000);
    });
}

function copiarBlocoFeedback(btn, textoCodificado) {
    const texto = decodeURIComponent(textoCodificado);
    if (!texto) return;

    navigator.clipboard.writeText(texto).then(() => {
        const textoOriginal = btn.innerText;

        btn.innerText = "Copiado! ✓";
        btn.style.background = "var(--success)";
        btn.style.borderColor = "var(--success)";

        setTimeout(() => {
            btn.innerText = textoOriginal;
            btn.style.background = "";
            btn.style.borderColor = "";
        }, 1000);
    });
}

function excluirBaseAtual() {
    const docSelected = document.getElementById('docSelect').value;
    if (!docSelected) return;

    if (confirm(`Deseja realmente excluir a base "${docSelected}"?`)) {
        delete bancoDeDados[docSelected];
        localStorage.setItem('minhas_planilhas', JSON.stringify(bancoDeDados));
        atualizarSelectDocs();
        buscar();
    }
}