import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Inventario() {
    const navigate = useNavigate()

    // Vistas: 'listaCantinas' | 'listaProductos'
    const [vista, setVista] = useState('listaCantinas')

    // Datos
    const [cantinas, setCantinas] = useState([])
    const [cantinaSeleccionada, setCantinaSeleccionada] = useState(null)
    const [productos, setProductos] = useState([])

    // Modal y Formulario de Producto
    const [showModal, setShowModal] = useState(false)
    const [nombreProducto, setNombreProducto] = useState('')
    const [precioProducto, setPrecioProducto] = useState('')
    const [stockInicial, setStockInicial] = useState('') // Es opcional

    // UI
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [exito, setExito] = useState(null)

    // Cargar cantinas al inicio
    useEffect(() => {
        fetchMisCantinas()
    }, [])

    // Cargar productos cuando se selecciona una cantina
    useEffect(() => {
        if (vista === 'listaProductos' && cantinaSeleccionada) {
            fetchProductos(cantinaSeleccionada.id_cantina)
        }
    }, [vista, cantinaSeleccionada])

    const fetchMisCantinas = async () => {
        setLoading(true)
        const { data, error } = await supabase.rpc('obtener_mis_cantinas')
        if (error) {
            console.error('Error al traer cantinas:', error.message)
        } else if (data) {
            setCantinas(data)
        }
        setLoading(false)
    }

    // INTEGRACIÓN DEL CÓDIGO DE JUAMPI
    const fetchProductos = async (idCantina) => {
        setLoading(true)
        const { data, error } = await supabase.rpc('obtener_productos_cantina', {
            p_id_cantina: idCantina
        })

        if (error) {
            console.error('Error al obtener productos:', error.message)
            setError('No se pudo cargar el inventario.')
        } else if (data) {
            console.log("Datos que manda JP:", data)
            setProductos(data)
        }
        setLoading(false)
    }

    // Crear Producto (Integrado con la RPC de Juampi)
    const handleCrearProducto = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setExito(null)

        // Preparamos los parámetros exactos que pide el backend
        const payload = {
            p_id_cantina: cantinaSeleccionada.id_cantina,
            p_nombre_producto: nombreProducto,
            p_precio_venta: parseFloat(precioProducto),
            p_cantidad_disp: stockInicial === '' ? null : parseInt(stockInicial)
        }

        // Llamamos a la función mágica de JP
        const { error: rpcError } = await supabase.rpc('crear_producto', payload)

        if (rpcError) {
            console.error(rpcError)
            setError(`Error al crear producto: ${rpcError.message}`)
        } else {
            setExito('¡Producto agregado al inventario!')
            setNombreProducto('')
            setPrecioProducto('')
            setStockInicial('')
            setShowModal(false) // Cerramos el modal al terminar
            fetchProductos(cantinaSeleccionada.id_cantina) // Recargamos la lista automáticamente
        }

        setLoading(false)
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

    // Helper para renderizar el estado del stock según la lógica de JP
    const renderBadgeStock = (cantidad) => {
        if (cantidad === null) {
            return <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Sin registro</span>
        } else if (cantidad === 0) {
            return <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">Agotado</span>
        } else {
            return <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">Stock: {cantidad}</span>
        }
    }

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

                {error && <div className="bg-red-100 text-red-600 p-4 rounded-2xl text-sm font-semibold text-center shadow-sm">{error}</div>}
                {exito && <div className="bg-green-100 text-green-700 p-4 rounded-2xl text-sm font-semibold text-center shadow-sm mb-4">{exito}</div>}

                {/* VISTA 1: Elegir Cantina */}
                {vista === 'listaCantinas' && (
                    <div className="space-y-4">
                        {loading ? (
                            <p className="text-center text-brand-muted mt-10 font-medium animate-pulse">Cargando negocios...</p>
                        ) : cantinas.length === 0 ? (
                            <p className="text-center text-brand-muted mt-10 font-medium">No tienes negocios asociados.</p>
                        ) : (
                            cantinas.map((cantina) => (
                                <div key={cantina.id_cantina} onClick={() => { setCantinaSeleccionada(cantina); setVista('listaProductos'); setError(null); setExito(null); }} className="bg-brand-surface p-5 rounded-3xl shadow-soft flex justify-between items-center cursor-pointer active:scale-95 transition-transform">
                                    <div>
                                        <h3 className="font-bold text-lg text-brand-text">{cantina.nombre_cantina}</h3>
                                        <p className="text-sm text-brand-muted">Ver inventario</p>
                                    </div>
                                    <svg className="w-6 h-6 text-brand-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* VISTA 2: Lista de Productos */}
                {vista === 'listaProductos' && cantinaSeleccionada && (
                    <div className="space-y-4 animate-in slide-in-from-right-4">

                        {loading ? (
                            <p className="text-center text-brand-muted mt-10 font-medium animate-pulse">Cargando productos...</p>
                        ) : productos.length === 0 ? (
                            <div className="text-center mt-20 space-y-3">
                                <p className="text-brand-muted font-medium">No hay productos en esta cantina.</p>
                                <p className="text-sm text-brand-muted">Toca el botón + para agregar el primero.</p>
                            </div>
                        ) : (
                            productos.map((prod) => (
                                <div key={prod.id_producto} className="bg-brand-surface p-4 rounded-3xl shadow-sm flex justify-between items-center border border-brand-bg/50">
                                    <div>
                                        {/* Actualizamos los nombres para que coincidan con la BD de Juampi */}
                                        <h3 className="font-bold text-brand-text text-lg">{prod.nombre_producto}</h3>
                                        <p className="text-brand-primary font-bold mt-1">${prod.precio_venta}</p>
                                    </div>
                                    <div className="text-right">
                                        {/* Renderizamos el badge del stock según la lógica de JP */}
                                        {renderBadgeStock(prod.cantidad_disp)}
                                    </div>
                                </div>
                            ))
                        )}

                        {/* FAB para agregar producto */}
                        <button onClick={() => setShowModal(true)} className="fixed bottom-8 right-8 w-16 h-16 bg-brand-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-brand-secondary active:scale-90 transition-all z-20">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        </button>

                        {/* Modal Crear Producto */}
                        {showModal && (
                            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                                <div className="bg-brand-surface w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">

                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-bold text-brand-text flex items-center gap-2">
                                            <svg className="w-5 h-5 text-brand-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                                            Nuevo Producto
                                        </h3>
                                        <button onClick={() => setShowModal(false)} className="text-brand-muted hover:text-brand-text p-1">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>

                                    <form onSubmit={handleCrearProducto} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-brand-text mb-2">Nombre del producto</label>
                                            <input type="text" value={nombreProducto} onChange={(e) => setNombreProducto(e.target.value)} placeholder="Ej. Alfajor Triple" className="w-full p-4 rounded-2xl bg-brand-bg border-none focus:outline-none focus:ring-2 focus:ring-brand-secondary text-brand-text shadow-inner" required />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-brand-text mb-2">Precio de venta ($)</label>
                                            <input type="number" step="0.01" value={precioProducto} onChange={(e) => setPrecioProducto(e.target.value)} placeholder="Ej. 1200" className="w-full p-4 rounded-2xl bg-brand-bg border-none focus:outline-none focus:ring-2 focus:ring-brand-secondary text-brand-text shadow-inner" required />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-brand-text mb-2">Stock inicial <span className="text-brand-muted font-normal">(Opcional)</span></label>
                                            <input type="number" value={stockInicial} onChange={(e) => setStockInicial(e.target.value)} placeholder="Dejar vacío si no hay stock" className="w-full p-4 rounded-2xl bg-brand-bg border-none focus:outline-none focus:ring-2 focus:ring-brand-secondary text-brand-text shadow-inner" />
                                        </div>

                                        <button type="submit" disabled={loading} className="w-full bg-brand-primary text-white font-bold py-4 rounded-full active:scale-95 transition-transform shadow-md mt-4 disabled:opacity-70">
                                            {loading ? 'Guardando...' : 'Crear Producto'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </main>
        </div>
    )
}