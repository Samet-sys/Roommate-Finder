import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '../ui/Button';
import { useTranslation } from '../../translate/useTranslations'; 

interface HeroProps {
  onSearch: (searchTerm: string) => void;
}

export function Hero({ onSearch }: HeroProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <div className="relative bg-slate-600">
      <div className="absolute inset-0">
        <img
          className="w-full h-full object-cover mix-blend-multiply filter brightness-50"
          src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
          alt="Modern living room"
        />
      </div>
      
      <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          {t('hero_title_line1')} <br />
          <span className="text-slate-200">{t('hero_title_line2')}</span>
        </h1>
        
        <p className="mt-6 text-xl text-slate-100 max-w-3xl">
          {t('hero_description')}
        </p>

        <div className="mt-10 max-w-xl">
          <form onSubmit={handleSubmit} className="bg-white p-3 rounded-lg shadow-lg flex">
            <input
              type="text"
              placeholder={t('hero_search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 border-0 focus:ring-0 px-4 text-slate-600"
            />
            <Button type="submit" variant="primary">
              <Search className="w-6 h-6 mr-1" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}