import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import { supabase } from '../supabaseClient'

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  const [cantinas, setCantinas] = useState([])
  const [cantinaSeleccionada, setCantinaSeleccionada] = useState(null)
  const [productos, setProductos] = useState([])
  const [mostrarSelector, setMostrarSelector] = useState(false)
  const [userName, setUserName] = useState('') 
  
  // Estados para el Modal de Compartir Menú y QR
  const [showQRModal, setShowQRModal] = useState(false)
  const [copiado, setCopiado] = useState(false)
  
  const [categoriaActiva, setCategoriaActiva] = useState('todos')
  
  const [carrito, setCarrito] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [mensajeExito, setMensajeExito] = useState(null)
  const [errorPago, setErrorPago] = useState(null)

  useEffect(() => {
    const initData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const nombreReal = user.user_metadata?.full_name || 
                           user.user_metadata?.nombre || 
                           user.user_metadata?.name || 
                           'Usuario'
        setUserName(nombreReal)
      }
      fetchMisCantinas()
    }
    initData()
  }, [])

  useEffect(() => {
    if (cantinaSeleccionada) {
      fetchProductos(cantinaSeleccionada.id_cantina)
      setCarrito([]) 
      setIsCartOpen(false)
      setMensajeExito(null)
      setCategoriaActiva('todos')
    }
  }, [cantinaSeleccionada])

  const fetchMisCantinas = async () => {
    setLoading(true)
    const { data, error } = await supabase.rpc('obtener_mis_cantinas')
    if (!error && data && data.length > 0) {
      setCantinas(data)
      setCantinaSeleccionada(data[0])
    }
    setLoading(false)
  }

  const fetchProductos = async (idCantina) => {
    const { data, error } = await supabase.rpc('obtener_productos_cantina', { p_id_cantina: idCantina })
    if (!error && data) {
      const productosOrdenados = data.sort((a, b) => 
        a.nombre_producto.localeCompare(b.nombre_producto, 'es', { sensitivity: 'base' })
      )
      setProductos(productosOrdenados)
    }
  }

  const mapaCategorias = {
    'dulce': 'Dulce',
    'salado': 'Salado',
    'bebida': 'Bebida',
    'sin categoria': 'Otros'
  }

  const categoriasDisponibles = Object.keys(mapaCategorias).filter(catKey => 
    productos.some(prod => (prod.categoria || 'sin categoria') === catKey)
  )

  const productosFiltrados = productos.filter(prod => {
    const catProd = prod.categoria || 'sin categoria'
    if (categoriaActiva === 'todos') return true
    return catProd === categoriaActiva
  })

  const agregarAlCarrito = (producto) => {
    setCarrito((prev) => {
      const existe = prev.find(item => item.id_producto === producto.id_producto)
      if (existe) {
        if (producto.cantidad_disp !== null && existe.cantidad >= producto.cantidad_disp) return prev 
        return prev.map(item => item.id_producto === producto.id_producto ? { ...item, cantidad: item.cantidad + 1 } : item)
      }
      return [...prev, { ...producto, cantidad: 1 }]
    })
  }

  const restarDelCarrito = (id_producto) => {
    setCarrito((prev) => {
      const existe = prev.find(item => item.id_producto === id_producto)
      if (existe.cantidad === 1) return prev.filter(item => item.id_producto !== id_producto)
      return prev.map(item => item.id_producto === id_producto ? { ...item, cantidad: item.cantidad - 1 } : item)
    })
  }

  const eliminarDelCarrito = (id_producto) => {
    setCarrito((prev) => prev.filter(item => item.id_producto !== id_producto))
    if (carrito.length === 1) setIsCartOpen(false)
  }

  const vaciarCarrito = () => {
    setCarrito([])
    setIsCartOpen(false)
  }

  const totalItems = carrito.reduce((acc, curr) => acc + curr.cantidad, 0)
  const totalCobrar = carrito.reduce((acc, curr) => acc + (curr.precio_venta * curr.cantidad), 0)

  const confirmarCobro = async (metodoPago) => {
    setIsProcessing(true)
    setErrorPago(null)
    
    const detallesPayload = carrito.map(item => ({
      id_producto: item.id_producto,
      cant_vendida: item.cantidad
    }))

    const { data: idVentaCreada, error } = await supabase.rpc('registrar_venta', {
      p_id_cantina: cantinaSeleccionada.id_cantina,
      p_metodo_pago: metodoPago, 
      p_detalles: detallesPayload
    })

    if (error) {
      setErrorPago(error.message)
      setIsProcessing(false)
      return
    }

    setShowPaymentModal(false)
    setIsProcessing(false)
    setMensajeExito(`¡Venta #${idVentaCreada} registrada con éxito!`)
    
    vaciarCarrito()
    fetchProductos(cantinaSeleccionada.id_cantina) 
    
    setTimeout(() => setMensajeExito(null), 4000)
  }

  // Generamos el link público basado en el ID de la cantina actual
  const urlPublica = cantinaSeleccionada 
    ? `${window.location.origin}/menu/${cantinaSeleccionada.id_cantina}`
    : ''

  const copiarEnPortapapeles = () => {
    navigator.clipboard.writeText(urlPublica)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2500)
  }

  return (
    <div className="h-[100dvh] w-full bg-brand-bg flex flex-col font-sans relative overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <header className="flex justify-between items-center p-6 pt-4 relative z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(true)} className="p-3 rounded-2xl bg-brand-surface shadow-soft text-brand-text active:scale-95 transition-transform shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          
          <div className="flex flex-col">
            <span className="text-sm font-extrabold text-brand-text leading-tight max-w-[100px] truncate">
              {userName || 'Cargando...'}
            </span>
            <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">
              {cantinaSeleccionada?.rol || 'Rol'}
            </span>
          </div>
        </div>

        {/* BOTÓN PARA COMPARTIR QR / MENÚ PÚBLICO */}
        {cantinaSeleccionada && (
          <button 
            onClick={() => setShowQRModal(true)}
            className="p-3 rounded-2xl bg-brand-surface shadow-soft text-brand-secondary hover:bg-brand-secondary/10 active:scale-95 transition-all flex items-center gap-2"
            title="Ver QR del Menú"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </button>
        )}
      </header>

      {/* Selector de Negocio */}
      <div className="px-6 mb-4 relative z-10">
        <div className="relative text-center">
          <button onClick={() => setMostrarSelector(!mostrarSelector)} className="flex flex-col items-center text-center w-full focus:outline-none active:opacity-70 transition-opacity">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-text leading-none tracking-tight break-words">
              {loading ? '...' : cantinaSeleccionada?.nombre_cantina || 'Sin cantina'}
            </h1>
            {!loading && cantinas.length > 1 && (
              <div className="flex items-center gap-1 text-brand-secondary font-bold mt-1 bg-brand-secondary/10 px-3 py-0.5 rounded-full text-xs mx-auto">
                <span>Cambiar negocio</span>
                <svg className={`w-3 h-3 transition-transform ${mostrarSelector ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
              </div>
            )}
          </button>

          {mostrarSelector && (
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-4 w-64 bg-brand-surface rounded-2xl shadow-2xl border border-brand-bg overflow-hidden animate-in fade-in slide-in-from-top-2 text-left z-30">
              <div className="p-3 bg-brand-bg/50 text-xs font-bold text-brand-muted uppercase tracking-wider">Tus negocios</div>
              {cantinas.map((cantina) => (
                <div key={cantina.id_cantina} onClick={() => { setCantinaSeleccionada(cantina); setMostrarSelector(false); }} className={`p-4 cursor-pointer transition-colors flex items-center justify-between ${cantinaSeleccionada?.id_cantina === cantina.id_cantina ? 'bg-brand-primary/10 font-bold text-brand-primary' : 'text-brand-text hover:bg-brand-bg'}`}>
                  {cantina.nombre_cantina}
                  {cantinaSeleccionada?.id_cantina === cantina.id_cantina && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <main className="flex-1 px-6 pb-36 space-y-4 overflow-y-auto z-0 relative">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-xs font-bold text-brand-muted uppercase tracking-wider">Punto de Venta</h2>
        </div>

        {!loading && productos.length > 0 && categoriasDisponibles.length > 0 && (
          <div className="flex bg-brand-surface p-1.5 rounded-2xl shadow-soft gap-1 overflow-x-auto">
            <button 
              onClick={() => setCategoriaActiva('todos')} 
              className={`flex-1 min-w-[70px] py-2.5 text-xs font-bold rounded-xl transition-all ${categoriaActiva === 'todos' ? 'bg-brand-primary text-white shadow-md' : 'text-brand-muted hover:text-brand-text'}`}
            >
              Todos
            </button>
            
            {categoriasDisponibles.map((catKey) => (
              <button 
                key={catKey}
                onClick={() => setCategoriaActiva(catKey)} 
                className={`flex-1 min-w-[80px] py-2.5 text-xs font-bold rounded-xl transition-all capitalize ${categoriaActiva === catKey ? 'bg-brand-primary text-white shadow-md' : 'text-brand-muted hover:text-brand-text'}`}
              >
                {mapaCategorias[catKey]}
              </button>
            ))}
          </div>
        )}
        
        {mensajeExito && <div className="bg-green-100 text-green-700 p-4 rounded-2xl text-sm font-bold text-center shadow-md animate-in fade-in slide-in-from-top-4 mb-4">{mensajeExito}</div>}

        {loading ? (
          <p className="text-center text-brand-muted mt-10 animate-pulse">Preparando sistema...</p>
        ) : productosFiltrados.length === 0 ? (
          <div className="text-center mt-10 p-6 bg-brand-surface rounded-3xl border border-dashed border-brand-bg">
            <p className="text-brand-muted font-medium">No hay productos en esta categoría.</p>
          </div>
        ) : (
          productosFiltrados.map((prod) => (
            <div key={prod.id_producto} className="bg-brand-surface p-5 rounded-3xl shadow-soft flex justify-between items-center">
              <div>
                <h3 className="font-bold text-brand-text text-lg">{prod.nombre_producto}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-brand-secondary font-bold">${prod.precio_venta}</span>
                  {prod.cantidad_disp !== null && <span className="text-xs text-brand-muted font-medium">Stock: {prod.cantidad_disp}</span>}
                </div>
              </div>
              
              <button onClick={() => agregarAlCarrito(prod)} disabled={prod.cantidad_disp === 0} className="w-12 h-12 rounded-full bg-brand-bg flex items-center justify-center text-brand-primary font-bold text-xl active:scale-90 transition-transform shadow-inner disabled:opacity-40">
                +
              </button>
            </div>
          ))
        )}
      </main>

      {/* CARRITO */}
      {isCartOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity" onClick={() => setIsCartOpen(false)} />}
      <div className={`fixed bottom-0 left-0 w-full bg-brand-surface rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] z-50 flex flex-col transition-all duration-300 ease-in-out border-t border-brand-bg ${isCartOpen ? 'h-[75vh]' : 'h-auto'}`}>
        <div onClick={() => { if (carrito.length > 0) setIsCartOpen(!isCartOpen) }} className="pt-6 px-8 pb-12 cursor-pointer flex flex-col items-center shrink-0">
          <div className="w-12 h-1.5 bg-brand-bg rounded-full mb-5" />
          <div className="flex justify-between items-center w-full max-w-lg mx-auto">
            <div>
              <p className="text-sm font-medium text-brand-muted">Total a cobrar ({totalItems} items)</p>
              <p className="text-3xl font-extrabold text-brand-text tracking-tight">${totalCobrar}</p>
            </div>
            
            <button 
              onClick={(e) => { e.stopPropagation(); if(carrito.length > 0) { setErrorPago(null); setShowPaymentModal(true); } }}
              disabled={carrito.length === 0}
              className="bg-brand-secondary text-white font-bold px-8 py-4 rounded-full active:scale-95 transition-all shadow-lg disabled:opacity-50 disabled:shadow-none"
            >
              Cobrar
            </button>
          </div>
        </div>

        <div className={`flex-1 overflow-y-auto px-8 pb-8 transition-opacity duration-300 ${isCartOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-brand-text">Detalle del pedido</h3>
            <button onClick={vaciarCarrito} className="text-sm font-bold text-red-500 bg-red-50 px-4 py-2 rounded-full active:scale-95">Vaciar</button>
          </div>
          <div className="space-y-4">
            {carrito.map((item) => (
              <div key={item.id_producto} className="flex justify-between items-center bg-brand-bg/50 p-4 rounded-2xl">
                <div className="flex-1">
                  <h4 className="font-bold text-brand-text">{item.nombre_producto}</h4>
                  <p className="text-sm text-brand-secondary font-bold">${item.precio_venta * item.cantidad}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => eliminarDelCarrito(item.id_producto)} className="text-brand-muted hover:text-red-500 p-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                  <div className="flex items-center bg-brand-surface rounded-full shadow-inner border border-brand-bg">
                    <button onClick={() => restarDelCarrito(item.id_producto)} className="w-8 h-8 flex items-center justify-center font-bold text-brand-text active:bg-brand-bg rounded-l-full">-</button>
                    <span className="w-8 text-center font-bold text-brand-primary">{item.cantidad}</span>
                    <button onClick={() => agregarAlCarrito(item)} disabled={item.cantidad_disp !== null && item.cantidad >= item.cantidad_disp} className="w-8 h-8 flex items-center justify-center font-bold text-brand-text active:bg-brand-bg rounded-r-full disabled:opacity-30">+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL DE PAGO */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-brand-surface w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 text-center flex flex-col items-center">
            <h3 className="text-2xl font-extrabold text-brand-text mb-2">Finalizar Venta</h3>
            <p className="text-brand-muted mb-4">Total: <span className="font-bold text-brand-secondary text-xl">${totalCobrar}</span></p>

            {errorPago && <div className="w-full bg-red-50 text-red-600 text-sm font-bold p-3 rounded-xl mb-4">{errorPago}</div>}

            <div className="space-y-4 w-full">
              <button onClick={() => confirmarCobro('efectivo')} disabled={isProcessing} className="w-full bg-brand-primary text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-md disabled:opacity-70">
                {isProcessing ? 'Registrando...' : <><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>Efectivo</>}
              </button>

              <button onClick={() => confirmarCobro('transferencia')} disabled={isProcessing} className="w-full bg-[#009EE3] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-md disabled:opacity-70">
                {isProcessing ? 'Registrando...' : <><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>Transferencia</>}
              </button>
            </div>

            <button onClick={() => setShowPaymentModal(false)} disabled={isProcessing} className="mt-6 text-brand-muted font-bold px-4 py-2 hover:text-brand-text active:scale-95">Cancelar</button>
          </div>
        </div>
      )}

      {/* NUEVO: MODAL DE CÓDIGO QR Y LINK PÚBLICO */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-brand-surface w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 text-center flex flex-col items-center">
            <h3 className="text-2xl font-extrabold text-brand-text mb-1">Menú Público y QR</h3>
            <p className="text-brand-muted text-xs mb-4">Escanea o comparte para que tus clientes vean los precios</p>

            {/* Imagen del Código QR generada al instante */}
            <div className="bg-white p-4 rounded-2xl shadow-inner mb-4 border border-brand-bg">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(urlPublica)}`} 
                alt="QR del Menú" 
                className="mx-auto rounded-lg"
              />
            </div>

            {/* Link copiable */}
            <div className="w-full bg-brand-bg p-3 rounded-2xl flex items-center justify-between gap-2 mb-4">
              <span className="text-xs text-brand-muted truncate font-medium">{urlPublica}</span>
              <button 
                onClick={copiarEnPortapapeles}
                className="bg-brand-primary text-white text-xs font-bold px-3 py-2 rounded-xl active:scale-95 transition-transform shrink-0"
              >
                {copiado ? '¡Copiado!' : 'Copiar'}
              </button>
            </div>

            <button 
              onClick={() => setShowQRModal(false)} 
              className="w-full bg-brand-secondary text-white font-bold py-3 rounded-2xl active:scale-95 transition-transform shadow-md"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

    </div>
  )
}