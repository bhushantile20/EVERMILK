import { useEffect, useState } from 'react'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from 'recharts'
import { api } from '../../app/apiClient'

const STATUS_COLORS = {
    pending: '#F59E0B',
    confirmed: '#3B82F6',
    shipped: '#8B5CF6',
    delivered: '#10B981',
    cancelled: '#EF4444',
}

const KpiCard = ({ label, value, sub, color = 'green', icon }) => {
    const colorMap = {
        green: 'bg-green-50 text-green-700 ring-green-500/20',
        blue: 'bg-blue-50 text-blue-700 ring-blue-500/20',
        amber: 'bg-amber-50 text-amber-700 ring-amber-500/20',
        rose: 'bg-rose-50 text-rose-700 ring-rose-500/20',
    }
    const iconColorMap = {
        green: 'bg-green-100 text-green-600',
        blue: 'bg-blue-100 text-blue-600',
        amber: 'bg-amber-100 text-amber-600',
        rose: 'bg-rose-100 text-rose-600',
    }
    return (
        <div className={`rounded-2xl bg-white p-6 shadow-sm border border-gray-100 relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1`}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">{label}</p>
                    <p className="mt-2 text-3xl font-extrabold text-gray-900">{value}</p>
                </div>
                <div className={`p-3 rounded-xl ${iconColorMap[color]}`}>
                    <span className="text-xl">{icon}</span>
                </div>
            </div>
            {sub && <div className={`inline-flex px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset ${colorMap[color]}`}>{sub}</div>}
        </div>
    )
}

export default function AdminAnalyticsPage() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const run = async () => {
            setLoading(true)
            setError('')
            try {
                const res = await api.get('/api/admin/analytics/')
                setData(res.data)
            } catch (e) {
                setError('Failed to load analytics')
            } finally {
                setLoading(false)
            }
        }
        run()
    }, [])

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="flex flex-col items-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-100 border-t-green-600 mb-4" />
                    <p className="text-gray-500 font-medium tracking-wide">Loading Analytics...</p>
                </div>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center max-w-2xl mx-auto mt-8">
                <div className="mx-auto w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <p className="text-lg font-bold text-gray-900">{error || 'No data available'}</p>
            </div>
        )
    }

    const { totals, monthly, daily_chart, orders_by_status } = data

    const pieData = orders_by_status.map((s) => ({
        name: s.status.charAt(0).toUpperCase() + s.status.slice(1),
        value: s.count,
        color: STATUS_COLORS[s.status] || '#94A3B8',
    }))

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">📊 Revenue Analytics</h1>
                    <p className="text-sm text-gray-500 mt-2">
                        Platform overview and last 30-day performance.
                    </p>
                </div>
                <div className="text-sm font-bold text-gray-500 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                    Last Updated: Just now
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                    label="Total Revenue"
                    value={`₹${Number(totals.total_revenue).toLocaleString()}`}
                    sub="All time"
                    color="green"
                    icon="💰"
                />
                <KpiCard
                    label="Total Orders"
                    value={totals.total_orders}
                    sub={`${monthly.orders} this month`}
                    color="blue"
                    icon="📦"
                />
                <KpiCard
                    label="Pending Orders"
                    value={totals.pending_orders}
                    sub="Awaiting action"
                    color="amber"
                    icon="⏳"
                />
                <KpiCard
                    label="Cancelled"
                    value={totals.cancelled_orders}
                    sub="All time"
                    color="rose"
                    icon="❌"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Revenue Line Chart */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-lg font-bold text-gray-900">Daily Revenue</h2>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50 px-3 py-1 rounded-md">Last 30 Days</span>
                        </div>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={daily_chart} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#16A34A" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#64748B', fontWeight: 500 }}
                                        dy={10}
                                        interval={4}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#64748B', fontWeight: 500 }}
                                        tickFormatter={(v) => `₹${v}`}
                                        dx={-10}
                                    />
                                    <Tooltip
                                        formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                                        contentStyle={{
                                            borderRadius: '16px',
                                            border: 'none',
                                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                                            padding: '12px 16px',
                                            fontWeight: 'bold',
                                            color: '#0F172A'
                                        }}
                                        itemStyle={{ color: '#16A34A' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#16A34A"
                                        strokeWidth={3}
                                        dot={false}
                                        activeDot={{ r: 6, fill: '#16A34A', stroke: '#fff', strokeWidth: 2 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Sidebar Metrics */}
                <div className="space-y-8">

                    {/* Monthly highlight */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 relative overflow-hidden group">
                        <div className="relative z-10">
                            <p className="text-xs font-extrabold text-green-600 uppercase tracking-widest mb-1">Monthly Snapshot</p>
                            <h3 className="text-4xl font-extrabold text-gray-900 tracking-tight mt-2 mb-1">
                                ₹{Number(monthly.revenue).toLocaleString()}
                            </h3>
                            <p className="text-sm font-semibold text-gray-500">{monthly.orders} successful orders</p>
                        </div>
                        <div className="absolute -right-4 -bottom-4 text-8xl opacity-10 group-hover:scale-110 transition-transform duration-500">
                            🌿
                        </div>
                    </div>

                    {/* Orders by status */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">Status Breakdown</h2>

                        {pieData.length > 0 ? (
                            <div className="h-[200px] mb-6">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {pieData.map((entry, idx) => (
                                                <Cell key={idx} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value, name) => [value, name]}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', fontWeight: 'bold' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-10 outline-dashed outline-1 outline-gray-200 rounded-xl mb-6">No order data yet.</p>
                        )}

                        <div className="space-y-3">
                            {orders_by_status.map((s) => (
                                <div key={s.status} className="flex items-center justify-between rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <span
                                            className="h-3 w-3 rounded-full shadow-sm"
                                            style={{ backgroundColor: STATUS_COLORS[s.status] || '#94A3B8' }}
                                        />
                                        <span className="text-sm font-extrabold text-gray-700 capitalize tracking-wide">
                                            {s.status}
                                        </span>
                                    </div>
                                    <span className="text-sm font-black text-gray-900 bg-white px-2 py-0.5 rounded-md shadow-sm border border-gray-100">{s.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
