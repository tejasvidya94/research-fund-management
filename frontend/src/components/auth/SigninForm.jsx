import { useAuthStore } from "../../store/useAuthStore";

export default function SigninForm() {
    const { isLoggingIn, login } = useAuthStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const credentials = {
            email: formData.get("email"),
            password: formData.get("password"),
        };

        try {
            const res = await login(credentials);
            if (!res || !res.success) {
                alert(res?.message || "Login failed");
                return;
            }
            e.target.reset();
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred during login');
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
                disabled={isLoggingIn}
                className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
                {isLoggingIn ? 'Signing In…' : 'Sign In'}
            </button>
        </form>
    );
}