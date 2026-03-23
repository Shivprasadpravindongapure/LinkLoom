import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
  getFeed
} from "../lib/api";
import { Link } from "react-router";
import { CheckCircleIcon, MapPinIcon, UserPlusIcon, UsersIcon, FlameIcon, GlobeIcon } from "lucide-react";
import { capitialize } from "../lib/utils";
import FriendCard, { getLanguageFlag } from "../components/FriendCard";
import CreatePostInput from "../components/CreatePostInput";
import PostCard from "../components/PostCard";
import PostSkeleton from "../components/PostSkeleton";
import useAuthUser from "../hooks/useAuthUser";

const HomePage = () => {
  const queryClient = useQueryClient();
  const { authUser } = useAuthUser();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
  });

  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  const { data: feedData = [], isLoading: loadingFeed } = useQuery({
    queryKey: ["feed"],
    queryFn: getFeed,
  });

  const { data: newsData = [], isLoading: loadingNews } = useQuery({
    queryKey: ["news"],
    queryFn: async () => {
      const res = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json");
      const ids = await res.json();
      return Promise.all(ids.slice(0, 3).map(id => fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r => r.json())));
    },
    staleTime: 5 * 60 * 1000,
  });

  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  useEffect(() => {
    const outgoingIds = new Set();
    if (outgoingFriendReqs && outgoingFriendReqs.length > 0) {
      outgoingFriendReqs.forEach((req) => {
        outgoingIds.add(req.recipient._id);
      });
      setOutgoingRequestsIds(outgoingIds);
    }
  }, [outgoingFriendReqs]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* MAIN FEED (Left/Center area) */}
        <div className="lg:col-span-8 space-y-6">
          
          <CreatePostInput />

          <div className="flex items-center justify-between mt-8 mb-4">
            <h2 className="text-2xl font-bold tracking-tight">Your Feed</h2>
            <div className="flex items-center gap-1.5 text-sm btn btn-sm btn-ghost hover:bg-base-200 rounded-full font-medium">
              <FlameIcon className="w-4 h-4 text-orange-500" /> Trending
            </div>
          </div>

          {loadingFeed ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <PostSkeleton key={i} />
              ))}
            </div>
          ) : feedData.length === 0 ? (
            <div className="bg-base-100 p-12 rounded-3xl text-center border border-base-200 shadow-sm mt-4">
              <h3 className="font-bold text-xl text-base-content">No posts yet</h3>
              <p className="text-base-content/60 mt-2 max-w-sm mx-auto">Build your network to see updates and photos from your language exchange partners!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {feedData.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR (Widgets / Profile Info) */}
        <div className="hidden lg:block lg:col-span-4 space-y-6">
          
          {/* Mini Profile Widget */}
          <div className="bg-base-100 rounded-3xl shadow-sm border border-base-200 overflow-hidden text-center pb-5 sticky top-20">
            <div className="h-20 bg-gradient-to-r from-primary to-secondary"></div>
            <div className="avatar -mt-10 mb-3 ring-4 ring-base-100 rounded-full relative z-10">
              <div className="w-20 h-20 rounded-full bg-base-300 mx-auto">
                <img src={authUser?.profilePic || "/avatar-placeholder.png"} alt="User" />
              </div>
            </div>
            <Link to="/profile" className="font-bold text-lg hover:text-primary transition-colors cursor-pointer">{authUser?.fullName}</Link>
            <p className="text-sm text-base-content/60 px-6 mt-1 mb-4 line-clamp-2">
              {authUser?.bio || "Set up your bio to tell partners about yourself!"}
            </p>
            
            <div className="border-t border-base-200 px-6 py-4 flex justify-around">
              <div>
                <p className="text-xs font-semibold text-base-content/50 uppercase">Friends</p>
                <p className="font-bold text-lg">{friends.length}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-base-content/50 uppercase">Learning</p>
                <p className="font-bold text-lg capitalize flex justify-center mt-0.5">{getLanguageFlag(authUser?.learningLanguage)}</p>
              </div>
            </div>
          </div>

          {/* Connect / Meet Widget */}
          <div className="bg-base-100 rounded-3xl shadow-sm border border-base-200 p-5 sticky top-[340px]">
            <h3 className="font-bold text-base mb-4 flex items-center gap-2">
              <UsersIcon className="w-5 h-5 text-primary" />
              Who to Connect With
            </h3>

            {loadingUsers ? (
              <span className="loading loading-spinner text-primary block mx-auto py-6" />
            ) : recommendedUsers.length === 0 ? (
              <p className="text-sm text-center text-base-content/60 py-4 bg-base-200/50 rounded-xl">No recommendations right now</p>
            ) : (
              <div className="space-y-5">
                {recommendedUsers.slice(0, 4).map((user) => {
                  const hasRequestBeenSent = outgoingRequestsIds.has(user._id);
                  return (
                    <div key={user._id} className="flex items-center gap-3">
                      <Link to={`/`} className="avatar shrink-0 group">
                        <div className="w-10 h-10 rounded-full group-hover:ring-2 ring-primary transition-all">
                          <img src={user.profilePic || "/avatar-placeholder.png"} alt="user" />
                        </div>
                      </Link>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{user.fullName}</h4>
                        <span className="text-xs text-base-content/60 truncate block">{getLanguageFlag(user.learningLanguage)} Learning {capitialize(user.learningLanguage)}</span>
                      </div>

                      <button
                        className={`btn btn-sm btn-circle shrink-0 ${hasRequestBeenSent ? "btn-disabled bg-base-200" : "btn-primary btn-outline"}`}
                        onClick={() => sendRequestMutation(user._id)}
                        disabled={hasRequestBeenSent || isPending}
                        title={hasRequestBeenSent ? "Request Sent" : "Send Connect Request"}
                      >
                        {hasRequestBeenSent ? <CheckCircleIcon className="w-4 h-4" /> : <UserPlusIcon className="w-4 h-4" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            <Link to="/networks" className="btn btn-ghost btn-sm w-full mt-4 text-primary hover:bg-primary/5 rounded-xl font-medium">View all suggestions</Link>
          </div>

          {/* World Wide News Widget */}
          <div className="bg-base-100 rounded-3xl shadow-sm border border-base-200 p-5 sticky top-[550px]">
            <h3 className="font-bold text-base mb-4 flex items-center gap-2">
              <GlobeIcon className="w-5 h-5 text-secondary" />
              Worldwide News
            </h3>

            {loadingNews ? (
              <span className="loading loading-spinner text-secondary block mx-auto py-6" />
            ) : (
              <div className="space-y-4">
                {newsData.map((item) => (
                  <a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="block group">
                    <h4 className="font-medium text-sm text-base-content/90 group-hover:text-primary transition-colors line-clamp-2">{item.title}</h4>
                    <span className="text-xs text-base-content/50 mt-1 block">{item.score} points • {(new URL(item.url || "https://news.ycombinator.com")).hostname}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
