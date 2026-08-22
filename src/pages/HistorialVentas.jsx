import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function HistorialVentas() {
  const navigate = useNavigate()
  const [ventas, setVentas] = useState([])
  const [cantinas, setCantinas] = useState([])
  const [cantinaSeleccionada, setCantinaSeleccionada] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mostrarSelector, setMostrarSelector] = useState(false)

  // ESTADOS PARA TABS Y FILTROS
  const [vistaActiva, setVistaActiva] = useState('ventas') 
  const [filtroTiempo, setFiltroTiempo] = useState('hoy') 
  const [dropdownAbierto, setDropdownAbierto] = useState(false)

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

  // LÓGICA DE FILTRADO POR TIEMPO
  const obtenerVentasFiltradas = () => {
    const ahora = new Date()
    const inicioHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate())

    const inicioSemana = new Date(inicioHoy)
    inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay() + (inicioSemana.getDay() === 0 ? -6 : 1)) 

    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)

    return ventas.filter(venta => {
      const fechaVenta = new Date(venta.fecha_hora)
      if (filtroTiempo === 'hoy') return fechaVenta >= inicioHoy
      if (filtroTiempo === 'semana') return fechaVenta >= inicioSemana
      if (filtroTiempo === 'mes') return fechaVenta >= inicioMes
      return true 
    })
  }

  const ventasFiltradas = obtenerVentasFiltradas()

  // Calculamos el total de las ventas filtradas
  const totalVendido = ventasFiltradas.reduce((total, venta) => {
    const totalVenta = venta.detalles.reduce((acc, d) => acc + d.subtotal, 0)
    return total + totalVenta
  }, 0)

  // LÓGICA PARA EL RANKING DE PRODUCTOS
  const obtenerRanking = () => {
    const mapaRanking = {}

    ventasFiltradas.forEach(venta => {
      venta.detalles.forEach(d => {
        if (!mapaRanking[d.nombre_producto]) {
          mapaRanking[d.nombre_producto] = { nombre: d.nombre_producto, cantidad: 0, recaudado: 0 }
        }
        mapaRanking[d.nombre_producto].cantidad += d.cant_vendida
        mapaRanking[d.nombre_producto].recaudado += d.subtotal
      })
    })

    return Object.values(mapaRanking).sort((a, b) => b.cantidad - a.cantidad)
  }

  const rankingOrdenado = obtenerRanking()

  const etiquetasFiltro = {
    'hoy': 'Hoy',
    'semana': 'Esta Semana',
    'mes': 'Este Mes',
    'siempre': 'Histórico Total'
  }

  return (
    <div className="min-h-screen bg-brand-bg pb-10">
      <header className="flex justify-between items-center p-6 pt-10">
        <button onClick={() => navigate(-1)} className="p-2 bg-brand-surface rounded-full shadow-soft"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>

        {/* 1. TEXTO DE AYUDA DE LA CANTINA */}
        <div className="relative text-right flex flex-col items-end">
          <button onClick={() => setMostrarSelector(!mostrarSelector)} className="flex items-center gap-2 font-bold text-brand-primary bg-brand-primary/10 px-4 py-2 rounded-full">
            {cantinaSeleccionada?.nombre_cantina || 'Seleccionar...'}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
          </button>
          <span className="text-[10px] font-medium text-brand-muted mt-1.5 mr-2">Tocá para cambiar de cantina</span>
          
          {mostrarSelector && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-brand-surface rounded-2xl shadow-xl border border-brand-bg z-30 text-left">
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

        {/* TARJETA DE TOTAL RECAUDADO CON FILTRO */}
        {!loading && ventas.length > 0 && (
          <div className="bg-brand-secondary p-5 rounded-3xl shadow-md mb-2 flex justify-between items-center text-white animate-in fade-in slide-in-from-top-4">
            <div>
              <p className="text-xs uppercase tracking-wider font-bold opacity-80 mb-1">Total Recaudado</p>

              {/* SELECTOR CUSTOMIZADO */}
              <div className="relative inline-block">
                <button 
                  onClick={() => setDropdownAbierto(!dropdownAbierto)}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-colors text-white text-xs font-bold pl-3 pr-2 py-1.5 rounded-lg outline-none shadow-sm border border-white/10"
                >
                  <span>{filtroTiempo === 'siempre' ? 'Siempre' : filtroTiempo === 'hoy' ? 'Hoy' : filtroTiempo === 'semana' ? 'Esta Semana' : 'Este Mes'}</span>
                  <svg className={`w-4 h-4 text-white transition-transform duration-200 ${dropdownAbierto ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                </button>

                {dropdownAbierto && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setDropdownAbierto(false)}></div>
                    
                    <div className="absolute left-0 top-full mt-2 w-40 bg-brand-surface rounded-2xl shadow-xl border border-brand-bg z-40 overflow-hidden animate-in fade-in zoom-in-95">
                      {[
                        { id: 'hoy', nombre: 'Hoy' },
                        { id: 'semana', nombre: 'Esta Semana' },
                        { id: 'mes', nombre: 'Este Mes' },
                        { id: 'siempre', nombre: 'Siempre' }
                      ].map((opcion) => (
                        <div 
                          key={opcion.id}
                          onClick={() => { setFiltroTiempo(opcion.id); setDropdownAbierto(false); }}
                          className={`px-4 py-3 text-xs font-bold cursor-pointer transition-colors flex justify-between items-center ${filtroTiempo === opcion.id ? 'bg-brand-primary/10 text-brand-primary' : 'text-brand-text hover:bg-brand-bg'}`}
                        >
                          {opcion.nombre}
                          {filtroTiempo === opcion.id && <svg className="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
              
              {/* 2. TEXTO DE AYUDA DEL FILTRO */}
              <p className="text-[10px] font-medium text-white/70 mt-1.5 ml-1">Filtrá por período de tiempo</p>

            </div>
            <div className="text-right">
              <p className="text-2xl font-extrabold tracking-tight">${totalVendido}</p>
            </div>
          </div>
        )}

        {/* PESTAÑAS (TABS) */}
        {!loading && ventas.length > 0 && (
          <div className="flex bg-brand-surface p-1.5 rounded-2xl shadow-soft gap-1 mb-2">
            <button
              onClick={() => setVistaActiva('ventas')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${vistaActiva === 'ventas' ? 'bg-brand-primary text-white shadow-md' : 'text-brand-secondary hover:text-brand-primary'}`}
            >
              Últimas Ventas
            </button>
            <button
              onClick={() => setVistaActiva('ranking')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${vistaActiva === 'ranking' ? 'bg-brand-primary text-white shadow-md' : 'text-brand-secondary hover:text-brand-primary'}`}
            >
              Ranking Productos
            </button>
          </div>
        )}

        {/* 3 Y 4. TEXTOS DE AYUDA DINÁMICOS SEGÚN LA PESTAÑA */}
        {!loading && ventasFiltradas.length > 0 && (
          <p className="text-[11px] text-center font-medium text-brand-muted mb-4 px-2">
            {vistaActiva === 'ventas' 
              ? 'Historial de todas las ventas realizadas.' 
              : 'Ranking de los productos más elegidos.'}
          </p>
        )}

        {loading ? <p className="text-center text-brand-muted animate-pulse mt-10">Cargando datos...</p> :
          ventasFiltradas.length === 0 ? (
            <div className="text-center mt-10 p-6 bg-brand-surface rounded-3xl border border-dashed border-brand-bg">
              <p className="text-brand-muted font-medium">No hay ventas para {etiquetasFiltro[filtroTiempo].toLowerCase()}.</p>
            </div>
          ) : (

            vistaActiva === 'ventas' ? (
              // VISTA 1: LISTA DE VENTAS
              ventasFiltradas.map((venta) => (
                <div key={venta.id_venta} className="bg-brand-surface p-5 rounded-3xl shadow-soft animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xl font-extrabold text-brand-text">Venta #{venta.id_venta}</p>
                      <p className="text-xs text-brand-text">{new Date(venta.fecha_hora).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-brand-primary text-xl">${venta.detalles.reduce((acc, d) => acc + d.subtotal, 0)}</p>
                      <p className="text-xs font-bold uppercase text-brand-secondary">{venta.metodo_pago}</p>
                    </div>
                  </div>

                  <div className="border-t border-brand-bg pt-3 mt-3 space-y-2">
                    {venta.detalles.map((d) => (
                      <div key={d.id_detalle} className="flex justify-between items-start text-base">
                        <span className="text-brand-text font-medium flex gap-2">
                          <span>{d.cant_vendida}x</span>
                          <span>{d.nombre_producto}</span>
                        </span>
                        <span className="font-medium text-brand-text">${d.subtotal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              // VISTA 2: RANKING DE PRODUCTOS
              <div className="space-y-3">
                {rankingOrdenado.map((item, index) => (
                  <div key={item.nombre} className="bg-brand-surface p-4 rounded-3xl shadow-soft flex justify-between items-center animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center font-extrabold text-brand-primary shrink-0">
                        #{index + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-brand-text text-base leading-tight mb-1">{item.nombre}</h3>
                        <p className="text-xs text-brand-secondary font-bold bg-brand-secondary/10 inline-block px-3 py-1 rounded-full">
                          {item.cantidad} {item.cantidad === 1 ? 'unidad vendida' : 'unidades vendidas'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-extrabold text-brand-text">${item.recaudado}</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
      </main>
    </div>
  )
}