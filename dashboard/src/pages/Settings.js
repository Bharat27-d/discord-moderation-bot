import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiSave, FiPlus, FiTrash2 } from 'react-icons/fi';
import './Settings.css';

function Settings() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [channels, setChannels] = useState([]);
    const [roles, setRoles] = useState([]);
    const [settings, setSettings] = useState(null);
    const [activeTab, setActiveTab] = useState('general');

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [channelsRes, rolesRes, settingsRes] = await Promise. all([
                api.get(`/api/server/${id}/channels`),
                api.get(`/api/server/${id}/roles`),
                api.get(`/api/server/${id}/settings`)
            ]);

            setChannels(channelsRes.data. channels);
            setRoles(rolesRes.data.roles);
            setSettings(settingsRes.data. settings);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.post(`/api/server/${id}/settings`, { settings });
            toast.success('Settings saved successfully! ');
        } catch (error) {
            console.error('Failed to save settings:', error);
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const updateSetting = (path, value) => {
        setSettings(prev => {
            const newSettings = { ... prev };
            const keys = path.split('.');
            let current = newSettings;
            
            for (let i = 0; i < keys.length - 1; i++) {
                current[keys[i]] = { ...current[keys[i]] };
                current = current[keys[i]];
            }
            
            current[keys[keys.length - 1]] = value;
            return newSettings;
        });
    };

    const addWordToFilter = () => {
        const word = prompt('Enter word to filter:');
        if (word) {
            updateSetting('automod.wordFilter. words', [
                ...settings.automod.wordFilter.words,
                word
            ]);
        }
    };

    const removeWordFromFilter = (index) => {
        const words = [... settings.automod.wordFilter. words];
        words.splice(index, 1);
        updateSetting('automod.wordFilter.words', words);
    };

    const addWhitelistedDomain = () => {
        const domain = prompt('Enter domain to whitelist (e.g., youtube.com):');
        if (domain) {
            updateSetting('automod.antiLink.whitelist', [
                ... settings.automod.antiLink. whitelist,
                domain
            ]);
        }
    };

    const removeWhitelistedDomain = (index) => {
        const whitelist = [...settings.automod. antiLink.whitelist];
        whitelist.splice(index, 1);
        updateSetting('automod.antiLink.whitelist', whitelist);
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="page-layout">
                    <Sidebar />
                    <div className="loading">Loading settings...</div>
                </div>
            </>
        );
    }

    if (!settings) {
        return (
            <>
                <Navbar />
                <div className="page-layout">
                    <Sidebar />
                    <div className="page-content">
                        <div className="container">
                            <div className="error">
                                <h2>Failed to load settings</h2>
                                <p>Unable to retrieve server settings. Please try again later.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="page-layout">
                <Sidebar />
                <div className="page-content">
                    <div className="container">
                        <div className="settings-header">
                            <h1>Server Settings</h1>
                            <button 
                                className="btn btn-primary" 
                                onClick={handleSave}
                                disabled={saving}
                            >
                                <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>

                        <div className="settings-tabs">
                            <button 
                                className={`settings-tab ${activeTab === 'general' ? 'active' : ''}`}
                                onClick={() => setActiveTab('general')}
                            >
                                General
                            </button>
                            <button 
                                className={`settings-tab ${activeTab === 'automod' ? 'active' : ''}`}
                                onClick={() => setActiveTab('automod')}
                            >
                                Auto-Moderation
                            </button>
                            <button 
                                className={`settings-tab ${activeTab === 'welcome' ? 'active' : ''}`}
                                onClick={() => setActiveTab('welcome')}
                            >
                                Welcome/Leave
                            </button>
                            <button 
                                className={`settings-tab ${activeTab === 'punishments' ? 'active' : ''}`}
                                onClick={() => setActiveTab('punishments')}
                            >
                                Punishments
                            </button>
                        </div>

                        {/* General Settings Tab */}
                        {activeTab === 'general' && (
                            <div className="card">
                                <h2>General Settings</h2>

                                <div className="form-group">
                                    <label className="form-label">Moderation Log Channel</label>
                                    <select 
                                        className="form-select"
                                        value={settings. modLog || ''}
                                        onChange={(e) => updateSetting('modLog', e.target.value)}
                                    >
                                        <option value="">None</option>
                                        {channels.map(channel => (
                                            <option key={channel. id} value={channel.id}>
                                                #{channel.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Punishment Log Channel</label>
                                    <select 
                                        className="form-select"
                                        value={settings.punishmentLog || ''}
                                        onChange={(e) => updateSetting('punishmentLog', e. target.value)}
                                    >
                                        <option value="">None</option>
                                        {channels.map(channel => (
                                            <option key={channel.id} value={channel.id}>
                                                #{channel.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Mute Role</label>
                                    <select 
                                        className="form-select"
                                        value={settings.muteRole || ''}
                                        onChange={(e) => updateSetting('muteRole', e.target.value)}
                                    >
                                        <option value="">None</option>
                                        {roles.map(role => (
                                            <option key={role. id} value={role.id}>
                                                {role.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Welcome Channel</label>
                                    <select 
                                        className="form-select"
                                        value={settings.welcomeChannel || ''}
                                        onChange={(e) => updateSetting('welcomeChannel', e.target.value)}
                                    >
                                        <option value="">None</option>
                                        {channels.map(channel => (
                                            <option key={channel. id} value={channel.id}>
                                                #{channel.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Leave Channel</label>
                                    <select 
                                        className="form-select"
                                        value={settings.leaveChannel || ''}
                                        onChange={(e) => updateSetting('leaveChannel', e.target. value)}
                                    >
                                        <option value="">None</option>
                                        {channels.map(channel => (
                                            <option key={channel.id} value={channel.id}>
                                                #{channel. name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Auto-Moderation Tab */}
                        {activeTab === 'automod' && (
                            <div>
                                <div className="card">
                                    <div className="setting-row">
                                        <div>
                                            <h3>Anti-Spam</h3>
                                            <p>Automatically detect and delete spam messages</p>
                                        </div>
                                        <label className="toggle-switch">
                                            <input 
                                                type="checkbox"
                                                checked={settings. automod.antiSpam. enabled}
                                                onChange={(e) => updateSetting('automod.antiSpam.enabled', e.target.checked)}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>

                                    {settings.automod.antiSpam.enabled && (
                                        <div className="setting-details">
                                            <div className="form-group">
                                                <label className="form-label">Max Messages</label>
                                                <input 
                                                    type="number"
                                                    className="form-input"
                                                    value={settings.automod.antiSpam.maxMessages}
                                                    onChange={(e) => updateSetting('automod.antiSpam.maxMessages', parseInt(e.target.value))}
                                                    min="1"
                                                    max="20"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Time Window (ms)</label>
                                                <input 
                                                    type="number"
                                                    className="form-input"
                                                    value={settings.automod.antiSpam.timeWindow}
                                                    onChange={(e) => updateSetting('automod.antiSpam.timeWindow', parseInt(e.target.value))}
                                                    min="1000"
                                                    max="60000"
                                                    step="1000"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="card">
                                    <div className="setting-row">
                                        <div>
                                            <h3>Anti-Link</h3>
                                            <p>Block links from being posted</p>
                                        </div>
                                        <label className="toggle-switch">
                                            <input 
                                                type="checkbox"
                                                checked={settings.automod. antiLink.enabled}
                                                onChange={(e) => updateSetting('automod.antiLink. enabled', e.target.checked)}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>

                                    {settings. automod.antiLink.enabled && (
                                        <div className="setting-details">
                                            <label className="form-label">Whitelisted Domains</label>
                                            <div className="list-items">
                                                {settings. automod.antiLink.whitelist.map((domain, index) => (
                                                    <div key={index} className="list-item">
                                                        <span>{domain}</span>
                                                        <button 
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => removeWhitelistedDomain(index)}
                                                        >
                                                            <FiTrash2 />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <button 
                                                className="btn btn-secondary"
                                                onClick={addWhitelistedDomain}
                                            >
                                                <FiPlus /> Add Domain
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="card">
                                    <div className="setting-row">
                                        <div>
                                            <h3>Anti-Mass Ping</h3>
                                            <p>Prevent users from pinging too many people</p>
                                        </div>
                                        <label className="toggle-switch">
                                            <input 
                                                type="checkbox"
                                                checked={settings.automod. antiMassPing.enabled}
                                                onChange={(e) => updateSetting('automod.antiMassPing.enabled', e.target.checked)}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>

                                    {settings.automod.antiMassPing.enabled && (
                                        <div className="setting-details">
                                            <div className="form-group">
                                                <label className="form-label">Max Pings Per Message</label>
                                                <input 
                                                    type="number"
                                                    className="form-input"
                                                    value={settings. automod.antiMassPing.maxPings}
                                                    onChange={(e) => updateSetting('automod.antiMassPing.maxPings', parseInt(e.target.value))}
                                                    min="1"
                                                    max="20"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="card">
                                    <div className="setting-row">
                                        <div>
                                            <h3>Word Filter</h3>
                                            <p>Filter out specific words</p>
                                        </div>
                                        <label className="toggle-switch">
                                            <input 
                                                type="checkbox"
                                                checked={settings.automod.wordFilter.enabled}
                                                onChange={(e) => updateSetting('automod.wordFilter.enabled', e.target.checked)}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>

                                    {settings.automod.wordFilter.enabled && (
                                        <div className="setting-details">
                                            <label className="form-label">Filtered Words</label>
                                            <div className="list-items">
                                                {settings.automod.wordFilter.words.map((word, index) => (
                                                    <div key={index} className="list-item">
                                                        <span>{word}</span>
                                                        <button 
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => removeWordFromFilter(index)}
                                                        >
                                                            <FiTrash2 />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <button 
                                                className="btn btn-secondary"
                                                onClick={addWordToFilter}
                                            >
                                                <FiPlus /> Add Word
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="card">
                                    <div className="setting-row">
                                        <div>
                                            <h3>Ghost Ping Detection</h3>
                                            <p>Detect when users delete messages with pings</p>
                                        </div>
                                        <label className="toggle-switch">
                                            <input 
                                                type="checkbox"
                                                checked={settings.automod.ghostPing.enabled}
                                                onChange={(e) => updateSetting('automod.ghostPing.enabled', e.target.checked)}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Welcome/Leave Tab */}
                        {activeTab === 'welcome' && (
                            <div>
                                <div className="card">
                                    <h2>Welcome Message</h2>
                                    
                                    <div className="form-group">
                                        <label className="form-label">
                                            <input 
                                                type="checkbox"
                                                className="form-checkbox"
                                                checked={settings.welcomeMessage.enabled}
                                                onChange={(e) => updateSetting('welcomeMessage.enabled', e.target.checked)}
                                            />
                                            {' '}Enable Welcome Messages
                                        </label>
                                    </div>

                                    {settings.welcomeMessage.enabled && (
                                        <>
                                            <div className="form-group">
                                                <label className="form-label">Title</label>
                                                <input 
                                                    type="text"
                                                    className="form-input"
                                                    value={settings.welcomeMessage.title}
                                                    onChange={(e) => updateSetting('welcomeMessage.title', e.target.value)}
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">Description</label>
                                                <textarea 
                                                    className="form-textarea"
                                                    value={settings.welcomeMessage.description}
                                                    onChange={(e) => updateSetting('welcomeMessage.description', e.target. value)}
                                                    placeholder="Use {user}, {server}, {memberCount} as variables"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">Color</label>
                                                <input 
                                                    type="color"
                                                    className="form-input"
                                                    value={settings.welcomeMessage.color}
                                                    onChange={(e) => updateSetting('welcomeMessage.color', e.target.value)}
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">Thumbnail URL</label>
                                                <input 
                                                    type="text"
                                                    className="form-input"
                                                    value={settings.welcomeMessage.thumbnail}
                                                    onChange={(e) => updateSetting('welcomeMessage.thumbnail', e.target.value)}
                                                    placeholder="https://example.com/image.png"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">Image URL</label>
                                                <input 
                                                    type="text"
                                                    className="form-input"
                                                    value={settings. welcomeMessage.image}
                                                    onChange={(e) => updateSetting('welcomeMessage. image', e.target.value)}
                                                    placeholder="https://example.com/image.png"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">Footer</label>
                                                <input 
                                                    type="text"
                                                    className="form-input"
                                                    value={settings.welcomeMessage.footer}
                                                    onChange={(e) => updateSetting('welcomeMessage.footer', e.target.value)}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="card">
                                    <h2>Leave Message</h2>
                                    
                                    <div className="form-group">
                                        <label className="form-label">
                                            <input 
                                                type="checkbox"
                                                className="form-checkbox"
                                                checked={settings.leaveMessage.enabled}
                                                onChange={(e) => updateSetting('leaveMessage.enabled', e.target. checked)}
                                            />
                                            {' '}Enable Leave Messages
                                        </label>
                                    </div>

                                    {settings.leaveMessage.enabled && (
                                        <>
                                            <div className="form-group">
                                                <label className="form-label">Title</label>
                                                <input 
                                                    type="text"
                                                    className="form-input"
                                                    value={settings.leaveMessage.title}
                                                    onChange={(e) => updateSetting('leaveMessage.title', e.target.value)}
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">Description</label>
                                                <textarea 
                                                    className="form-textarea"
                                                    value={settings.leaveMessage.description}
                                                    onChange={(e) => updateSetting('leaveMessage.description', e.target.value)}
                                                    placeholder="Use {user}, {server}, {memberCount} as variables"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">Color</label>
                                                <input 
                                                    type="color"
                                                    className="form-input"
                                                    value={settings.leaveMessage.color}
                                                    onChange={(e) => updateSetting('leaveMessage.color', e.target.value)}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Punishments Tab */}
                        {activeTab === 'punishments' && (
                            <div className="card">
                                <h2>Punishment System</h2>

                                <div className="form-group">
                                    <label className="form-label">Warning Threshold</label>
                                    <input 
                                        type="number"
                                        className="form-input"
                                        value={settings.punishments. warnThreshold}
                                        onChange={(e) => updateSetting('punishments.warnThreshold', parseInt(e.target.value))}
                                        min="1"
                                        max="20"
                                    />
                                    <small>Number of warnings before automatic action</small>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Appeal Link</label>
                                    <input 
                                        type="text"
                                        className="form-input"
                                        value={settings.appealLink}
                                        onChange={(e) => updateSetting('appealLink', e.target.value)}
                                        placeholder="https://your-appeal-form.com"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Settings;