import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { ThemeProvider } from './context/ThemeContext.tsx';
import { Layout } from './Layout.tsx';
import HomePage from './pages/HomePage.tsx';
import JoinServer from './pages/JoinServer.tsx';
import SurvivalProgress from './pages/SurvivalProgress.tsx';
import MemberPage from './pages/Members.tsx';
import OpenSourcePage from './pages/OpenSource.tsx';
import Hardware from './pages/Hardware.tsx';
import InternalPage from './pages/InternalPage.tsx';

import initI18n from './i18n/i18nConfig';
import 'antd/dist/reset.css';
import 'react-lazy-load-image-component/src/effects/blur.css';
import './main.css';
import './styles/home.css';

initI18n();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path='/' element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path='home' element={<HomePage />} />
            <Route path='join' element={<JoinServer />} />
            <Route path='survival' element={<SurvivalProgress />} />
            <Route path='survivalProgress' element={<SurvivalProgress />} />
            <Route path='member' element={<MemberPage />} />
            <Route path='openSource' element={<OpenSourcePage />} />
            <Route path='hardware' element={<Hardware />} />
            <Route path='internal' element={<InternalPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
);
