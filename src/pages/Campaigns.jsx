import { useEffect, useState } from "react";
import api from "../services/api";
import { toast } from "sonner";

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
  });

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = "Campaign name is required";
    }

    if (!formData.start_date) {
      newErrors.start_date = "Start date is required";
    }

    if (!formData.end_date) {
      newErrors.end_date = "End date is required";
    }

    if (
      formData.start_date &&
      formData.end_date &&
      new Date(formData.end_date) < new Date(formData.start_date)
    ) {
      newErrors.end_date = "End date must be after start date";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/campaigns/${editingId}`, formData);
        toast.success("Campaign updated successfully!");
      } else {
        await api.post("/campaigns", formData);
        toast.success("Campaign created successfully!");
      }

      resetForm();
      fetchCampaigns();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (campaign) => {
    const status = getCampaignStatus(campaign);
    if (status === "Completed") {
      toast.error("Completed campaigns cannot be updated");
      return;
    }
    setEditingId(campaign.id);
    setFormData({
      name: campaign.name || "",
      description: campaign.description || "",
      start_date: campaign.start_date || "",
      end_date: campaign.end_date || "",
    });
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/campaigns/${deleteId}`);
      toast.success("Campaign deleted successfully!");
      fetchCampaigns();
    } catch (err) {
      toast.error("Failed to delete campaign");
    } finally {
      setDeleteId(null);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      description: "",
      start_date: "",
      end_date: "",
    });
    setErrors({});
  };

  const getCampaignStatus = (campaign) => {
    const today = new Date();
    const start = new Date(campaign.start_date);
    const end = new Date(campaign.end_date);

    // Remove time part for accurate comparison

    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (today < start) return "Upcoming";
    if (today > end) return "Completed";
    return "Active";
  };

  const getStatusBadgeStyle = (status) => {
    const base =
      "px-3 py-1 text-xs font-semibold rounded-full";

    switch (status) {
      case "Active":
        return `${base} bg-green-100 text-green-700`;
      case "Upcoming":
        return `${base} bg-blue-100 text-blue-700`;
      case "Completed":
        return `${base} bg-gray-200 text-gray-600`;
      default:
        return base;
    }
  };

  return (
    <div className="space-y-8">

      {/* Form */}

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? "Edit Campaign" : "Create Campaign"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6 w-full">

          {/* Campaign Name */}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Campaign Name
              <span className="text-red-500 ml-1">*</span> {/* <-- red asterisk */}
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter campaign name"
              className={`border min-w-0 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.name ? "border-red-500" : "border-slate-300"
                }`}
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">
                {errors.name}
              </p>
            )}
          </div>

          {/* Dates Row */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">

            {/* Start Date */}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Start Date
                <span className="text-red-500 ml-1">*</span> {/* <-- red asterisk */}
              </label>
              <input
                type="date"
                name="start_date"
                min={new Date().toISOString().split("T")[0]}
                className={`border min-w-0 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.start_date ? "border-red-500" : "border-slate-300"
                  }`}
                value={formData.start_date}
                onChange={handleChange}
              />
              {errors.start_date && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.start_date}
                </p>
              )}
            </div>

            {/* End Date */}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                End Date
                <span className="text-red-500 ml-1">*</span> {/* <-- red asterisk */}
              </label>
              <input
                type="date"
                name="end_date"
                min={formData.start_date || new Date().toISOString().split("T")[0]}
                className={`border min-w-0 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.end_date ? "border-red-500" : "border-slate-300"
                  }`}
                value={formData.end_date}
                onChange={handleChange}
              />
              {errors.end_date && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.end_date}
                </p>
              )}
            </div>
          </div>

          {/* Description */}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              placeholder="Brief description about this campaign"
              rows={3}
              className="border min-w-0 border-slate-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {/* Buttons */}

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              type="submit"
              className="bg-indigo-600 text-white px-5 py-2 rounded-md hover:bg-indigo-700 transition"
            >
              {loading ? "Saving..." : editingId ? "Update Campaign" : "Create Campaign"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-slate-300 px-5 py-2 rounded-md hover:bg-slate-400 transition"
              >
                Cancel
              </button>
            )}
          </div>

        </form>
      </div>

      {/* Campaign List */}

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">
          Your Campaigns
        </h2>

        <div className="space-y-4">
          {campaigns.length === 0 && (
            <p className="text-slate-500">No campaigns yet.</p>
          )}
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="
                  border border-slate-200
                  rounded-xl
                  p-5
                  flex flex-col sm:flex-row
                  sm:justify-between
                  sm:items-center
                  gap-4
                  bg-white
                  shadow-sm
                  transition-all duration-300 ease-in-out
                  hover:shadow-lg
                  hover:-translate-y-0.5
                  hover:border-indigo-200
                ">
              <div>
                <div className="flex flex-wrap items-center gap-2 wrap-break-word">
                  <p className="font-medium text-lg wrap-break-word max-w-full">
                    {campaign.name}
                  </p>

                  {(() => {
                    const status = getCampaignStatus(campaign);
                    return (
                      <span className={getStatusBadgeStyle(status)}>
                        {status}
                      </span>
                    );
                  })()}
                </div>

                <p className="text-sm text-slate-500 mt-1">
                  {campaign.start_date} → {campaign.end_date}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
                <button
                  onClick={() => handleEdit(campaign)}
                  className={`w-auto px-4 py-1 rounded-lg font-semibold flex items-center gap-2 ${getCampaignStatus(campaign) === "Completed"
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-green-700 text-white hover:bg-green-800"
                    }`}
                  title={getCampaignStatus(campaign) === "Completed" ? "Completed campaigns cannot be edited" : ""}
                >
                  Edit
                </button>

                <button
                  onClick={() => setDeleteId(campaign.id)}
                  className="w-auto bg-red-500 text-white px-4 py-1 rounded-lg hover:bg-red-700 font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Modal */}

      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-sm">
            <h3 className="text-lg font-semibold mb-3">
              Confirm Delete
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Are you sure you want to delete this campaign?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-1 rounded-md bg-slate-300 hover:bg-slate-400"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="px-4 py-1 rounded-md bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaigns;