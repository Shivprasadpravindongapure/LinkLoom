const PostSkeleton = () => {
  return (
    <div className="bg-base-100 rounded-2xl shadow-sm border border-base-200 mb-6 overflow-hidden animate-pulse">
      {/* Header Skeleton */}
      <div className="p-4 flex items-center justify-between border-b border-base-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-base-300"></div>
          <div className="space-y-2">
            <div className="h-4 w-32 bg-base-300 rounded"></div>
            <div className="h-3 w-20 bg-base-300 rounded"></div>
          </div>
        </div>
      </div>
      
      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        <div className="h-4 w-full bg-base-300 rounded"></div>
        <div className="h-4 w-5/6 bg-base-300 rounded"></div>
        <div className="h-4 w-4/6 bg-base-300 rounded"></div>
      </div>
      
      {/* Image Skeleton */}
      <div className="w-full h-64 bg-base-300"></div>
      
      {/* Actions Skeleton */}
      <div className="px-4 py-3 flex gap-4 border-t border-base-200">
        <div className="h-8 w-20 bg-base-300 rounded"></div>
        <div className="h-8 w-24 bg-base-300 rounded"></div>
      </div>
    </div>
  );
};
export default PostSkeleton;
