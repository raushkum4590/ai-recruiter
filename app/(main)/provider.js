import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import React from 'react'
import { AppSidebar } from './dashboard/_component/AppSidebar'
import Welcome from './dashboard/_components/Welcome'


function Dashboardprovider({children}) {
  return (
    <SidebarProvider>
        <AppSidebar />
    <div className='w-full'>
        <SidebarTrigger/>
    <Welcome />
      {children}
    </div>
    </SidebarProvider>
  )
}

export default Dashboardprovider