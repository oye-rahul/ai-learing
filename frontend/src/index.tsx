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
  if (e.message.includes('ResizeObserver')) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
});

// Also suppress unhandled promise rejections related to ResizeObserver
window.addEventListener('unhandledrejection', (e) => {
  if (e.reason?.message?.includes('ResizeObserver')) {
    e.preventDefault();
  }
});

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
