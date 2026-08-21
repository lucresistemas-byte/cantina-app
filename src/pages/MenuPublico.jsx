import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function MenuPublico() {
  const { idCantina } = useParams() // Obtenemos el ID de la cantina desde la URL
  const [cantina, setCantina] = useState(null)
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchMenuPublico()
  }, [idCantina])

  const fetchMenuPublico = async () => {
    setLoading(true)
    setError(null)

    // 1. Buscamos la info de la cantina para mostrar el nombre arriba
    // (Asumiendo que hay una RPC o tabla, o podemos listarla con obtener_mis_cantinas si es pública, 
    // o consultamos directo la tabla cantinas si está abierta a lectura pública por RLS)
    try {
      const { data: cantinasData, error: cantinaError } = await supabase.rpc('obtener_mis_cantinas')
      // Si la RPC filtra por usuario logueado, para un usuario anónimo quizás Juampi armó otra función o tabla.
      // Consultamos los productos directamente usando la función de Juampi:
      const { data: prodData, error: prodError } = await supabase.rpc('obtener_productos_cantina', { 
        p_id_cantina: parseInt(idCantina) 
      })

      if (prodError) throw prodError
      setProductos(prodData || [])

      // Intentamos buscar el nombre de la cantina
      if (cantinasData) {
        const encontrada = cantinasData.find(c => c.id_cantina === parseInt(idCantina))
        if (encontrada) setCantina(encontrada)
      }
    } catch (err) {
      setError('No se pudo cargar el menú de la cantina.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col font-sans px-6 py-10 max-w-md mx-auto relative">
      
      {/* Header del Menú */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-brand-primary tracking-tight mb-1">
          {cantina ? cantina.nombre_cantina : "Cantina"}
        </h1>
        <p className="text-brand-muted font-medium text-sm">Menú digital disponible</p>
      </div>

      {/* Contenido Principal */}
      <main className="flex-1 space-y-4">
        {loading ? (
          <div className="text-center mt-20">
            <p className="text-brand-muted font-medium animate-pulse">Cargando delicias...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-600 p-4 rounded-2xl text-sm font-bold text-center">
            {error}
          </div>
        ) : productos.length === 0 ? (
          <div className="text-center mt-20 p-6 bg-brand-surface rounded-3xl border border-dashed border-brand-bg">
            <p className="text-brand-muted font-medium">No hay productos cargados en este momento.</p>
          </div>
        ) : (
          productos.map((prod) => (
            <div key={prod.id_producto} className="bg-brand-surface p-5 rounded-3xl shadow-soft flex justify-between items-center border border-brand-bg/50">
              <div className="flex-1 pr-4">
                <h3 className="font-bold text-brand-text text-lg leading-snug">{prod.nombre_producto}</h3>
                {/* PRECIO EN MARRÓN COMO PEDISTE */}
                <p className="text-brand-secondary font-extrabold text-lg mt-1">${prod.precio_venta}</p>
              </div>

              {/* Indicador visual opcional de disponibilidad */}
              {prod.cantidad_disp !== null && prod.cantidad_disp === 0 && (
                <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Agotado
                </span>
              )}
            </div>
          ))
        )}
      </main>

      {/* Footer minimalista */}
      <footer className="text-center mt-10 text-xs text-brand-muted font-medium">
        Powered by <span className="font-bold text-brand-primary">Cantina App</span>
      </footer>
    </div>
  )
}