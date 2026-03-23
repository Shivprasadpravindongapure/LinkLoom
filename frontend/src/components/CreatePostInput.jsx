import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CameraIcon, SendIcon, X, LoaderIcon } from "lucide-react";
import { createPost } from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";

const CreatePostInput = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const { mutate: createPostMutation, isPending } = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      toast.success("Post created!");
      setText("");
      setImagePreview(null);
      
      // Optimitically update the feed cache
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to create post");
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    // Reset file input so same file can be selected again if removed
    e.target.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) {
      toast.error("Please add some text or an image.");
      return;
    }
    createPostMutation({ text: text.trim(), image: imagePreview });
  };

  return (
    <div className="bg-base-100 rounded-2xl shadow-sm border border-base-200 p-4 sm:p-5 mb-6">
      <div className="flex gap-4">
        <div className="avatar">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-base-300">
            <img src={authUser?.profilePic || "/avatar-placeholder.png"} alt="User" />
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 w-full space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="textarea w-full text-base resize-none bg-base-200/50 focus:bg-base-200 border-none px-4 py-3 min-h-[80px]"
            placeholder="What's on your mind? Share your thoughts..."
            rows={2}
          />

          {imagePreview && (
            <div className="relative rounded-xl overflow-hidden bg-base-300 inline-block max-h-80 max-w-full group">
              <img src={imagePreview} alt="Preview" className="max-h-80 max-w-full object-contain" />
              <button 
                type="button" 
                onClick={() => setImagePreview(null)} 
                className="absolute top-2 right-2 btn btn-xs btn-circle btn-neutral shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-base-200 pt-3">
            <div className="flex">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                accept="image/*"
              />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-ghost btn-sm text-base-content/70 hover:text-primary hover:bg-primary/10"
              >
                <CameraIcon className="w-5 h-5 mr-1.5" />
                <span className="hidden sm:inline">Photo</span>
              </button>
            </div>

            <button 
              type="submit" 
              disabled={isPending || (!text.trim() && !imagePreview)}
              className="btn btn-primary btn-sm rounded-full px-6"
            >
              {isPending ? <LoaderIcon className="w-4 h-4 animate-spin" /> : (
                <>
                  <SendIcon className="w-4 h-4 mr-1.5" />
                  Post
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CreatePostInput;
