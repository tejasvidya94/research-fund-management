export default function SigninForm({ onLogin }) {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.get('email'),
                    password: formData.get('password')
                })
            });

            const data = await res.json();

            if (res.ok) {
                sessionStorage.setItem('token', data.token);     // ← sessionStorage
                onLogin({ ...data.user, role: getRoleName(data.user.designation) });
            } else {
                alert(data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-400 text-center mb-2">
                Welcome Back
            </h2>
            <input type="email" name="email" placeholder="Email" className="input" required />
            <input type="password" name="password" placeholder="Password" className="input" required />
            <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
                {loading ? 'Signing In…' : 'Sign In'}
            </button>
        </form>
    );
}