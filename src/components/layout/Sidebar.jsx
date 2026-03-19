import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Users, Pill, BarChart3, LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const navItems = [
  { label: 'Physician Search', icon: Search, path: '/' },
  { label: 'Reverse Drug Search', icon: Pill, path: '/drug-search' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col min-h-screen fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-sidebar-foreground">Noble Infusion</h1>
            <p className="text-[11px] text-sidebar-foreground/50 tracking-wider uppercase">Physician Intel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-primary'
                  : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={() => base44.auth.logout()}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all w-full"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}