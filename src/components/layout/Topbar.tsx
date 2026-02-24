import { useEffect, useState } from 'react';
import { Search, Bell, Clock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuthMe } from '@/features/auth/hooks/use-auth-me';

const RECENT_STORAGE_KEY = 'global-search-recent';

export function Topbar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [recentItems, setRecentItems] = useState<string[]>([]);
  const { data: profile, isLoading: isProfileLoading } = useAuthMe();

  const user = profile?.data;

  const displayName = user?.name || [user?.firstname, user?.lastname].filter(Boolean).join(' ') || '-';
  const userId = user?.username || user?.email || String(user?.id ?? '-');
  const role = user?.role || '-';
  const subtitle = user ? `${userId}${role && role !== '-' ? ` • ${role}` : ''}` : 'User data unavailable';
  const initials =
    displayName
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'US';

  /* ================= LOAD RECENT ================= */
  useEffect(() => {
    const stored = localStorage.getItem(RECENT_STORAGE_KEY);
    if (stored) {
      setRecentItems(JSON.parse(stored));
    }
  }, []);

  /* ================= SAVE RECENT ================= */
  const saveRecent = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    let updated = [trimmed, ...recentItems.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())];
    updated = updated.slice(0, 6); // max 6 recent

    setRecentItems(updated);
    localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(updated));
  };

  /* ================= HANDLE SEARCH ================= */
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveRecent(query);
    setOpen(false);

    // TODO: trigger real search API here
    console.log('Searching:', query);
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      {/* ================= SEARCH ================= */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className="relative w-80 text-left outline-none group">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <div
              className="
                                flex items-center
                                h-10
                                w-full
                                rounded-xl
                                border
                                border-gray-200
                                bg-gray-50
                                pl-10
                                pr-4
                                text-sm
                                text-gray-400
                                transition
                                group-hover:bg-white
                                group-focus:bg-white
                                cursor-text
                            "
            >
              Search here...
            </div>
          </button>
        </PopoverTrigger>

        <PopoverContent align="start" className="w-96 p-0 rounded-xl shadow-xl border border-gray-200">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative border-b border-gray-200 px-4 py-3">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search here..."
              className="
                w-full
                bg-transparent
                pl-8
                pr-2
                py-1
                text-sm
                outline-none
                placeholder:text-gray-400
              "
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
                    }}
                    className="
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-lg
                      px-3
                      py-2
                      text-left
                      text-sm
                      text-gray-700
                      hover:bg-gray-100
                      transition
                    "
                  >
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{item}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* ================= RIGHT SIDE ================= */}
      <div className="flex items-center gap-5">
        <button className="text-gray-600 hover:text-black transition">
          <Bell className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right">
            <span className="text-sm font-medium text-gray-900" title={displayName}>
              {isProfileLoading ? 'Loading...' : displayName}
            </span>
            <span className="text-xs text-gray-500" title={`User ID: ${userId}`}>
              {isProfileLoading ? '' : subtitle}
            </span>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-700">{initials}</div>
        </div>
      </div>
    </header>
  );
}
