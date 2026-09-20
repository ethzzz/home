/** tools.html 入口：工具 / 功能页（按分类左 tab） */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ToolsPage from './ToolsPage';
import './styles/global.css';

const container = document.getElementById('root');
if (!container) throw new Error('找不到挂载点 #root（tools.html）');

createRoot(container).render(
  <StrictMode>
    <ToolsPage />
  </StrictMode>,
);
