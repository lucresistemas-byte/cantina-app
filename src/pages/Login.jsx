import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom' // <-- Acá agregamos Link
import { supabase } from '../supabaseClient'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) {
      setError('Credenciales incorrectas. Intenta de nuevo.')
      setLoading(false)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-center px-6 font-sans">
      
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-brand-primary mb-2">Cantina</h1>
        <p className="text-brand-muted font-medium">Gestión y Punto de Venta</p>
      </div>

      <form onSubmit={handleLogin} className="bg-brand-surface p-8 rounded-3xl shadow-soft space-y-6">
        
        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-xl text-sm font-semibold text-center">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-brand-text mb-2">Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com" 
            className="w-full p-4 rounded-2xl bg-brand-bg border-none focus:outline-none focus:ring-2 focus:ring-brand-secondary text-brand-text shadow-inner" 
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-text mb-2">Contraseña</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••" 
            className="w-full p-4 rounded-2xl bg-brand-bg border-none focus:outline-none focus:ring-2 focus:ring-brand-secondary text-brand-text shadow-inner" 
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-brand-primary text-white font-bold py-4 rounded-full active:scale-95 transition-transform shadow-md mt-4 disabled:opacity-70"
        >
          {loading ? 'Cargando...' : 'Iniciar Sesión'}
        </button>

        {/* ACÁ ESTÁ EL CÓDIGO NUEVO 👇 */}
        <div className="text-center pt-2">
          <p className="text-sm text-brand-muted">
            ¿No tienes cuenta? <Link to="/registro" className="text-brand-secondary font-bold hover:underline">Regístrate</Link>
          </p>
        </div>

      </form>
    </div>
  )
}