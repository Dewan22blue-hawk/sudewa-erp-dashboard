interface Props {
  active: string;
  onChange: (value: string) => void;
}

export default function StockUnitFilterTabs({ active, onChange }: Props) {
  const tabs = [
    { label: 'All', value: 'all' },
    { label: 'In Transit', value: 'in_transit' },
    { label: 'Available', value: 'available' },
    { label: 'Reserved', value: 'reserved' },
  ];

  return (
    <div className="inline-flex items-center gap-1 rounded-xl bg-gray-100 px-2 py-1">
      {tabs.map((tab) => {
        const isActive = active === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
              isActive ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-700 hover:bg-white/70'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
