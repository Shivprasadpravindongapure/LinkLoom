import Post from "../models/Post.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";

// CREATE POST
export const createPost = async (req, res) => {
  try {
    const { text, image } = req.body;
    let imageUrl = "";

    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    if (!text && !imageUrl) {
      return res.status(400).json({ message: "Post must have text or an image" });
    }

    const newPost = await Post.create({
      user: req.user._id,
      text,
      image: imageUrl,
    });

    const populatedPost = await Post.findById(newPost._id).populate("user", "fullName profilePic");

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET FEED FOR HOMEPAGE
// We will show posts from friends, or all posts if we want a global discovery feed.
export const getFeed = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    
    // As a modern social app, we show posts from the user, their friends, or trending global
    // To keep it simple but "amazing", let's get ALL posts but sort by newest.
    // In a real app we would filter by: [...currentUser.friends, currentUser._id]
    
    const feed = await Post.find()
      .populate("user", "fullName profilePic")
      .populate("comments.user", "fullName profilePic")
      .sort({ createdAt: -1 })
      .limit(50); // limit for performance

    res.status(200).json(feed);
  } catch (error) {
    console.error("Error fetching feed:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET SPECIFIC USER POSTS
export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await Post.find({ user: userId })
      .populate("user", "fullName profilePic")
      .populate("comments.user", "fullName profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// TOGGLE LIKE
export const toggleLike = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const { likes } = post;
    const isLiked = likes.includes(userId);

    if (isLiked) {
      post.likes = likes.filter((id) => id.toString() !== userId.toString());
    } else {
      post.likes.push(userId);
    }

    await post.save();
    
    // Repopulate to return full updated post
    const updatedPost = await Post.findById(postId)
      .populate("user", "fullName profilePic")
      .populate("comments.user", "fullName profilePic");

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ADD COMMENT
export const addComment = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push({ user: userId, text });
    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate("user", "fullName profilePic")
      .populate("comments.user", "fullName profilePic");

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
