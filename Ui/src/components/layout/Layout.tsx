import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { SidebarProvider } from '@/contexts/SidebarContext'

export default function Layout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-bg-light dark:bg-bg-dark">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}