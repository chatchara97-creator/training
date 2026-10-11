import React from 'react';
import { Search, Filter, RotateCcw, UserCheck } from 'lucide-react';
import { FilterState, User } from '../types';

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  currentUser: User;
  allUsers: User[];
  totalVisibleCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  setFilters,
  currentUser,
  allUsers,
  totalVisibleCount,
}) => {
  const isAdmin = currentUser.role === 'admin';

  const handleReset = () => {
    setFilters((prev) => ({
      ...prev,
      searchQuery: '',
      type: 'all',
      category: 'all',
      format: 'all',
      status: 'all',
      userId: 'all',
    }));
  };

  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.type !== 'all' ||
    filters.category !== 'all' ||
    filters.format !== 'all' ||
    filters.status !== 'all' ||
    filters.userId !== 'all';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
            placeholder={
              isAdmin
                ? 'ค้นหาชื่อกิจกรรม, สถานที่, หรือชื่อผู้จัด...'
                : 'ค้นหาชื่อกิจกรรมของคุณ หรือสถานที่...'
            }
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
          <select
            value={filters.type}
            onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value as any }))}
            className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          >
            <option value="all">ทุกประเภทกิจกรรม</option>
            <option value="meeting">📋 การประชุม (Meeting)</option>
            <option value="training">🎓 การอบรม (Training)</option>
            <option value="seminar">🏛️ สัมมนา (Seminar)</option>
          </select>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value as any }))}
            className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          >
            <option value="all">ทุกด้านงาน (Category)</option>
            <option value="academic">🔬 ด้านวิชาการ (Academic)</option>
            <option value="quality">⭐ ด้านคุณภาพ (Quality/HA)</option>
            <option value="safety">🛡️ ด้านความปลอดภัย (Safety)</option>
            <option value="management">💼 ด้านบริหาร/ทั่วไป</option>
          </select>

          {/* Format Filter */}
          <select
            value={filters.format}
            onChange={(e) => setFilters((prev) => ({ ...prev, format: e.target.value as any }))}
            className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          >
            <option value="all">ทุกรูปแบบ (Onsite/Online)</option>
            <option value="onsite">🏢 ออนไซต์ (On-site)</option>
            <option value="online">💻 ออนไลน์ (Online)</option>
            <option value="hybrid">🌐 ไฮบริด (Hybrid)</option>
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value as any }))}
            className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          >
            <option value="all">ทุกสถานะ</option>
            <option value="approved">✅ อนุมัติแล้ว</option>
            <option value="pending">⏳ รออนุมัติ</option>
            <option value="rejected">❌ ไม่อนุมัติ</option>
          </select>

          {/* ADMIN ONLY: Filter by User */}
          {isAdmin && (
            <div className="flex items-center gap-1.5 bg-blue-50/80 border border-blue-200/90 px-2 py-1 rounded-xl">
              <UserCheck className="w-3.5 h-3.5 text-blue-900" />
              <select
                value={filters.userId}
                onChange={(e) => setFilters((prev) => ({ ...prev, userId: e.target.value }))}
                className="text-xs font-semibold bg-transparent text-blue-950 focus:outline-none cursor-pointer"
              >
                <option value="all">👤 บุคลากรทุกคน (Master)</option>
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role === 'admin' ? 'Admin' : 'User'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
              title="ล้างตัวกรอง"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ล้างตัวกรอง</span>
            </button>
          )}
        </div>
      </div>

      {/* Results status banner */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>
            แสดงกิจกรรมที่สอดคล้อง: <strong className="text-slate-800">{totalVisibleCount}</strong> รายการ
          </span>
          {!isAdmin && (
            <span className="text-[11px] bg-blue-50/80 text-blue-950 px-2.5 py-0.5 rounded-md font-semibold border border-blue-200/80">
              🔒 กรองเฉพาะกิจกรรมของคุณ (Data Privacy)
            </span>
          )}
          {isAdmin && filters.userId === 'all' && (
            <span className="text-[11px] bg-blue-950 text-white px-2.5 py-0.5 rounded-md font-semibold shadow-2xs">
              👑 แสดงกิจกรรมของทุกคนในองค์กร (Master Calendar)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
