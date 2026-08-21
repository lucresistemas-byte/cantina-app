import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate()
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const nombreReal = user.user_metadata?.full_name || 
                           user.user_metadata?.nombre || 
                           user.user_metadata?.name || 
                           'Usuario'
        setUserName(nombreReal)
      }
    }
    
    // Solo buscamos el usuario si el menú se abre (optimización)
    if (isOpen) {
      fetchUser()
    }
  }, [isOpen])

  const handleCerrarSesion = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[70] flex">
      {/* Fondo oscuro transparente para cerrar al tocar afuera */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70]" 
        onClick={onClose}
      />

      {/* Contenedor del Menú (Aparece desde la izquierda) */}
      <div className="relative w-72 bg-brand-surface h-[100dvh] pb-16 shadow-2xl flex flex-col p-6 z-[80] justify-between animate-in slide-in-from-left duration-200">
        
        {/* Parte Superior: Título y Opciones */}
        <div>
          <div className="flex justify-between items-start mb-8">
            <div className="flex flex-col">
              {/* ACÁ AGREGAMOS EL NOMBRE DEL USUARIO */}
              <span className="text-sm font-bold text-brand-text mb-1 truncate max-w-[160px]">
                {userName || 'Cargando...'}
              </span>
              <h2 className="text-2xl font-extrabold text-brand-primary leading-none">Menú</h2>
            </div>
            
            <button 
              onClick={onClose}
              className="p-2 rounded-full bg-brand-bg text-brand-text active:scale-90 transition-transform"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="space-y-3">
            <button 
              onClick={() => { navigate('/dashboard'); onClose(); }}
              className="w-full text-left p-4 rounded-2xl bg-brand-bg hover:bg-brand-primary/10 font-semibold text-brand-text transition-colors flex items-center gap-3"
            >
              <svg className="w-5 h-5 text-brand-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Punto de Venta
            </button>

            <button 
              onClick={() => { navigate('/inventario'); onClose(); }}
              className="w-full text-left p-4 rounded-2xl bg-brand-bg hover:bg-brand-primary/10 font-semibold text-brand-text transition-colors flex items-center gap-3"
            >
              <svg className="w-5 h-5 text-brand-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Inventario
            </button>

            <button 
              onClick={() => { navigate('/gestion'); onClose(); }}
              className="w-full text-left p-4 rounded-2xl bg-brand-bg hover:bg-brand-primary/10 font-semibold text-brand-text transition-colors flex items-center gap-3"
            >
              <svg className="w-5 h-5 text-brand-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Gestión de Cantinas
            </button>

            <button 
              onClick={() => { navigate('/historial'); onClose(); }}
              className="w-full text-left p-4 rounded-2xl bg-brand-bg hover:bg-brand-primary/10 font-semibold text-brand-text transition-colors flex items-center gap-3"
            >
              <svg className="w-5 h-5 text-brand-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v2m3-2v2m3-2v2M5 10h14M5 10a2 2 0 110-4h14a2 2 0 110 4M5 10v6a2 2 0 002 2h10a2 2 0 002-2v-6" />
              </svg>
              Historial de Ventas
            </button>
          </nav>
        </div>

        {/* Parte Inferior: Cerrar Sesión */}
        <div className="pt-4 border-t border-brand-bg">
          <button 
            onClick={handleCerrarSesion}
            className="w-full text-left p-4 rounded-2xl bg-red-50 hover:bg-red-100 font-semibold text-red-500 transition-colors flex items-center gap-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar Sesión
          </button>
        </div>

      </div>
    </div>
  )
}