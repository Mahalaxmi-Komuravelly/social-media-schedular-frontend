import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "@/context/AuthContext.jsx";
import React from "react";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { FileText, Calendar, Send, Megaphone, Heart, MessageCircle, Share2, Activity, Clock, CheckCircle } from "lucide-react";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const Dashboard = () => {
  const { user } = useAuth();

  const [totalPosts, setTotalPosts] = useState(0);
  const [scheduledPosts, setScheduledPosts] = useState(0);
  const [publishedPosts, setPublishedPosts] = useState(0);
  const [totalCampaigns, setTotalCampaigns] = useState(0);
  const [totalMembers, setTotalMembers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [activeCount, setActiveCount] = useState(0);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  const getStatusBadge = (status) => {
    const base = "px-3 py-1 text-xs rounded-full font-medium";

    if (status === "published")
      return `${base} bg-green-100 text-green-700`;

    if (status === "scheduled")
      return `${base} bg-yellow-100 text-yellow-700`;

    return `${base} bg-slate-200 text-slate-700`;
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const postsRes = await api.get("/posts");
      const campaignsRes = await api.get("/campaigns");
      const analyticsRes = await api.get("/analytics");

      const posts = postsRes.data.data;
      const campaigns = campaignsRes.data.data;

      // Overview Cards
      setTotalPosts(posts.length);
      setScheduledPosts(posts.filter(p => p.status === "scheduled").length);
      setPublishedPosts(posts.filter(p => p.status === "published").length);
      setTotalCampaigns(campaigns.length);

      // 🔐 Only ADMIN can access users
      if (user?.role === "ADMIN") {
        const usersRes = await api.get("/users");
        setTotalMembers(usersRes.data.data.length);
      }

      // Campaign Summary

      const today = new Date();

      const activeCount = campaigns.filter(campaign => {
        const start = new Date(campaign.start_date);
        const end = new Date(campaign.end_date);

        return today >= start && today <= end;
      }).length;

      const upcomingCount = campaigns.filter(campaign => {
        const start = new Date(campaign.start_date);
        return today < start;
      }).length;

      const completedCount = campaigns.filter(campaign => {
        const end = new Date(campaign.end_date);
        return today > end;
      }).length;

      setActiveCount(activeCount);
      setUpcomingCount(upcomingCount);
      setCompletedCount(completedCount);

      // Recent Posts

      setRecentPosts(
        posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5)
      );

      // Analytics

      setAnalytics(analyticsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalLikes = analytics.reduce((a, b) => a + b.likes, 0);
  const totalComments = analytics.reduce((a, b) => a + b.comments, 0);
  const totalShares = analytics.reduce((a, b) => a + b.shares, 0);

  const avgEngagement =
    analytics.length > 0
      ? (
        analytics.reduce((a, b) => a + b.engagement_rate, 0) /
        analytics.length
      ).toFixed(2)
      : 0;

  const chartData = {
    labels: analytics.map(a => a.posts?.caption || "Post"),
    datasets: [
      {
        label: "Engagement",
        data: analytics.map(a => a.likes + a.comments + a.shares),
        backgroundColor: "#6366f1",
        borderRadius: 6,
      },
    ],
  };

  const cardStyle =
    "bg-white border border-slate-200 shadow-sm hover:shadow-md transition rounded-xl p-6";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-500">Loading dashboard...</p>
      </div>
    );
  }
  return (
    <div className="space-y-10">

      {/* 🔹 Overview */}

      <div>
        <h2 className="text-xl font-semibold text-slate-800 mb-6">
          Overview
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          <StatCard title="Total Posts" value={totalPosts} icon={<FileText />} color="indigo" />
          <StatCard title="Published Posts" value={publishedPosts} icon={<Send />} color="green" />
          <StatCard title="Scheduled Posts" value={scheduledPosts} icon={<Calendar />} color="yellow" />
          <StatCard title="Total Campaigns" value={totalCampaigns} icon={<Megaphone />} color="blue" />

          {user?.role === "ADMIN" && (
            <StatCard title="Total Members" value={totalMembers} icon={<FileText />} color="purple" />
          )}

        </div>
      </div>

      <h2 className="text-xl font-semibold text-slate-700 mb-4">
        Campaign Summary
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
        <StatCard title="Active" value={activeCount} icon={<Activity />} color="green" />
        <StatCard title="Upcoming" value={upcomingCount} icon={<Clock />} color="blue" />
        <StatCard title="Completed" value={completedCount} icon={<CheckCircle />} color="gray" />
      </div>

      {/* 🔹 Engagement */}

      <div>
        <h2 className="text-xl font-semibold text-slate-800 mb-6">
          Engagement Summary
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          <StatCard title="Total Likes" value={totalLikes} icon={<Heart />} color="rose" />
          <StatCard title="Comments" value={totalComments} icon={<MessageCircle />} color="green" />
          <StatCard title="Shares" value={totalShares} icon={<Share2 />} color="orange" />
          <StatCard title="Avg Engagement %" value={`${avgEngagement}%`} icon={<FileText />} color="indigo" />
        </div>
      </div>

      {/* 🔹 Chart + Recent Posts */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
        <div className={cardStyle}>
          <h3 className="font-semibold text-slate-800 mb-4">
            Engagement Insights
          </h3>
          <div className="relative w-full h-64 overflow-hidden">
            <Bar data={chartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div className={cardStyle}>
          <h3 className="font-semibold text-slate-800 mb-4">
            Recent Posts
          </h3>

          {recentPosts.length === 0 ? (
            <p className="text-slate-500">No recent posts.</p>
          ) : (
            <div className="space-y-4">
              {recentPosts.map(post => (
                <div
                  key={post.id}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border-b pb-3 last:border-none wrap-break-word"                >
                  <div>
                    <p className="font-medium text-slate-800 wrap-break-word max-w-full">
                      {post.caption || "Untitled Post"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {post.platform}
                    </p>
                  </div>

                  <span className={`${getStatusBadge(post.status)} self-start w-fit`}>
                    {post.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const colors = {
    indigo: "bg-indigo-100 text-indigo-600",
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-600",
    blue: "bg-blue-100 text-blue-600",
    rose: "bg-rose-100 text-rose-600",
    orange: "bg-orange-100 text-orange-600",
    purple: "bg-purple-100 text-purple-600",
    gray: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition rounded-xl p-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          {React.cloneElement(icon, { size: 24 })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;