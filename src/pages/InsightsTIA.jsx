import { useEffect, useMemo, useState } from 'react'
import './Timeline.css'
import api from '../services/api'

const BOAS_VINDAS =
  'Olá, eu sou o TI.A, um assistente com poder de analisar e transformar todas nossas entregas em um resumo rápido com visão estratégica. Clique abaixo e descubra, em poucos segundos, o que estamos construindo e o valor que estamos gerando.'

function TypingMessage({ text, speed = 20 }) {
  const [displayedText, setDisplayedText] = useState('')

  useEffect(() => {
    let index = 0
    setDisplayedText('')

    const timer = setInterval(() => {
      index += 1
      setDisplayedText(text.slice(0, index))

      if (index >= text.length) {
        clearInterval(timer)
      }
    }, speed)

    return () => clearInterval(timer)
  }, [text, speed])

  return (
    <div
      style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '1rem 1.25rem',
        marginBottom: '1.25rem',
        color: '#334155',
        lineHeight: 1.6,
        minHeight: '96px'
      }}
    >
      <span>{displayedText}</span>
      <span
        style={{
          display: 'inline-block',
          marginLeft: '2px',
          animation: 'blink-caret 1s step-end infinite'
        }}
      >
        |
      </span>
    </div>
  )
}

function parseSummary(summary) {
  if (!summary) {
    return null
  }

  if (typeof summary === 'string') {
    try {
      return JSON.parse(summary)
    } catch {
      return null
    }
  }

  return summary
}

function InfoChips({ items, variant = 'blue' }) {
  return (
    <div className={`insights-chip-grid insights-chip-grid-${variant}`}>
      {items.map((item, index) => (
        <div key={`${item}-${index}`} className="insights-chip-item">
          {item}
        </div>
      ))}
    </div>
  )
}

export default function InsightsTIA() {
  const [loadingGPT, setLoadingGPT] = useState(false)
  const [respostaGPT, setRespostaGPT] = useState(null)
  const [erro, setErro] = useState('')

  const summaryObj = useMemo(() => parseSummary(respostaGPT?.summary), [respostaGPT])

  const handleResumoGeral = async () => {
    setLoadingGPT(true)
    setErro('')

    try {
      const { data } = await api.get('/Insights/summary')
      setRespostaGPT(data)
    } catch {
      setErro('Não foi possível gerar o resumo agora. Tente novamente em instantes.')
      setRespostaGPT(null)
    } finally {
      setLoadingGPT(false)
    }
  }

  return (
    <div className="resumo-ia-container">
      <style>{`
        @keyframes blink-caret { 50% { opacity: 0; } }
        @keyframes tia-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes star-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .gpt-button:hover .star-icon {
          animation: star-spin 0.7s linear;
        }
        .insights-result-shell {
          margin-top: 1.25rem;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #dbeafe;
          box-shadow: 0 12px 32px rgba(15, 23, 42, 0.1);
          background: #ffffff;
        }
        .insights-result-head {
          background: linear-gradient(130deg, #1d4ed8 0%, #2563eb 55%, #38bdf8 100%);
          color: #ffffff;
          padding: 1.2rem 1.4rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .insights-result-title {
          font-size: 1rem;
          font-weight: 700;
        }
        .insights-result-date {
          font-size: 0.85rem;
          background: rgba(255, 255, 255, 0.18);
          padding: 0.35rem 0.7rem;
          border-radius: 999px;
          font-weight: 500;
        }
        .insights-result-body {
          padding: 1.25rem;
          display: grid;
          gap: 1rem;
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
        }
        .insights-kpi-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.8rem;
        }
        .insights-kpi-card {
          border-radius: 12px;
          padding: 0.95rem;
          border: 1px solid #e2e8f0;
          background: #ffffff;
        }
        .insights-kpi-label {
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #64748b;
          margin-bottom: 0.35rem;
          font-weight: 700;
        }
        .insights-kpi-value {
          color: #0f172a;
          font-size: 1.05rem;
          font-weight: 700;
          line-height: 1.35;
        }
        .insights-summary-card {
          background: #ecfeff;
          border: 1px solid #99f6e4;
          border-left: 4px solid #0d9488;
          border-radius: 12px;
          padding: 1rem;
        }
        .insights-section-title {
          margin: 0 0 0.55rem 0;
          font-size: 0.95rem;
          font-weight: 700;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }
        .insights-summary-text {
          margin: 0;
          color: #334155;
          line-height: 1.65;
        }
        .insights-list-card {
          border: 1px solid #e2e8f0;
          background: #ffffff;
          border-radius: 12px;
          padding: 0.95rem;
        }
        .insights-chip-grid {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .insights-chip-item {
          border-radius: 999px;
          padding: 0.4rem 0.75rem;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .insights-chip-grid-blue .insights-chip-item {
          background: #eff6ff;
          color: #1d4ed8;
          border: 1px solid #bfdbfe;        }
        .insights-chip-grid-green .insights-chip-item {
          background: #eff6ff;
          color: #1d4ed8;
          border: 1px solid #bfdbfe;        }
        .insights-chip-grid-amber .insights-chip-item {
          background: #eff6ff;
          color: #1d4ed8;
          border: 1px solid #bfdbfe;        }
        @media (max-width: 860px) {
          .insights-kpi-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <h4><span className="gpt-icon" aria-hidden="true">{'\uD83E\uDD16'}</span> Insights TI.A</h4>

      <TypingMessage text={BOAS_VINDAS} />

      {!respostaGPT && (
        <div className="gpt-buttons-grid" style={{ gridTemplateColumns: '1fr', width: '100%' }}>
          <button
            className="gpt-button"
            onClick={handleResumoGeral}
            disabled={loadingGPT}
            style={{
              width: '100%',
              background: '#16a34a',
              border: 'none',
              outline: 'none',
              boxShadow: 'none',
              appearance: 'none',
              color: '#ffffff',
              justifyContent: 'center',
              animation: 'tia-bounce 2s ease-in-out infinite'
            }}
          >
            <span className="gpt-icon star-icon">{'\u2B50'}</span>
            <span className="gpt-text">Gerar Análise</span>
          </button>
        </div>
      )}

      {loadingGPT && (
        <div className="gpt-loading">
          <div className="gpt-spinner"></div>
          <p>Gerando análise com IA...</p>
        </div>
      )}

      {erro && !loadingGPT && (
        <div className="error-state" style={{ margin: '1rem 0' }}>
          {erro}
        </div>
      )}

      {respostaGPT && !loadingGPT && (
        <div className="insights-result-shell">
          <div className="insights-result-head">
            <span className="insights-result-title">{respostaGPT.title || 'Resumo Geral de Entregas'}</span>
            <span className="insights-result-date">
              {respostaGPT.generatedAt ? new Date(respostaGPT.generatedAt).toLocaleString('pt-BR') : ''}
            </span>
          </div>

          <div className="insights-result-body">
            {summaryObj ? (
              <>
                <div className="insights-kpi-grid">
                  <div className="insights-kpi-card">
                    <div className="insights-kpi-label">Período</div>
                    <div className="insights-kpi-value">{summaryObj.periodo || '-'}</div>
                  </div>
                  <div className="insights-kpi-card">
                    <div className="insights-kpi-label">Total de entregas</div>
                    <div className="insights-kpi-value">{summaryObj.totalEntregas ?? '-'}</div>
                  </div>                  <div className="insights-kpi-card">
                    <div className="insights-kpi-label">Média de entregas por mês</div>
                    <div className="insights-kpi-value">{summaryObj.mediaEntregasPorMes ?? '-'}</div>
                  </div>

                </div>

                <div className="insights-summary-card">
                  <h5 className="insights-section-title">Resumo executivo</h5>
                  <p className="insights-summary-text">{summaryObj.resumoGeral}</p>
                </div>

                <div className="insights-list-card">
                  <h5 className="insights-section-title"><span aria-hidden="true">{'\uD83C\uDFAF'}</span> Principais temas</h5>
                  <InfoChips items={summaryObj.topTemas || []} variant="blue" />
                </div>

                <div className="insights-list-card">
                  <h5 className="insights-section-title"><span aria-hidden="true">{'\uD83D\uDC65'}</span> Areas mais atendidas</h5>
                  <InfoChips items={summaryObj.topAreasAtendidas || []} variant="green" />
                </div>

                <div className="insights-list-card">
                  <h5 className="insights-section-title"><span aria-hidden="true">{'\uD83E\uDD47'}</span> Ganhos percebidos</h5>
                  <InfoChips items={summaryObj.ganhosPercebidos || []} variant="amber" />
                </div>
              </>
            ) : (
              <div style={{ whiteSpace: 'pre-wrap', color: '#334155' }}>{respostaGPT.summary}</div>
            )}
          </div>
        </div>
      )}

      {respostaGPT && !loadingGPT && (
        <div className="resumo-footer" style={{ marginTop: '1rem' }}>
          <p>
            <em>Análises geradas automaticamente com base nas entregas finalizadas.</em>
          </p>
        </div>
      )}
    </div>
  )
}









