import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Dashboard from './pages/Dashboard'
import GestionCantina from './pages/GestionCantina'
import Inventario from './pages/Inventario'
import HistorialVentas from './pages/HistorialVentas'

function App() {
  return (
    <BrowserRouter>
      <Routes>
          {/* Ahora el Login es la página principal */}
          <Route path="/" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          {/* Movemos el Dashboard a su propia ruta */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Nuestras dos vistas principales de administración */}
          <Route path="/gestion" element={<GestionCantina />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/historial" element={<HistorialVentas />} />
        </Routes>
    </BrowserRouter>
  )
}

export default App