import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Auth } from './features/auth/auth'
import { App as AntdApp } from 'antd'
import { Dashboard } from './features/dashboard/Dashboard'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


function App() {

  const queryClient = new QueryClient();
  // console.log(queryClient.getQueryCache().getAll());

  return (
    <QueryClientProvider client={queryClient}>
      <AntdApp>
        <BrowserRouter>
          <Routes>
            <Route element={<Auth />} path='/login' />
            <Route element={<Dashboard />} path='/dashboard' />
          </Routes>
        </BrowserRouter>
      </AntdApp>
    </QueryClientProvider>
  )
}

export default App
