
import React, { useState, useEffect, useMemo } from 'react';
import Layout from './components/Layout';
import MatchCard from './components/MatchCard';
import PlayerView from './components/PlayerView';
import { APIMatch, Sport, FilterState } from './types';
import { api } from './services/api';

const App: React.FC = () => {
  const [currentMatch, setCurrentMatch] = useState<APIMatch | null>(null);
  const [matches, setMatches] = useState<APIMatch[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    sportId: 'all',
    liveOnly: false,
    popularOnly: false
  });

  // Dynamic Date for Sidebar
  const today = new Date();
  const day = today.getDate();
  const month = today.toLocaleString('default', { month: 'short' }).toUpperCase();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentMatch]);

  useEffect(() => {
    const init = async () => {
      try {
        const sportsData = await api.getSports();
        setSports(sportsData);
        loadMatches();
      } catch (err) {
        console.error('Initialization error:', err);
      }
    };
    init();
  }, []);

  useEffect(() => {
    loadMatches();
  }, [filters]);

  const loadMatches = async () => {
    setLoading(true);
    try {
      let data: APIMatch[] = [];
      if (filters.liveOnly) {
        data = await api.getLiveMatches(filters.popularOnly);
      } else {
        data = await api.getMatches(filters.sportId, filters.popularOnly);
      }
      setMatches(data);
    } catch (err) {
      console.error('Match loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMatches = useMemo(() => {
    let result = [...matches];
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(m => 
        m.title.toLowerCase().includes(lowerSearch) ||
        (m.teams?.home?.name || '').toLowerCase().includes(lowerSearch) ||
        (m.teams?.away?.name || '').toLowerCase().includes(lowerSearch) ||
        m.category.toLowerCase().includes(lowerSearch)
      );
    }
    return result.sort((a, b) => a.date - b.date);
  }, [matches, searchTerm]);

  const handleResetToSchedule = () => {
    setCurrentMatch(null);
    setSearchTerm('');
    setFilters({ sportId: 'all', liveOnly: false, popularOnly: false });
  };

  const renderSchedule = () => (
    <div className="animate-in fade-in duration-700">
      {/* Filters Bar */}
      <div className="bg-[#0a0a0a] border border-white/5 rounded-lg p-2 mb-6 flex flex-wrap items-center gap-2">
        <button 
          onClick={() => setFilters(prev => ({ ...prev, liveOnly: !prev.liveOnly }))}
          className={`flex-1 sm:flex-none px-3 py-1.5 rounded text-[9px] sm:text-[10px] font-black tracking-widest uppercase transition-all ${filters.liveOnly ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-white/5 text-slate-400 hover:text-white'}`}
        >
          Live
        </button>
        <button 
          onClick={() => setFilters(prev => ({ ...prev, popularOnly: !prev.popularOnly }))}
          className={`flex-1 sm:flex-none px-3 py-1.5 rounded text-[9px] sm:text-[10px] font-black tracking-widest uppercase transition-all ${filters.popularOnly ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'bg-white/5 text-slate-400 hover:text-white'}`}
        >
          Popular
        </button>
        
        <div className="hidden sm:block h-4 w-px bg-white/10 mx-1"></div>
        
        <div className="relative flex-grow sm:flex-grow-0">
          <select 
            value={filters.sportId}
            onChange={(e) => setFilters(prev => ({ ...prev, sportId: e.target.value }))}
            className="w-full appearance-none bg-[#111] border border-white/10 text-slate-300 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded px-8 py-1.5 focus:outline-none focus:border-blue-500/40 cursor-pointer"
          >
            <option value="all">All Sports</option>
            {sports.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <i className="fa-solid fa-filter text-[10px] text-slate-600"></i>
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <i className="fa-solid fa-chevron-down text-[8px] text-slate-600"></i>
          </div>
        </div>
      </div>

      <div className="flex gap-4 sm:gap-12">
        {/* Vertical Date Sidebar */}
        <div className="hidden sm:flex flex-col items-center pt-2 select-none">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] [writing-mode:vertical-lr]">TODAY</span>
          <span className="text-4xl font-black text-red-600 my-2">{day}</span>
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] [writing-mode:vertical-lr]">{month}</span>
        </div>

        {/* Matches Grid - Modified for 2 columns on mobile */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="aspect-[16/9] bg-white/5 animate-pulse rounded-lg sm:rounded-xl"></div>
              ))}
            </div>
          ) : filteredMatches.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-y-6 sm:gap-y-10 gap-x-4 sm:gap-x-6">
              {filteredMatches.map(match => (
                <MatchCard 
                  key={match.id} 
                  match={match} 
                  onSelect={(m) => setCurrentMatch(m)} 
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 sm:py-32 text-center px-4">
               <i className="fa-solid fa-ghost text-slate-800 text-4xl sm:text-5xl mb-4"></i>
               <h3 className="text-base sm:text-xl font-black text-slate-400 uppercase tracking-tighter">No matches found</h3>
               <button 
                  onClick={handleResetToSchedule}
                  className="mt-6 text-[10px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest border-b border-blue-500/20 pb-1"
               >
                  Reset all filters
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Layout 
      searchTerm={searchTerm} 
      onSearchChange={setSearchTerm}
      onScheduleClick={handleResetToSchedule}
      showSearch={!currentMatch}
    >
      {currentMatch ? (
        <PlayerView 
            match={currentMatch} 
            onBack={() => setCurrentMatch(null)} 
        />
      ) : (
        renderSchedule()
      )}
    </Layout>
  );
};

export default App;
