import { useEffect, useState } from "react";
import api from "../services/api";
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    ArcElement,
    Tooltip,
    Legend,
    LineElement,
    PointElement
} from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";

ChartJS.register(
    BarElement,
    CategoryScale,
    LinearScale,
    ArcElement,
    Tooltip,
    Legend,
    LineElement,
    PointElement
);

const Analytics = () => {
    const [analytics, setAnalytics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const fetchAnalytics = async () => {
        try {
            let params = [];

            if (startDate) params.push(`startDate=${startDate}`);
            if (endDate) params.push(`endDate=${endDate}`);
            const url =
                params.length > 0
                    ? `/analytics?${params.join("&")}`
                    : "/analytics";

            const response = await api.get(url);
            setAnalytics(response.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const clearFilter = () => {
        setStartDate("");
        setEndDate("");
    }

    useEffect(() => {
        fetchAnalytics();
    }, []);

    if (loading) return <p>Loading analytics...</p>;

    // Totals

    const totalLikes = analytics.reduce((acc, curr) => acc + curr.likes, 0);
    const totalComments = analytics.reduce((acc, curr) => acc + curr.comments, 0);
    const totalShares = analytics.reduce((acc, curr) => acc + curr.shares, 0);

    // Platform-wise Analytics (FB vs Instagram)

    const platformStats = analytics.reduce(
        (acc, curr) => {
            const platform = curr.posts?.platform || "Unknown";

            if (!acc[platform]) {
                acc[platform] = {
                    likes: 0,
                    comments: 0,
                    shares: 0,
                };
            }

            acc[platform].likes += curr.likes;
            acc[platform].comments += curr.comments;
            acc[platform].shares += curr.shares;

            return acc;
        },
        {}
    );

    // Bar Chart Data

    const barData = {
        labels: analytics.map((a) => a.posts?.caption || "Untitled"),
        datasets: [
            {
                label: "Likes",
                data: analytics.map((a) => a.likes),
                backgroundColor: "#4f46e5",
            },
            {
                label: "Comments",
                data: analytics.map((a) => a.comments),
                backgroundColor: "#22c55e",
            },
            {
                label: "Shares",
                data: analytics.map((a) => a.shares),
                backgroundColor: "#f97316",
            },
        ],
    };

    // Pie Chart Data

    const pieData = {
        labels: ["Likes", "Comments", "Shares"],
        datasets: [
            {
                data: [totalLikes, totalComments, totalShares],
                backgroundColor: ["#4f46e5", "#22c55e", "#f97316"],
            },
        ],
    };

    // Line Chart Data

    const lineData = {
        labels: analytics.map((a) =>
            new Date(a.created_at).toLocaleDateString()
        ),
        datasets: [
            {
                label: "Engagement Rate",
                data: analytics.map((a) => a.engagement_rate),
                borderColor: "#4f46e5",
                fill: false,
                tension: 0.3,
            },
        ],
    };


    //Platform Bar Chart Data

    const platformBarData = {
        labels: Object.keys(platformStats),
        datasets: [
            {
                label: "Likes",
                data: Object.values(platformStats).map((p) => p.likes),
                backgroundColor: "#4f46e5",
            },
            {
                label: "Comments",
                data: Object.values(platformStats).map((p) => p.comments),
                backgroundColor: "#22c55e",
            },
            {
                label: "Shares",
                data: Object.values(platformStats).map((p) => p.shares),
                backgroundColor: "#f97316",
            },
        ],
    };

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top",
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: "#f1f5f9",
                },
            },
        },
    };

    return (
        <div className="space-y-8 overflow-x-hidden">
            <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
            <div className="bg-white shadow rounded-lg p-4 flex flex-wrap gap-4 items-end">
                <div className="w-full sm:w-auto">
                    <label className="block text-sm font-medium mb-1">
                        Start Date
                    </label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full border rounded-md px-3 py-2"
                    />
                </div>

                <div className="w-full sm:w-auto">
                    <label className="block text-sm font-medium mb-1">
                        End Date
                    </label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full border rounded-md px-3 py-2"
                    />
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={fetchAnalytics}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                    >
                        Apply Filter
                    </button>

                    <button
                        onClick={clearFilter}
                        className="bg-slate-300 px-4 py-2 rounded-md hover:bg-slate-400 hover:text-white"
                    >
                        Clear Filter
                    </button>
                </div>

            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
                <div className="bg-white shadow rounded-lg p-6">
                    <p className="text-sm text-slate-500">Total Likes</p>
                    <p className="text-3xl font-bold text-indigo-600 mt-2">
                        {totalLikes}
                    </p>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <p className="text-sm text-slate-500">Total Comments</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                        {totalComments}
                    </p>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <p className="text-sm text-slate-500">Total Shares</p>
                    <p className="text-3xl font-bold text-orange-500 mt-2">
                        {totalShares}
                    </p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
                <div className="bg-white shadow rounded-lg p-6 border border-slate-100">
                    <h2 className="mb-4 font-semibold">
                        Post Engagement
                    </h2>

                    <div className="relative w-full h-72 overflow-hidden">
                        <Bar
                            data={barData}
                            options={{
                                ...commonOptions,
                            }}
                        />
                    </div>
                </div>
                <div className="bg-white shadow rounded-lg p-6 border border-slate-100">
                    <h2 className="mb-4 font-semibold">
                        Engagement Distribution
                    </h2>

                    <div className="relative w-full h-72 overflow-hidden">
                        <Pie
                            data={pieData}
                            options={{
                                ...commonOptions,
                            }}
                        />
                    </div>
                </div>
                <div className="bg-white shadow rounded-lg p-6 border border-slate-100">
                    <h2 className="mb-4 font-semibold">
                        Engagement Growth Over Time
                    </h2>

                    <div className="relative w-full h-72 overflow-hidden">
                        <Line
                            data={lineData}
                            options={{
                                ...commonOptions,
                            }}
                        />
                    </div>
                </div>
                <div className="bg-white shadow rounded-lg p-6 border border-slate-100">
                    <h2 className="mb-4 font-semibold">
                        Platform-wise Performance (Facebook vs Instagram)
                    </h2>

                    <div className="relative w-full h-72 overflow-hidden">
                        <Bar
                            data={platformBarData}
                            options={{
                                ...commonOptions,
                            }}
                        />
                    </div>
                </div>

            </div>
            {/* Platform Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {Object.entries(platformStats).map(([platform, stats]) => {
                    const total = stats.likes + stats.comments + stats.shares;

                    return (
                        <div
                            key={platform}
                            className="bg-white shadow rounded-xl p-6 border border-slate-100"
                        >
                            <h3 className="text-lg font-semibold mb-3">
                                {platform}
                            </h3>

                            <div className="space-y-1 text-sm text-slate-600">
                                <p>Likes: <span className="font-medium">{stats.likes}</span></p>
                                <p>Comments: <span className="font-medium">{stats.comments}</span></p>
                                <p>Shares: <span className="font-medium">{stats.shares}</span></p>
                            </div>

                            <div className="mt-4 text-2xl font-bold text-indigo-600">
                                {total}
                                <span className="text-sm font-normal text-slate-500 ml-1">
                                    Total Engagement
                                </span>
                            </div>
                        </div>
                    );
                })}

            </div>
        </div>
    );
};

export default Analytics;