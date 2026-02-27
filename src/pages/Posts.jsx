import { useEffect, useState } from "react";
import api from "../services/api";
import { toast } from "sonner";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [editingPostId, setEditingPostId] = useState(null);
  const [deletePostId, setDeletePostId] = useState(null);
  const [errors, setErrors] = useState({});
  const [campaigns, setCampaigns] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [postsLoading, setPostsLoading] = useState(true);

  const [formData, setFormData] = useState({
    caption: "",
    media_url: "",
    platform: "",
    scheduled_time: "",
    campaign_id: ""
  });

  const fetchPosts = async (campaignId = "") => {
    setPostsLoading(true);
    try {
      let url = "/posts";
      if (campaignId) url += `?campaign_id=${campaignId}`;
      const res = await api.get(url);
      setPosts(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch posts");
    } finally {
      setPostsLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const res = await api.get("/campaigns");
      setCampaigns(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    fetchPosts(selectedCampaign);
  }, [selectedCampaign]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchPosts(selectedCampaign);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [selectedCampaign]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.platform) newErrors.platform = "Please select a platform";
    if (!formData.caption) newErrors.caption = "Caption is required";
    if (formData.scheduled_time) {
      const selectedTime = new Date(formData.scheduled_time);
      if (selectedTime <= new Date())
        newErrors.scheduled_time = "Scheduled time must be in the future";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      let payload = { ...formData, campaign_id: formData.campaign_id || null };
      if (formData.scheduled_time) {
        payload.scheduled_time = dayjs(formData.scheduled_time).toISOString();
      }

      if (editingPostId) {
        await api.put(`/posts/${editingPostId}`, payload);
        toast.success("Post updated successfully!");
      } else {
        await api.post("/posts", payload);
        toast.success("Post created successfully!");
      }

      resetForm();
      fetchPosts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post) => {
    setEditingPostId(post.id);
    setFormData({
      caption: post.caption || "",
      media_url: post.media_url || "",
      platform: post.platform || "",
      scheduled_time: post.scheduled_time ? formatForInput(post.scheduled_time) : "",
      campaign_id: post.campaign_id || ""
    });
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/posts/${deletePostId}`);
      toast.success("Post deleted successfully!");
      fetchPosts();
    } catch (err) {
      toast.error("Failed to delete post");
    } finally {
      setDeletePostId(null);
    }
  };

  const resetForm = () => {
    setEditingPostId(null);
    setFormData({
      caption: "",
      media_url: "",
      platform: "",
      scheduled_time: "",
      campaign_id: ""
    });
  };

  const getStatusBadge = (status) => {
    const base = "px-3 py-1 text-xs rounded-full font-medium";
    if (status === "published") return `${base} bg-green-100 text-green-700`;
    if (status === "scheduled") return `${base} bg-yellow-100 text-yellow-700`;
    return `${base} bg-slate-200 text-slate-700`;
  };

  dayjs.extend(utc);
  dayjs.extend(timezone);

  const formatForInput = (utcDate) =>
    dayjs.utc(utcDate).local().format("YYYY-MM-DDTHH:mm");

  const formatForDisplay = (utcDate) =>
    dayjs.utc(utcDate).local().format("DD MMM YYYY, hh:mm A");

  return (
    <div className="space-y-8 overflow-x-hidden">
      {/* Create / Edit Form */}
      <div className="bg-white shadow rounded-lg p-6 w-full min-w-0">
        <h2 className="text-xl font-semibold mb-4">
          {editingPostId ? "Edit Post" : "Create Post"}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {/* Caption */}
          <div className="mb-4 w-full min-w-0">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Caption <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="caption"
              value={formData.caption}
              onChange={handleChange}
              className={`border rounded-md px-3 py-2 w-full min-w-0 wrap-break-word focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.caption ? "border-red-500" : "border-slate-300"}`}
            />
            {errors.caption && <p className="text-red-500 text-sm mt-1">{errors.caption}</p>}
          </div>

          {/* Media URL */}
          <div className="mb-4 w-full min-w-0">
            <label className="block text-sm font-medium text-slate-700 mb-1">Media URL</label>
            <input
              type="text"
              name="media_url"
              value={formData.media_url}
              onChange={handleChange}
              className={`border rounded-md px-3 py-2 w-full min-w-0 wrap-break-word focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.media_url ? "border-red-500" : "border-slate-300"}`}
            />
            {errors.media_url && <p className="text-red-500 text-sm mt-1">{errors.media_url}</p>}
          </div>

          {/* Platform */}
          <div className="mb-4 w-full min-w-0">
            <label className="block text-sm font-medium text-slate-700 mb-1">Platform <span className="text-red-500">*</span></label>
            <Select
              value={formData.platform}
              onValueChange={(value) => {
                setFormData(prev => ({ ...prev, platform: value }));
                setErrors(prev => ({ ...prev, platform: "" }));
              }}
            >
              <SelectTrigger className={`w-full min-w-0 ${errors.platform ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Select Platform" />
              </SelectTrigger>
              <SelectContent className="w-full min-w-0">
                <SelectGroup>
                  <SelectLabel>Platforms</SelectLabel>
                  <SelectItem value="Facebook">Facebook</SelectItem>
                  <SelectItem value="Instagram">Instagram</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.platform && <p className="text-red-500 text-sm mt-1">{errors.platform}</p>}
          </div>

          {/* Campaign */}
          <div className="mb-4 w-full min-w-0">
            <label className="block text-sm font-medium text-slate-700 mb-1">Campaign</label>
            <Select
              value={formData.campaign_id || ""}
              onValueChange={(value) => setFormData(prev => ({ ...prev, campaign_id: value }))}
            >
              <SelectTrigger className="w-full min-w-0">
                <SelectValue placeholder="Select Campaign" />
              </SelectTrigger>
              <SelectContent className="w-full max-h-60 overflow-y-auto">
                <SelectGroup>
                  <SelectLabel>Campaigns</SelectLabel>
                  {campaigns.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Scheduled Time */}
          <div className="mb-4 w-full min-w-0">
            <label className="block text-sm font-medium text-slate-700 mb-1">Schedule Time</label>
            <input
              type="datetime-local"
              name="scheduled_time"
              value={formData.scheduled_time}
              onChange={handleChange}
              className={`border rounded-md px-3 py-2 w-full min-w-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.scheduled_time ? "border-red-500" : "border-slate-300"}`}
            />
            {errors.scheduled_time && <p className="text-red-500 text-sm mt-1">{errors.scheduled_time}</p>}
          </div>

          {/* Buttons */}
          <div className="md:col-span-2 flex flex-wrap gap-4">
            <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
              {loading ? "Saving..." : editingPostId ? "Update Post" : "Create Post"}
            </button>
            {editingPostId && (
              <button type="button" onClick={resetForm} className="bg-slate-300 px-4 py-2 rounded-md hover:bg-slate-400">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Campaign Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full min-w-0">
        <label className="font-medium whitespace-nowrap">Filter by Campaign:</label>
        <div className="w-full min-w-0">
          <Select
            value={selectedCampaign || "all"}
            onValueChange={(value) => setSelectedCampaign(value === "all" ? "" : value)}
          >
            <SelectTrigger className="w-full min-w-0 bg-white">
              <SelectValue placeholder="All Campaigns" />
            </SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
              <SelectGroup>
                <SelectLabel>Campaigns</SelectLabel>
                <SelectItem value="all">All Campaigns</SelectItem>
                {campaigns.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Posts List */}
      {postsLoading ? (
        "Loading Posts..."
      ) : (
        <div className="bg-white shadow rounded-lg p-6 w-full overflow-x-auto">
          <h2 className="text-xl font-semibold mb-4">Your Posts</h2>
          <div className="space-y-4 min-w-0">
            {posts.length === 0 ? (
              <p className="text-slate-500">No posts yet.</p>
            ) : (
              posts.map(post => (
                <div key={post.id} className="border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white shadow-sm transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-0.5 hover:border-indigo-200 min-w-0 wrap-break-word">
                  <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 mt-1 text-sm text-slate-500 min-w-0 wrap-break-word">
                    <p className="font-medium max-w-full wrap-break-word">{post.caption}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-sm text-slate-500">{post.platform}</span>
                      <span className={getStatusBadge(post.status)}>{post.status}</span>
                      {post.campaigns && (
                        <button onClick={() => navigate("/dashboard/campaigns")} className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition">
                          📢 {post.campaigns?.name}
                        </button>
                      )}
                      {post.scheduled_time && <span>⏰ {formatForDisplay(post.scheduled_time)}</span>}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-start sm:justify-end min-w-0">
                    <button
                      onClick={() => handleEdit(post)}
                      disabled={post.status === "published"}
                      className={`w-auto px-4 py-1 rounded-lg font-semibold flex items-center gap-2 ${post.status === "published"
                          ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                          : "bg-green-700 text-white hover:bg-green-800"
                        }`}
                      title={post.status === "published" ? "Published posts cannot be edited" : ""}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeletePostId(post.id)}
                      className="w-auto bg-red-500 text-white font-semibold px-4 py-1 rounded-lg hover:bg-red-700">
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {deletePostId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h3 className="text-lg font-semibold mb-3">Confirm Delete</h3>
            <p className="text-sm text-slate-600 mb-4">Are you sure you want to delete this post?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeletePostId(null)} className="px-4 py-1 rounded-md bg-slate-300 hover:bg-slate-400">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-1 rounded-md bg-red-600 text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Posts;