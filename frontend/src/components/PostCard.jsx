import { useState } from "react";
import { Link } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import { HeartIcon, MessageCircleIcon, ShareIcon, SendIcon } from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";
import { toggleLikePost, commentOnPost } from "../lib/api";

const PostCard = ({ post }) => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const currentUserId = authUser?._id;

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const isLikedByMe = post.likes.includes(currentUserId);

  const { mutate: toggleLikeMutation } = useMutation({
    mutationFn: toggleLikePost,
    onSuccess: () => {
      // Optimistically invalidate cache so it refetches the post (or mutate manually)
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: () => toast.error("Failed to like post"),
  });

  const { mutate: commentMutation, isPending: isCommenting } = useMutation({
    mutationFn: commentOnPost,
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: () => toast.error("Failed to comment"),
  });

  const handleLike = () => toggleLikeMutation(post._id);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    commentMutation({ postId: post._id, text: commentText.trim() });
  };

  return (
    <div className="bg-base-100 rounded-3xl shadow-sm border border-base-200 mb-6 overflow-hidden animate-fade-up">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <Link to={`#`} className="flex items-center gap-3 group">
          <div className="avatar">
            <div className="w-10 h-10 rounded-full bg-base-300">
              <img src={post.user?.profilePic || "/avatar-placeholder.png"} alt="User" />
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
              {post.user?.fullName}
            </h3>
            <p className="text-xs text-base-content/50">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </Link>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        {post.text && <p className="text-base-content/90 whitespace-pre-wrap text-[15px]">{post.text}</p>}
      </div>

      {/* Image */}
      {post.image && (
        <div className="w-full bg-base-300 border-y border-base-200 flex items-center justify-center max-h-[500px]">
          <img src={post.image} alt="Post content" className="w-full h-full object-contain max-h-[500px]" />
        </div>
      )}

      {/* Stats/Metrics */}
      {(post.likes?.length > 0 || post.comments?.length > 0) && (
        <div className="px-4 py-3 flex justify-between text-xs text-base-content/60 border-b border-base-200">
          <div className="flex items-center gap-1">
            {post.likes?.length > 0 && <span>{post.likes.length} likes</span>}
          </div>
          <div className="flex items-center gap-3">
            {post.comments?.length > 0 && (
              <button onClick={() => setShowComments(!showComments)} className="hover:underline">
                {post.comments.length} comments
              </button>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-2 py-1 flex items-center justify-between">
        <button 
          onClick={handleLike} 
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-base-200 transition-colors font-medium text-sm ${isLikedByMe ? 'text-rose-500' : 'text-base-content/70'}`}
        >
          <HeartIcon className={`w-5 h-5 ${isLikedByMe ? "fill-current" : ""}`} />
          Like
        </button>
        <button 
          onClick={() => setShowComments(!showComments)} 
          className="flex-1 flex flex-row items-center justify-center gap-2 py-2 rounded-lg hover:bg-base-200 transition-colors font-medium text-sm text-base-content/70"
        >
          <MessageCircleIcon className="w-5 h-5" />
          Comment
        </button>
        <button className="flex-1 flex flex-row items-center justify-center gap-2 py-2 rounded-lg hover:bg-base-200 transition-colors font-medium text-sm text-base-content/70">
          <ShareIcon className="w-5 h-5" />
          Share
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="p-4 bg-base-200/50 border-t border-base-200 space-y-4">
          
          {/* List existing comments */}
          {post.comments?.map((comment, i) => (
            <div key={i} className="flex gap-3">
              <div className="avatar">
                <div className="w-8 h-8 rounded-full bg-base-300">
                  <img src={comment.user?.profilePic || "/avatar-placeholder.png"} alt="User" />
                </div>
              </div>
              <div className="flex-1 bg-base-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm text-sm border border-base-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{comment.user?.fullName}</span>
                  <span className="text-[10px] text-base-content/50 opacity-70">
                    {formatDistanceToNow(new Date(comment.createdAt))} ago
                  </span>
                </div>
                <p className="text-base-content/90">{comment.text}</p>
              </div>
            </div>
          ))}

          {/* Add a comment input */}
          <div className="flex gap-3 pt-2">
            <div className="avatar mt-1">
              <div className="w-8 h-8 rounded-full bg-base-300">
                <img src={authUser?.profilePic || "/avatar-placeholder.png"} alt="Me" />
              </div>
            </div>
            <form onSubmit={handleCommentSubmit} className="flex-1 relative">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="input input-sm h-10 w-full rounded-full bg-base-100 border-base-300 pr-10 focus:border-primary focus:outline-none"
              />
              <button 
                type="submit" 
                disabled={!commentText.trim() || isCommenting}
                className="absolute right-1 top-1 bottom-1 btn btn-xs btn-circle btn-primary shadow-sm"
              >
                <SendIcon className="w-3 h-3" />
              </button>
            </form>
          </div>
          
        </div>
      )}
    </div>
  );
};
export default PostCard;
