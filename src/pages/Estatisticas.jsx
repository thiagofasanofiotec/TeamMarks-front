import { useMarcosContext } from '../context/MarcosContext'
import { useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

export default function Estatisticas() {
  const { marcos } = useMarcosContext()
  const [anoEstatisticas, setAnoEstatisticas] = useState('')
  const [filtroTipo, setFiltroTipo] = useState(null) // null = todos, 1 = sistemas, 2 = infra, 3 = devsecops

  // Apenas entregas aprovadas
  const marcosAprovados = marcos.filter(m => m.statusId === 2)
  const anosDisponiveis = [...new Set(
    marcosAprovados.filter(m => m.data).map(m => m.data.split('-')[0])
  )].sort((a, b) => b - a)

  const marcosFiltrados = anoEstatisticas
    ? marcosAprovados.filter(m => m.data && m.data.startsWith(anoEstatisticas))
    : marcosAprovados

  // Aplica filtro de tipo se selecionado
  const marcosFiltradosPorTipo = filtroTipo
    ? marcosFiltrados.filter(m => m.typeId === filtroTipo)
    : marcosFiltrados

  // Estatísticas
  const total = marcosFiltradosPorTipo.length
  const sistemas = marcosFiltradosPorTipo.filter(m => m.typeId === 1).length
  const infra = marcosFiltradosPorTipo.filter(m => m.typeId === 2).length
  const devsecops = marcosFiltradosPorTipo.filter(m => m.typeId === 3).length
  const mediaMensal = total > 0 ? Math.round(total / 12) : 0


  // Dados para gráfico de entregas por mês (igual timeline)
  const dadosGrafico = (() => {
    const marcosPorMes = {}
    marcosFiltrados.forEach(marco => {
      if (!marco.data) return
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
      if (marco.typeId === 1) marcosPorMes[chave].sistemas += 1
      else if (marco.typeId === 2) marcosPorMes[chave].infra += 1
      else if (marco.typeId === 3) marcosPorMes[chave].devsecops += 1
    })
    return Object.values(marcosPorMes).sort((a, b) => a.ordem - b.ordem)
  })()

  // Dados para gráfico de sistemas mais impactados (Top 10)
  const dadosSistemas = (() => {
    const sistemasPorImpacto = {}
    marcosFiltrados.forEach(marco => {
      const sistema = marco.applicant || 'Sem Sistema'
      if (!sistemasPorImpacto[sistema]) {
        sistemasPorImpacto[sistema] = {
          sistema: sistema,
          total: 0,
          sistemas: 0,
          infra: 0,
          devsecops: 0
        }
      }
      sistemasPorImpacto[sistema].total += 1
      if (marco.typeId === 1) sistemasPorImpacto[sistema].sistemas += 1
      else if (marco.typeId === 2) sistemasPorImpacto[sistema].infra += 1
      else if (marco.typeId === 3) sistemasPorImpacto[sistema].devsecops += 1
    })
    return Object.values(sistemasPorImpacto)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
  })()

  return (
    <div className="resumo-ia-container">
      <h2>Estatísticas</h2>
      <br />
      <div className="timeline-filters">
        <div className="filters-left-group">
          <div className="filter-select-container">
            <select 
              id="filtro-ano-resumo"
              value={anoEstatisticas || ''}
              onChange={e => setAnoEstatisticas(e.target.value)}
              className="tipo-filter-select"
            >
              <option value="">📅 Todos os anos ({marcosAprovados.length})</option>
              {anosDisponiveis.map(ano => (
                <option key={ano} value={ano}>
                  📅 {ano} ({marcosAprovados.filter(m => m.data && m.data.startsWith(ano)).length})
                </option>
              ))}
            </select>
          </div>
          <div className="filter-select-container">
            <select
              id="filtro-tipo-estatisticas"
              value={filtroTipo === null ? 'todos' : filtroTipo}
              onChange={e => setFiltroTipo(e.target.value === 'todos' ? null : parseInt(e.target.value))}
              className="tipo-filter-select"
            >
              <option value="todos">📋 Todas as áreas ({marcosFiltrados.length})</option>
              <option value="1">🖥️ Sistemas ({marcosFiltrados.filter(m => m.typeId === 1).length})</option>
              <option value="2">⚙️ Infra ({marcosFiltrados.filter(m => m.typeId === 2).length})</option>
              <option value="3">🔒 DevSecops ({marcosFiltrados.filter(m => m.typeId === 3).length})</option>
            </select>
          </div>
        </div>
      </div>
      <div className="numeros-section">
        <div className="numeros-grid">
          <div className="numero-card">
            <div className="numero-valor">{total}</div>
            <div className="numero-label">Total de Entregas</div>
          </div>
          <div className="numero-card sistemas">
            <div className="numero-valor">{sistemas}</div>
            <div className="numero-label">Sistemas 💻</div>
            <div className="numero-percent">{total ? ((sistemas/total)*100).toFixed(0) : 0}%</div>
          </div>
          <div className="numero-card infra">
            <div className="numero-valor">{infra}</div>
            <div className="numero-label">Infra ⚙️</div>
            <div className="numero-percent">{total ? ((infra/total)*100).toFixed(0) : 0}%</div>
          </div>
          <div className="numero-card devsecops">
            <div className="numero-valor">{devsecops}</div>
            <div className="numero-label">DevSecops 🔒</div>
            <div className="numero-percent">{total ? ((devsecops/total)*100).toFixed(0) : 0}%</div>
          </div>
          <div className="numero-card">
            <div className="numero-valor">{mediaMensal}</div>
            <div className="numero-label">Média Mensal</div>
          </div>
        </div>
      </div>
      <div className="grafico-section">
        <h4>📈 Quantidade de Entregas por Mês</h4>
        <div className="grafico-container">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={dadosGrafico} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="mes" angle={-45} textAnchor="end" height={80} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                labelStyle={{ color: '#1e293b', fontWeight: 'bold' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="square" />
              <Bar dataKey="sistemas" name="Sistemas" fill="#2563eb" radius={[8, 8, 0, 0]} />
              <Bar dataKey="infra" name="Infra" fill="#059669" radius={[8, 8, 0, 0]} />
              <Bar dataKey="devsecops" name="DevSecops" fill="#dc2626" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grafico-section">
        <h4>🎯 Sistemas Mais Impactados (Top 10)</h4>
        <div className="grafico-container">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={dadosSistemas}
              margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
              layout="horizontal"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="sistema" 
                angle={-45}
                textAnchor="end"
                height={120}
                tick={{ fill: '#64748b', fontSize: 11 }}
                interval={0}
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
                stackId="a"
                radius={[8, 8, 0, 0]}
              />
              <Bar 
                dataKey="infra" 
                name="Infra" 
                fill="#059669" 
                stackId="a"
              />
              <Bar 
                dataKey="devsecops" 
                name="DevSecops" 
                fill="#dc2626" 
                stackId="a"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
