const express = require("express");
const pool = require("../db");
const router = express.Router();
const middlewareAuth = require("../middleware/auth");




//投稿取得処理
router.get("/get",middlewareAuth, async(req,res) => {
    try{
        const [posts] = await pool.query(
            `SELECT 
              posts.*,
              users.username,
              parent_users.username as replyToUsername,
              COUNT(likes.id) as likeCount,
              COUNT(reposts.id) as repostCount,
              EXISTS(
                SELECT 1 FROM likes 
                WHERE likes.post_id = posts.id 
                AND likes.user_id = ?
              ) as isLiked 
            FROM posts
            LEFT JOIN users ON posts.user_id = users.id
            LEFT JOIN posts as parent_posts ON posts.parent_id = parent_posts.id
            LEFT JOIN users as parent_users ON parent_posts.user_id = parent_users.id
            LEFT JOIN likes ON posts.id = likes.post_id
            LEFT JOIN reposts ON posts.id = reposts.post_id
            GROUP BY posts.id
            ORDER BY posts.created_at DESC`,
            [req.user.id]
            );
        res.json({
            message: "投稿取得",
            posts
        });
    }catch(err){
        console.error(err);
        res.status(500).json({ message: "サーバーエラー" });
    }
});

//投稿処理
router.post("/post", middlewareAuth, async(req,res) =>{
    try{
        const comment = req.body.content;
    const userId = req.user.id
    const userName = req.user.username
    if(!comment){
        return res.status(401).json({message: "コメントが空です"})
    }
    if(comment.length >  280){
        return res.status(401).json({message: "コメントは280字以内です"})
    }
    
    const [result] = await pool.query(
        "INSERT INTO posts (content, user_id) VALUES (?, ?)",
        [comment, userId]
        );
    
    res.json({
        comment,
    });
    }catch(err){
        console.error(err);
        res.status(500).json({ message: "サーバーエラー" });
    }
    
});


//投稿削除処理
router.delete("/:id", middlewareAuth, async (req,res) => {
    try{
    const postId = req.params.id
    const userId = req.user.id
    
        const [posts] = await pool.query(
            "SELECT * FROM posts WHERE id = ?",
            [postId]
        );
    
    if(posts.length == 0){
        return res.status(401).json({
            message: "投稿がありません"
        });
    };
    
    const post = posts[0]

    if(post.user_id != userId){
        return res.status(401).json({
            message: "自分の投稿ではありません"
        });
    };

   
        await pool.query(
            "DELETE FROM posts WHERE id = ?",
            [req.params.id]
        );

    res.json({
        message: "投稿を削除しました"
    });
    }catch(err){
        console.error(err);
        res.status(500).json({ message: "サーバーエラー" });
    }
        
});


//いいね処理
router.post("/:id/like", middlewareAuth, async(req,res) => {
    const postId = req.params.id
    try{
        const [likes] = await pool.query(
            "SELECT * FROM likes WHERE user_id = ? AND post_id = ?",
            [req.user.id, req.params.id]
        );
    
    
    if(likes.length == 0){
            await pool.query(
                "INSERT INTO likes (user_id, post_id) VALUES (?, ?)",
                [req.user.id, req.params.id]
            );
        
        
    };
    if(likes.length > 0){
        
            await pool.query(
                "DELETE FROM likes WHERE user_id = ? AND post_id = ?",
                [req.user.id, req.params.id]
            );
        
        
    };
    
        const [result] = await pool.query(
            "SELECT COUNT(*) as likeCount FROM likes WHERE post_id = ?",
            [req.params.id]
        );
        res.json({
            likeCount: result[0].likeCount 
        });
    
    }catch(err){
        console.error(err);
        res.status(500).json({ message: "サーバーエラー" });
    }
        
    
});

//リポスト処理
router.post("/:id/repost", middlewareAuth, async(req,res) =>{
   try{
    const postId = req.params.id
    
    const [repost] = await pool.query(
        "SELECT * FROM reposts WHERE user_id = ? AND post_id = ?",
        [req.user.id, postId]
    )

     if(repost.length == 0){
    
        await pool.query(
            "INSERT INTO reposts (user_id, post_id) VALUES (?, ?)",
            [req.user.id, postId]
        );
         
    };
    if(repost.length > 0){
    
        await pool.query(
            "DELETE FROM reposts WHERE user_id = ? AND post_id = ?",
            [req.user.id, postId]
        );
   
    };


    const [result] = await pool.query(
        "SELECT COUNT(*) as repostCount FROM reposts WHERE post_id = ?",
        [req.params.id]
    );
    res.json({
        repostCount: result[0].repostCount 
    });
   }catch(err){
    console.error(err);
    res.status(500).json({ message: "サーバーエラー" });
   }
   
});


// 返信処理
router.post("/:id/reply", middlewareAuth, async (req, res) => {
    try {
        const parentId = req.params.id;
        const userId = req.user.id;
        const comment = req.body.content;

        // 入力チェック
        if (!comment) {
            return res.status(400).json({ message: "返信内容が空です" });
        }
        if (comment.length > 280) {
            return res.status(400).json({ message: "返信は280字以内です" });
        }

        // 親投稿の存在確認
        const [parentPosts] = await pool.query(
            "SELECT * FROM posts WHERE id = ?",
            [parentId]
        );

        if (parentPosts.length === 0) {
            return res.status(404).json({ message: "投稿が見つかりません" });
        }

        // 返信を投稿
        const [result] = await pool.query(
            "INSERT INTO posts (content, user_id, parent_id) VALUES (?, ?, ?)",
            [comment, userId, parentId]
        );

        res.status(201).json({
            message: "返信しました",
            reply: {
                id: result.insertId,
                content: comment,
                userId,
                parentId
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "サーバーエラー" });
    }
});

// 返信一覧取得
router.get("/:id/replies", middlewareAuth, async (req, res) => {
    try {
        const parentId = req.params.id;

        const [replies] = await pool.query(
            `SELECT 
                posts.*,
                users.username,
                parent_users.username as replyToUsername,
                COUNT(likes.id) as likeCount,
                COUNT(reposts.id) as repostCount,
                EXISTS(
                    SELECT 1 FROM likes
                    WHERE likes.post_id = posts.id
                    AND likes.user_id = ?
                ) as isLiked
            FROM posts
            LEFT JOIN users ON posts.user_id = users.id
            LEFT JOIN posts as parent_posts ON posts.parent_id = parent_posts.id
            LEFT JOIN users as parent_users ON parent_posts.user_id = parent_users.id 
            LEFT JOIN likes ON posts.id = likes.post_id
            LEFT JOIN reposts ON posts.id = reposts.post_id
            WHERE posts.parent_id = ?
            GROUP BY posts.id
            ORDER BY posts.created_at ASC`,
            [req.user.id, parentId]
        );

        res.json({
            message: "返信取得",
            replies
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "サーバーエラー" });
    }
});

module.exports = router
