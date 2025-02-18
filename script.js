document.addEventListener('DOMContentLoaded', () => {
    // Captura os elementos da interface
    const btnSalvar = document.getElementById("btnSalvar")
    const unidadesContainer = document.getElementById('unidades-container');
    const totalChamadosSpan = document.getElementById('total-chamados-numero');
    const searchInput = document.getElementById('search');
    const contextMenu = document.getElementById('context-menu');
    const resetContextItem = document.getElementById('reset-context-item');

    // Verifica se os elementos foram encontrados
    if (!btnSalvar || !unidadesContainer || !totalChamadosSpan || !searchInput || !contextMenu || !resetContextItem) {
        console.error("❌ Erro: Um ou mais elementos não foram encontrados no HTML.");
        return; // Sai da função se algum elemento não existir
    }

    // Estrutura de dados com as unidades agrupadas por tipo
    const unidadesPorTipo = {
        "UPAs": ["UPA Alvarenga", "UPA Alves Dias", "UPA Baeta", "UPA Demarchi", "UPA Jardim Silvina / Selecta", "UPA Paulicéia", "UPA Riacho", "UPA Rudge", "UPA S. Pedro", "UPA Silvina"],
        "UBSs": ["UBS Alvarenga", "UBS Alves Dias", "UBS Areião", "UBS Baeta", "UBS Batistini", "UBS Calux", "UBS Caminho do Mar", "UBS Demarchi", "UBS Farina", "UBS Ferrazópolis", "UBS Finco", "UBS Ipê", "UBS Jordanópolis", "UBS Leblon", "UBS Montanhão", "UBS Nazareth", "UBS Orquídeas", "UBS Parque São Bernardo", "UBS Paulicéia", "UBS Planalto", "UBS Represa", "UBS Riacho", "UBS Rudge Ramos", "UBS Santa Cruz", "UBS Santa Terezinha", "UBS São Pedro", "UBS São Pedro II", "UBS Selecta", "UBS Silvina", "UBS Taboão", "UBS União", "UBS Vila Dayse", "UBS Vila Esperança", "UBS Vila Euclides", "UBS Vila Marchi", "UBS Vila Rosa"],
        "CAPs": ["CAPS III AD Alves Dias", "CAPS III Álc Drog Alvarenga", "CAPS III Álc. e Drog Cent", "CAPS III Álc. e Drog Inf. Juv", "CAPS III Alvarenga", "CAPS III Alves Dias", "CAPS III Centro", "CAPS III Farina", "CAPS III Rudge Ramos", "CAPS III Selecta", "CAPS Inf. Juvenil"],
        "Outros": ["Almoxarifado Central", "CEO Alvarenga", "CEO Nova Petrópolis", "CEO Silvina", "CER", "Chamado errado / Sem localização", "Comunicação", "Consultório na Rua", "Departamento de Administração da Saúde", "Departamento de Apoio a Gestão do SUS", "Departamento de Atenção a Saúde e Vigilância", "Departamento de Atenção Básica e Gestão do Cuidado", "Departamento de Atenção Especializada", "Departamento de Atenção Hospitalar, Urgências  Emergências", "Divisão Ambulatorial", "Divisão Assistência Farmacêutica", "Divisão de Adm. De Bens, Serv. E Pessoal - SS", "Divisão de Adm. Do Fundo Municipal de Saúde", "Divisão de Compras", "Divisão de Contratos", "Divisão de Educação Permanente e Gestão Participativa", "Divisão de Patrimônio", "Divisão de Planejamento em Saúde", "Divisão de Saúde Bucal", "Divisão de Saúde do Trabalhador e do Meio Ambiente", "Divisão de Saúde Mental", "Divisão de Unidade Básica de Saúde", "Divisão de Veterinária e Controle de Zoonoses", "Divisão de Vigilância Epidemiológica", "Divisão de Vigilância Sanitária", "Divisão Infraestrutura (Corporativo)", "Divisão Regulação", "Divisão Técnico Assistencial", "Dunacor", "Escola de Saúde", "Farmácia de Medicamentos Especializados - FME", "FMABC", "FUNCRAF", "Gabinete da Secretaria de Saúde", "GSS | Gabinete Secretaria da Saúde", "HA - Hospital Anchieta", "HC - Hospital das Clinicas", "HMU - Hospital da Mulher", "Hospital da Reabilitação - ABC", "Hospital de Olhos", "Hospital Municipal de Olhos.", "HU - Hospital Urgência", "IML Demarchi - Corpo de Delito", "Juridico", "NEU - Núcleo Educação de Urgência", "Nutrarte", "Outras Secretarias", "PA Psiquiátrico", "PA Taboão", "Parque Estoril (SS)", "POLIALVARENGA", "POLICENTRO", "POLIMAGEM", "Recursos Humanos", "Residências Terapêuticas", "SAAJ - Serv. Atendimento Ação Judicial", "Sala de Choque", "SAME", "SAMU - Avançado", "SAMU - Basica", "SAMU - Serv. Administrativos", "Seção da Central de Regulação em Saúde", "Seção de Auditoria em Saúde", "Seção de Controle e Avaliação", "Seção de Educação em Saúde", "Seção de Gestão Participativa", "Seção de Informação para gestão", "Seção de Lab. Municipal de Saúde Pública", "Seção de Orçamento e Planej. Em Saúde", "Seção de Padronização e Programação", "Seção de Programação", "Seção de Unidade, Org. e Acesso em Assistência Farmacêutica", "Seção de Verificação de Óbitos", "Secretária da Administração", "Secretária de Finanças", "Serviço de Expediente", "Serviço e Transporte Sanitário e Administrativo", "SETIH - Transporte InterHospitalar - Avançado", "SETIH - Transporte InterHospitalar - Basico", "SIGMA", "UA - Unidade de Acolhimento Transitório", "UGP", "Unidade de Coordenação de Programas", "Unidade Gestora do Projeto", "Unidades Externas"]
    };

    const BACKEND_URL = "http://127.0.0.1:5001";
    const API_URL = "http://127.0.0.1:5002";
    

    let contadores = carregarContadores();
    let totalChamados = calcularTotalChamados();

    function carregarContadores() {
        const contadoresSalvos = localStorage.getItem('contadores');
        if (contadoresSalvos) {
            return JSON.parse(contadoresSalvos);
        }
        return criarContadores(unidadesPorTipo);
    }

    function criarContadores(unidades) {
        const contadoresTemp = {};
        for (const tipo in unidades) {
            unidades[tipo].forEach(unidade => {
                contadoresTemp[unidade] = 0;
            });
        }
        return contadoresTemp;
    }

    function calcularTotalChamados() {
        return Object.values(contadores).reduce((acc, val) => acc + val, 0);
    }

    function atualizarTotalChamados() {
        totalChamados = calcularTotalChamados();
        totalChamadosSpan.textContent = totalChamados;
    }

    function criarGruposUnidades(unidadesFiltradas = unidadesPorTipo) {
        unidadesContainer.innerHTML = '';

        for (const tipo in unidadesFiltradas) {
            const grupoDiv = document.createElement('div');
            grupoDiv.classList.add('unidade-grupo');

            const tituloGrupo = document.createElement('h3');
            tituloGrupo.textContent = tipo;
            grupoDiv.appendChild(tituloGrupo);

            const unidadesDoGrupo = unidadesFiltradas[tipo];
            unidadesDoGrupo.forEach(unidade => {
                const button = document.createElement('button');
                button.classList.add('unidade-button');
                button.textContent = `${unidade}: ${contadores[unidade] || 0}`;
                button.addEventListener('click', () => {
                    contadores[unidade] = (contadores[unidade] || 0) + 1;
                    button.textContent = `${unidade}: ${contadores[unidade]}`;
                    atualizarTotalChamados();
                    salvarContadores();
                });
                grupoDiv.appendChild(button);
            });

            unidadesContainer.appendChild(grupoDiv);
        }
    }

    function salvarContadores() {
        localStorage.setItem('contadores', JSON.stringify(contadores));
    }

    criarGruposUnidades();
    atualizarTotalChamados();

    unidadesContainer.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        contextMenu.style.display = 'block';
        contextMenu.style.left = `${event.pageX}px`;
        contextMenu.style.top = `${event.pageY}px`;
    });

    document.addEventListener('click', (event) => {
        if (!contextMenu.contains(event.target)) {
            contextMenu.style.display = 'none';
        }
    });

    resetContextItem.addEventListener('click', () => {
        contadores = criarContadores(unidadesPorTipo);
        criarGruposUnidades();
        atualizarTotalChamados();
        salvarContadores();
        contextMenu.style.display = 'none';
        mostrarMensagem('Contadores resetados!');
    });

    btnSalvar.addEventListener('click', salvarDados);

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const unidadesFiltradas = {};
        for (const tipo in unidadesPorTipo) {
            unidadesFiltradas[tipo] = unidadesPorTipo[tipo].filter(unidade =>
                unidade.toLowerCase().includes(searchTerm)
            );
        }
        criarGruposUnidades(unidadesFiltradas);
    });

    async function salvarDados() {
        try {
            await esperarBackend();
            const salvarResponse = await fetch(`${BACKEND_URL}/salvar_dados`, {  // Alterado para BACKEND_URL
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contadores })
            });
    
            const data = await salvarResponse.json();
            if (data.sucesso) {
                mostrarMensagem("✅ Dados salvos com sucesso!");
            } else {
                mostrarMensagem("⚠️ Erro ao salvar os dados.");
            }
        } catch (error) {
            mostrarMensagem("❌ Erro: Backend não está rodando.");
        }
    }
    
    
    
    
    function carregarContadores() {
        const contadoresSalvos = localStorage.getItem('contadores');
        if (contadoresSalvos) {
            return JSON.parse(contadoresSalvos);
        }
        return criarContadores(unidadesPorTipo);
    }
    
    async function esperarBackend() {
        for (let i = 0; i < 10; i++) {  // Tenta por 10 segundos
            try {
                const response = await fetch(`${API_URL}/ping`);

                if (response.ok) {
                    console.log("✅ Backend está rodando!");
                    return;
                }
            } catch (error) {
                console.log("⏳ Aguardando backend iniciar...");
            }
            await new Promise(resolve => setTimeout(resolve, 1000)); // Espera 1 segundo antes de tentar novamente
        }
        console.error("❌ Backend não iniciou a tempo!");
    }
    
    document.addEventListener('DOMContentLoaded', async () => {
        await esperarBackend();
        criarGruposUnidades();
        atualizarTotalChamados();
    });
    

    function mostrarMensagem(mensagem) {
        const mensagemElement = document.createElement('div');
        mensagemElement.textContent = mensagem;
        mensagemElement.style.position = 'fixed';
        mensagemElement.style.top = '20px';
        mensagemElement.style.left = '50%';
        mensagemElement.style.transform = 'translateX(-50%)';
        mensagemElement.style.padding = '10px';
        mensagemElement.style.backgroundColor = '#f0f0f0';
        mensagemElement.style.border = '1px solid #ccc';
        mensagemElement.style.borderRadius = '5px';
        document.body.appendChild(mensagemElement);

        setTimeout(() => {
            document.body.removeChild(mensagemElement);
        }, 3000);
    }
});
