import { useState, useEffect } from "react";
import api from "../api/axios";

export default function UserAnalytics({ userId, userName, onClose }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState(30); // days

  useEffect(() => {
    if (userId) {
      fetchAnalytics();
    }
  }, [userId, period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get(`/admin/users/${userId}/analytics?days=${period}`);
      setAnalytics(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch analytics");
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const getActionTypeLabel = (actionType) => {
    const labels = {
      CONTACT_LOG: "Contacts Logged",
      IMPORT_CONTACTS: "Imports",
      ADD_REQUIREMENT: "Requirements Added",
      UPDATE_CONTACT: "Contacts Updated",
      DELETE_CONTACT: "Contacts Deleted"
    };
    return labels[actionType] || actionType;
  };

  const getActionTypeIcon = (actionType) => {
    const icons = {
      CONTACT_LOG: "📞",
      IMPORT_CONTACTS: "📥",
      ADD_REQUIREMENT: "📋",
      UPDATE_CONTACT: "✏️",
      DELETE_CONTACT: "🗑️"
    };
    return icons[actionType] || "📊";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Group daily activities by date
  const groupedDailyActivity = analytics?.dailyActivity?.reduce((acc, item) => {
    if (!acc[item.date]) {
      acc[item.date] = [];
    }
    acc[item.date].push(item);
    return acc;
  }, {}) || {};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">User Analytics</h2>
            <p className="text-blue-100 text-sm mt-1">{userName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Period Selector */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Time Period:</label>
            <select
              value={period}
              onChange={(e) => setPeriod(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
              <option value={60}>Last 60 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-600">Loading analytics...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
            </div>
          ) : analytics ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                  <div className="text-blue-600 text-sm font-medium mb-1">Total Activities</div>
                  <div className="text-3xl font-bold text-blue-900">{analytics.summary.totalActivities}</div>
                  <div className="text-blue-600 text-xs mt-1">Last {period} days</div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                  <div className="text-green-600 text-sm font-medium mb-1">Contacts Touched</div>
                  <div className="text-3xl font-bold text-green-900">{analytics.summary.contactsTouched}</div>
                  <div className="text-green-600 text-xs mt-1">Unique contacts</div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                  <div className="text-purple-600 text-sm font-medium mb-1">Activity Types</div>
                  <div className="text-3xl font-bold text-purple-900">{analytics.summary.byActionType.length}</div>
                  <div className="text-purple-600 text-xs mt-1">Different actions</div>
                </div>
              </div>

              {/* Activity Breakdown by Type */}
              {analytics.summary.byActionType.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Activity Breakdown</h3>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {analytics.summary.byActionType.map((item) => (
                        <div key={item.action_type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{getActionTypeIcon(item.action_type)}</span>
                            <div>
                              <div className="font-medium text-gray-900">{getActionTypeLabel(item.action_type)}</div>
                              <div className="text-xs text-gray-500">Last: {formatDateTime(item.last_activity)}</div>
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-blue-600">{item.count}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Daily Activity */}
              {Object.keys(groupedDailyActivity).length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Daily Activity</h3>
                  </div>
                  <div className="p-4 max-h-64 overflow-y-auto">
                    <div className="space-y-3">
                      {Object.entries(groupedDailyActivity).map(([date, activities]) => (
                        <div key={date} className="border-l-4 border-blue-500 pl-4 py-2">
                          <div className="font-semibold text-gray-900 mb-2">{formatDate(date)}</div>
                          <div className="grid grid-cols-2 gap-2">
                            {activities.map((activity, idx) => (
                              <div key={idx} className="text-sm text-gray-600 flex justify-between">
                                <span>{getActionTypeLabel(activity.action_type)}</span>
                                <span className="font-semibold text-blue-600">{activity.count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Activities */}
              {analytics.recentActivities.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Recent Activities</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    <div className="divide-y divide-gray-100">
                      {analytics.recentActivities.map((activity) => (
                        <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-lg">{getActionTypeIcon(activity.action_type)}</span>
                                <span className="font-medium text-gray-900">{getActionTypeLabel(activity.action_type)}</span>
                              </div>
                              <p className="text-sm text-gray-600 ml-7">{activity.action_description}</p>
                              {activity.contact_name && (
                                <p className="text-xs text-gray-500 ml-7 mt-1">Contact: {activity.contact_name}</p>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 whitespace-nowrap ml-4">
                              {formatDateTime(activity.created_at)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* No Activity Message */}
              {analytics.summary.totalActivities === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Activity Yet</h3>
                  <p className="text-gray-600">This user hasn't performed any tracked activities in the selected period.</p>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
