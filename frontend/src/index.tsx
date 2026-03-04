import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import App from './App';
import { store } from './store/store';

// Suppress harmless ResizeObserver errors from Monaco Editor
window.addEventListener('error', (e) => {
  if (e.message.includes('ResizeObserver') || e.message.includes('Canceled')) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
});

// Also suppress unhandled promise rejections related to ResizeObserver and Monaco
window.addEventListener('unhandledrejection', (e) => {
  if (
    e.reason?.message?.includes('ResizeObserver') ||
    e.reason?.message?.includes('Canceled') ||
    e.reason?.name === 'Canceled' ||
    e.reason === 'Canceled'
  ) {
    e.preventDefault();
  }
});

// Suppress specific harmless console logs
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('move of an UNKNOWN touch') ||
      args[0].includes('Canceled'))
  ) {
    return;
  }
  originalConsoleError(...args);
};

const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('move of an UNKNOWN touch')
  ) {
    return;
  }
  originalConsoleWarn(...args);
};

const theme = localStorage.getItem('theme') as 'light' | 'dark' | null;
if (theme === 'dark') {
  document.documentElement.classList.add('dark');
} else if (theme === 'light') {
  document.documentElement.classList.remove('dark');
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
