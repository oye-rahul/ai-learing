import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { RootState } from '../../store/store';
import { AppDispatch } from '../../store/store';
import Sidebar from '../navigation/Sidebar';
import Header from '../navigation/Header';
import AIChatWindow from '../features/AIChatWindow';
import { setChatOpen } from '../../store/slices/aiSlice';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const { sidebarCollapsed } = useSelector((state: RootState) => state.ui);
  const { isChatOpen, contextCode, contextLanguage } = useSelector((state: RootState) => state.ai);

  const isLearningView = location.pathname.startsWith('/learn');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans relative">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className={`flex-1 overflow-y-auto ${isLearningView || location.pathname.startsWith('/playground') ? 'p-0' : 'p-6'}`}>
          {children}
        </main>
      </div>

      {/* Global AI Assistant FAB and View */}
      <div className="fixed bottom-6 right-6 z-[100]">
        {isChatOpen ? (
          <div className="w-[400px] h-[600px] animate-slide-up">
            <AIChatWindow
              onClose={() => dispatch(setChatOpen(false))}
              currentCode={contextCode}
              language={contextLanguage}
              onCodeUpdate={() => { }} // Global chat doesn't update random editors
            />
          </div>
        ) : (
          <button
            onClick={() => dispatch(setChatOpen(true))}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 group relative"
            title="Ask AI Tutor"
          >
            <div className="absolute -top-12 right-0 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold px-3 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-slate-200 dark:border-slate-700">
              Need help learning? Ask AI ✨
            </div>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default AppLayout;
