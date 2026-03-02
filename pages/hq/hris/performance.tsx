import { useState, useEffect } from 'react';
import HQLayout from '@/components/hq/HQLayout';
import { 
  Star, TrendingUp, TrendingDown, Award, Users, 
  Building2, Calendar, Filter, Download, Search,
  ChevronRight, BarChart3, Target, MessageSquare
} from 'lucide-react';

interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  position: string;
  branchName: string;
  department: string;
  reviewPeriod: string;
  reviewDate: string;
  reviewer: string;
  overallRating: number;
  categories: {
    name: string;
    rating: number;
    weight: number;
    comments: string;
  }[];
  strengths: string[];
  areasForImprovement: string[];
  goals: string[];
  status: 'draft' | 'submitted' | 'reviewed' | 'acknowledged';
}


export default function PerformancePage() {
  const [mounted, setMounted] = useState(false);
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/hq/hris/performance');
      if (response.ok) {
        const json = await response.json();
        const payload = json.data || json;
        setReviews(payload.reviews || []);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error('Failed to fetch performance reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  if (!mounted) return null;

  const avgRating = reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length || 0;
  const excellentPerformers = reviews.filter(r => r.overallRating >= 4.5).length;
  const needsImprovement = reviews.filter(r => r.overallRating < 3.5).length;

  const filteredReviews = reviews.filter(r => {
    const matchSearch = r.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       r.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPeriod = periodFilter === 'all' || r.reviewPeriod === periodFilter;
    return matchSearch && matchPeriod;
  });

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600 bg-green-100';
    if (rating >= 3.5) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'acknowledged': return <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">Acknowledged</span>;
      case 'reviewed': return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">Reviewed</span>;
      case 'submitted': return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">Submitted</span>;
      case 'draft': return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">Draft</span>;
      default: return null;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <HQLayout title="Performance Review" subtitle="Evaluasi dan penilaian kinerja karyawan">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Review</p>
                <p className="text-xl font-bold">{reviews.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Rata-rata Rating</p>
                <p className="text-xl font-bold">{avgRating.toFixed(1)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Award className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Excellent Performers</p>
                <p className="text-xl font-bold">{excellentPerformers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Needs Improvement</p>
                <p className="text-xl font-bold">{needsImprovement}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                + Buat Review Baru
              </button>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari karyawan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border rounded-lg text-sm w-48"
                />
              </div>
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="all">Semua Periode</option>
                <option value="Q4 2025">Q4 2025</option>
                <option value="Q3 2025">Q3 2025</option>
                <option value="Q2 2025">Q2 2025</option>
              </select>
              <button className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReviews.map((review) => (
            <div 
              key={review.id} 
              className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-all cursor-pointer"
              onClick={() => setSelectedReview(review)}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold">{review.employeeName}</h3>
                  <p className="text-sm text-gray-500">{review.position}</p>
                  <p className="text-xs text-gray-400">{review.branchName}</p>
                </div>
                <div className={`px-3 py-1 rounded-lg text-lg font-bold ${getRatingColor(review.overallRating)}`}>
                  {review.overallRating.toFixed(1)}
                </div>
              </div>

              <div className="mb-3">
                {renderStars(review.overallRating)}
              </div>

              <div className="space-y-2 mb-4">
                {review.categories.slice(0, 3).map((cat, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-600">{cat.name}</span>
                    <span className="font-medium">{cat.rating}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <div className="text-xs text-gray-500">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  {review.reviewPeriod}
                </div>
                {getStatusBadge(review.status)}
              </div>
            </div>
          ))}
        </div>

        {/* Detail Modal */}
        {selectedReview && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4">
              <div className="p-6 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold">{selectedReview.employeeName}</h3>
                    <p className="text-gray-500">{selectedReview.position} • {selectedReview.branchName}</p>
                    <p className="text-sm text-gray-400">Review: {selectedReview.reviewPeriod}</p>
                  </div>
                  <button onClick={() => setSelectedReview(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className={`text-4xl font-bold ${getRatingColor(selectedReview.overallRating).split(' ')[0]}`}>
                    {selectedReview.overallRating.toFixed(1)}
                  </div>
                  <div>
                    {renderStars(selectedReview.overallRating)}
                    <p className="text-sm text-gray-500 mt-1">Overall Rating</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Kategori Penilaian</h4>
                  <div className="space-y-3">
                    {selectedReview.categories.map((cat, i) => (
                      <div key={i} className="border rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{cat.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Bobot: {cat.weight}%</span>
                            <span className={`px-2 py-1 rounded text-sm font-medium ${getRatingColor(cat.rating)}`}>
                              {cat.rating}
                            </span>
                          </div>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${cat.rating >= 4 ? 'bg-green-500' : cat.rating >= 3 ? 'bg-yellow-500' : 'bg-red-500'} rounded-full`}
                            style={{ width: `${(cat.rating / 5) * 100}%` }}
                          />
                        </div>
                        <p className="text-sm text-gray-500 mt-2">{cat.comments}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-green-700 mb-2">Kekuatan</h4>
                    <ul className="text-sm space-y-1">
                      {selectedReview.strengths.map((s, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <h4 className="font-semibold text-orange-700 mb-2">Area Perbaikan</h4>
                    <ul className="text-sm space-y-1">
                      {selectedReview.areasForImprovement.map((s, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-700 mb-2">Goals & Objectives</h4>
                  <ul className="text-sm space-y-1">
                    {selectedReview.goals.map((g, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-500" />
                        {g}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">Export PDF</button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Edit Review</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </HQLayout>
  );
}
