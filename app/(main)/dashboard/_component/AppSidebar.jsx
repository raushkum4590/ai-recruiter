"use client"
import { Button } from "@/components/ui/button"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
  } from "@/components/ui/sidebar"
import { SideBarOptions } from "@/services/constants"
import { Plus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
  
  export function AppSidebar() {
    const path=usePathname();
    console.log(path)
    return (
      <Sidebar>
        <SidebarHeader className='flex items-center' >
            <Image src={'/logo.svg'} alt="logo" width={200} height={100} className="w-[150px] pt-2" />
            <Button className='w-full mt-5 bg-blue-500 hover:bg-blue-700'><Plus/>Create New Interview</Button>
            </SidebarHeader>
        <SidebarContent>
          <SidebarGroup >
            <SidebarContent>
                <SidebarMenu>
                    {SideBarOptions.map((option, index) => (
                     <SidebarMenuItem key={index} className='p-1'>
                        <SidebarMenuButton asChild className={`p-5 ${path == option.path && 'bg-blue-100'}`}>
                            <Link href={option.path}>
                            <option.icon className={` ${path == option.path && 'text-blue-400'}`}/>
                            <span className={`text-[16px] font-medium ${path == option.path && 'text-blue-400'}`}>{option.name}</span>
                            </Link>

                        </SidebarMenuButton>

                     </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
            </SidebarGroup>
          <SidebarGroup />
        </SidebarContent>
        <SidebarFooter />
      </Sidebar>
    )
  }
  