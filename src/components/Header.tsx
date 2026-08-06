import React from 'react';

interface HeaderProps {
  onMenuClick: () => void;
  currentView: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  currentView,
  searchQuery,
  onSearchChange,
}) => {
  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return 'Operational Dashboard';
      case 'requests':
        return 'Psychologist Applications';
      case 'dossier':
        return 'Psychologist Dossier';
      case 'users':
        return 'User Management';
      case 'moderation':
        return 'Reports & Moderation';
      case 'catalogs':
        return 'Catalogs Administration';
      case 'audit':
        return 'Security & Audit Logs';
      default:
        return 'ClinicalAdmin';
    }
  };

  return (
    <header className="h-16 w-full sticky top-0 z-30 bg-surface-container-lowest border-b border-outline-variant flex justify-between items-center px-4 md:px-gutter max-w-container-max mx-auto shadow-sm">
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile Menu Toggle Button */}
        <button
          onClick={onMenuClick}
          className="md:hidden text-primary p-2 hover:bg-surface-container rounded-lg transition-colors flex items-center justify-center"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        {/* Mobile Page Title */}
        <h2 className="font-headline-sm text-headline-sm font-bold text-primary md:hidden whitespace-nowrap">
          {getViewTitle()}
        </h2>

        {/* Desktop Search Bar (hidden on mobile) */}
        <div className="hidden md:flex items-center bg-surface-container-low rounded-full px-4 py-2 w-64 border border-outline-variant focus-within:border-secondary transition-colors">
          <span className="material-symbols-outlined text-on-surface-variant mr-2 text-sm">search</span>
          <input
            className="bg-transparent border-none outline-none text-body-sm font-body-sm w-full placeholder-on-surface-variant focus:ring-0"
            placeholder="Search records, IDs..."
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        {/* Quick Action Buttons */}
        <button className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer active:opacity-80 p-2 rounded-full hover:bg-surface-container flex items-center justify-center">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer active:opacity-80 p-2 rounded-full hover:bg-surface-container flex items-center justify-center">
          <span className="material-symbols-outlined">security</span>
        </button>
        <button className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer active:opacity-80 p-2 rounded-full hover:bg-surface-container flex items-center justify-center hidden sm:flex">
          <span className="material-symbols-outlined">help</span>
        </button>

        <div className="h-6 w-px bg-outline-variant mx-1 md:mx-2"></div>

        {/* User Account / Admin Settings Dropdown trigger */}
        <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer active:opacity-80">
          <div className="hidden md:flex flex-col items-end">
            <span className="font-body-sm text-[13px] font-semibold text-primary">Dr. A. Sterling</span>
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider">Admin Settings</span>
          </div>
          <img
            alt="Administrator Profile Avatar"
            className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover border border-outline-variant hover:border-secondary transition-colors bg-surface-container-high"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2BoFP5QYuAuLh9cq1CrBnG5qtw2ZQUCcmyCOZAiEEVx1C4xnRN5TgpZmon8UpGrpxZD4Ad3GJN_WzeaQyDSgnexb4YvxDH33xBKjGh6um_LghB-bORd885k9JVhOmV4xsigV9FQ3MMUKDFCcgbN4bfqAdDxoNAGgWTdEb6g9N0gXDLmBUnstAcdX9gmWREaUfzk2UNdSSHAgJBpbZx8tAlZp4bwQPfYCn0P2PZKBr6Hz56Eb2OnYi2A"
          />
        </button>
      </div>
    </header>
  );
};
