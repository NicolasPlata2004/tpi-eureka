'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  role: 'student' | 'teacher';
  avatar: string;
}

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    async function checkUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkUser();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Error cerrando sesión:', err);
    }
  };

  return (
    <header className="bg-white border-b border-tinta/8 w-full sticky top-0 z-40 select-none">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div 
          onClick={() => {
            if (user) {
              router.push(user.role === 'student' ? '/dashboard' : '/teacher');
            } else {
              router.push('/');
            }
          }}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <img src="/logo.png" alt="Eureka Logo" className="h-8 w-auto object-contain" />
          <span className="text-xl font-bold tracking-tight text-tinta">Eureka</span>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          <span 
            onClick={() => router.push('/')} 
            className="text-sm font-medium text-slate-500 hover:text-tinta transition-colors cursor-pointer"
          >
            Cómo funciona
          </span>
          
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-bg-soft2 animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-4">
              <span 
                onClick={() => router.push(user.role === 'student' ? '/dashboard' : '/teacher')}
                className="text-sm font-semibold text-blue-action hover:underline cursor-pointer"
              >
                {user.role === 'student' ? 'Mi camino' : 'Panel docente'}
              </span>
              
              <div className="relative">
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-9 h-9 rounded-full bg-bg-soft2 border border-blue-action/20 text-blue-action flex items-center justify-center font-bold text-sm hover:bg-blue-action hover:text-white transition-all cursor-pointer relative z-50"
                >
                  {(user.name || '').charAt(0).toUpperCase()}
                </button>
                
                {/* Backdrop transparente para cerrar al hacer clic afuera */}
                {dropdownOpen && (
                  <div 
                    onClick={() => setDropdownOpen(false)}
                    className="fixed inset-0 z-40 bg-transparent cursor-default" 
                  />
                )}
                
                {/* Dropdown de usuario */}
                <div 
                  className={`absolute right-0 top-full mt-2 w-48 bg-white border border-tinta/10 rounded-xl shadow-lg p-2 z-50 transition-all ${
                    dropdownOpen ? 'block' : 'hidden'
                  }`}
                >
                  <div className="px-3 py-2 border-b border-tinta/5">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                      {user.role === 'student' ? 'Estudiante' : 'Docente'}
                    </p>
                    <p className="text-sm font-bold truncate text-tinta">{user.name}</p>
                  </div>
                  <button 
                    onClick={(e) => {
                      setDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-amber-revisar hover:bg-bg-soft1 rounded-lg transition-colors font-medium mt-1 cursor-pointer"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => router.push('/auth/dev-login')}
                className="text-sm font-semibold text-slate-500 hover:text-tinta px-3 py-2 transition-colors cursor-pointer"
              >
                Ingresar
              </button>
              <button 
                onClick={() => router.push('/auth/dev-login')}
                className="h-10 px-4 rounded-xl bg-blue-action text-white text-sm font-semibold hover:bg-blue-action/90 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                Empezar gratis
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
