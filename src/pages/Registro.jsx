import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Registro() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [nombre, setNombre] = useState('')
    const [apellido, setApellido] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleRegistro = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        // 1. Registramos el usuario en la autenticación de Supabase
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        })

        if (authError) {
            setError(authError.message)
            setLoading(false)
            return
        }

        // 2. Si el registro en Auth fue exitoso, insertamos sus datos en la tabla 'usuario' que creó JP.
        // Usamos el ID (uuid) que nos devolvió Auth.
        const { error: dbError } = await supabase
            .from('usuario')
            .insert([
                {
                    id: authData.user.id,
                    nombre: nombre,
                    apellido: apellido,
                    user_name: email.split('@')[0] // Generamos un user_name básico por ahora
                }
            ])

        if (dbError) {
            setError('Se creó la cuenta pero hubo un error al guardar los datos de perfil.')
            setLoading(false)
            return
        }

        // Si todo salió bien, vamos al Login
        navigate('/login')
    }

    return (
        <div className="min-h-screen bg-brand-bg flex flex-col justify-center px-6 font-sans py-10">

            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-brand-primary mb-2">Crear Cuenta</h1>
                <p className="text-brand-muted font-medium">Registra tu usuario en la cantina</p>
            </div>

            <form onSubmit={handleRegistro} className="bg-brand-surface p-8 rounded-3xl shadow-soft space-y-5">

                {error && (
                    <div className="bg-red-100 text-red-600 p-3 rounded-xl text-sm font-semibold text-center">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-brand-text mb-2">Nombre</label>
                        <input
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            className="w-full p-4 rounded-2xl bg-brand-bg border-none focus:outline-none focus:ring-2 focus:ring-brand-secondary text-brand-text shadow-inner"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-brand-text mb-2">Apellido</label>
                        <input
                            type="text"
                            value={apellido}
                            onChange={(e) => setApellido(e.target.value)}
                            className="w-full p-4 rounded-2xl bg-brand-bg border-none focus:outline-none focus:ring-2 focus:ring-brand-secondary text-brand-text shadow-inner"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-brand-text mb-2">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-4 rounded-2xl bg-brand-bg border-none focus:outline-none focus:ring-2 focus:ring-brand-secondary text-brand-text shadow-inner"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-brand-text mb-2">Contraseña (Mínimo 6)</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-4 rounded-2xl bg-brand-bg border-none focus:outline-none focus:ring-2 focus:ring-brand-secondary text-brand-text shadow-inner"
                        required
                        minLength="6"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand-primary text-white font-bold py-4 rounded-full active:scale-95 transition-transform shadow-md mt-6 disabled:opacity-70"
                >
                    {loading ? 'Registrando...' : 'Registrarse'}
                </button>

                <div className="text-center pt-2">
                    <p className="text-sm text-brand-muted">
                        ¿Ya tienes cuenta? <Link to="/" className="text-brand-secondary font-bold hover:underline">Inicia Sesión</Link>
                    </p>
                </div>

            </form>
        </div>
    )
}