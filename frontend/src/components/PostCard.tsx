import type { Post } from "../types/index";
import { useState } from "react"


type Props = {
    post: Post;
    onPostUpdated: () => void
};

const PostCard = (props: Props) => {
    const { post, onPostUpdated } = props;
    const username = localStorage.getItem("username")
    const token = localStorage.getItem("token")
    const [error, setError] = useState("")
    const [message, setMessage] = useState("")
    const [isReplyOpen, setIsReplyOpen] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const [replies, setReplies] = useState<Post[]>([]);

    //ライク処理
    const like = async () => {
        try {
            const response = await fetch(`https://x-clone-backend-en1v.onrender.com/api/posts/${post.id}/like`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            });

            const data = await response.json();

            if (response.ok) {
                onPostUpdated();
            } else {
                setError(data.message);
            }
        } catch (error) {
            setError("サーバーに接続できません");
        }
    }


    //リポスト処理
    const repost = async () => {
        try {
            const response = await fetch(`https://x-clone-backend-en1v.onrender.com/api/posts/${post.id}/repost`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            });

            const data = await response.json();

            if (response.ok) {
                onPostUpdated();
            } else {
                setError(data.message);
            }
        } catch (error) {
            setError("サーバーに接続できません")
        }
    }

    //削除処理
    const dele = async () => {
        try {
            const response = await fetch(`https://x-clone-backend-en1v.onrender.com/api/posts/${post.id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            });

            const data = await response.json()

            if (response.ok) {
                setMessage(data.message);
            }
        } catch (error) {
            setError("サーバーと接続できません")
        }
    }

    //削除時の一部画面変更
    const reload = () => {
        setMessage("");
        onPostUpdated();
    }


    //投稿日時の表示
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        const minutes = Math.floor(diff / 1000 / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return "たった今";
        if (minutes < 60) return `${minutes}分前`;
        if (hours < 24) return `${hours}時間前`;
        return `${days}日前`;
    };


    //リプライ処理
    const reply = async () => {
        try {
            const response = await fetch(`https://x-clone-backend-en1v.onrender.com/api/posts/${post.id}/reply`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ content: replyContent })
            });

            const data = await response.json();

            if (response.ok) {
                setReplyContent("");
                setIsReplyOpen(false);
                onPostUpdated();
            } else {
                setError(data.message);
            }
        } catch (error) {
            setError("サーバーに接続できません");
        }
    }


    //リプライ一覧の取得
    const toggleReply = async () => {
        if (!isReplyOpen) {
            try {
                const response = await fetch(
                    `https://x-clone-backend-en1v.onrender.com/api/posts/${post.id}/replies`,
                    {
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    }
                );
                const data = await response.json();
                if (response.ok) {
                    setReplies(data.replies);
                }
            } catch (error) {
                setError("サーバーに接続できません");
            }
        }
        setIsReplyOpen(!isReplyOpen);
    }




    return (
        <div className="border border-gray-200 rounded-lg p-4 mb-4">
            {post.replyToUsername && (
                <p className="text-blue-400 text-xs mb-2">@{post.replyToUsername} への返信</p>
            )}
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-gray-800">@{post.username}</p>
                    <p className="text-gray-700 mt-1">{post.content}</p>
                    <p className="text-gray-400 text-sm mt-2">
                        {formatDate(post.created_at)}
                    </p>
                </div>
                {message && (
                    <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-100 border border-green-400 text-green-700 px-6 py-3 rounded-lg flex items-center gap-4 shadow-lg">
                        <p>{message}</p>
                        <button
                            className="text-green-500 hover:text-green-700 font-bold"
                            onClick={reload}
                        >
                            ✕
                        </button>
                    </div>
                )}
                {username === post.username && (
                    <button
                        className="text-red-400 hover:text-red-600 text-sm"
                        onClick={dele}
                    >
                        削除
                    </button>
                )}
            </div>
            <div className="flex gap-6 mt-3">
                <button
                    className={`flex items-center gap-1 ${post.isLiked ? "text-red-500" : "text-gray-500"} hover:text-red-500`}
                    onClick={like}
                >
                    {post.isLiked ? "❤️" : "🤍"} {post.likeCount}
                </button>
                <button
                    className="flex items-center gap-1 text-gray-500 hover:text-green-500"
                    onClick={repost}
                >
                    🔁 {post.repostCount}
                </button>
                <button
                    className="flex items-center gap-1 text-gray-500 hover:text-blue-500"
                    onClick={toggleReply}
                >
                    💬 返信
                </button>
            </div>
            {isReplyOpen && replies.map((reply) => (
                <div key={reply.id} className="ml-8 mt-2 border-l-2 border-gray-200 pl-4">
                    {reply.replyToUsername && (
                        <p className="text-blue-400 text-xs">@{reply.replyToUsername} への返信</p>
                    )}
                    <p className="font-bold text-gray-800 text-sm">@{reply.username}</p>
                    <p className="text-gray-700 text-sm">{reply.content}</p>
                    <p className="text-gray-400 text-xs mt-1">{formatDate(reply.created_at)}</p>
                </div>
            ))}
            {isReplyOpen && (
                <div className="mt-4">
                    <textarea
                        className="w-full border border-gray-300 rounded-md px-3 py-2 resize-none h-24 focus:outline-none focus:border-blue-500"
                        placeholder="返信を入力..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                    />
                    <div className="flex justify-end gap-2 mt-2">
                        <button
                            className="px-4 py-2 rounded-md text-gray-500 hover:bg-gray-100"
                            onClick={() => setIsReplyOpen(false)}
                        >
                            キャンセル
                        </button>
                        <button
                            className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
                            onClick={reply}
                        >
                            返信
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostCard;