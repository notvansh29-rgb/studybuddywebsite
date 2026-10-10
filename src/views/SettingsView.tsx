import React, { useState, useRef } from 'react';
import {
  User,
  CreditCard,
  Download,
  Upload,
  RotateCcw,
  Shield,
  Bell,
  Save,
  Check,
  Building2,
  Crown,
  FileSpreadsheet,
  ShieldCheck,
  LogIn,
} from 'lucide-react';
import { StudentProfile, SubscriptionTier } from '../types';
import { storage } from '../utils/storage';
import { triggerConfetti } from '../utils/confetti';
import { useAuth } from '../context/AuthContext';

interface SettingsViewProps {
  profile: StudentProfile;
  onUpdateProfile: (updated: StudentProfile) => void;
  onOpenSubscriptionModal: () => void;
  onOpenAuthModal: () => void;
  onResetAllData: () => void;
  onShowToast: (message: string, type: 'success' | 'info' | 'warning') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  onUpdateProfile,
  onOpenSubscriptionModal,
  onOpenAuthModal,
  onResetAllData,
  onShowToast,
}) => {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'billing' | 'data' | 'firebase'>('profile');

  // Form State
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [grade, setGrade] = useState(profile.grade);
  const [school, setSchool] = useState(profile.school);
  const [weeklyTargetHours, setWeeklyTargetHours] = useState(profile.weeklyTargetHours);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      name,
      email,
      grade,
      school,
      weeklyTargetHours,
      avatarUrl,
    });
    onShowToast('Profile settings updated successfully!', 'success');
  };

  const handleExportJson = () => {
    const backupJson = storage.exportFullBackup();
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StudyBuddy_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Full study backup downloaded successfully!', 'success');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = storage.importBackup(content);
        if (success) {
          onShowToast('Data imported successfully! Reloading...', 'success');
          setTimeout(() => {
            window.location.reload();
          }, 800);
        } else {
          onShowToast('Failed to import backup file. Invalid format.', 'warning');
        }
      }
    };
    reader.readAsText(file);
  };

  const handlePrintAcademicReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-900 sm:text-2xl flex items-center gap-2">
          <span>Settings & Workspace Preferences</span>
          <span className="rounded-lg bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
            SaaS Account
          </span>
        </h2>
        <p className="text-xs text-slate-500">
          Manage your personal profile, subscription tier, data exports, and study preferences.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {(
          [
            { id: 'profile', label: 'Student Profile', icon: User },
            { id: 'firebase', label: 'Firebase Account', icon: ShieldCheck },
            { id: 'billing', label: 'Billing & Plan', icon: CreditCard },
            { id: 'data', label: 'Data & Backups', icon: Download },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Profile Form */}
      {activeTab === 'profile' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm max-w-2xl">
          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <img
                src={avatarUrl}
                alt={name}
                className="h-16 w-16 rounded-2xl object-cover ring-4 ring-blue-500/10 shadow-xs"
              />
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-slate-500">
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full sm:w-80 rounded-xl border border-slate-200 p-2 text-xs text-slate-700 focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Grade / Section
                </label>
                <input
                  type="text"
                  required
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  School / Institution
                </label>
                <input
                  type="text"
                  required
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Weekly Target Study Hours
                </label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={weeklyTargetHours}
                  onChange={(e) => setWeeklyTargetHours(parseInt(e.target.value, 10) || 25)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
              >
                <Save className="h-4 w-4" /> Save Profile Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB: Firebase Account */}
      {activeTab === 'firebase' && (
        <div className="space-y-6 max-w-2xl">
          <div className="rounded-3xl border border-blue-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-200">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Firebase Cloud Integration</h3>
                  <p className="text-xs text-slate-500">Project ID: <span className="font-mono font-bold text-slate-700">studybuddy-da3b4</span></p>
                </div>
              </div>

              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live SDK
              </span>
            </div>

            {currentUser ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4 border border-slate-200">
                  <img
                    src={currentUser.photoURL || profile.avatarUrl}
                    alt={currentUser.displayName || ''}
                    className="h-12 w-12 rounded-xl object-cover ring-2 ring-emerald-500/20"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 text-sm">{currentUser.displayName || 'Firebase User'}</p>
                    <p className="text-xs text-slate-500 truncate">{currentUser.email || 'Anonymous Guest'}</p>
                    <p className="font-mono text-[10px] text-slate-400 mt-0.5 truncate">UID: {currentUser.uid}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Auth Provider</p>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {currentUser.providerData[0]?.providerId || 'firebase'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Database Sync</p>
                    <p className="font-semibold text-emerald-600 mt-0.5">Firestore Active</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={onOpenAuthModal}
                    className="flex-1 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-xs"
                  >
                    Manage Account
                  </button>
                  <button
                    onClick={async () => {
                      await logout();
                      onShowToast('Signed out of Firebase account', 'info');
                    }}
                    className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-center py-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
                  <LogIn className="h-7 w-7" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Not Signed In to Firebase</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Sign in with your Google account or email to link your study timetable, homework, and quiz marks to your Firebase profile.
                  </p>
                </div>

                <button
                  onClick={onOpenAuthModal}
                  className="rounded-2xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all"
                >
                  Sign In with Firebase / Google
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Billing & Plan */}
      {activeTab === 'billing' && (
        <div className="space-y-6 max-w-3xl">
          {/* Active Plan Card */}
          <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/50 p-6 shadow-sm flex flex-col justify-between sm:flex-row sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Current Plan
                </span>
                <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-black text-white">
                  {profile.tier} Student Tier
                </span>
              </div>
              <h3 className="mt-2 text-xl font-black text-slate-900">
                StudyBuddy {profile.tier} Subscription
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Unlimited AI quiz generation, automated spaced repetition, and lecture cheatsheets enabled.
              </p>
            </div>

            <button
              onClick={onOpenSubscriptionModal}
              className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:scale-102 transition-all whitespace-nowrap"
            >
              Change / Upgrade Plan
            </button>
          </div>

          {/* Billing Invoices Table */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
            <h4 className="font-bold text-slate-900 text-sm mb-4">Billing History & Invoices</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold uppercase text-slate-400">
                    <th className="pb-3">Invoice</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 font-semibold text-slate-800">INV-2026-10</td>
                    <td className="py-3 text-slate-500">Oct 1, 2026</td>
                    <td className="py-3 font-bold text-slate-900">$4.99</td>
                    <td className="py-3">
                      <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        Paid ✓
                      </span>
                    </td>
                    <td className="py-3 text-right text-blue-600 font-semibold cursor-pointer hover:underline">
                      Download PDF
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-slate-800">INV-2026-09</td>
                    <td className="py-3 text-slate-500">Sep 1, 2026</td>
                    <td className="py-3 font-bold text-slate-900">$4.99</td>
                    <td className="py-3">
                      <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        Paid ✓
                      </span>
                    </td>
                    <td className="py-3 text-right text-blue-600 font-semibold cursor-pointer hover:underline">
                      Download PDF
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Data & Backups */}
      {activeTab === 'data' && (
        <div className="space-y-6 max-w-2xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h4 className="font-bold text-slate-900 text-sm">Data Portability & Backups</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              As a full-featured study SaaS, your study materials belong to you. Export your complete
              database (homework, timetable, test marks, quiz scores, flashcards, notes) as a JSON file or import a saved backup.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleExportJson}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-colors"
              >
                <Download className="h-4 w-4" /> Download JSON Backup
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Upload className="h-4 w-4" /> Import Backup File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportJson}
                className="hidden"
              />

              <button
                onClick={handlePrintAcademicReport}
                className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors"
              >
                <FileSpreadsheet className="h-4 w-4" /> Print Full Transcript
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-3xl border border-rose-200 bg-rose-50/40 p-6 shadow-xs space-y-3">
            <h4 className="font-bold text-rose-900 text-sm">Exhibition / Demo Reset</h4>
            <p className="text-xs text-rose-700 leading-relaxed">
              Need to restore all demo data back to the clean state for a new student or booth visitor?
              This resets assignments, timetables, test scores, flashcard decks, and quiz history.
            </p>
            <button
              onClick={onResetAllData}
              className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition-colors"
            >
              <RotateCcw className="h-4 w-4" /> Reset All Data to Exhibition State
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
