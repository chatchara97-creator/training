/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { FilterBar } from './components/FilterBar';
import { CalendarView } from './components/CalendarView';
import { AdminDashboard } from './components/AdminDashboard';
import { EventModal } from './components/EventModal';
import { EventDetailsModal } from './components/EventDetailsModal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { CMTESummaryCard } from './components/CMTESummaryCard';
import { ListView } from './components/ListView';
import { AuthModal } from './components/AuthModal';
import { PrintReportModal } from './components/PrintReportModal';
import { LoginScreen } from './components/LoginScreen';

import {
  ScheduledEvent,
  User,
  FilterState,
} from './types';

import {
  getCurrentUser,
  setCurrentUser,
  getRegisteredUsers,
  initAuth,
  getAccessToken,
} from './services/auth';

import {
  getAllStoredEvents,
  getVisibleEvents,
  filterEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  setEventApproval,
} from './services/storage';

import { getSavedSheetInfo } from './services/sheets';

export default function App() {
  const [currentUser, setAppStateUser] = useState<User | null>(() => getCurrentUser());
  const [allUsers, setAllUsers] = useState<User[]>(() => getRegisteredUsers());
  const [allEvents, setAllEvents] = useState<ScheduledEvent[]>(() => getAllStoredEvents());
  const [activeTab, setActiveTab] = useState<'calendar' | 'admin' | 'list'>('calendar');

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    type: 'all',
    category: 'all',
    format: 'all',
    status: 'all',
    userId: 'all',
    month: selectedMonth,
    year: selectedYear,
  });

  // Modal States
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduledEvent | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<ScheduledEvent | null>(null);
  const [modalDefaultDate, setModalDefaultDate] = useState<string | null>(null);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [isSheetsConnected, setIsSheetsConnected] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot' | 'inbox'>('login');

  // Initialize auth listener
  useEffect(() => {
    initAuth(
      (_firebaseUser, token) => {
        setIsSheetsConnected(!!token);
      },
      () => {
        setIsSheetsConnected(false);
      }
    );

    // Check if sheets was previously connected
    const saved = getSavedSheetInfo();
    if (saved) {
      setIsSheetsConnected(true);
    }
  }, []);

  const handleUserChange = (newUser: User) => {
    setCurrentUser(newUser);
    setAppStateUser(newUser);
    // If switching to standard user while on admin tab, switch to calendar tab
    if (newUser.role !== 'admin' && activeTab === 'admin') {
      setActiveTab('calendar');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAppStateUser(null);
    setActiveTab('calendar');
  };

  // Fresh Login Requirement: When not logged in, render dedicated Login Portal
  if (!currentUser) {
    return (
      <LoginScreen
        onLoginSuccess={(user) => {
          handleUserChange(user);
          setAllUsers(getRegisteredUsers());
        }}
      />
    );
  }

  // RBAC Filter: Standard users see ONLY their own events or events they attend
  const visibleEvents = getVisibleEvents(currentUser, allEvents);
  const filteredEvents = filterEvents(visibleEvents, filters);
  const pendingApprovalsCount = allEvents.filter((e) => e.status === 'pending').length;

  const handleOpenNewEvent = (prefillDate?: string) => {
    setEditingEvent(null);
    setModalDefaultDate(prefillDate || null);
    setIsEventModalOpen(true);
  };

  const handleOpenEditEvent = (event: ScheduledEvent) => {
    setEditingEvent(event);
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = (data: any) => {
    if (editingEvent) {
      const updated = updateEvent(currentUser, editingEvent.id, data);
      if (updated) {
        setAllEvents(getAllStoredEvents());
      }
    } else {
      createEvent(currentUser, data);
      setAllEvents(getAllStoredEvents());
    }
    setIsEventModalOpen(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = (eventId: string) => {
    deleteEvent(currentUser, eventId);
    setAllEvents(getAllStoredEvents());
    if (selectedEvent?.id === eventId) {
      setSelectedEvent(null);
    }
  };

  const handleApproveEvent = (eventId: string) => {
    if (currentUser.role === 'admin') {
      setEventApproval(currentUser, eventId, 'approved');
      setAllEvents(getAllStoredEvents());
    }
  };

  const handleRejectEvent = (eventId: string) => {
    if (currentUser.role === 'admin') {
      setEventApproval(currentUser, eventId, 'rejected');
      setAllEvents(getAllStoredEvents());
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col antialiased">
      {/* Navbar with RBAC Switcher & Google Sheets connection */}
      <Navbar
        currentUser={currentUser}
        onSelectUser={handleUserChange}
        onLogout={handleLogout}
        onOpenNewEventModal={() => handleOpenNewEvent()}
        onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
        onOpenPrintModal={() => setIsPrintModalOpen(true)}
        onOpenAuthModal={(mode) => {
          setAuthModalMode(mode);
          setIsAuthModalOpen(true);
        }}
        isSheetsConnected={isSheetsConnected}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingApprovalsCount={pendingApprovalsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* CMTE Credits Banner for Current User */}
        <CMTESummaryCard currentUser={currentUser} events={allEvents} />

        {/* Dynamic Tab Views */}
        {activeTab === 'admin' && currentUser.role === 'admin' ? (
          <AdminDashboard
            adminUser={currentUser}
            allEvents={allEvents}
            allUsers={allUsers}
            onApproveEvent={handleApproveEvent}
            onRejectEvent={handleRejectEvent}
            onEditEvent={handleOpenEditEvent}
            onDeleteEvent={handleDeleteEvent}
            onViewEventDetails={(ev) => setSelectedEvent(ev)}
            onOpenSheetsExport={() => setIsSheetsModalOpen(true)}
            onOpenPrintReport={() => setIsPrintModalOpen(true)}
          />
        ) : (
          <>
            {/* Filter & Search Bar */}
            <FilterBar
              filters={filters}
              setFilters={setFilters}
              currentUser={currentUser}
              allUsers={allUsers}
              totalVisibleCount={filteredEvents.length}
            />

            {activeTab === 'calendar' ? (
              <CalendarView
                events={filteredEvents}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                onChangeMonth={(m, y) => {
                  setSelectedMonth(m);
                  setSelectedYear(y);
                }}
                onSelectEvent={(ev) => setSelectedEvent(ev)}
                onOpenCreateWithDate={(dateStr) => handleOpenNewEvent(dateStr)}
              />
            ) : (
              <ListView
                events={filteredEvents}
                currentUser={currentUser}
                onSelectEvent={(ev) => setSelectedEvent(ev)}
                onEditEvent={handleOpenEditEvent}
                onDeleteEvent={handleDeleteEvent}
                onOpenCreateModal={() => handleOpenNewEvent()}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>MedTechLab</strong> (สถาบันมะเร็งแห่งชาติ) — ระบบบันทึกวันประชุม อบรม สัมมนา พร้อมระบบแบ่งสิทธิ์ (RBAC) & CMTE
          </div>
          <div className="text-slate-400">
            Current User: <span className="font-semibold text-slate-600">{currentUser.name}</span> ({currentUser.role})
          </div>
        </div>
      </footer>

      {/* Add / Edit Event Modal */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleSaveEvent}
        editingEvent={editingEvent}
        currentUser={currentUser}
        allUsers={allUsers}
        defaultDate={modalDefaultDate}
      />

      {/* Event Details Modal */}
      <EventDetailsModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        currentUser={currentUser}
        allUsers={allUsers}
        onEdit={handleOpenEditEvent}
        onDelete={handleDeleteEvent}
        onApprove={handleApproveEvent}
        onReject={handleRejectEvent}
      />

      {/* Google Sheets Sync & Export Modal */}
      <GoogleSheetsModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        currentUser={currentUser}
        eventsToExport={currentUser.role === 'admin' ? allEvents : visibleEvents}
        isAdmin={currentUser.role === 'admin'}
      />

      {/* Official Quality Document Print Report Modal (FM-ACA-MT-08023-01) */}
      <PrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        currentUser={currentUser}
        events={currentUser.role === 'admin' ? allEvents : visibleEvents}
        isAdmin={currentUser.role === 'admin'}
      />

      {/* Email & Password Authentication & Password Reset Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onAuthSuccess={(user) => {
          handleUserChange(user);
          setAllUsers(getRegisteredUsers());
        }}
      />
    </div>
  );
}
