import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function GestionCantina() {
  const navigate = useNavigate()
  
  const [vista, setVista] = useState('lista')
  
  // Datos
  const [cantinas, setCantinas] = useState([])
  const [cantinaSeleccionada, setCantinaSeleccionada] = useState(null)
  const [equipo, setEquipo] = useState([]) // NUEVO: Estado para la lista de usuarios
  
  // Formularios
  const [nombreCantina, setNombreCantina] = useState('')
  const [userNameNuevo, setUserNameNuevo] = useState('')
  const [rol, setRol] = useState('empleado')
  const [showRolMenu, setShowRolMenu] = useState(false)
  
  // NUEVO: Estado para controlar el Modal
  const [showModal, setShowModal] = useState(false)

  // UI
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [exito, setExito] = useState(null)

  const rolesOpciones = [
    { valor: 'empleado', label: 'Empleado (Solo ventas)' },
    { valor: 'administrador', label: 'Administrador (Gestión total)' }
  ]

  useEffect(() => {
    fetchMisCantinas()
  }, [])

  // Se ejecuta cada vez que entramos a administrar una cantina
  useEffect(() => {
    if (vista === 'administrar' && cantinaSeleccionada) {
      fetchEquipo(cantinaSeleccionada.id_cantina)
    }
  }, [vista, cantinaSeleccionada])

  const fetchMisCantinas = async () => {
    setLoading(true)
    const { data, error } = await supabase.rpc('obtener_mis_cantinas')

    if (error) {
      console.error('Error al traer cantinas:', error.message)
    } else if (data) {
      const cantinasFormateadas = data.map(item => ({
        id_cantina: item.id_cantina,
        nombre_cantina: item.nombre_cantina,
        mi_rol: item.rol
      }))
      setCantinas(cantinasFormateadas)
    }
    setLoading(false)
  }

  // NUEVA FUNCIÓN REAL: Traer el equipo de la cantina seleccionada
  const fetchEquipo = async (idCantina) => {
    setLoading(true)
    
    const { data, error } = await supabase.rpc('obtener_equipo_cantina', { 
      p_id_cantina: idCantina 
    })

    if (error) {
      console.error('Error al obtener el equipo:', error.message)
      setError('No se pudo cargar la lista del equipo.')
    } else if (data) {
      setEquipo(data)
    }
    
    setLoading(false)
  }

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
      setError(`Error al crear la cantina: ${dbError.message}`)
    } else if (data && data.length > 0) {
      setExito(`¡Cantina "${data[0].nombre_cantina}" creada!`)
      setNombreCantina('')
      await fetchMisCantinas()
      setVista('lista')
    }
    setLoading(false)
  }

  const handleAgregarEmpleado = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setExito(null)

    const { error: rpcError } = await supabase.rpc('agregar_empleado', {
      p_user_name: userNameNuevo,
      p_id_cantina: cantinaSeleccionada.id_cantina,
      p_rol: rol 
    })

    if (rpcError) {
      setError(`Error: ${rpcError.message}`)
    } else {
      setExito(`¡Usuario vinculado correctamente!`)
      setUserNameNuevo('') 
      setShowModal(false) // Cerramos el modal al tener éxito
      fetchEquipo(cantinaSeleccionada.id_cantina) // Recargamos la lista
    }
    setLoading(false)
  }

  const handleBack = () => {
    setError(null)
    setExito(null)
    if (vista === 'lista') navigate(-1)
    else {
      setVista('lista')
      setCantinaSeleccionada(null)
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col font-sans relative">
      
      <header className="flex items-center p-6 pt-10 gap-4 relative z-10 bg-brand-bg/90 backdrop-blur-md">
        <button onClick={handleBack} className="p-2 rounded-full bg-brand-surface shadow-soft text-brand-text active:scale-90 transition-transform">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-brand-text tracking-tight">Administración</h1>
          <p className="text-sm text-brand-muted">
            {vista === 'lista' && 'Tus negocios'}
            {vista === 'crear' && 'Nuevo negocio'}
            {vista === 'administrar' && `Gestionar equipo`}
          </p>
        </div>
      </header>

      <main className="flex-1 px-6 pb-24 space-y-6">
        
        {error && <div className="bg-red-100 text-red-600 p-4 rounded-2xl text-sm font-semibold text-center shadow-sm animate-in fade-in">{error}</div>}
        {exito && <div className="bg-green-100 text-green-700 p-4 rounded-2xl text-sm font-semibold text-center shadow-sm animate-in fade-in mb-4">{exito}</div>}

        {/* VISTA 1: Lista */}
        {vista === 'lista' && (
           // ... (El código de la vista lista queda igual que antes)
          <div className="space-y-4">
            {loading ? (
              <p className="text-center text-brand-muted mt-10 font-medium animate-pulse">Cargando negocios...</p>
            ) : cantinas.length === 0 ? (
              <div className="text-center mt-20 space-y-3">
                <p className="text-brand-muted font-medium">Aún no tienes negocios.</p>
                <p className="text-sm text-brand-muted">Toca el botón + para crear uno.</p>
              </div>
            ) : (
              cantinas.map((cantina) => (
                <div key={cantina.id_cantina} onClick={() => { setCantinaSeleccionada(cantina); setVista('administrar'); setError(null); setExito(null); }} className="bg-brand-surface p-5 rounded-3xl shadow-soft flex justify-between items-center cursor-pointer active:scale-95 transition-transform">
                  <div>
                    <h3 className="font-bold text-lg text-brand-text">{cantina.nombre_cantina}</h3>
                    <span className="inline-block mt-1 bg-brand-primary/10 text-brand-primary text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">{cantina.mi_rol}</span>
                  </div>
                  <svg className="w-6 h-6 text-brand-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              ))
            )}
            <button onClick={() => { setVista('crear'); setError(null); setExito(null); }} className="fixed bottom-24 right-8 w-16 h-16 bg-brand-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-brand-secondary active:scale-90 transition-all z-20">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>
        )}

        {/* VISTA 2: Crear */}
        {vista === 'crear' && (
           // ... (El código de crear cantina queda igual)
          <form onSubmit={handleCrearCantina} className="bg-brand-surface p-6 rounded-3xl shadow-soft space-y-5 animate-in slide-in-from-right-4">
            <h2 className="text-lg font-bold text-brand-primary">Datos del negocio</h2>
            <div>
              <label className="block text-sm font-semibold text-brand-text mb-2">Nombre</label>
              <input type="text" value={nombreCantina} onChange={(e) => setNombreCantina(e.target.value)} placeholder="Ej. Cantina Central" className="w-full p-4 rounded-2xl bg-brand-bg border-none focus:outline-none focus:ring-2 focus:ring-brand-secondary text-brand-text shadow-inner" required maxLength="50" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-brand-primary text-white font-bold py-4 rounded-full active:scale-95 transition-transform shadow-md mt-2 disabled:opacity-70">
              {loading ? 'Creando...' : 'Guardar Cantina'}
            </button>
          </form>
        )}

        {/* VISTA 3: Administrar (Con Lista y Modal) */}
        {vista === 'administrar' && cantinaSeleccionada && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            
            {/* Header Azul */}
            <div className="bg-brand-primary text-white p-6 rounded-3xl shadow-md">
              <h2 className="text-xl font-bold">{cantinaSeleccionada.nombre_cantina}</h2>
              <p className="text-brand-bg text-sm mt-1 opacity-90">Gestión de acceso al sistema</p>
            </div>

            {/* Lista del Equipo */}
            <div className="space-y-3">
              <h3 className="font-bold text-brand-text px-2">Miembros del equipo</h3>
              
              {loading ? (
                <p className="text-brand-muted text-sm px-2 animate-pulse">Cargando equipo...</p>
              ) : equipo.length === 0 ? (
                <p className="text-brand-muted text-sm px-2">No hay miembros vinculados aún.</p>
              ) : (
                equipo.map((miembro) => (
                  <div key={miembro.id_usuario} className="bg-brand-surface p-4 rounded-2xl shadow-sm flex justify-between items-center border border-brand-bg/50">
                    <div>
                      <span className="font-bold text-brand-text block">@{miembro.user_name}</span>
                      {/* Si tiene nombre o apellido, lo mostramos chiquito abajo */}
                      {(miembro.nombre || miembro.apellido) && (
                        <span className="text-xs text-brand-muted">{miembro.nombre} {miembro.apellido}</span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-brand-secondary bg-brand-secondary/10 px-3 py-1 rounded-full uppercase tracking-wide">
                      {miembro.rol}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Botón Flotante para Agregar (Solo creador/admin) */}
            {(cantinaSeleccionada.mi_rol === 'creador' || cantinaSeleccionada.mi_rol === 'administrador') && (
              <button 
                onClick={() => setShowModal(true)}
                className="fixed bottom-8 right-8 w-16 h-16 bg-brand-secondary text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-20"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
              </button>
            )}

            {/* Modal para Agregar Empleado */}
            {showModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="bg-brand-surface w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
                  
                  {/* Encabezado del modal */}
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-brand-text flex items-center gap-2">
                      <svg className="w-5 h-5 text-brand-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                      Sumar al Equipo
                    </h3>
                    <button onClick={() => setShowModal(false)} className="text-brand-muted hover:text-brand-text p-1">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>

                  {/* Formulario */}
                  <form onSubmit={handleAgregarEmpleado} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-brand-text mb-2">Usuario (User Name)</label>
                      <input type="text" value={userNameNuevo} onChange={(e) => setUserNameNuevo(e.target.value)} placeholder="Ej. juanpablo" className="w-full p-4 rounded-2xl bg-brand-bg border-none focus:outline-none focus:ring-2 focus:ring-brand-secondary text-brand-text shadow-inner" required />
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-semibold text-brand-text mb-2">Rol a asignar</label>
                      <button type="button" onClick={() => setShowRolMenu(!showRolMenu)} className="w-full p-4 rounded-2xl bg-brand-bg text-left focus:outline-none focus:ring-2 focus:ring-brand-secondary text-brand-text shadow-inner flex justify-between items-center">
                        <span>{rolesOpciones.find(opcion => opcion.valor === rol)?.label}</span>
                        <svg className={`w-5 h-5 text-brand-muted transition-transform ${showRolMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>

                      {showRolMenu && (
                        <div className="absolute z-50 w-full mt-2 bg-brand-surface border border-brand-bg rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                          {rolesOpciones.map((opcion) => (
                            <div key={opcion.valor} onClick={() => { setRol(opcion.valor); setShowRolMenu(false); }} className={`p-4 cursor-pointer transition-colors flex items-center justify-between ${rol === opcion.valor ? 'bg-brand-primary/10 font-bold text-brand-primary' : 'text-brand-text hover:bg-brand-bg'}`}>
                              {opcion.label}
                              {rol === opcion.valor && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-brand-secondary text-white font-bold py-4 rounded-full active:scale-95 transition-transform shadow-md mt-6 disabled:opacity-70">
                      {loading ? 'Vinculando...' : 'Vincular Usuario'}
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