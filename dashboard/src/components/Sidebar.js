import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { 
    FiHome, FiSettings, FiEdit, FiList, FiChevronLeft, FiBarChart2, 
    FiMessageSquare, FiUsers, FiShield, FiMic, FiHelpCircle, FiZap, 
    FiCommand, FiRadio 
} from 'react-icons/fi';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "./ui/sidebar"

export default function AppSidebar() {
    const location = useLocation();
    const { id } = useParams();

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    return (
        <Sidebar collapsible="none">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link to="/servers">
                                <FiChevronLeft className="mr-2" /> 
                                <span>Back to Servers</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={isActive(`/server/${id}`) && location.pathname === `/server/${id}`}>
                                    <Link to={`/server/${id}`}>
                                        <FiHome /> <span>Dashboard</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>



                <SidebarGroup>
                    <SidebarGroupLabel>Utilities</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={isActive(`/server/${id}/tickets`)}>
                                    <Link to={`/server/${id}/tickets`}>
                                        <FiHelpCircle /> <span>Tickets</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={isActive(`/server/${id}/reactionroles`)}>
                                    <Link to={`/server/${id}/reactionroles`}>
                                        <FiZap /> <span>Reaction Roles</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={isActive(`/server/${id}/customcommands`)}>
                                    <Link to={`/server/${id}/customcommands`}>
                                        <FiCommand /> <span>Custom Commands</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={isActive(`/server/${id}/announcements`)}>
                                    <Link to={`/server/${id}/announcements`}>
                                        <FiRadio /> <span>Announcements</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Configuration</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={isActive(`/server/${id}/settings`)}>
                                    <Link to={`/server/${id}/settings`}>
                                        <FiSettings /> <span>Settings</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={isActive(`/server/${id}/embed-builder`)}>
                                    <Link to={`/server/${id}/embed-builder`}>
                                        <FiEdit /> <span>Embed Builder</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}