/** index.html 入口：个人主页（项目 / 文章） */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css';

const container = document.getElementById('root');
if (!container) throw new Error('找不到挂载点 #root（index.html）');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
