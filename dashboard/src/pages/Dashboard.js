import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { FiSettings, FiLayout, FiMessageSquare, FiCommand, FiShield } from 'react-icons/fi';
import './Dashboard.css';

function Dashboard() {
    const { id } = useParams();
    const [server, setServer] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServer = async () => {
            try {
                const res = await api.get(`/api/server/${id}`);
                setServer(res.data);
            } catch (error) {
                console.error('Failed to fetch server:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchServer();
    }, [id]);

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="page-layout">
                    <Sidebar />
                    <div className="flex items-center justify-center w-full h-full text-gray-400">Loading your workspace...</div>
                </div>
            </>
        );
    }

    if (!server) {
        return (
            <>
                <Navbar />
                <div className="page-layout">
                    <Sidebar />
                    <div className="flex flex-col items-center justify-center w-full h-full text-center p-8">
                        <div className="text-[#ed4245] mb-4"><FiShield size={48} /></div>
                        <h2 className="text-2xl font-bold text-white mb-2">Server Not Found</h2>
                        <p className="text-gray-400 max-w-md">The bot may not be in this server or you don't have permission to manage it. Please invite the bot first.</p>
                    </div>
                </div>
            </>
        );
    }

    const quickLinks = [
        { title: 'Server Settings', icon: <FiSettings size={24} />, desc: 'Configure channels, logging, and auto-mod.', path: `/server/${id}/settings`, color: 'bg-blue-500/10 text-blue-500' },
        { title: 'Embed Builder', icon: <FiLayout size={24} />, desc: 'Create and send beautiful custom messages.', path: `/server/${id}/embed-builder`, color: 'bg-purple-500/10 text-purple-500' },
        { title: 'Reaction Roles', icon: <FiMessageSquare size={24} />, desc: 'Set up self-assignable roles for your members.', path: `/server/${id}/reactionroles`, color: 'bg-green-500/10 text-green-500' },
        { title: 'Custom Commands', icon: <FiCommand size={24} />, desc: 'Create your own personalized text commands.', path: `/server/${id}/customcommands`, color: 'bg-yellow-500/10 text-yellow-500' }
    ];

    return (
        <>
            <Navbar />
            <div className="page-layout">
                <Sidebar />
                <div className="page-content bg-[#0f0f13]">
                    <div className="max-w-6xl mx-auto p-8">
                        {/* Welcome Banner */}
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2b2d31] to-[#1e1f22] border border-[#3f4147] p-10 mb-8">
                            <div className="relative z-10 flex items-center space-x-6">
                                {server.icon ? (
                                    <img src={server.icon} alt={server.name} className="w-24 h-24 rounded-2xl shadow-lg border border-[#3f4147]" />
                                ) : (
                                    <div className="w-24 h-24 rounded-2xl bg-[#3f4147] flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                                        {server.name.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Welcome to {server.name}</h1>
                                    <p className="text-gray-400 text-lg">Manage your server, configure settings, and build a better community from your central dashboard.</p>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#5865f2] opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        </div>

                        {/* Quick Actions Grid */}
                        <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {quickLinks.map((link, i) => (
                                <Link to={link.path} key={i} className="group block p-6 rounded-xl bg-[#1e1f22] border border-[#2b2d31] hover:border-[#5865f2] transition-all duration-300">
                                    <div className="flex items-start space-x-4">
                                        <div className={`p-3 rounded-lg ${link.color} transition-transform group-hover:scale-110 duration-300`}>
                                            {link.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#5865f2] transition-colors">{link.title}</h3>
                                            <p className="text-gray-400 text-sm leading-relaxed">{link.desc}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        
                        {/* Status Footer */}
                        <div className="mt-12 text-center p-6 rounded-xl border border-dashed border-[#2b2d31]">
                            <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                Nexon Bot is active and protecting your server.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Dashboard;