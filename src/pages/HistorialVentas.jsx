import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function HistorialVentas() {
  const navigate = useNavigate()
  const [ventas, setVentas] = useState([])
  const [cantinas, setCantinas] = useState([])
  const [cantinaSeleccionada, setCantinaSeleccionada] = useState(null)
  const [loading, setLoading] = useState(true)
  const [detalleSeleccionado, setDetalleSeleccionado] = useState(null)
  const [mostrarSelector, setMostrarSelector] = useState(false)

  useEffect(() => {
    fetchMisCantinas()
  }, [])

  useEffect(() => {
    if (cantinaSeleccionada) fetchVentas(cantinaSeleccionada.id_cantina)
  }, [cantinaSeleccionada])

  const fetchMisCantinas = async () => {
    setLoading(true)
    const { data, error } = await supabase.rpc('obtener_mis_cantinas')
    if (!error && data?.length > 0) {
      setCantinas(data)
      setCantinaSeleccionada(data[0])
    }
    setLoading(false)
  }

  const fetchVentas = async (idCantina) => {
    setLoading(true)
    const { data, error } = await supabase.rpc('obtener_ventas_cantina', { p_id_cantina: idCantina })
    if (data) setVentas(data)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-brand-bg pb-10">
      <header className="flex justify-between items-center p-6 pt-10">
        <button onClick={() => navigate(-1)} className="p-2 bg-brand-surface rounded-full shadow-soft"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
        
        <div className="relative text-right">
          <button onClick={() => setMostrarSelector(!mostrarSelector)} className="flex items-center gap-2 font-bold text-brand-primary bg-brand-primary/10 px-4 py-2 rounded-full">
            {cantinaSeleccionada?.nombre_cantina || 'Seleccionar...'}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
          </button>
          {mostrarSelector && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-brand-surface rounded-2xl shadow-xl border border-brand-bg z-30">
              {cantinas.map(c => (
                <div key={c.id_cantina} onClick={() => { setCantinaSeleccionada(c); setMostrarSelector(false); }} className="p-4 cursor-pointer hover:bg-brand-bg font-bold text-brand-text">
                  {c.nombre_cantina}
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="px-6 space-y-4">
        {loading ? <p className="text-center text-brand-muted animate-pulse">Cargando ventas...</p> : 
          ventas.length === 0 ? <p className="text-center text-brand-muted">No hay ventas registradas.</p> :
          ventas.map((venta) => (
            <div key={venta.id_venta} onClick={() => setDetalleSeleccionado(venta)} className="bg-brand-surface p-5 rounded-3xl shadow-soft cursor-pointer active:scale-95 transition-transform">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-brand-text">Venta #{venta.id_venta}</p>
                  <p className="text-xs text-brand-muted">{new Date(venta.fecha_hora).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-brand-primary text-lg">${venta.detalles.reduce((acc, d) => acc + d.subtotal, 0)}</p>
                  <p className="text-xs font-bold uppercase text-brand-secondary">{venta.metodo_pago}</p>
                </div>
              </div>
            </div>
          ))
        }
      </main>

      {/* Modal Detalle */}
      {detalleSeleccionado && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-brand-surface w-full max-w-sm rounded-3xl p-6 shadow-2xl">
            <h3 className="font-bold text-xl mb-4 text-brand-text">Detalle Venta #{detalleSeleccionado.id_venta}</h3>
            <div className="space-y-3 mb-6">
              {detalleSeleccionado.detalles.map((d) => (
                <div key={d.id_detalle} className="flex justify-between text-sm">
                  <span>{d.cant_vendida}x {d.nombre_producto}</span>
                  <span className="font-bold">${d.subtotal}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setDetalleSeleccionado(null)} className="w-full bg-brand-primary text-white font-bold py-3 rounded-xl">Cerrar</button>
          </div>
        </div>
      )}
    </div>
  )
}