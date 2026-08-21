import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function GestionCantina() {
  const navigate = useNavigate()
  
  // Estados para la Cantina
  const [nombreCantina, setNombreCantina] = useState('')
  const [miCantina, setMiCantina] = useState(null)

  // Estados para el Empleado
  const [userNameNuevo, setUserNameNuevo] = useState('') // <-- Cambiado de ID a userName
  const [rol, setRol] = useState('empleado')

  // Estados de UI
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [exito, setExito] = useState(null)

  // Función 1: Crear la Cantina (Queda igual, JP dijo que el creador se pone automático)
  const handleCrearCantina = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setExito(null)

    const { data, error: dbError } = await supabase
      .from('cantina')
      .insert([{ nombre_cantina: nombreCantina }])
      .select()

    if (dbError) {
      console.error("DETALLE DEL ERROR SUPABASE:", dbError) // <-- Acá vemos todo
      setError(`Error al crear la cantina: ${dbError.message}`) // Mostramos el mensaje real en pantalla
    }
    
    setLoading(false)
  }

  // Función 2: Asociar Empleado (Actualizada para usar la RPC de JP)
  const handleAgregarEmpleado = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setExito(null)

    // Usamos la RPC que nos pasó JP
    const { error: rpcError } = await supabase.rpc('agregar_empleado', {
      p_user_name: userNameNuevo,
      p_id_cantina: miCantina.id_cantina,
      p_rol: rol 
    })

    if (rpcError) {
      console.error(rpcError)
      setError(`Error: ${rpcError.message || 'No se pudo vincular el usuario. Verifica el nombre de usuario.'}`)
    } else {
      setExito(`¡Usuario ${userNameNuevo} vinculado correctamente!`)
      setUserNameNuevo('') // Limpiamos el input
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col font-sans">
      
      {/* Header */}
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
          <h1 className="text-2xl font-bold text-brand-text tracking-tight">Administración</h1>
          <p className="text-sm text-brand-muted">Gestión de negocio y equipo</p>
        </div>
      </header>

      <main className="flex-1 px-6 pb-10 space-y-6">
        
        {error && <div className="bg-red-100 text-red-600 p-4 rounded-2xl text-sm font-semibold text-center shadow-sm">{error}</div>}
        {exito && <div className="bg-green-100 text-green-700 p-4 rounded-2xl text-sm font-semibold text-center shadow-sm">{exito}</div>}

        {/* SECCIÓN 1: Crear Cantina */}
        {!miCantina && (
          <form onSubmit={handleCrearCantina} className="bg-brand-surface p-6 rounded-3xl shadow-soft space-y-5">
            <h2 className="text-lg font-bold text-brand-primary">1. Crear tu Cantina</h2>
            <div>
              <label className="block text-sm font-semibold text-brand-text mb-2">Nombre del negocio</label>
              <input 
                type="text" 
                value={nombreCantina}
                onChange={(e) => setNombreCantina(e.target.value)}
                placeholder="Ej. Cantina Central" 
                className="w-full p-4 rounded-2xl bg-brand-bg border-none focus:outline-none focus:ring-2 focus:ring-brand-secondary text-brand-text shadow-inner" 
                required
                maxLength="50"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-brand-primary text-white font-bold py-4 rounded-full active:scale-95 transition-transform shadow-md mt-2 disabled:opacity-70"
            >
              {loading ? 'Creando...' : 'Crear Cantina'}
            </button>
          </form>
        )}

        {/* SECCIÓN 2: Agregar Empleados */}
        {miCantina && (
          <form onSubmit={handleAgregarEmpleado} className="bg-brand-surface p-6 rounded-3xl shadow-soft space-y-5 border-2 border-brand-primary/10">
            <h2 className="text-lg font-bold text-brand-primary">2. Sumar al Equipo</h2>
            <p className="text-sm text-brand-muted">Agrega usuarios a <strong>{miCantina.nombre_cantina}</strong></p>
            
            <div>
              <label className="block text-sm font-semibold text-brand-text mb-2">Nombre de Usuario (User Name)</label>
              {/* Cambiamos el placeholder y el type para que sea texto normal */}
              <input 
                type="text" 
                value={userNameNuevo}
                onChange={(e) => setUserNameNuevo(e.target.value)}
                placeholder="Ej. juanpablo" 
                className="w-full p-4 rounded-2xl bg-brand-bg border-none focus:outline-none focus:ring-2 focus:ring-brand-secondary text-brand-text shadow-inner" 
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-text mb-2">Rol a asignar</label>
              <select 
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                className="w-full p-4 rounded-2xl bg-brand-bg border-none focus:outline-none focus:ring-2 focus:ring-brand-secondary text-brand-text shadow-inner appearance-none"
              >
                {/* Aseguramos que los values coinciden con los de JP */}
                <option value="empleado">Empleado (Solo ventas)</option>
                <option value="administrador">Administrador (Gestión total)</option>
              </select>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-brand-secondary text-white font-bold py-4 rounded-full active:scale-95 transition-transform shadow-md mt-2 disabled:opacity-70"
            >
              {loading ? 'Vinculando...' : 'Asociar Usuario'}
            </button>
          </form>
        )}

      </main>
    </div>
  )
}