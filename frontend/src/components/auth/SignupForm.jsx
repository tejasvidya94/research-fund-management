import { useAuthStore } from "../../store/useAuthStore";
import { useState } from "react";

export default function SignupForm() {
    const departments = [
        "Department of Architecture",
        "Department of Atmospheric Science",
        "Department of Biochemistry",
        "Department of Biomedical Engineering",
        "Department of Biotechnology",
        "Department of Chemistry",
        "Department of Commerce",
        "Department of Computer Science",
        "Department of Computer Science & Engineering",
        "Department of Culture & Media Studies",
        "Department of Data Science & Analytics",
        "Department of Economics",
        "Department of Education",
        "Department of English",
        "Department of Environmental Science",
        "Department of Health Sciences",
        "Department of Hindi",
        "Department of Hotel and Tourism Management",
        "Department of Linguistics",
        "Department of Management",
        "Department of Mathematics",
        "Department of Microbiology",
        "Department of Pharmacy",
        "Department of Physics",
        "Department of Public Policy, Law and Governance",
        "Department of Social work",
        "Department of Society - Technology Interface",
        "Department of Sports Bio-Sciences",
        "Department of Sports Biomechanics",
        "Department of Sports Psychology",
        "Department of Statistics",
        "Department of Vocational Studies and Skill Development",
        "Department of Yoga",
        "Department of Electronics and Communication Engineering(ECE)"
    ];

    const [designation, setDesignation] = useState("");
    const { isSigningIn, signup } = useAuthStore()
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!designation) {
            alert("Please select designation");
            return;
        }
        try {
            const formData = new FormData(e.target);
            const payload = {
                name: formData.get('name'),
                email: formData.get('email'),
                password: formData.get('password'),
                designation: designation,
                department: formData.get('department') || 'N/A'
            };
            const res = await signup(payload);
            if (!res.success) {
                alert(res.message);
                return;
            }

            e.target.reset();
            setDesignation("");
        } catch (error) {
            console.log("Error in signupForm: ", error);
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
                disabled={isSigningIn}
                className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
                {isSigningIn ? 'Signing Up…' : 'Sign Up'}
            </button>
        </form>
    );
}