import { useQuery } from "@tanstack/react-query";
import { getUserFriends } from "../lib/api";
import { UsersIcon, MessageCircle } from "lucide-react";
import FriendCard from "../components/FriendCard";
import useAuthUser from "../hooks/useAuthUser";

const FriendsPage = () => {
  const { authUser } = useAuthUser();
  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-base-content flex items-center gap-3">
            <UsersIcon className="w-8 h-8 text-primary" />
            Your Connections
          </h2>
          <p className="opacity-70 mt-2 text-lg">
            People you can chat and practice languages with.
          </p>
        </div>
        <div className="badge badge-primary badge-lg badge-outline hidden sm:flex">
          {friends.length} Friends
        </div>
      </div>

      {loadingFriends ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card bg-base-100 shadow-sm border border-base-200 animate-pulse h-48 rounded-3xl" />
          ))}
        </div>
      ) : friends.length === 0 ? (
        <div className="bg-base-100 p-12 rounded-3xl text-center border border-base-200 shadow-sm mt-4 max-w-2xl mx-auto">
          <MessageCircle className="w-16 h-16 text-primary/40 mx-auto mb-4" />
          <h3 className="font-bold text-2xl text-base-content mb-2">No friends yet</h3>
          <p className="text-base-content/60 max-w-sm mx-auto mb-6">Connect with learners from the home page to start chatting and practicing!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {friends.map((friend) => (
            <FriendCard key={friend._id} friend={friend} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendsPage;
