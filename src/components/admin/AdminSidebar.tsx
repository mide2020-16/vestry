/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LogOut, Settings, Package, LayoutDashboard,
  Boxes, PanelLeftIcon, PanelRightIcon,
} from 'lucide-react';
import { NavItem } from '../../components/admin/NavItem';

const NAV = [
  { href: '/admin',           label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products',  label: 'Products',  icon: Package },
  { href: '/admin/inventory', label: 'Inventory', icon: Boxes },
  { href: '/admin/settings',  label: 'Settings',  icon: Settings },
];

interface Props {
  email?: string | null;
}

export default function AdminSidebar({ email }: Props) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    setCollapsed(mq.matches);
    setIsMounted(true);

    const handler = (e: MediaQueryListEvent) => setCollapsed(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  if (!isMounted) {
    return <div className="w-18 h-screen bg-neutral-900 border-r border-neutral-800 shrink-0" />;
  }

  return (
    <aside
      className={`flex flex-col bg-neutral-900 border-r border-neutral-800 sticky top-0 h-screen shrink-0 transition-all duration-500 ease-in-out
        ${collapsed ? 'w-18' : 'w-72'}`}
    >
      <div className="flex flex-col h-full py-8 gap-8 overflow-hidden">

        {/* Header */}
        <header className={`flex items-center transition-all duration-500
          ${collapsed ? 'flex-row gap-2' : 'justify-between px-6'}`}>

          {!collapsed && (
            <div>
              <h1 className="text-lg font-black text-white tracking-[0.2em] uppercase leading-none">
                Vestry
              </h1>
              <p className="text-[10px] text-neutral-500 mt-1 uppercase tracking-widest font-bold">
                Admin Panel
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => setCollapsed(c => !c)}
            className=" mr-2 p-2 rounded-xl text-neutral-500 hover:text-white hover:bg-white/10 transition-all duration-300 active:scale-95 shrink-0"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelRightIcon size={20} /> : <PanelLeftIcon size={20} />}
          </button>
        </header>

        {/* Divider */}
        <div className={`h-px bg-white/5 transition-all duration-500 ${collapsed ? 'mx-4' : 'mx-6'}`} />

        {/* Nav */}
        <nav className={`flex flex-col transition-all duration-500
          ${collapsed ? 'gap-3 px-0 items-center' : 'gap-1.5 px-4'}`}>
          {NAV.map(({ href, label, icon }) => (
            <NavItem
              key={href}
              href={href}
              label={label}
              icon={icon}
              isActive={pathname === href}
              collapsed={collapsed}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className={`mt-auto transition-all duration-500 ${collapsed ? 'flex flex-col items-center px-0' : 'px-4'}`}>

          {!collapsed && email && (
            <div className="mb-4 px-4 py-3 bg-white/5 rounded-2xl border border-white/8">
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest mb-0.5">Signed in as</p>
              <p className="text-neutral-300 text-xs truncate font-medium">{email}</p>
            </div>
          )}

          <Link
            href="/api/auth/signout"
            title={collapsed ? 'Sign Out' : undefined}
            className={`flex items-center gap-4 rounded-2xl bg-red-500/5 text-red-400
              hover:bg-red-500/15 hover:text-red-300 transition-all duration-500 font-medium
              ${collapsed ? 'justify-center w-11 h-11' : 'px-4 py-3.5 w-full'}`}
          >
            <LogOut size={20} className="shrink-0" />
            {!collapsed && (
              <span className="overflow-hidden w-auto opacity-100 transition-all duration-500 whitespace-nowrap">
                Sign Out
              </span>
            )}
          </Link>
        </div>
      </div>
    </aside>
  );
}