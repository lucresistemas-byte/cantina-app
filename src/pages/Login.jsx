import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Login() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        })
        if (data?.session) {
            console.log("¡ÉXITO! Sesión guardada:", data.session)
        } else {
            console.log("Algo falló, no hay sesión:", error)
        }

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
                        maxLength="100"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-brand-text mb-2">Contraseña</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full p-4 pr-12 rounded-2xl bg-brand-bg border-none focus:outline-none focus:ring-2 focus:ring-brand-secondary text-brand-text shadow-inner"
                            required
                            maxLength="64"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text transition-colors"
                        >
                            {showPassword ? (
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand-primary text-white font-bold py-4 rounded-full active:scale-95 transition-transform shadow-md mt-4 disabled:opacity-70"
                >
                    {loading ? 'Cargando...' : 'Iniciar Sesión'}
                </button>

                <div className="text-center pt-2">
                    <p className="text-sm text-brand-muted">
                        ¿No tienes cuenta? <Link to="/registro" className="text-brand-secondary font-bold hover:underline">Regístrate</Link>
                    </p>
                </div>

            </form>
        </div>
    )
}