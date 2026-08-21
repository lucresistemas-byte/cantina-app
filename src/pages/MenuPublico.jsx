import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function MenuPublico() {
  const { idCantina } = useParams()
  const [nombreCantina, setNombreCantina] = useState('Cantina')
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [categoriaActiva, setCategoriaActiva] = useState('todos')

  useEffect(() => {
    fetchMenuPublico()
  }, [idCantina])

  const fetchMenuPublico = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: rpcError } = await supabase.rpc('obtener_menu_publico', {
        p_id_cantina: parseInt(idCantina)
      })

      if (rpcError) throw rpcError

      if (data && data.length > 0) {
        const productosOrdenados = data.sort((a, b) => 
          a.nombre_producto.localeCompare(b.nombre_producto, 'es', { sensitivity: 'base' })
        )
        setProductos(productosOrdenados)

        if (data[0].nombre_cantina) {
          setNombreCantina(data[0].nombre_cantina)
        }
      } else {
        setProductos([])
      }
    } catch (err) {
      console.error(err)
      setError('No se pudo cargar el menú de la cantina.')
    } finally {
      setLoading(false)
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

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col font-sans px-6 py-10 max-w-md mx-auto relative">
      
      <div className="text-center mb-6">
        <h1 className="text-4xl font-extrabold text-brand-primary tracking-tight mb-1">
          {nombreCantina}
        </h1>
        <p className="text-brand-muted font-medium text-sm">Menú digital disponible</p>
      </div>

      {!loading && productos.length > 0 && categoriasDisponibles.length > 0 && (
        <div className="flex bg-brand-surface p-1.5 rounded-2xl shadow-soft gap-1 mb-6 overflow-x-auto shrink-0">
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

      <main className="flex-1 space-y-4">
        {loading ? (
          <div className="text-center mt-20">
            <p className="text-brand-muted font-medium animate-pulse">Cargando delicias...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-600 p-4 rounded-2xl text-sm font-bold text-center">
            {error}
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="text-center mt-20 p-6 bg-brand-surface rounded-3xl border border-dashed border-brand-bg">
            <p className="text-brand-muted font-medium">No hay productos en esta categoría.</p>
          </div>
        ) : (
          productosFiltrados.map((prod) => (
            <div key={prod.id_producto} className="bg-brand-surface p-5 rounded-3xl shadow-soft flex justify-between items-center border border-brand-bg/50">
              <div className="flex-1 pr-4">
                <h3 className="font-bold text-brand-text text-lg leading-snug">{prod.nombre_producto}</h3>
                <p className="text-xs text-brand-muted uppercase tracking-wider font-semibold mt-0.5 capitalize">
                  {prod.categoria !== 'sin categoria' ? prod.categoria : ''}
                </p>
                <p className="text-brand-secondary font-extrabold text-lg mt-1">${prod.precio_venta}</p>
              </div>
            </div>
          ))
        )}
      </main>

      <footer className="text-center mt-10 text-xs text-brand-muted font-medium">
        Powered by <span className="font-bold text-brand-primary">Cantina App</span>
      </footer>
    </div>
  )
}