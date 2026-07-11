import { useState } from "react";

type Props = {
    onPostCreated: () => void
    onClose: () => void
}

//ポストフォーム処理
const PostForm = (props: Props) => {
    const {onClose, onPostCreated} = props;

    const token = localStorage.getItem("token")
    const [content, setContent] = useState("")
    const [error, setError] = useState("")

    const post = async () => {
        try {
            const response = await fetch("https://x-clone-backend-en1v.onrender.com/api/posts/post", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ content })
            });

            const data = await response.json()

            if (response.ok) {
               onPostCreated()
               onClose()
            } else {
                setError(data.message)
            }
        }catch(error){
            setError("サーバーに接続できません")
        }
    }



    return (
        <div className="w-80">
            <h2 className="text-xl font-bold mb-4">新規投稿</h2>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <textarea
                className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 resize-none h-32 focus:outline-none focus:border-blue-500"
                placeholder="いまどうしてる？"
                onChange={(e) => setContent(e.target.value)}
            />
            <div className="flex justify-end gap-2">
                <button
                    className="px-4 py-2 rounded-md text-gray-500 hover:bg-gray-100"
                    onClick={onClose}
                >
                    キャンセル
                </button>
                <button
                    className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
                    onClick={post}
                >
                    投稿
                </button>
            </div>
        </div>
    );
};

export default PostForm;