import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Dashboard from './pages/Dashboard'
import Productos from './pages/Productos'
import NuevoProducto from './pages/NuevoProducto'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ahora el Login es la página principal */}
        <Route path="/" element={<Login />} /> 
        <Route path="/registro" element={<Registro />} />
        
        {/* Movemos el Dashboard a su propia ruta */}
        <Route path="/dashboard" element={<Dashboard />} /> 
        <Route path="/productos" element={<Productos />} />
        <Route path="/nuevo-producto" element={<NuevoProducto />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App