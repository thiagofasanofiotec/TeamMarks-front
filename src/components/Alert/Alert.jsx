import { useState, useEffect } from 'react'
import './Alert.css'

function Alert({ refShow }) {
  const [alerts, setAlerts] = useState([])

  const show = (message, type = 'success') => {
    const id = Date.now()
    const newAlert = { id, message, type }
    
    setAlerts(prev => [...prev, newAlert])
    
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id))
    }, 4000)
  }

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id))
  }

  useEffect(() => {
    if (refShow) {
      refShow(show)
    }
  }, [refShow])

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return '✓'
      case 'error':
        return '✗'
      case 'info':
        return 'ℹ'
      case 'warning':
        return '⚠'
      default:
        return '✓'
    }
  }

  return (
    <div className="alert-container">
      {alerts.map(alert => (
        <div key={alert.id} className={`alert alert-${alert.type}`}>
          <span className="alert-icon">{getIcon(alert.type)}</span>
          <span className="alert-message">{alert.message}</span>
          <button 
            className="alert-close" 
            onClick={() => removeAlert(alert.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

export default Alert
