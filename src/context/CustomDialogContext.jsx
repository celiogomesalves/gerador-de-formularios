import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X, Trash2, ShieldAlert } from 'lucide-react';

const CustomDialogContext = createContext(null);

export function CustomDialogProvider({ children }) {
  // Modal dialog state (Alert / Confirm)
  const [dialog, setDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info', // 'info' | 'warning' | 'danger' | 'success'
    confirmText: 'OK',
    cancelText: 'Cancelar',
    isConfirm: false,
    resolve: null,
  });

  // Toasts state
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  const showToast = useCallback(({ message, type = 'info', title = '', duration = 4000 }) => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, message, type, title }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const closeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showAlert = useCallback(({ title = 'Aviso do Sistema', message = '', type = 'info', confirmText = 'Entendido' }) => {
    return new Promise((resolve) => {
      setDialog({
        isOpen: true,
        title,
        message,
        type,
        confirmText,
        cancelText: '',
        isConfirm: false,
        resolve,
      });
    });
  }, []);

  const showConfirm = useCallback(({ 
    title = 'Confirmação', 
    message = '', 
    type = 'warning', 
    confirmText = 'Confirmar', 
    cancelText = 'Cancelar' 
  }) => {
    return new Promise((resolve) => {
      setDialog({
        isOpen: true,
        title,
        message,
        type,
        confirmText,
        cancelText,
        isConfirm: true,
        resolve,
      });
    });
  }, []);

  const handleConfirm = () => {
    if (dialog.resolve) dialog.resolve(true);
    setDialog(prev => ({ ...prev, isOpen: false }));
  };

  const handleCancel = () => {
    if (dialog.resolve) dialog.resolve(false);
    setDialog(prev => ({ ...prev, isOpen: false }));
  };

  // Safe global window.alert override so no native popups appear anywhere
  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (msg) => {
      showAlert({
        title: 'Aviso',
        message: typeof msg === 'object' ? JSON.stringify(msg) : String(msg || ''),
        type: 'info'
      });
    };

    return () => {
      window.alert = originalAlert;
    };
  }, [showAlert]);

  const getIcon = () => {
    switch (dialog.type) {
      case 'danger':
        return <Trash2 size={24} color="#ef4444" />;
      case 'warning':
        return <AlertTriangle size={24} color="#f59e0b" />;
      case 'success':
        return <CheckCircle2 size={24} color="#10b981" />;
      case 'error':
        return <AlertCircle size={24} color="#ef4444" />;
      default:
        return <Info size={24} color="var(--accent-color, #3b82f6)" />;
    }
  };

  const getIconBackground = () => {
    switch (dialog.type) {
      case 'danger':
      case 'error':
        return 'rgba(239, 68, 68, 0.15)';
      case 'warning':
        return 'rgba(245, 158, 11, 0.15)';
      case 'success':
        return 'rgba(16, 185, 129, 0.15)';
      default:
        return 'rgba(59, 130, 246, 0.15)';
    }
  };

  const getConfirmButtonColor = () => {
    if (dialog.type === 'danger' || dialog.type === 'error') {
      return '#ef4444';
    }
    return 'var(--accent-color, #3b82f6)';
  };

  return (
    <CustomDialogContext.Provider value={{ showAlert, showConfirm, showToast }}>
      {children}

      {/* Floating System Toasts */}
      <div 
        style={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 999999,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          pointerEvents: 'none',
          maxWidth: '90vw',
          width: 380,
        }}
      >
        {toasts.map(toast => (
          <div
            key={toast.id}
            style={{
              pointerEvents: 'auto',
              background: 'rgba(15, 23, 42, 0.95)',
              color: '#f8fafc',
              border: `1px solid ${
                toast.type === 'error' || toast.type === 'danger'
                  ? '#ef4444'
                  : toast.type === 'warning'
                  ? '#f59e0b'
                  : toast.type === 'success'
                  ? '#10b981'
                  : 'rgba(255, 255, 255, 0.15)'
              }`,
              borderRadius: 12,
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor:
                  toast.type === 'error' || toast.type === 'danger'
                    ? 'rgba(239, 68, 68, 0.15)'
                    : toast.type === 'warning'
                    ? 'rgba(245, 158, 11, 0.15)'
                    : toast.type === 'success'
                    ? 'rgba(16, 185, 129, 0.15)'
                    : 'rgba(59, 130, 246, 0.15)',
                color:
                  toast.type === 'error' || toast.type === 'danger'
                    ? '#ef4444'
                    : toast.type === 'warning'
                    ? '#f59e0b'
                    : toast.type === 'success'
                    ? '#10b981'
                    : 'var(--accent-color, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {toast.type === 'error' || toast.type === 'danger' ? (
                <AlertCircle size={18} />
              ) : toast.type === 'warning' ? (
                <AlertTriangle size={18} />
              ) : toast.type === 'success' ? (
                <CheckCircle2 size={18} />
              ) : (
                <Info size={18} />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {toast.title && (
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>
                  {toast.title}
                </div>
              )}
              <div style={{ fontSize: 13, opacity: 0.9, lineHeight: 1.4 }}>
                {toast.message}
              </div>
            </div>
            <button
              type="button"
              onClick={() => closeToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                padding: 4,
                cursor: 'pointer',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 4,
              }}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Global System Modal (Alert / Confirm) */}
      {dialog.isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999999,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            animation: 'fadeInDialog 0.2s ease-out',
          }}
          onClick={handleCancel}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 440,
              backgroundColor: 'var(--card-bg, #0f172a)',
              color: 'var(--text-main, #f8fafc)',
              borderRadius: 16,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
              padding: 24,
              animation: 'scaleUpDialog 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: getIconBackground(),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {getIcon()}
              </div>
              <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: 'var(--text-main, #f8fafc)' }}>
                  {dialog.title}
                </h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary, #94a3b8)', margin: '8px 0 0 0', lineHeight: 1.55, whiteSpace: 'pre-line' }}>
                  {dialog.message}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
              {dialog.isConfirm && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleCancel}
                  style={{
                    padding: '9px 18px',
                    fontSize: 13,
                    borderRadius: 8,
                    color: 'var(--text-secondary, #94a3b8)',
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                  }}
                >
                  {dialog.cancelText || 'Cancelar'}
                </button>
              )}
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirm}
                autoFocus
                style={{
                  padding: '9px 20px',
                  fontSize: 13,
                  fontWeight: 600,
                  borderRadius: 8,
                  backgroundColor: getConfirmButtonColor(),
                  borderColor: getConfirmButtonColor(),
                  color: '#ffffff',
                  boxShadow: `0 4px 12px ${getConfirmButtonColor()}40`,
                }}
              >
                {dialog.confirmText || 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global CSS for Animations */}
      <style>{`
        @keyframes fadeInDialog {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUpDialog {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </CustomDialogContext.Provider>
  );
}

export function useCustomDialog() {
  const context = useContext(CustomDialogContext);
  if (!context) {
    throw new Error('useCustomDialog must be used within a CustomDialogProvider');
  }
  return context;
}
