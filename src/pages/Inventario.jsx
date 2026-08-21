import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Inventario() {
  const navigate = useNavigate()
  
  const [vista, setVista] = useState('listaCantinas')
  
  const [cantinas, setCantinas] = useState([])
  const [cantinaSeleccionada, setCantinaSeleccionada] = useState(null)
  const [productos, setProductos] = useState([])
  
  // Modal Crear Producto
  const [showModal, setShowModal] = useState(false)
  const [nombreProducto, setNombreProducto] = useState('')
  const [precioProducto, setPrecioProducto] = useState('')
  const [stockInicial, setStockInicial] = useState('')
  const [categoriaNuevo, setCategoriaNuevo] = useState('sin categoria') // NUEVO

  // Modal Editar Producto
  const [showEditModal, setShowEditModal] = useState(false)
  const [productoAEditar, setProductoAEditar] = useState(null)
  const [editNombre, setEditNombre] = useState('')
  const [editPrecio, setEditPrecio] = useState('')
  const [editCategoria, setEditCategoria] = useState('sin categoria') // NUEVO
  const [tipoAjuste, setTipoAjuste] = useState('sumar') 
  const [editStockAjuste, setEditStockAjuste] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [exito, setExito] = useState(null)

  useEffect(() => {
    fetchMisCantinas()
  }, [])

  useEffect(() => {
    if (vista === 'listaProductos' && cantinaSeleccionada) {
      fetchProductos(cantinaSeleccionada.id_cantina)
      setError(null)
      setExito(null)
    }
  }, [vista, cantinaSeleccionada])

  const fetchMisCantinas = async () => {
    setLoading(true)
    const { data, error } = await supabase.rpc('obtener_mis_cantinas')
    if (!error && data) setCantinas(data)
    setLoading(false)
  }

  const fetchProductos = async (idCantina) => {
    setLoading(true)
    const { data, error } = await supabase.rpc('obtener_productos_cantina', { p_id_cantina: idCantina })
    if (error) {
      setError('No se pudo cargar el inventario.')
    } else if (data) {
      // ORDEN ALFABÉTICO (A - Z)
      const productosOrdenados = data.sort((a, b) => 
        a.nombre_producto.localeCompare(b.nombre_producto, 'es', { sensitivity: 'base' })
      )
      setProductos(productosOrdenados)
    }
    setLoading(false)
  }

  const handleCrearProducto = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setExito(null)

    const payload = {
      p_id_cantina: cantinaSeleccionada.id_cantina,
      p_nombre_producto: nombreProducto,
      p_precio_venta: parseFloat(precioProducto),
      p_cantidad_disp: stockInicial === '' ? null : parseInt(stockInicial),
      p_categoria: categoriaNuevo // NUEVO: enviamos la categoría elegida
    }

    const { error: rpcError } = await supabase.rpc('crear_producto', payload)

    if (rpcError) {
      setError(`Error al crear producto: ${rpcError.message}`)
    } else {
      setExito('¡Producto agregado al inventario!')
      setNombreProducto('')
      setPrecioProducto('')
      setStockInicial('')
      setCategoriaNuevo('sin categoria')
      setShowModal(false)
      fetchProductos(cantinaSeleccionada.id_cantina)
      setTimeout(() => setExito(null), 3000)
    }
    setLoading(false)
  }

  const handleEditarProducto = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setExito(null)

    const payload = {
      p_id_producto: productoAEditar.id_producto
    }

    if (editNombre.trim() !== productoAEditar.nombre_producto) payload.p_nombre_producto = editNombre.trim()
    if (parseFloat(editPrecio) !== productoAEditar.precio_venta) payload.p_precio_venta = parseFloat(editPrecio)
    if (editCategoria !== productoAEditar.categoria) payload.p_categoria = editCategoria // NUEVO
    
    let ajuste = parseInt(editStockAjuste)
    if (!isNaN(ajuste) && ajuste > 0) payload.p_ajuste_stock = tipoAjuste === 'restar' ? -Math.abs(ajuste) : Math.abs(ajuste)

    if (Object.keys(payload).length === 1) {
      setShowEditModal(false)
      setLoading(false)
      return
    }

    const { error: rpcError } = await supabase.rpc('actualizar_producto', payload)

    if (rpcError) {
      setError(`Error al actualizar: ${rpcError.message}`)
    } else {
      setExito(`¡Producto actualizado correctamente!`)
      setShowEditModal(false)
      fetchProductos(cantinaSeleccionada.id_cantina)
      setTimeout(() => setExito(null), 3000)
    }
    setLoading(false)
  }

  const abrirModalEdicion = (prod) => {
    setProductoAEditar(prod)
    setEditNombre(prod.nombre_producto)
    setEditPrecio(prod.precio_venta.toString())
    setEditCategoria(prod.categoria || 'sin categoria')
    setTipoAjuste('sumar')
    setEditStockAjuste('') 
    setShowEditModal(true)
    setError(null)
  }

  const handleBack = () => {
    setError(null)
    setExito(null)
    if (vista === 'listaCantinas') {
      navigate(-1)
    } else {
      setVista('listaCantinas')
      setCantinaSeleccionada(null)
    }
  }

  const renderBadgeStock = (cantidad) => {
    if (cantidad === null) return <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Sin registro</span>
    if (cantidad === 0) return <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">Agotado</span>
    return <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">Stock: {cantidad}</span>
  }

  const esAdmin = cantinaSeleccionada?.rol === 'creador' || cantinaSeleccionada?.rol === 'administrador'

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col font-sans relative">
      <header className="flex items-center p-6 pt-10 gap-4 relative z-10 bg-brand-bg/90 backdrop-blur-md">
        <button onClick={handleBack} className="p-2 rounded-full bg-brand-surface shadow-soft text-brand-text active:scale-90 transition-transform">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-brand-text tracking-tight">Inventario</h1>
          <p className="text-sm text-brand-muted">
            {vista === 'listaCantinas' && 'Seleccioná un negocio'}
            {vista === 'listaProductos' && cantinaSeleccionada?.nombre_cantina}
          </p>
        </div>
      </header>

      <main className="flex-1 px-6 pb-24 space-y-6">
        {error && <div className="bg-red-100 text-red-600 p-4 rounded-2xl text-sm font-bold text-center shadow-sm">{error}</div>}
        {exito && <div className="bg-green-100 text-green-700 p-4 rounded-2xl text-sm font-bold text-center shadow-sm mb-4 animate-in fade-in">{exito}</div>}

        {vista === 'listaCantinas' && (
          <div className="space-y-4">
            {loading ? <p className="text-center text-brand-muted mt-10 font-medium animate-pulse">Cargando negocios...</p> : cantinas.length === 0 ? <p className="text-center text-brand-muted mt-10 font-medium">No tienes negocios asociados.</p> : (
              cantinas.map((cantina) => (
                <div key={cantina.id_cantina} onClick={() => { setCantinaSeleccionada(cantina); setVista('listaProductos'); }} className="bg-brand-surface p-5 rounded-3xl shadow-soft flex justify-between items-center cursor-pointer active:scale-95 transition-transform">
                  <div>
                    <h3 className="font-bold text-lg text-brand-text">{cantina.nombre_cantina}</h3>
                    <p className="text-sm text-brand-muted">Tu rol: <span className="font-bold text-brand-primary uppercase">{cantina.rol}</span></p>
                  </div>
                  <svg className="w-6 h-6 text-brand-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              ))
            )}
          </div>
        )}

        {vista === 'listaProductos' && cantinaSeleccionada && (
          <div className="space-y-4 animate-in slide-in-from-right-4">
            {loading ? <p className="text-center text-brand-muted mt-10 font-medium animate-pulse">Cargando productos...</p> : productos.length === 0 ? (
              <div className="text-center mt-20 p-6"><p className="text-brand-muted font-medium">No hay productos.</p></div>
            ) : (
              productos.map((prod) => (
                <div key={prod.id_producto} className="bg-brand-surface p-4 rounded-3xl shadow-sm flex justify-between items-center border border-brand-bg/50">
                  <div className="flex-1 pr-4">
                    <h3 className="font-bold text-brand-text text-lg leading-tight">{prod.nombre_producto}</h3>
                    <p className="text-xs text-brand-muted uppercase tracking-wider font-semibold mt-0.5">Cat: {prod.categoria || 'sin categoria'}</p>
                    <p className="text-brand-secondary font-bold mt-1">${prod.precio_venta}</p>
                  </div>
                  
                  <div className="text-right flex flex-col items-end gap-2 shrink-0">
                    {renderBadgeStock(prod.cantidad_disp)}
                    {esAdmin && (
                      <button onClick={() => abrirModalEdicion(prod)} className="text-xs font-bold text-brand-secondary underline active:opacity-70 flex items-center gap-1 mt-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg> Editar
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}

            <button onClick={() => setShowModal(true)} className="fixed bottom-8 right-8 w-16 h-16 bg-brand-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-brand-secondary active:scale-90 transition-all z-20">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>
        )}
      </main>

      {/* MODAL CREAR */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-brand-surface w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-brand-text flex items-center gap-2">Nuevo Producto</h3>
              <button onClick={() => setShowModal(false)} className="text-brand-muted p-1"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleCrearProducto} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-brand-text mb-2">Nombre del producto</label>
                <input type="text" value={nombreProducto} onChange={(e) => setNombreProducto(e.target.value)} className="w-full p-4 rounded-2xl bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-primary text-brand-text shadow-inner" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-brand-text mb-2">Precio de venta ($)</label>
                <input type="number" step="0.01" value={precioProducto} onChange={(e) => setPrecioProducto(e.target.value)} className="w-full p-4 rounded-2xl bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-primary text-brand-text shadow-inner" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-brand-text mb-2">Categoría</label>
                <select value={categoriaNuevo} onChange={(e) => setCategoriaNuevo(e.target.value)} className="w-full p-4 rounded-2xl bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-primary text-brand-text shadow-inner">
                  <option value="sin categoria">Sin categoría</option>
                  <option value="bebida">Bebida</option>
                  <option value="dulce">Dulce</option>
                  <option value="salado">Salado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-brand-text mb-2">Stock inicial <span className="text-brand-muted font-normal">(Opcional)</span></label>
                <input type="number" value={stockInicial} onChange={(e) => setStockInicial(e.target.value)} className="w-full p-4 rounded-2xl bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-primary text-brand-text shadow-inner" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-brand-primary text-white font-bold py-4 rounded-full mt-4 disabled:opacity-70 active:scale-95 transition-transform">
                {loading ? 'Guardando...' : 'Crear Producto'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {showEditModal && productoAEditar && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-brand-surface w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-brand-text">Modificar Producto</h3>
              <button onClick={() => setShowEditModal(false)} className="text-brand-muted p-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleEditarProducto} className="space-y-4">
              <div className="space-y-3 pb-3 border-b border-brand-bg">
                <div>
                  <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-1">Nombre</label>
                  <input type="text" value={editNombre} onChange={(e) => setEditNombre(e.target.value)} className="w-full p-3 rounded-xl bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-secondary text-brand-text shadow-inner" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-1">Precio de venta ($)</label>
                  <input type="number" step="0.01" value={editPrecio} onChange={(e) => setEditPrecio(e.target.value)} className="w-full p-3 rounded-xl bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-secondary text-brand-text shadow-inner" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider mb-1">Categoría</label>
                  <select value={editCategoria} onChange={(e) => setEditCategoria(e.target.value)} className="w-full p-3 rounded-xl bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-secondary text-brand-text shadow-inner">
                    <option value="sin categoria">Sin categoría</option>
                    <option value="bebida">Bebida</option>
                    <option value="dulce">Dulce</option>
                    <option value="salado">Salado</option>
                  </select>
                </div>
              </div>

              <div className="pt-1">
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-xs font-bold text-brand-muted uppercase tracking-wider">Ajustar Stock</label>
                  <span className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full">
                    Actual: {productoAEditar.cantidad_disp !== null ? productoAEditar.cantidad_disp : 'N/A'}
                  </span>
                </div>
                
                <div className="flex bg-brand-bg p-1 rounded-xl mb-2">
                  <button type="button" onClick={() => setTipoAjuste('sumar')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${tipoAjuste === 'sumar' ? 'bg-green-100 text-green-700 shadow-sm' : 'text-brand-muted hover:text-brand-text'}`}>Sumar (+)</button>
                  <button type="button" onClick={() => setTipoAjuste('restar')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${tipoAjuste === 'restar' ? 'bg-red-100 text-red-600 shadow-sm' : 'text-brand-muted hover:text-brand-text'}`}>Restar (-)</button>
                </div>
                <input type="number" min="1" value={editStockAjuste} onChange={(e) => setEditStockAjuste(e.target.value)} placeholder={`Cantidad a ${tipoAjuste}... (Opcional)`} className="w-full p-3 rounded-xl bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-secondary text-brand-text shadow-inner text-center font-bold text-sm" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-brand-secondary text-white font-bold py-3.5 rounded-full shadow-md disabled:opacity-70 active:scale-95 transition-transform mt-2">
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}