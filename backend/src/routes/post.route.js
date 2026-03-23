import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createPost,
  getFeed,
  getUserPosts,
  toggleLike,
  addComment,
} from "../controllers/post.controller.js";

const router = express.Router();

router.use(protectRoute);

router.post("/", createPost);
router.get("/feed", getFeed);
router.get("/user/:userId", getUserPosts);
router.put("/:id/like", toggleLike);
router.post("/:id/comment", addComment);

export default router;
