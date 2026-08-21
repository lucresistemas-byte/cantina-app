import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

export default function Dashboard() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [carrito, setCarrito] = useState([])

  // Productos de prueba temporales
  const productosVenta = [
    { id: 1, nombre: 'Sándwich de Miga', precio: 1200, stock: 15 },
    { id: 2, nombre: 'Coca Cola 500ml', precio: 1500, stock: 24 },
    { id: 3, nombre: 'Alfajor Triple', precio: 800, stock: 10 },
  ]

  // Función para agregar productos al carrito
  const agregarAlCarrito = (producto) => {
    setCarrito([...carrito, producto])
  }

  // Calcular el total a cobrar sumando los precios
  const totalACobrar = carrito.reduce((acc, item) => acc + item.precio, 0)

  // Función para simular el cobro
  const handleCobrar = () => {
    if (carrito.length === 0) {
      alert('Agregá al menos un producto para cobrar.')
      return
    }
    alert(`¡Venta cobrada con éxito! Total: $${totalACobrar}`)
    setCarrito([]) // Vaciamos el carrito
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col font-sans">
      
      {/* Header con Menú a la izquierda */}
      <header className="flex justify-between items-center p-6 pt-10">
        <button 
          onClick={() => setMenuOpen(true)}
          className="p-3 rounded-2xl bg-brand-surface text-brand-text shadow-soft active:scale-90 transition-transform"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="text-right">
          <h1 className="text-xl font-bold text-brand-text tracking-tight">Cantina</h1>
          <p className="text-xs text-brand-muted">Punto de Venta</p>
        </div>
      </header>

      {/* Lista de productos para seleccionar */}
      <main className="flex-1 px-6 pb-32 space-y-4 overflow-y-auto">
        {productosVenta.map((item) => (
          <div key={item.id} className="bg-brand-surface p-4 rounded-3xl shadow-soft flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-brand-text">{item.nombre}</h3>
              <p className="font-medium text-brand-secondary mt-1">
                ${item.precio} <span className="text-xs text-brand-muted ml-2">Stock: {item.stock}</span>
              </p>
            </div>
            
            {/* Botón de sumar al carrito */}
            <button 
              onClick={() => agregarAlCarrito(item)}
              className="bg-brand-bg text-brand-primary w-10 h-10 rounded-2xl font-bold flex items-center justify-center shadow-inner active:scale-90 transition-transform"
            >
              +
            </button>
          </div>
        ))}
      </main>

      {/* Barra inferior de Cobro Dinámica */}
      <div className="fixed bottom-0 left-0 right-0 bg-brand-surface p-6 shadow-soft rounded-t-3xl flex justify-between items-center border-t border-brand-bg z-20">
        <div>
          <span className="text-xs text-brand-muted block">
            Total a cobrar ({carrito.length} items)
          </span>
          <span className="text-2xl font-bold text-brand-text">${totalACobrar}</span>
        </div>
        <button 
          onClick={handleCobrar}
          className="bg-brand-primary text-white px-8 py-4 rounded-full font-bold shadow-md active:scale-95 transition-transform"
        >
          Cobrar
        </button>
      </div>

      {/* Componente del Menú Lateral */}
      <Sidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

    </div>
  )
}