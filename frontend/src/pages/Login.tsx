import { useState } from "react"
import { useNavigate } from "react-router-dom"

const Login = () => {
    
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const post = async () => {
        try {
            const response = await fetch("https://x-clone-backend-en1v.onrender.com/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("username", data.user.username)
                navigate("/");
            } else {
                setError(data.message);
            }
        } catch (error) {
            setError("サーバーに接続できません");
        }
    }

    return (
        <div className="flex flex-col items-center mt-20">
            <h1 className="text-2xl font-bold mb-8">ログイン</h1>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <input
                className="border border-gray-300 rounded-md px-2 py-1 w-40 mb-4"
                type="text"
                placeholder="メールアドレス"
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                className="border border-gray-300 rounded-md px-2 py-1 w-40 mb-4"
                type="password"
                placeholder="パスワード"
                onChange={(e) => setPassword(e.target.value)}
            />
            <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={post}
            >
                送信
            </button>
            <p className="mt-4 text-sm">
                アカウントをお持ちでない方は
                <a href="/register" className="text-blue-500 hover:underline ml-1">
                    登録はこちら
                </a>
            </p>
        </div>
    );
};

export default Login;