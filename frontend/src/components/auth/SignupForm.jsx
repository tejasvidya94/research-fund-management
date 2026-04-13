import { useAuthStore } from "../../store/useAuthStore";

export default function SignupForm({ onLogin }) {
    const [designation, setDesignation] = useState("");
    const { authUser, isSigningIn, signup } = useAuthStore()
    const handleSubmit = async (e) => {
        e.preventDefault();
        isSigningIn(true)
        const formData = new FormData(e.target);

        const payload = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            designation: designation,
            department: formData.get('department') || 'N/A'
        };

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {
                sessionStorage.setItem('token', data.token);     // ← sessionStorage
                onLogin({ ...data.user, role: getRoleName(data.user.designation) });
            } else {
                alert(data.error || 'Signup failed');
            }
        } catch (error) {
            console.error('Signup error:', error);
            alert('An error occurred during signup');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-400 text-center mb-2">
                Create an Account
            </h2>

            <select
                className="input"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                required
            >
                <option value="">Select Designation</option>
                <option value="professor">Professor</option>
                <option value="hod">HOD</option>
                <option value="dean">Dean</option>
                <option value="r&d_helper">R&D Helper</option>
                <option value="r&d_main">R&D Main</option>
                <option value="academic_integrity_officer">Academic Integrity Officer (AIQ)</option>
                <option value="finance_officer_helper">Finance Officer Helper</option>
                <option value="finance_officer_main">Finance Officer Main</option>
                <option value="registrar">Registrar</option>
                <option value="vc_office">VC Office</option>
                <option value="vice_chancellor">Vice Chancellor</option>
                <option value="fund">Fund Department</option>
            </select>

            <input type="text" name="name" placeholder="Full Name" className="input" required />
            <input type="email" name="email" placeholder="Email" className="input" required />

            {!["vice_chancellor", "vc_office", "fund", "rnd", "r&d_helper", "rnd_helper", "r&d_main", "rnd_main", "academic_integrity_officer", "aio", "finance_officer_helper", "finance_officer_main", "registrar"].includes(designation) && (
                <select name="department" className="input" required>
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                    ))}
                </select>
            )}

            <input type="password" name="password" placeholder="Password" className="input" required />
            <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
                {loading ? 'Signing Up…' : 'Sign Up'}
            </button>
        </form>
    );
}