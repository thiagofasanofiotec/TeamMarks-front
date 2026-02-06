import { useState, useEffect, useRef } from 'react'
import './Confirm.css'

function Confirm({ refShow }) {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState({
    title: 'Confirmação',
    message: 'Deseja realizar esta operação?',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    type: 'warning' // 'warning', 'danger', 'info'
  })
  const resolveRef = useRef(null)

  const handleCancel = () => {
    setIsOpen(false)
    if (resolveRef.current) {
      resolveRef.current(false)
      resolveRef.current = null
    }
  }

  const handleConfirm = () => {
    setIsOpen(false)
    if (resolveRef.current) {
      resolveRef.current(true)
      resolveRef.current = null
    }
  }

  const show = (props = {}) => {
    setConfig(prevConfig => ({ ...prevConfig, ...props }))
    setIsOpen(true)
    return new Promise((resolve) => {
      resolveRef.current = resolve
    })
  }

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('confirm-overlay')) {
      handleCancel()
    }
  }

  useEffect(() => {
    if (refShow) {
      refShow(show)
    }
  }, [refShow])

  if (!isOpen) return null

  const getIcon = () => {
    switch (config.type) {
      case 'danger':
        return '🗑️'
      case 'info':
        return 'ℹ️'
      default:
        return '⚠️'
    }
  }

  return (
    <div className="confirm-overlay" onClick={handleOverlayClick}>
      <div className="confirm-dialog">
        <div className={`confirm-icon ${config.type}`}>
          {getIcon()}
        </div>
        <h3 className="confirm-title">{config.title}</h3>
        <p className="confirm-message">{config.message}</p>
        <div className="confirm-actions">
          <button 
            className="confirm-btn confirm-btn-cancel" 
            onClick={handleCancel}
          >
            {config.cancelText}
          </button>
          <button 
            className={`confirm-btn confirm-btn-confirm ${config.type}`}
            onClick={handleConfirm}
          >
            {config.confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Confirm
