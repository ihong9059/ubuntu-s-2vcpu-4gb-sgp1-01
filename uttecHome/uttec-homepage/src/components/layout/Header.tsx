'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown, Phone, Monitor } from 'lucide-react';
import { mainNavigation, companyInfo } from '@/lib/data/navigation';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      {/* Top Bar */}
      <div className={`hidden md:block border-b transition-colors ${isScrolled ? 'border-gray-200 bg-gray-50' : 'border-white/20 bg-white/10'}`}>
        <div className="container mx-auto px-4 py-2 flex justify-between items-center text-sm">
          <div className={`flex items-center gap-4 ${isScrolled ? 'text-gray-600' : 'text-white/80'}`}>
            <span className="flex items-center gap-1">
              <Phone size={14} />
              {companyInfo.phone}
            </span>
            <span>{companyInfo.email}</span>
          </div>
          <div className={`flex items-center gap-4 ${isScrolled ? 'text-gray-600' : 'text-white/80'}`}>
            <Link href="/contact" className="hover:text-primary transition-colors">
              문의하기
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className={`text-2xl font-bold ${isScrolled ? 'text-primary' : 'text-white'}`}>
              UTTEC
            </div>
            <span className={`hidden sm:inline text-sm ${isScrolled ? 'text-gray-500' : 'text-white/70'}`}>
              스마트 솔루션
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {mainNavigation.map((item) => (
              <div
                key={item.id}
                className="relative"
                onMouseEnter={() => setActiveDropdown(item.id)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                    isScrolled
                      ? 'text-gray-700 hover:text-primary hover:bg-gray-100'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.label}
                  {item.children && <ChevronDown size={16} />}
                </Link>

                {/* Dropdown Menu */}
                {item.children && activeDropdown === item.id && (
                  <div className="absolute top-full left-0 pt-2 animate-slide-down">
                    <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-2 min-w-[240px]">
                      {item.children.map((child) => (
                        <Link
                          key={child.id}
                          href={child.href}
                          className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="font-medium text-gray-800">{child.label}</div>
                          {child.description && (
                            <div className="text-sm text-gray-500 mt-0.5">{child.description}</div>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/monitor"
              className={`p-2.5 rounded-lg transition-colors ${
                isScrolled
                  ? 'text-gray-600 hover:text-primary hover:bg-gray-100'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              title="서버 리소스 모니터"
            >
              <Monitor size={20} />
            </Link>
            <Link
              href="/portfolio/demos"
              className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
            >
              데모 체험
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`lg:hidden p-2 rounded-lg ${isScrolled ? 'text-gray-700' : 'text-white'}`}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t shadow-lg animate-slide-down">
          <div className="container mx-auto px-4 py-4">
            {mainNavigation.map((item) => (
              <div key={item.id} className="border-b border-gray-100 last:border-0">
                <Link
                  href={item.href}
                  className="block py-3 font-medium text-gray-800"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="pl-4 pb-2">
                    {item.children.map((child) => (
                      <Link
                        key={child.id}
                        href={child.href}
                        className="block py-2 text-gray-600 hover:text-primary"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link
              href="/portfolio/demos"
              className="block mt-4 py-3 bg-primary text-white text-center rounded-lg font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              데모 체험하기
            </Link>
            <Link
              href="/monitor"
              className="flex items-center justify-center gap-2 mt-2 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Monitor size={18} />
              서버 모니터
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
