import { useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import { changePassword, getUserPosts } from "../lib/api";
import { Edit2, MapPin, Globe, Github, Linkedin, Link as LinkIcon, KeyIcon, Image as ImageIcon } from "lucide-react";
import EditProfileModal from "../components/EditProfileModal";

const ProfilePage = () => {
  const { authUser } = useAuthUser();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { data: userPosts, isLoading: isLoadingPosts } = useQuery({
    queryKey: ["userPosts", authUser?._id],
    queryFn: () => getUserPosts(authUser._id),
    enabled: !!authUser?._id,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const { mutate: changePasswordMutation, isPending: isPasswordPending } = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success("Password changed successfully");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to change password");
    },
  });

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    changePasswordMutation(passwordForm);
  };

  if (!authUser) return null;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 pb-20">
      
      {/* Banner & Header (LinkedIn style) */}
      <div className="bg-base-100 rounded-2xl shadow-sm border border-base-200 overflow-hidden relative">
        {/* Banner */}
        <div className="h-40 md:h-52 bg-gradient-to-r from-primary/80 to-secondary/80 object-cover w-full"></div>
        
        {/* Profile Info Section */}
        <div className="px-6 pb-6 relative flex flex-col items-center sm:items-stretch sm:flex-none">
          <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end -mt-20 md:-mt-24 mb-4 gap-4">
            <div className="avatar ring-4 ring-base-100 rounded-full bg-base-100 relative shadow-xl">
              <div className="w-40 md:w-48 rounded-full bg-base-300">
                <img src={authUser?.profilePic || "/avatar-placeholder.png"} alt="Profile" className="object-cover" />
              </div>
            </div>
            
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="btn btn-outline btn-primary rounded-full px-6 shadow-sm w-full sm:w-auto"
            >
              <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
            </button>
          </div>

          <div className="mt-2 text-center sm:text-left">
            <h1 className="text-3xl font-bold">{authUser?.fullName}</h1>
            <p className="text-base-content/70 mt-3 max-w-2xl text-lg leading-relaxed">{authUser?.bio || "No bio added yet."}</p>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-5 text-sm font-medium text-base-content/80">
              {authUser?.location && (
                <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary"/> {authUser.location}</div>
              )}
              {authUser?.nativeLanguage && (
                <div className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-primary"/> Native: <span className="capitalize">{authUser.nativeLanguage}</span></div>
              )}
              {authUser?.learningLanguage && (
                <div className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-secondary"/> Learning: <span className="capitalize">{authUser.learningLanguage}</span></div>
              )}
            </div>

            {/* Social Links */}
            {(authUser?.socialLinks?.github || authUser?.socialLinks?.linkedin || authUser?.socialLinks?.portfolio) && (
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4">
                {authUser.socialLinks.github && (
                  <a href={authUser.socialLinks.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                    <Github className="w-4 h-4"/> GitHub
                  </a>
                )}
                {authUser.socialLinks.linkedin && (
                  <a href={authUser.socialLinks.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                    <Linkedin className="w-4 h-4"/> LinkedIn
                  </a>
                )}
                {authUser.socialLinks.portfolio && (
                  <a href={authUser.socialLinks.portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                    <LinkIcon className="w-4 h-4"/> Portfolio
                  </a>
                )}
              </div>
            )}

            {/* Interests / Tags */}
            {authUser?.interests && authUser.interests.length > 0 && (
              <div className="mt-8 border-t border-base-200 pt-6">
                <h3 className="text-sm font-bold text-base-content/60 uppercase tracking-wider mb-4">Interests</h3>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  {authUser.interests.map((tag, i) => (
                    <span key={i} className="badge badge-primary badge-outline px-4 py-3 bg-primary/5 border-primary/20 rounded-xl font-medium">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Posts Section */}
      <div className="bg-base-100 rounded-2xl shadow-sm border border-base-200 overflow-hidden mt-8">
        <div className="px-6 py-5 border-b border-base-200">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ImageIcon className="size-5 text-primary" />
            Your Activity & Posts
          </h2>
        </div>
        
        <div className="p-6">
          {isLoadingPosts ? (
            <div className="flex justify-center p-8"><span className="loading loading-spinner text-primary" /></div>
          ) : userPosts?.length === 0 ? (
            <p className="text-center text-base-content/60 py-8">You haven't posted anything yet.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {userPosts?.map((post) => (
                <div key={post._id} className="border border-base-200 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow bg-base-100">
                  <div>
                    <div className="flex justify-between text-xs text-base-content/50 mb-2">
                      <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
                      <span className="font-medium text-primary">{(post.likes?.length || 0)} Likes, {(post.comments?.length || 0)} Comments</span>
                    </div>
                    {post.text && <p className="text-base-content/90 line-clamp-2 text-sm mb-3 font-medium">{post.text}</p>}
                    {post.image && (
                      <div className="h-32 rounded-lg bg-base-200 mt-2 mb-2 overflow-hidden border border-base-200 relative">
                         <img src={post.image} alt="post" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Security settings at bottom */}
      <div className="bg-base-100 rounded-2xl shadow-sm border border-base-200 overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <KeyIcon className="size-5 text-primary" />
            Security Settings
          </h2>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-xl">
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Current Password</span></label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="input input-bordered w-full"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">New Password</span></label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="input input-bordered w-full"
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Confirm New Password</span></label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="input input-bordered w-full"
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <button className="btn btn-neutral sm:w-auto w-full mt-2 rounded-xl" disabled={isPasswordPending} type="submit">
              {!isPasswordPending ? "Update Password" : <span className="loading loading-spinner loading-sm"></span>}
            </button>
          </form>
        </div>
      </div>

      <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} user={authUser} />
    </div>
  );
};
export default ProfilePage;
