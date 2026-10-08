import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/router';
import '@/i18n';
import '@/chartJsInit';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <div className='page-root'>
    <RouterProvider router={router} />
  </div>
);
