import { useNavigate } from 'react-router-dom'

// Reutilizamos los datos de prueba
const productosDePrueba = [
  { id_producto: 1, nombre: 'Sándwich de Miga', precio_venta: 1200, stock: 15 },
  { id_producto: 2, nombre: 'Coca Cola 500ml', precio_venta: 1500, stock: 24 },
  { id_producto: 3, nombre: 'Alfajor Triple', precio_venta: 800, stock: 10 },
  { id_producto: 4, nombre: 'Papas Fritas', precio_venta: 1000, stock: 8 },
]

export default function Productos() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col font-sans">
      
      {/* Header con botón de volver */}
      <header className="flex items-center p-6 pt-10 gap-4">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 rounded-full bg-brand-surface shadow-soft text-brand-text active:scale-90 transition-transform"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-brand-text tracking-tight">Inventario</h1>
          <p className="text-sm text-brand-muted">Gestión de stock</p>
        </div>
      </header>

      {/* Lista de Productos Administrable */}
      <main className="flex-1 px-6 pb-32 space-y-4 overflow-y-auto">
        {productosDePrueba.map((producto) => (
          <div 
            key={producto.id_producto}
            className="bg-brand-surface p-4 rounded-3xl shadow-soft flex justify-between items-center"
          >
            <div>
              <h3 className="font-semibold text-brand-text">{producto.nombre}</h3>
              <p className="font-medium text-brand-secondary mt-1">${producto.precio_venta}</p>
            </div>
            
            <div className="text-right">
              <span className="text-xs text-brand-muted block mb-1">Stock</span>
              <span className="bg-brand-bg px-3 py-1 rounded-full text-sm font-bold text-brand-text shadow-inner">
                {producto.stock}
              </span>
            </div>
          </div>
        ))}
      </main>

      {/* Botón Flotante para Agregar Producto */}
      <div className="fixed bottom-6 right-6">
        <button 
          onClick={() => navigate('/nuevo-producto')} 
          className="bg-brand-primary text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-transform"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

    </div>
  )
}