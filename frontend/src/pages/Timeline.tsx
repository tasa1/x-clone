import { useEffect } from "react";
import { useState } from "react";
import { useNavigate} from "react-router-dom"
import PostCard from "../components/PostCard";
import PostForm from "../components/PostForm";
import type { Post } from "../types/index";



//タイムラインの表示
const Timeline = () =>{
    
    const navigate = useNavigate();
    const [error,setError] = useState("")
    const [posts, setPosts] = useState<Post[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false);
    

    const logout = () =>{
        localStorage.removeItem("token");
        navigate("/login");
    }

    const get =async() => {
        try{
            const token = localStorage.getItem("token")
            const response = await fetch("https://x-clone-production-26bc.up.railway.app/api/posts/get",{
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                  }
             });

             const data = await response.json()

             if(response.ok){
                 setPosts(data.posts);
                }else{
                    setError(data.message)
                }
        }catch(error){
            setError("サーバーに接続できません")
        }
        
    }

    useEffect(() =>{
        get()
    },[])



    
    return(
        <div>
            <header className="flex items-center justify-between bg-slate-800 px-8 py-4 text-white">
                <h1 className="text-2xl font-bold">
                    X-clone
                </h1>
                <button
                    className="rounded-md bg-red-500 px-4 py-2 font-medium text-white transition-colors hover:bg-red-600 active:bg-red-700"
                    onClick={logout}
                >
                    ログアウト
               </button>
            </header>
            {error && <p className="text-red-500 text-center mt-4">{error}</p>}
            <main className="max-w-xl mx-auto mt-4">
                {posts.map((post) => (
                    <PostCard key={post.id} post={post} onPostUpdated={get} />
                ))}
            </main>
            <button 
            className="fixed bottom-8 right-8 rounded-full bg-blue-500 w-14 h-14 text-white text-3xl"
            onClick={() => setIsModalOpen(true)}
            >
                +
            </button>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6">
                        <button
                        className="float-right text-gray-500 hover:text-gray-700"
                        onClick={() => setIsModalOpen(false)}
                        >
                            ✕
                        </button>
                            <PostForm 
                              onClose={() => setIsModalOpen(false)}
                              onPostCreated={get}
                            />
                    </div>
                </div>
            )}
        </div>

    );
}

export default Timeline;