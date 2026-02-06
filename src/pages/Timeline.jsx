import { useState, useEffect, useRef } from 'react'
import React from 'react'
import { useMarcosContext } from '../context/MarcosContext'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { showConfirm } from '../App'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './Timeline.css'

function Timeline() {
  const { marcos, excluirMarco, loading, error } = useMarcosContext()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [modalAberto, setModalAberto] = useState(false)
  const [marcoSelecionado, setMarcoSelecionado] = useState(null)
  const [filtroTipo, setFiltroTipo] = useState(null) // null = todos, 1 = sistemas, 2 = infra, 3 = devsecops
  const [anoSelecionado, setAnoSelecionado] = useState(null) // Será definido automaticamente para o ano mais recente
  const [visualizacao, setVisualizacao] = useState('timeline') // 'timeline', 'resumo' ou 'insights'
  const [perguntaSelecionada, setPerguntaSelecionada] = useState(null)
  const [loadingGPT, setLoadingGPT] = useState(false)
  const [respostaGPT, setRespostaGPT] = useState('')
  
  // Refs para controlar animações
  const timelineItemsRef = useRef([])

  const isAprovador = user?.roleId === 'Aprovador'

  // Filtra apenas entregas aprovadas (status 2)
  const marcosAprovados = marcos.filter(m => m.statusId === 2)
  
  // Extrai anos únicos disponíveis
  const anosDisponiveis = [...new Set(
    marcosAprovados
      .filter(m => m.data)
      .map(m => m.data.split('-')[0])
  )].sort((a, b) => b - a) // Ordem decrescente (mais recente primeiro)
  
  // Define o ano mais recente como padrão quando carrega os dados
  useEffect(() => {
    if (anosDisponiveis.length > 0 && !anoSelecionado) {
      setAnoSelecionado(anosDisponiveis[0])
    }
  }, [anosDisponiveis.length])
  
  // Aplica filtro de ano primeiro
  const marcosFiltradosPorAno = anoSelecionado
    ? marcosAprovados.filter(m => m.data && m.data.startsWith(anoSelecionado))
    : marcosAprovados
  
  // Aplica filtro de tipo se selecionado
  const marcosFiltrados = filtroTipo 
    ? marcosFiltradosPorAno.filter(m => m.typeId === filtroTipo)
    : marcosFiltradosPorAno
  
  // Ordena as entregas por data
  const marcosSorted = [...marcosFiltrados].sort((a, b) => new Date(a.data) - new Date(b.data))

  // Intersection Observer para animação de fade
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-visible')
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    )

    // Observa todos os itens da timeline
    timelineItemsRef.current.forEach((item) => {
      if (item) observer.observe(item)
    })

    return () => {
      timelineItemsRef.current.forEach((item) => {
        if (item) observer.unobserve(item)
      })
    }
  }, [marcosSorted])

  const toggleFiltro = (tipo) => {
    setFiltroTipo(tipo)
  }

  const formatarData = (data) => {
    const date = new Date(data + 'T00:00:00')
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  const truncarTexto = (texto, limite = 50) => {
    if (texto.length <= limite) return texto
    return texto.substring(0, limite) + '...'
  }

  const truncarDescricao = (texto, limite = 200) => {
    if (!texto) return ''
    // Remove tags HTML
    const textoLimpo = limparHTML(texto)
    if (textoLimpo.length <= limite) return textoLimpo
    return textoLimpo.substring(0, limite) + '...'
  }

  const limparHTML = (html) => {
    if (!html) return ''
    return html
      .replace(/<[^>]*>/g, '') // Remove todas as tags HTML
      .replace(/&nbsp;/g, ' ') // Substitui &nbsp; por espaço
      .replace(/&amp;/g, '&') // Substitui &amp; por &
      .replace(/&lt;/g, '<') // Substitui &lt; por <
      .replace(/&gt;/g, '>') // Substitui &gt; por >
      .replace(/&quot;/g, '"') // Substitui &quot; por "
      .trim()
  }

  const abrirModal = (marco) => {
    setMarcoSelecionado(marco)
    setModalAberto(true)
  }

  const fecharModal = () => {
    setModalAberto(false)
    setMarcoSelecionado(null)
  }

  const handleEditar = (id) => {
    fecharModal()
    navigate(`/editar-marco/${id}`)
  }

  const handleExcluir = async (id) => {
    if (!showConfirm) {
      console.error('showConfirm não está disponível')
      alert('Erro ao carregar componente de confirmação. Recarregue a página.')
      return
    }

    const confirmed = await showConfirm({
      title: 'Confirmar Exclusão',
      message: 'Tem certeza que deseja excluir esta entrega? Esta ação não pode ser desfeita.',
      confirmText: 'Sim, excluir',
      cancelText: 'Cancelar',
      type: 'danger'
    })

    if (confirmed) {
      excluirMarco(id)
      fecharModal()
    }
  }

  const gerarPDF = () => {
    // Cria uma nova janela para impressão
    const printWindow = window.open('', '_blank')
    
    // Formata o conteúdo para impressão
    const conteudoFormatado = respostaGPT
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/•/g, '&bull;')
    
    const tituloPergunta = {
      'analise-executiva': 'Análise Executiva da Performance da Equipe',
      'resumo-executivo': 'Resumo Executivo das Entregas',
      'principais-padroes': 'Principais Padrões Observados',
      'sistemas-mais-entregas': 'Sistemas com Maior Volume de Melhorias',
      'squads-mais-entregas': 'Squads com Maior Número de Entregas'
    }[perguntaSelecionada] || 'Análise IA'
    
    const dataHora = new Date().toLocaleString('pt-BR')
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${tituloPergunta}</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 40px 20px;
            }
            h1 {
              color: #1e293b;
              border-bottom: 3px solid #3b82f6;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            h2 {
              color: #475569;
              margin-top: 25px;
              margin-bottom: 15px;
            }
            p {
              margin: 10px 0;
              text-align: justify;
            }
            strong {
              color: #1e293b;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #e2e8f0;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e2e8f0;
              text-align: center;
              font-size: 12px;
              color: #64748b;
            }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🤖 ${tituloPergunta}</h1>
            <p><strong>Gerado em:</strong> ${dataHora}</p>
          </div>
          <div class="content">
            <p>${conteudoFormatado}</p>
          </div>
          <div class="footer">
            <p>Relatório gerado automaticamente pela plataforma Observatório TI</p>
          </div>
        </body>
      </html>
    `)
    
    printWindow.document.close()
    
    // Aguarda o carregamento e abre o diálogo de impressão
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  const handlePerguntaGPT = async (tipo) => {
    setPerguntaSelecionada(tipo)
    setLoadingGPT(true)
    setRespostaGPT('')
    
    // Simula chamada à API (por enquanto texto fixo)
    setTimeout(() => {
      let resposta = ''
      
      switch(tipo) {
        case 'analise-executiva':
          resposta = `**Análise Executiva da Performance da Equipe**\n\nEste relatório apresenta uma análise abrangente dos marcos alcançados pela nossa equipe, demonstrando não apenas números, mas também a qualidade e o impacto estratégico de cada conquista.\n\n**Visão Geral de Performance**\n\nAo longo do período analisado, a equipe consolidou marcos significativos, evidenciando um padrão consistente de entrega e excelência operacional. A distribuição estratégica entre projetos estruturantes e melhorias contínuas reflete uma abordagem equilibrada de inovação e otimização.\n\n**Distribuição Estratégica**\n\nA análise da composição dos marcos revela aspectos importantes sobre as prioridades e a estratégia de atuação da equipe. O equilíbrio entre projetos de grande impacto e melhorias incrementais demonstra maturidade na gestão do portfólio de iniciativas.\n\n**Principais Indicadores:**\n\n• Cadência consistente de entregas mensais\n• Alta taxa de conclusão de projetos no prazo\n• Qualidade evidenciada pelos destaques documentados\n• Colaboração efetiva entre múltiplos squads\n• Foco em sistemas críticos do negócio\n\n**Impacto e Valor Gerado**\n\nAs entregas realizadas contribuíram significativamente para:\n• Modernização da infraestrutura tecnológica\n• Otimização de processos críticos de negócio\n• Aumento da eficiência operacional\n• Fortalecimento da cultura de inovação\n• Melhoria contínua da experiência dos usuários\n\n**Conclusão:**\n\nA equipe demonstra uma performance sólida e consistente, com entregas de alto valor que impactam positivamente a organização. O padrão de qualidade e a diversidade de iniciativas evidenciam uma equipe madura e alinhada com os objetivos estratégicos.`
          break
        case 'resumo-executivo':
          resposta = `**Resumo Executivo das Entregas**\n\nNossa equipe demonstrou um desempenho consistente e estratégico ao longo do período analisado. Com foco balanceado entre projetos estruturantes e melhorias contínuas, alcançamos marcos significativos que impactaram positivamente diversos sistemas e processos.\n\n**Principais Conquistas:**\n\n• Implementação de soluções inovadoras que aumentaram a eficiência operacional\n• Melhorias incrementais que resultaram em maior satisfação dos usuários\n• Entregas alinhadas com os objetivos estratégicos da organização\n• Colaboração efetiva entre diferentes squads, gerando resultados sinérgicos\n\n**Impacto Organizacional:**\n\nAs entregas realizadas contribuíram diretamente para a modernização da infraestrutura tecnológica, otimização de processos críticos e fortalecimento da cultura de inovação contínua.`
          break
        case 'principais-padroes':
          resposta = `**Principais Padrões Observados**\n\nA análise dos dados revela padrões importantes na forma como nossa equipe trabalha e entrega valor:\n\n**1. Ritmo de Entrega**\n• Cadência consistente de entregas ao longo dos meses\n• Picos de produtividade alinhados com ciclos de planejamento\n• Distribuição equilibrada entre projetos de curto e longo prazo\n\n**2. Tipologia das Entregas**\n• Maior volume de melhorias contínuas, demonstrando maturidade operacional\n• Projetos estruturantes concentrados em períodos estratégicos\n• Foco crescente em otimização e refinamento de sistemas existentes\n\n**3. Colaboração entre Squads**\n• Forte interdependência entre equipes em projetos complexos\n• Compartilhamento de conhecimento e boas práticas\n• Sinergia que potencializa resultados além da soma individual\n\n**4. Qualidade e Documentação**\n• Alto padrão de documentação dos marcos alcançados\n• Destaque para benefícios e impactos das entregas\n• Rastreabilidade completa das iniciativas implementadas`
          break
        case 'sistemas-mais-entregas':
          resposta = `**Sistemas com Maior Volume de Melhorias**\n\nBaseado na análise das entregas registradas, identificamos os sistemas que receberam maior atenção e investimento em melhorias:\n\n**Top 5 Sistemas:**\n\n**1. Portal de Diárias** (32% das melhorias)\n• Otimização de processos de aprovação\n• Melhorias na interface do usuário\n• Implementação de novos relatórios\n• Integração com sistemas corporativos\n\n**2. Sistema de Compras** (24% das melhorias)\n• Automação de workflows\n• Melhorias em performance\n• Novas funcionalidades de rastreamento\n• Otimização de consultas\n\n**3. EPF - Escritório de Projetos** (18% das melhorias)\n• Gestão de portfólio aprimorada\n• Dashboards estratégicos\n• Integrações com ferramentas de gestão\n\n**4. Sistema de Contas a Receber** (15% das melhorias)\n• Automação de conciliações\n• Melhorias em relatórios financeiros\n• Otimização de processos contábeis\n\n**5. Outros Sistemas** (11% das melhorias)\n• Melhorias distribuídas em sistemas diversos\n• Manutenções evolutivas\n• Correções e ajustes\n\n**Insight:** Os sistemas core do negócio receberam maior atenção, refletindo a estratégia de fortalecer as operações essenciais.`
          break
        case 'squads-mais-entregas':
          resposta = `**Squads com Maior Número de Entregas**\n\nA análise de produtividade por squad revela a distribuição de esforços e especialidades:\n\n**Ranking de Entregas:**\n\n**🥇 1º Lugar - Squad de Compras**\n• Total: 18 entregas (12 melhorias + 6 projetos)\n• Especialização em automação de processos de compras\n• Destaque em inovação e otimização\n• Taxa de sucesso: 95% das entregas no prazo\n\n**🥈 2º Lugar - Squad de Diárias e IA**\n• Total: 15 entregas (9 melhorias + 6 projetos)\n• Foco em inteligência artificial aplicada\n• Projetos de transformação digital\n• Liderança em inovação tecnológica\n\n**🥉 3º Lugar - Squad de Sistemas Financeiros**\n• Total: 12 entregas (8 melhorias + 4 projetos)\n• Especialização em sistemas críticos\n• Alta complexidade técnica\n• Excelência em qualidade de código\n\n**4º Lugar - Squad de Infraestrutura**\n• Total: 9 entregas (6 melhorias + 3 projetos)\n• Foco em estabilidade e performance\n• Suporte aos demais squads\n• Otimização contínua\n\n**5º Lugar - Squad de Projetos Estratégicos**\n• Total: 8 entregas (3 melhorias + 5 projetos)\n• Projetos de alto impacto\n• Iniciativas de longo prazo\n• Foco em transformação\n\n**Insights:**\n• Distribuição equilibrada de esforços entre squads\n• Cada squad com especialização clara\n• Colaboração frequente em projetos interfuncionais\n• Alta taxa de conclusão e qualidade das entregas`
          break
        case 'conteudo-slides':
          resposta = `**Conteúdo para Apresentação de Slides**\n\nAbaixo está o conteúdo estruturado por slides para apresentar as entregas da equipe:\n\n**SLIDE 1: Capa**\n🎯 Observatório TI - Entregas da Equipe\nPeríodo: [Inserir período]\nApresentação dos principais marcos e conquistas\n\n**SLIDE 2: Visão Geral**\n📊 Nossos Números\n• Total de entregas realizadas\n• Distribuição entre projetos e melhorias\n• Média mensal de entregas\n• Squads envolvidas nas iniciativas\n\n**SLIDE 3: Distribuição Estratégica**\n🎯 Projetos vs Melhorias\n• Projetos estruturantes: transformação e inovação\n• Melhorias contínuas: otimização e excelência\n• Equilíbrio estratégico entre inovação e melhoria\n• Foco em valor de longo prazo\n\n**SLIDE 4: Principais Conquistas**\n⭐ Destaques do Período\n• Modernização da infraestrutura tecnológica\n• Automação de processos críticos\n• Implementação de soluções inovadoras\n• Melhoria na experiência dos usuários\n\n**SLIDE 5: Impacto Organizacional**\n📈 Valor Gerado\n• Aumento da eficiência operacional\n• Redução de custos e tempo de processos\n• Fortalecimento da cultura de inovação\n• Maior satisfação dos stakeholders\n\n**SLIDE 6: Sistemas Beneficiados**\n💻 Áreas de Atuação\n• Portal de Diárias: otimizações e novas funcionalidades\n• Sistema de Compras: automação e integrações\n• Sistemas Financeiros: melhorias em relatórios e processos\n• Outros sistemas corporativos\n\n**SLIDE 7: Performance das Squads**\n👥 Colaboração e Produtividade\n• Distribuição equilibrada de entregas entre equipes\n• Alta taxa de conclusão no prazo\n• Colaboração interfuncional efetiva\n• Especialização e excelência técnica\n\n**SLIDE 8: Qualidade e Padrões**\n✅ Excelência em Entregas\n• Alto padrão de documentação\n• Testes e validações rigorosas\n• Aderência às melhores práticas\n• Rastreabilidade completa das iniciativas\n\n**SLIDE 9: Conclusão e Perspectivas**\n🚀 Próximos Passos\n• Manutenção do ritmo de entregas\n• Foco contínuo em inovação e qualidade\n• Expansão de iniciativas bem-sucedidas\n• Fortalecimento da cultura de melhoria contínua\n\n**SLIDE 10: Agradecimentos**\n👏 Reconhecimento\nAgradecemos a todas as squads e colaboradores envolvidos nas entregas.\nJuntos, construímos uma trajetória de sucesso e excelência!`
          break
        default:
          resposta = 'Resposta não disponível.'
      }
      
      setRespostaGPT(resposta)
      setLoadingGPT(false)
    }, 2000)
  }

  const gerarResumoIA = () => {
    const totalMarcos = marcosFiltrados.length
    const sistemas = marcosFiltrados.filter(m => m.typeId === 1).length
    const infra = marcosFiltrados.filter(m => m.typeId === 2).length
    const devsecops = marcosFiltrados.filter(m => m.typeId === 3).length
    
    // Agrupa por mês
    const marcosPorMes = {}
    marcosFiltrados.forEach(marco => {
      const mes = new Date(marco.data + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      if (!marcosPorMes[mes]) marcosPorMes[mes] = []
      marcosPorMes[mes].push(marco)
    })

    const mesComMaisMarcos = Object.entries(marcosPorMes).sort((a, b) => b[1].length - a[1].length)[0]
    const mesesAtivos = Object.keys(marcosPorMes).length
    const mediaMarcosPorMes = (totalMarcos / mesesAtivos).toFixed(1)
    
    // Gera apenas conclusão e perspectivas
    let resumoTexto = ``
    
    const distribuicao = [
      { tipo: 'Sistemas', qtd: sistemas },
      { tipo: 'Infra', qtd: infra },
      { tipo: 'DevSecops', qtd: devsecops }
    ].sort((a, b) => b.qtd - a.qtd)
    
    resumoTexto += `O portfólio analisado revela uma equipe com foco estratégico bem definido. A distribuição das entregas entre Sistemas (${sistemas}), Infraestrutura (${infra}) e DevSecops (${devsecops}) demonstra uma abordagem equilibrada que abrange desenvolvimento, operações e segurança. Este perfil multifacetado indica maturidade organizacional e capacidade de atender diferentes frentes simultaneamente.\n\n`
    
    resumoTexto += `Os ${totalMarcos} marcos alcançados não representam apenas entregas isoladas, mas sim um portfólio coerente que reflete estratégia, disciplina e competência técnica. Cada marco contribui para um mosaico maior de evolução organizacional, e a análise conjunta revela padrões que podem orientar decisões futuras, alocação de recursos e definição de prioridades. A trajetória demonstrada estabelece precedentes positivos e fornece fundamentos sólidos para desafios futuros de maior complexidade e escopo.`
    
    return {
      numeros: {
        total: totalMarcos,
        sistemas: sistemas,
        infra: infra,
        devsecops: devsecops,
        meses: mesesAtivos,
        mediaMensal: mediaMarcosPorMes,
        mesDestaque: mesComMaisMarcos ? mesComMaisMarcos[0] : null,
        marcosNoMesDestaque: mesComMaisMarcos ? mesComMaisMarcos[1].length : 0
      },
      resumoCompleto: resumoTexto
    }
  }

  const prepararDadosGrafico = () => {
    // Agrupa marcos por mês/ano
    const marcosPorMes = {}
    
    marcosFiltrados.forEach(marco => {
      const data = new Date(marco.data + 'T00:00:00')
      const mesAno = data.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
      const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
      
      if (!marcosPorMes[chave]) {
        marcosPorMes[chave] = {
          mes: mesAno.charAt(0).toUpperCase() + mesAno.slice(1),
          sistemas: 0,
          infra: 0,
          devsecops: 0,
          total: 0,
          ordem: data.getTime()
        }
      }
      
      marcosPorMes[chave].total += 1
      
      if (marco.typeId === 1) {
        marcosPorMes[chave].sistemas += 1
      } else if (marco.typeId === 2) {
        marcosPorMes[chave].infra += 1
      } else if (marco.typeId === 3) {
        marcosPorMes[chave].devsecops += 1
      }
    })
    
    // Converte para array e ordena por data
    return Object.values(marcosPorMes).sort((a, b) => a.ordem - b.ordem)
  }

  const prepararDadosSquadsPorMes = () => {
    // Agrupa por mês e squad
    const dadosPorMes = {}
    const squadsUnicas = new Set()
    
    marcosFiltrados.forEach(marco => {
      const data = new Date(marco.data + 'T00:00:00')
      const mesAno = data.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
      const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
      
      if (!dadosPorMes[chave]) {
        dadosPorMes[chave] = {
          mes: mesAno.charAt(0).toUpperCase() + mesAno.slice(1),
          ordem: data.getTime()
        }
      }
      
      // Processa squads do marco
      const squadsString = marco.squad || marco.squads || '' // API pode retornar squad
      if (squadsString && typeof squadsString === 'string' && squadsString.trim()) {
        // Divide squads por vírgula e processa cada um
        const squadsList = squadsString.split(',').map(s => s.trim()).filter(s => s)
        squadsList.forEach(squadName => {
          squadsUnicas.add(squadName)
          
          if (!dadosPorMes[chave][squadName]) {
            dadosPorMes[chave][squadName] = 0
          }
          dadosPorMes[chave][squadName] += 1
        })
      } else {
        // Se não tem squad, adiciona como "Sem Squad"
        squadsUnicas.add('Sem Squad')
        if (!dadosPorMes[chave]['Sem Squad']) {
          dadosPorMes[chave]['Sem Squad'] = 0
        }
        dadosPorMes[chave]['Sem Squad'] += 1
      }
    })
    
    // Converte para array e ordena por data
    const dados = Object.values(dadosPorMes).sort((a, b) => a.ordem - b.ordem)
    
    // Define cores para cada squad
    const cores = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']
    const squadsArray = Array.from(squadsUnicas)
    const coresPorSquad = {}
    squadsArray.forEach((squad, index) => {
      coresPorSquad[squad] = cores[index % cores.length]
    })
    
    return { dados, squads: squadsArray, cores: coresPorSquad }
  }

  const prepararDadosEntregasPorArea = () => {
    // Agrupa entregas por customer/área
    const entregasPorArea = {}
    
    marcosFiltrados.forEach(marco => {
      const areaName = marco.customer || 'Sem Área'
      
      if (!entregasPorArea[areaName]) {
        entregasPorArea[areaName] = {
          area: areaName,
          sistemas: 0,
          infra: 0,
          devsecops: 0,
          total: 0
        }
      }
      
      entregasPorArea[areaName].total += 1
      
      if (marco.typeId === 1) {
        entregasPorArea[areaName].sistemas += 1
      } else if (marco.typeId === 2) {
        entregasPorArea[areaName].infra += 1
      } else if (marco.typeId === 3) {
        entregasPorArea[areaName].devsecops += 1
      }
    })
    
    // Converte para array e ordena por total decrescente
    return Object.values(entregasPorArea).sort((a, b) => b.total - a.total)
  }

  return (
    <div className="timeline-container">
      <div className="timeline-header">
        <div className="timeline-view-toggle">
          <button 
            className={`toggle-btn ${visualizacao === 'timeline' ? 'active' : ''}`}
            onClick={() => setVisualizacao('timeline')}
          >
            📊 Timeline Visual
          </button>
          <button 
            className={`toggle-btn ${visualizacao === 'resumo' ? 'active' : ''}`}
            onClick={() => setVisualizacao('resumo')}
          >
            📝 Estatísticas
          </button>
          {isAprovador && (
            <button 
              className={`toggle-btn ${visualizacao === 'insights' ? 'active' : ''}`}
              onClick={() => setVisualizacao('insights')}
            >
              🤖 Insights TI.A
            </button>
          )}
        </div>
      </div>
      
      {visualizacao === 'timeline' && (
        <div className="timeline-filters">
          <div className="filters-left-group">
            <div className="filter-select-container">
              <select 
                id="filtro-ano"
                value={anoSelecionado || ''}
                onChange={(e) => setAnoSelecionado(e.target.value)}
                className="tipo-filter-select"
              >
                {anosDisponiveis.map(ano => (
                  <option key={ano} value={ano}>
                    📅 {ano} ({marcosAprovados.filter(m => m.data && m.data.startsWith(ano)).length})
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-select-container">
              <select 
                id="filtro-tipo"
                value={filtroTipo === null ? 'todos' : filtroTipo}
                onChange={(e) => toggleFiltro(e.target.value === 'todos' ? null : parseInt(e.target.value))}
                className="tipo-filter-select"
              >
                <option value="todos">📋 Todas as áreas ({marcosFiltradosPorAno.length})</option>
                <option value="1">🖥️ Sistemas ({marcosFiltradosPorAno.filter(m => m.typeId === 1).length})</option>
                <option value="2">⚙️ Infra ({marcosFiltradosPorAno.filter(m => m.typeId === 2).length})</option>
                <option value="3">🔒 DevSecops ({marcosFiltradosPorAno.filter(m => m.typeId === 3).length})</option>
              </select>
            </div>
          </div>
          <button 
            className="btn-adicionar-entrega"
            onClick={() => navigate('/novo-marco')}
          >
            <span className="btn-icon">+</span> Nova Entrega
          </button>
        </div>
      )}
      
      {loading && <div className="loading-state">Carregando entregas...</div>}
      {error && <div className="error-state">{error}</div>}
      
      {!loading && marcosSorted.length === 0 ? (
        <div className="empty-state">
          <p>Nenhuma entrega aprovada ainda.</p>
          {user?.roleId === 'Contribuidor' && (
            <button onClick={() => navigate('/novo-marco')} className="btn-primary">
              Criar Primeira Entrega
            </button>
          )}
        </div>
      ) : (
        <>
          {visualizacao === 'timeline' ? (
            <div className="timeline-vertical-wrapper">
              <div className="timeline-vertical">
            {marcosSorted.map((marco, index) => {
              // Verifica se é a primeira entrega do mês
              const mesAtual = new Date(marco.data + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
              const mesAnterior = index > 0 
                ? new Date(marcosSorted[index - 1].data + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
                : null
              const isPrimeiroDoMes = mesAtual !== mesAnterior
              
              return (
                <React.Fragment key={marco.id}>
                  {isPrimeiroDoMes && (
                    <div className="timeline-mes-divider">
                      <span className="timeline-mes-label">📅 {mesAtual}</span>
                    </div>
                  )}
                  <div 
                    ref={(el) => (timelineItemsRef.current[index] = el)}
                    className={`timeline-item-vertical fade-in-item ${index % 2 === 0 ? 'timeline-item-right' : 'timeline-item-left'}`}
                    onClick={() => abrirModal(marco)}
                  >
                    <div 
                      className="timeline-dot" 
                      style={{ borderColor: '#2563eb' }}
                    ></div>
                    <div 
                      className={`timeline-card-vertical ${marco.highlighted ? 'highlighted' : ''}`}
                      style={{ 
                        borderLeftColor: marco.highlighted ? '#fbbf24' : (index % 2 === 0 ? marco.cor : '#e8edf2'),
                        borderRightColor: marco.highlighted ? '#fbbf24' : (index % 2 === 0 ? '#e8edf2' : marco.cor)
                      }}
                    >
                      <div className="timeline-icon-large" style={{ 
                        backgroundColor: marco.typeId === 1 ? '#2563eb' : marco.typeId === 2 ? '#059669' : '#dc2626' 
                      }}>
                        {marco.typeId === 1 ? '🖥️' : marco.typeId === 2 ? '⚙️' : '🔒'}
                      </div>
                      <div className="timeline-content-wrapper">
                        <div className="timeline-date-vertical">{formatarData(marco.data)}</div>
                        <h3 className="timeline-title-vertical">{truncarTexto(marco.titulo, 60)}</h3>
                        <p className="timeline-description-preview">{truncarDescricao(marco.descricao, 200)}</p>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              )
            })}
          </div>
        </div>
          ) : visualizacao === 'resumo' ? (
            <>
              {(() => {
                const resumo = gerarResumoIA()
                const dadosGrafico = prepararDadosGrafico()
                const dadosSquads = prepararDadosSquadsPorMes()
                const dadosAreas = prepararDadosEntregasPorArea()
                return (
                  <div className="resumo-ia-container">
                    <div className="numeros-section">
                      <h4>📊 Estatísticas</h4>
                      <div className="numeros-grid">
                        <div className="numero-card">
                          <div className="numero-valor">{resumo.numeros.total}</div>
                          <div className="numero-label">Total de Entregas</div>
                        </div>
                        <div className="numero-card sistemas">
                          <div className="numero-valor">{resumo.numeros.sistemas}</div>
                          <div className="numero-label">Sistemas 💻</div>
                          <div className="numero-percent">{((resumo.numeros.sistemas/resumo.numeros.total)*100).toFixed(0)}%</div>
                        </div>
                        <div className="numero-card infra">
                          <div className="numero-valor">{resumo.numeros.infra}</div>
                          <div className="numero-label">Infra ⚙️</div>
                          <div className="numero-percent">{((resumo.numeros.infra/resumo.numeros.total)*100).toFixed(0)}%</div>
                        </div>
                        <div className="numero-card devsecops">
                          <div className="numero-valor">{resumo.numeros.devsecops}</div>
                          <div className="numero-label">DevSecops 🔒</div>
                          <div className="numero-percent">{((resumo.numeros.devsecops/resumo.numeros.total)*100).toFixed(0)}%</div>
                        </div>
                        <div className="numero-card">
                          <div className="numero-valor">{resumo.numeros.mediaMensal}</div>
                          <div className="numero-label">Média Mensal</div>
                        </div>
                      </div>
                    </div>

                    <div className="grafico-section">
                      <h4>📈 Quantidade de Entregas por Mês</h4>
                      <div className="grafico-container">
                        <ResponsiveContainer width="100%" height={400}>
                          <BarChart
                            data={dadosGrafico}
                            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis 
                              dataKey="mes" 
                              angle={-45}
                              textAnchor="end"
                              height={80}
                              tick={{ fill: '#64748b', fontSize: 12 }}
                            />
                            <YAxis 
                              tick={{ fill: '#64748b', fontSize: 12 }}
                              allowDecimals={false}
                            />
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                              }}
                              labelStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                            />
                            <Legend 
                              wrapperStyle={{ paddingTop: '20px' }}
                              iconType="square"
                            />
                            <Bar 
                              dataKey="sistemas" 
                              name="Sistemas" 
                              fill="#2563eb" 
                              radius={[8, 8, 0, 0]}
                            />
                            <Bar 
                              dataKey="infra" 
                              name="Infra" 
                              fill="#059669" 
                              radius={[8, 8, 0, 0]}
                            />
                            <Bar 
                              dataKey="devsecops" 
                              name="DevSecops" 
                              fill="#dc2626" 
                              radius={[8, 8, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="grafico-section">
                      <h4>🏢 Entregas por Área</h4>
                      <div className="grafico-container">
                        <ResponsiveContainer width="100%" height={400}>
                          <BarChart
                            data={dadosAreas}
                            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                            layout="horizontal"
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis 
                              dataKey="area" 
                              angle={-45}
                              textAnchor="end"
                              height={100}
                              tick={{ fill: '#64748b', fontSize: 12 }}
                            />
                            <YAxis 
                              tick={{ fill: '#64748b', fontSize: 12 }}
                              allowDecimals={false}
                            />
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                              }}
                              labelStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                            />
                            <Legend 
                              wrapperStyle={{ paddingTop: '20px' }}
                              iconType="square"
                            />
                            <Bar 
                              dataKey="sistemas" 
                              name="Sistemas" 
                              fill="#2563eb" 
                              radius={[8, 8, 0, 0]}
                              stackId="stack"
                            />
                            <Bar 
                              dataKey="infra" 
                              name="Infra" 
                              fill="#059669" 
                              radius={[8, 8, 0, 0]}
                              stackId="stack"
                            />
                            <Bar 
                              dataKey="devsecops" 
                              name="DevSecops" 
                              fill="#dc2626" 
                              radius={[8, 8, 0, 0]}
                              stackId="stack"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </>
          ) : (
            <>
              {(() => {
                const resumo = gerarResumoIA()
                return (
                  <div className="resumo-ia-container">
                    <div className="resumo-completo-section">
                      <h4>🤖 Insights TI.A</h4>
                      <div className="resumo-texto-completo">
                        <h4>Conclusão e Perspectivas</h4>
                        <p className="resumo-paragrafo">{resumo.resumoCompleto}</p>
                      </div>
                    </div>

                    <div className="gpt-perguntas-section">
                      <h4>Perguntas</h4>
                      <p className="gpt-intro">Selecione uma análise para obter insights gerados por inteligência artificial:</p>
                      
                      <div className="gpt-buttons-grid">
                        <button 
                          className={`gpt-button ${perguntaSelecionada === 'resumo-executivo' ? 'active' : ''}`}
                          onClick={() => handlePerguntaGPT('resumo-executivo')}
                          disabled={loadingGPT}
                        >
                          <span className="gpt-icon">📋</span>
                          <span className="gpt-text">Resumo geral</span>
                        </button>
                        
                        <button 
                          className={`gpt-button ${perguntaSelecionada === 'analise-executiva' ? 'active' : ''}`}
                          onClick={() => handlePerguntaGPT('analise-executiva')}
                          disabled={loadingGPT}
                        >
                          <span className="gpt-icon">📈</span>
                          <span className="gpt-text">Análise de performance</span>
                        </button>
                      </div>

                      {loadingGPT && (
                        <div className="gpt-loading">
                          <div className="gpt-spinner"></div>
                          <p>Gerando análise com IA...</p>
                        </div>
                      )}

                      {respostaGPT && !loadingGPT && (
                        <div className="gpt-resposta">
                          <div className="gpt-resposta-header">
                            <span className="gpt-badge">Resposta da IA</span>
                          </div>
                          <div className="gpt-resposta-conteudo">
                            <div style={{ whiteSpace: 'pre-wrap' }}>{respostaGPT}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    <br />

                    <div className="resumo-footer">
                      <p>💡 <em>Análises geradas automaticamente com base nas entregas aprovadas.</em></p>
                    </div>
                  </div>
                )
              })()}
            </>
          )}
        </>
      )}

      {modalAberto && marcoSelecionado && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={fecharModal}>×</button>
            <div className="modal-header" style={{ 
              borderTopColor: marcoSelecionado.typeId === 1 ? '#2563eb' : marcoSelecionado.typeId === 2 ? '#059669' : '#dc2626' 
            }}>
              <h2>{marcoSelecionado.titulo}</h2>
              <div className="modal-meta">
                <span className="modal-type-badge" style={{ 
                  backgroundColor: marcoSelecionado.typeId === 1 ? '#2563eb' : marcoSelecionado.typeId === 2 ? '#059669' : '#dc2626' 
                }}>
                  {marcoSelecionado.typeId === 1 ? '🖥️ Sistemas' : marcoSelecionado.typeId === 2 ? '⚙️ Infra' : '🔒 DevSecops'}
                </span>
                <div className="modal-date">{formatarData(marcoSelecionado.data)}</div>
              </div>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <h4 className="modal-section-title">Descrição</h4>
                <p className="modal-description" style={{ whiteSpace: 'pre-wrap' }}>{limparHTML(marcoSelecionado.descricao)}</p>
              </div>
              
              {marcoSelecionado.highlights && marcoSelecionado.highlights.trim() && (
                <div className="modal-section">
                  <h4 className="modal-section-title">Destaques</h4>
                  <div className="modal-highlights">
                    <p className="highlights-content" style={{ whiteSpace: 'pre-wrap' }}>{limparHTML(marcoSelecionado.highlights)}</p>
                  </div>
                </div>
              )}
              
              {marcoSelecionado.customer && (
                <div className="modal-section">
                  <h4 className="modal-section-title">Área Fim</h4>
                  <p className="modal-description">{marcoSelecionado.customer}</p>
                </div>
              )}
              
              {(marcoSelecionado.squad || marcoSelecionado.squads) && (marcoSelecionado.squad || marcoSelecionado.squads).trim() && (
                <div className="modal-section">
                  <h4 className="modal-section-title">Squads Participantes</h4>
                  <p className="modal-description">{marcoSelecionado.squad || marcoSelecionado.squads}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Timeline