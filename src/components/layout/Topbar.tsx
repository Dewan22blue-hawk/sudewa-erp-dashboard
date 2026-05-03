import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Search, Bell, Clock, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthMe } from '@/features/auth/hooks/use-auth-me';
import { performClientLogout } from '@/lib/session/logout';

const RECENT_STORAGE_KEY = 'global-search-recent';

export function Topbar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [recentItems, setRecentItems] = useState<string[]>([]);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { data: profile, isLoading: isProfileLoading } = useAuthMe();
  const queryClient = useQueryClient();
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  const user = profile?.data;

  const displayName = user?.name || [user?.firstname, user?.lastname].filter(Boolean).join(' ') || '-';
  const userId = user?.username || user?.email || String(user?.id ?? '-');
  const initials =
    displayName
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'US';

  useEffect(() => {
    const stored = localStorage.getItem(RECENT_STORAGE_KEY);
    if (stored) setRecentItems(JSON.parse(stored));
  }, []);

  const saveRecent = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    let updated = [trimmed, ...recentItems.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())];
    updated = updated.slice(0, 6);
    setRecentItems(updated);
    localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(updated));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveRecent(query);
    setOpen(false);
    setMobileSearchOpen(false);
    console.log('Searching:', query);
  };

  const handleLogout = () => {
    performClientLogout(queryClient);
    router.replace('/login');
  };

  const handleProfileClick = () => {
    router.push(slug ? `/dashboard/${slug}/profile` : `/dashboard/profile`);
  };

  const SearchDropdownContent = (
    <>
      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative border-b border-gray-200 px-4 py-3">
        <Search className="absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search here..."
          className="w-full bg-transparent pl-8 pr-2 py-1 text-sm outline-none placeholder:text-gray-400"
        />
      </form>

      {/* Recent Section */}
      {recentItems.length > 0 && (
        <div className="px-4 py-3">
          <p className="text-sm font-semibold text-gray-500 mb-3">Recent</p>
          <div className="space-y-2">
            {recentItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  setQuery(item);
                  saveRecent(item);
                  setOpen(false);
                  setMobileSearchOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition"
              >
                <Clock className="h-4 w-4 text-gray-400" />
                <span>{item}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6">
        {/* Left — spacer on mobile (hamburger is fixed, handled by Sidebar) */}
        <div className="flex items-center gap-3">
          {/* Spacer so content doesn't sit behind hamburger on mobile */}
          <div className="w-8 md:hidden" />

          {/* ── Desktop Search ── */}
          <div className="hidden md:block">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <button className="relative w-80 text-left outline-none group">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <div className="flex items-center h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-400 transition group-hover:bg-white cursor-text">
                    Search here...
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-96 p-0 rounded-xl shadow-xl border border-gray-200">
                {SearchDropdownContent}
              </PopoverContent>
            </Popover>
          </div>

          {/* ── Mobile Search Button ── */}
          <button
            onClick={() => setMobileSearchOpen(true)}
            className="md:hidden flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-400 hover:bg-white transition"
          >
            <Search className="h-4 w-4" />
            <span>Search...</span>
          </button>
        </div>

        {/* ── Right Side ── */}
        <div className="flex items-center gap-4 md:gap-6">
          <button className="text-gray-600 hover:text-black transition">
            <Bell className="h-5 w-5" />
          </button>

          <div className="h-8 w-px bg-gray-200" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 outline-none hover:opacity-80 transition-opacity">
                {/* Hide name/userId on mobile, show only avatar */}
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-[13px] leading-tight font-semibold text-gray-900" title={displayName}>
                    {isProfileLoading ? 'Loading...' : displayName}
                  </span>
                  <span className="text-[11px] leading-tight text-slate-500 font-medium mt-0.5" title={`User ID: ${userId}`}>
                    {isProfileLoading ? '' : userId}
                  </span>
                </div>
                <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full bg-slate-50 text-[13px] font-bold text-black border border-gray-100">
                  {initials}
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px] p-2 rounded-xl">
              <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer font-medium text-slate-900 text-[13px] py-2 px-3 rounded-lg hover:bg-slate-50 focus:bg-slate-50">
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer font-medium text-red-600 text-[13px] py-2 px-3 rounded-lg hover:bg-red-50 focus:bg-red-50 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* ── Mobile Search Modal ── */}
      {mobileSearchOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col bg-white">
          {/* Modal Header */}
          <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3">
            <form onSubmit={handleSearchSubmit} className="flex flex-1 items-center gap-2">
              <Search className="h-4 w-4 shrink-0 text-gray-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search here..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
            </form>
            <button
              onClick={() => setMobileSearchOpen(false)}
              className="shrink-0 rounded-md p-1.5 text-gray-500 hover:bg-gray-100 transition"
              aria-label="Close search"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Recent Results */}
          <div className="flex-1 overflow-y-auto">
            {recentItems.length > 0 && (
              <div className="px-4 py-4">
                <p className="text-sm font-semibold text-gray-500 mb-3">Recent</p>
                <div className="space-y-1">
                  {recentItems.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setQuery(item);
                        saveRecent(item);
                        setMobileSearchOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm text-gray-700 hover:bg-gray-100 transition"
                    >
                      <Clock className="h-4 w-4 shrink-0 text-gray-400" />
                      <span>{item}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {recentItems.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 py-20 text-gray-400">
                <Search className="h-8 w-8" />
                <p className="text-sm">Type something to search</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
