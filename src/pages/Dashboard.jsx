import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const productosDePrueba = [
    { id_producto: 1, nombre: 'Sándwich de Miga', precio_venta: 1200, stock: 15 },
    { id_producto: 2, nombre: 'Coca Cola 500ml', precio_venta: 1500, stock: 24 },
    { id_producto: 3, nombre: 'Alfajor Triple', precio_venta: 800, stock: 10 },
    { id_producto: 4, nombre: 'Papas Fritas', precio_venta: 1000, stock: 8 },
]

export default function Dashboard() {
    const [carrito, setCarrito] = useState([])
    const navigate = useNavigate()

    const agregarAlCarrito = (producto) => {
        setCarrito([...carrito, producto])
    }

    const total = carrito.reduce((sum, item) => sum + item.precio_venta, 0)

    return (
        <div className="min-h-screen bg-brand-bg flex flex-col font-sans">

            {/* Header tipo App */}
            <header className="flex justify-between items-center p-6 pt-10">
                <div>
                    <h1 className="text-2xl font-bold text-brand-text tracking-tight">Cantina</h1>
                    <p className="text-sm text-brand-muted">Punto de Venta</p>
                </div>
                {/* Ícono de carrito / menú (simulado) */}
                <button
                    onClick={() => navigate('/productos')}
                    className="p-2 rounded-full bg-brand-surface shadow-soft active:scale-90 transition-transform"
                >
                    <svg className="w-6 h-6 text-brand-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </header>

            {/* Lista de Productos estilo Tarjetas */}
            <main className="flex-1 px-6 pb-32 space-y-4 overflow-y-auto">
                {productosDePrueba.map((producto) => (
                    <div
                        key={producto.id_producto}
                        className="bg-brand-surface p-4 rounded-3xl shadow-soft flex justify-between items-center"
                    >
                        <div>
                            <h3 className="font-semibold text-brand-text text-lg">{producto.nombre}</h3>
                            <div className="flex items-center gap-4 mt-1">
                                <span className="font-medium text-brand-text">${producto.precio_venta}</span>
                                <span className="text-xs text-brand-muted">Stock: {producto.stock}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => agregarAlCarrito(producto)}
                            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-brand-muted hover:bg-gray-100 active:scale-90 transition-all"
                        >
                            +
                        </button>
                    </div>
                ))}
            </main>

            {/* Bottom Bar (Carrito) inspirado en la imagen */}
            <div className="fixed bottom-0 left-0 w-full bg-brand-bg p-6 bg-opacity-90 backdrop-blur-sm">
                <div className="bg-brand-surface rounded-full shadow-soft p-2 pr-6 pl-6 flex justify-between items-center h-20">
                    <div className="flex flex-col">
                        <span className="text-sm text-brand-muted font-medium">Total</span>
                        <span className="font-bold text-brand-text text-xl">${total}</span>
                    </div>

                    <button
                        className={`px-8 py-3 rounded-full font-semibold transition-all shadow-md ${carrito.length > 0
                                ? 'bg-brand-secondary text-white hover:opacity-90 active:scale-95'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        disabled={carrito.length === 0}
                    >
                        Cobrar
                    </button>
                </div>
            </div>

        </div>
    )
}