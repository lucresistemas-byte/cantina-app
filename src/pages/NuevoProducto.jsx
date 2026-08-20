import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function NuevoProducto() {
  const navigate = useNavigate()
  const [nombre, setNombre] = useState('')
  const [precio, setPrecio] = useState('')
  const [stock, setStock] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGuardar = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Acá simulamos que guardamos en Supabase.
    // A futuro, esto hará un INSERT en la tabla 'producto' y luego en 'stock'.
    console.log("Guardando:", { nombre, precio, stock })
    
    setTimeout(() => {
      setLoading(false)
      // Después de "guardar", volvemos a la lista de productos
      navigate('/productos')
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col font-sans">
      
      {/* Header con botón de volver */}
      <header className="flex items-center p-6 pt-10 gap-4">
        <button 
          onClick={() => navigate(-1)} 
          type="button"
          className="p-2 rounded-full bg-brand-surface shadow-soft text-brand-text active:scale-90 transition-transform"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-brand-text tracking-tight">Cargar Producto</h1>
          <p className="text-sm text-brand-muted">Agregar al inventario</p>
        </div>
      </header>

      {/* Formulario */}
      <main className="flex-1 px-6 pb-10">
        <form onSubmit={handleGuardar} className="bg-brand-surface p-6 rounded-3xl shadow-soft space-y-5">
          
          <div>
            <label className="block text-sm font-semibold text-brand-text mb-2">Nombre del producto</label>
            <input 
              type="text" 
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Sándwich de Miga" 
              className="w-full p-4 rounded-2xl bg-brand-bg border-none focus:outline-none focus:ring-2 focus:ring-brand-secondary text-brand-text shadow-inner" 
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-brand-text mb-2">Precio ($)</label>
              <input 
                type="number" 
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                placeholder="0.00" 
                min="0"
                className="w-full p-4 rounded-2xl bg-brand-bg border-none focus:outline-none focus:ring-2 focus:ring-brand-secondary text-brand-text shadow-inner" 
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-text mb-2">Stock Inicial</label>
              <input 
                type="number" 
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0" 
                min="0"
                className="w-full p-4 rounded-2xl bg-brand-bg border-none focus:outline-none focus:ring-2 focus:ring-brand-secondary text-brand-text shadow-inner" 
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-primary text-white font-bold py-4 rounded-full active:scale-95 transition-transform shadow-md mt-6 disabled:opacity-70"
          >
            {loading ? 'Guardando...' : 'Guardar Producto'}
          </button>

        </form>
      </main>

    </div>
  )
}