import ReactDOM from 'react-dom/client';
import './index.css';
import { App } from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './Home';
import { Shell } from './Shell';
import { NotFound } from './NotFound';
import React from 'react';

const root = ReactDOM.createRoot(
   document.getElementById('root') as HTMLElement
);

root.render(
   <React.StrictMode>
      <BrowserRouter>
         <Routes>
            <Route path="/" element={<Shell />}>
               <Route index element={<Home />} />
               <Route path="edit" element={<App />}>
                  <Route path=":diagram" element={<div />} />
               </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
         </Routes>
      </BrowserRouter>
   </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
