import { useState } from 'react'
import { useMarcosContext } from '../context/MarcosContext'
import './Timeline.css'
import api from '../services/api'

export default function InsightsTIA() {
  const { marcos } = useMarcosContext()
  const [loadingGPT, setLoadingGPT] = useState(false)
  const [respostaGPT, setRespostaGPT] = useState('')
  const [tituloRespostaGPT, setTituloRespostaGPT] = useState('')
  const [perguntaSelecionada, setPerguntaSelecionada] = useState(null)

  const handlePerguntaGPT = async (pergunta) => {
    setLoadingGPT(true)
    setRespostaGPT('')
    setTituloRespostaGPT('')
    setPerguntaSelecionada(pergunta)
    try {
      let response
      let titulo = ''
      switch (pergunta) {
        case 'resumo-geral':
          response = await api.get('/Insights/resumo-geral')
          titulo = 'Resumo Geral'
          break
        case 'analise-melhorias':
          response = await api.get('/Insights/analise-melhorias')
          titulo = 'Entregas mais solicitadas'
          break
        default:
          response = { data: 'Pergunta não implementada.' }
      }
      setRespostaGPT(response.data)
      setTituloRespostaGPT(titulo)
    } catch (error) {
      setRespostaGPT('Erro ao buscar insights da IA.')
      setTituloRespostaGPT('Erro')
    } finally {
      setLoadingGPT(false)
    }
  }

  return (
    <div className="resumo-ia-container">
      <h4>🤖 Insights TI.A</h4>
      <div className="gpt-buttons-grid">
        <button 
          className={`gpt-button ${perguntaSelecionada === 'resumo-geral' ? 'active' : ''}`}
          onClick={() => handlePerguntaGPT('resumo-geral')}
          disabled={loadingGPT}
        >
          <span className="gpt-icon">📋</span>
          <span className="gpt-text">Resumo geral</span>
        </button>
        <button 
          className={`gpt-button ${perguntaSelecionada === 'analise-melhorias' ? 'active' : ''}`}
          onClick={() => handlePerguntaGPT('analise-melhorias')}
          disabled={loadingGPT}
        >
          <span className="gpt-icon">💡</span>
          <span className="gpt-text">Entregas mais solicitadas</span>
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
            <span className="gpt-badge">{tituloRespostaGPT || 'Resposta da IA'}</span>
          </div>
          <div className="gpt-resposta-conteudo">
            <div style={{ whiteSpace: 'pre-wrap' }}>{respostaGPT}</div>
          </div>
        </div>
      )}
      <br />
      <div className="resumo-footer">
        <p>💡 <em>Análises geradas automaticamente com base nas entregas aprovadas.</em></p>
      </div>
    </div>
  )
}
