import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, page: string) => {
    e.preventDefault();
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { name: 'Услуги', page: 'services' },
    { name: 'Кейсы', page: 'cases' },
    { name: 'О нас', page: 'about' },
    { name: 'Отзывы', page: 'reviews' },
    { name: 'Контакты', page: 'contact' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-brand-dark/90 backdrop-blur-md border-b border-white/10 py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <a href="#" onClick={(e) => handleLinkClick(e, 'home')} className="flex items-center gap-2 group">
           <div className="w-10 h-10 bg-gradient-to-br from-brand-yellow to-brand-orange rounded-lg flex items-center justify-center transform group-hover:rotate-6 transition-transform">
             <span className="text-brand-dark font-bold text-xl">V</span>
           </div>
           <span className="font-bold text-2xl tracking-tight text-white">
             Valstand
           </span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-8 items-center">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={`#${link.page}`}
              onClick={(e) => handleLinkClick(e, link.page)}
              className={`text-sm uppercase tracking-wider font-medium transition-colors cursor-pointer ${
                currentPage === link.page ? 'text-brand-yellow' : 'text-gray-300 hover:text-brand-yellow'
              }`}
            >
              {link.name}
            </a>
          ))}
          <a 
            href="#contact"
            onClick={(e) => handleLinkClick(e, 'contact')}
            className="px-5 py-2 bg-gradient-to-r from-brand-yellow to-brand-orange text-brand-dark font-bold rounded-full hover:shadow-[0_0_20px_rgba(255,184,0,0.4)] transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            Обсудить проект
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-brand-dark border-b border-white/10 shadow-2xl p-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={`#${link.page}`}
              className={`block text-lg py-2 border-b border-white/5 cursor-pointer ${
                currentPage === link.page ? 'text-brand-yellow' : 'text-gray-300'
              }`}
              onClick={(e) => handleLinkClick(e, link.page)}
            >
              {link.name}
            </a>
          ))}
          <a 
            href="#contact" 
            className="block text-center w-full py-3 bg-brand-yellow text-brand-dark font-bold rounded-lg mt-2 cursor-pointer"
            onClick={(e) => handleLinkClick(e, 'contact')}
          >
            Обсудить проект
          </a>
        </div>
      )}
    </header>
  );
};

export default Header;