import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CameraIcon, X, Plus, MapPinIcon } from "lucide-react";
import { updateProfile } from "../lib/api";
import { LANGUAGES } from "../constants";

const EditProfileModal = ({ isOpen, onClose, user }) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [formState, setFormState] = useState({
    fullName: user?.fullName || "",
    bio: user?.bio || "",
    nativeLanguage: user?.nativeLanguage || "",
    learningLanguage: user?.learningLanguage || "",
    location: user?.location || "",
    image: null,
    interests: user?.interests || [],
    socialLinks: user?.socialLinks || { github: "", linkedin: "", portfolio: "" }
  });

  const [displayPic, setDisplayPic] = useState(user?.profilePic || "");
  const [interestInput, setInterestInput] = useState("");
  const [detectingLocation, setDetectingLocation] = useState(false);

  const handleAutoDetectLocation = async () => {
    setDetectingLocation(true);
    try {
      const res = await fetch("https://ipapi.co/json/");
      const data = await res.json();
      if (data.city && data.country_name) {
        setFormState(prev => ({ ...prev, location: `${data.city}, ${data.country_name}` }));
        toast.success("Location auto-detected!");
      }
    } catch (err) {
      toast.error("Failed to detect location automatically.");
    } finally {
      setDetectingLocation(false);
    }
  };

  const { mutate: updateProfileMutation, isPending } = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      onClose(); // closed modal on success
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to update profile");
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
      setFormState({ ...formState, image: reader.result });
      setDisplayPic(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAddInterest = (e) => {
    e.preventDefault();
    if (interestInput.trim() && !formState.interests.includes(interestInput.trim())) {
      setFormState(prev => ({
        ...prev,
        interests: [...prev.interests, interestInput.trim()]
      }));
      setInterestInput("");
    }
  };

  const handleRemoveInterest = (tagToRemove) => {
    setFormState(prev => ({
      ...prev,
      interests: prev.interests.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSocialLinkChange = (e, platform) => {
    setFormState(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: e.target.value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation(formState);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-base-100 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col relative shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-base-200">
          <h2 className="text-xl font-bold">Edit Profile</h2>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto">
          <form id="edit-profile-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Avatar Edit */}
            <div className="flex flex-col items-center gap-4">
              <div 
                className="relative w-28 h-28 rounded-full bg-base-200 cursor-pointer overflow-hidden group ring-4 ring-base-100 shadow-md"
                onClick={() => fileInputRef.current?.click()}
              >
                {displayPic ? (
                  <img src={displayPic} alt="Profile" className="w-full h-full object-cover group-hover:opacity-75 transition" />
                ) : (
                  <div className="flex items-center justify-center h-full"><CameraIcon className="w-8 h-8 opacity-50" /></div>
                )}
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition sm:opacity-100 sm:bg-transparent">
                  <div className="bg-black/60 rounded-full p-2 text-white sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <CameraIcon className="w-6 h-6" />
                  </div>
                  <span className="text-xs text-white mt-1 bg-black/60 px-2 rounded-full sm:opacity-0 group-hover:opacity-100 transition-opacity">Upload</span>
                </div>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-sm btn-ghost text-primary sm:hidden"
              >
                Change Photo
              </button>
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Full Name</span></label>
                <input type="text" value={formState.fullName} onChange={e => setFormState({...formState, fullName: e.target.value})} className="input input-bordered" required />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Bio</span></label>
                <textarea value={formState.bio} onChange={e => setFormState({...formState, bio: e.target.value})} className="textarea textarea-bordered h-20" placeholder="A short bio..." />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Location</span></label>
                <div className="flex gap-2">
                  <input type="text" value={formState.location} onChange={e => setFormState({...formState, location: e.target.value})} className="input input-bordered flex-1" placeholder="City, Country" />
                  <button type="button" onClick={handleAutoDetectLocation} disabled={detectingLocation} className="btn btn-outline btn-primary shrink-0" title="Auto Detect Location">
                    {detectingLocation ? <span className="loading loading-spinner loading-xs"></span> : <MapPinIcon className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Languages */}
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Native Language</span></label>
                <select value={formState.nativeLanguage} onChange={e => setFormState({...formState, nativeLanguage: e.target.value})} className="select select-bordered">
                  <option value="">Select...</option>
                  {LANGUAGES.map(lang => <option key={lang} value={lang.toLowerCase()}>{lang}</option>)}
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Learning Language</span></label>
                <select value={formState.learningLanguage} onChange={e => setFormState({...formState, learningLanguage: e.target.value})} className="select select-bordered">
                  <option value="">Select...</option>
                  {LANGUAGES.map(lang => <option key={lang} value={lang.toLowerCase()}>{lang}</option>)}
                </select>
              </div>
            </div>

            {/* Interests / Tags */}
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Interests</span></label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' ? handleAddInterest(e) : null}
                  className="input input-bordered flex-1" 
                  placeholder="e.g. React, Photography, Travel" 
                />
                <button type="button" onClick={handleAddInterest} className="btn btn-square btn-primary">
                  <Plus className="w-5 h-5"/>
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {formState.interests.map(tag => (
                  <span key={tag} className="badge badge-primary px-3 py-3 gap-2 rounded-lg">
                    {tag}
                    <button type="button" onClick={() => handleRemoveInterest(tag)} className="hover:text-red-300">
                      <X className="w-3 h-3"/>
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div className="form-control space-y-3">
              <label className="label"><span className="label-text font-medium">Social Links</span></label>
              <div className="flex items-center gap-2">
                <span className="w-24 text-sm font-medium opacity-70">GitHub</span>
                <input type="url" value={formState.socialLinks?.github || ""} onChange={e => handleSocialLinkChange(e, "github")} className="input input-sm input-bordered flex-1" placeholder="https://github.com/username" />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-24 text-sm font-medium opacity-70">LinkedIn</span>
                <input type="url" value={formState.socialLinks?.linkedin || ""} onChange={e => handleSocialLinkChange(e, "linkedin")} className="input input-sm input-bordered flex-1" placeholder="https://linkedin.com/in/username" />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-24 text-sm font-medium opacity-70">Portfolio</span>
                <input type="url" value={formState.socialLinks?.portfolio || ""} onChange={e => handleSocialLinkChange(e, "portfolio")} className="input input-sm input-bordered flex-1" placeholder="https://yourwebsite.com" />
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-base-200 flex justify-end gap-3 bg-base-100 rounded-b-2xl">
          <button type="button" onClick={onClose} className="btn btn-ghost" disabled={isPending}>Cancel</button>
          <button type="submit" form="edit-profile-form" className="btn btn-primary min-w-[120px]" disabled={isPending}>
            {isPending ? <span className="loading loading-spinner loading-sm"></span> : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
