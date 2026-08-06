import React from 'react';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) => {
  const navItems = [
    { name: 'Dashboard', id: 'dashboard', icon: 'dashboard' },
    { name: 'Requests', id: 'requests', icon: 'pending_actions' },
    { name: 'User Management', id: 'users', icon: 'group' },
    { name: 'Reports & Moderation', id: 'moderation', icon: 'assessment' },
    { name: 'Catalogs', id: 'catalogs', icon: 'library_books' },
    { name: 'Audit Logs', id: 'audit', icon: 'history' },
  ];

  const handleNavClick = (viewId: string) => {
    onViewChange(viewId);
    setIsMobileMenuOpen(false);
  };

  const navContent = (
    <div className="flex flex-col h-full bg-primary-container py-6">
      {/* Brand */}
      <div className="px-6 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary-fixed flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary-fixed fill text-lg">psychology</span>
          </div>
          <div>
            <h1 className="font-headline-sm text-headline-sm font-bold text-on-primary-container">ClinicalAdmin</h1>
            <p className="font-label-caps text-[10px] text-on-primary-container/60 uppercase tracking-wider">Institutional Portal</p>
          </div>
        </div>
        {/* Close mobile menu button */}
        <button
          className="md:hidden text-on-primary-container hover:text-white"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = currentView === item.id || (item.id === 'requests' && currentView === 'dossier');
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex items-center gap-3 px-4 py-3 w-full text-left transition-all duration-200 ease-in-out border-l-4 rounded-r-lg ${
                isActive
                  ? 'bg-secondary-container/10 text-secondary-fixed border-secondary-fixed font-semibold'
                  : 'text-on-primary-container/70 hover:bg-primary-fixed-dim/10 hover:text-on-primary-container border-transparent'
              }`}
            >
              <span className={`material-symbols-outlined ${isActive ? 'fill' : ''}`}>{item.icon}</span>
              <span className="font-body-md text-body-md">{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Navigation */}
      <div className="px-4 mt-auto space-y-1 border-t border-outline-variant/20 pt-4">
        <button className="flex items-center gap-3 px-4 py-3 w-full text-left text-on-primary-container/70 hover:bg-primary-fixed-dim/10 hover:text-on-primary-container transition-all duration-200 border-l-4 border-transparent">
          <span className="material-symbols-outlined">settings</span>
          <span className="font-body-md text-body-md">Settings</span>
        </button>
        <button className="flex items-center gap-3 px-4 py-3 w-full text-left text-on-primary-container/70 hover:bg-primary-fixed-dim/10 hover:text-on-primary-container transition-all duration-200 border-l-4 border-transparent">
          <span className="material-symbols-outlined">help</span>
          <span className="font-body-md text-body-md">Support</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (visible on md screens and larger) */}
      <aside className="hidden md:flex flex-col w-[260px] h-screen sticky left-0 top-0 border-r border-outline-variant z-40 shrink-0">
        {navContent}
      </aside>

      {/* Mobile Drawer Backdrop (visible when open) */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer Content */}
      <aside
        className={`fixed top-0 left-0 h-screen w-[260px] z-50 md:hidden transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {navContent}
      </aside>
    </>
  );
};
