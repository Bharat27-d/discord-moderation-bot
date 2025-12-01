import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiSend } from 'react-icons/fi';
import './EmbedBuilder.css';

function EmbedBuilder() {
    const { id } = useParams();
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    
    const [embed, setEmbed] = useState({
        title: '',
        description: '',
        color: '#5865f2',
        thumbnail: '',
        image: '',
        footer: '',
        author: {
            name: '',
            iconURL: ''
        },
        fields: []
    });
    
    const [selectedChannel, setSelectedChannel] = useState('');

    useEffect(() => {
        fetchChannels();
    }, [id]);

    const fetchChannels = async () => {
        try {
            const response = await api. get(`/api/server/${id}/channels`);
            setChannels(response.data.channels);
        } catch (error) {
            console.error('Failed to fetch channels:', error);
            toast.error('Failed to load channels');
        } finally {
            setLoading(false);
        }
    };

    const updateEmbed = (field, value) => {
        setEmbed(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const updateAuthor = (field, value) => {
        setEmbed(prev => ({
            ...prev,
            author: {
                ...prev.author,
                [field]: value
            }
        }));
    };

    const addField = () => {
        setEmbed(prev => ({
            ...prev,
            fields: [
                ...prev.fields,
                { name: 'Field Name', value: 'Field Value', inline: false }
            ]
        }));
    };

    const updateField = (index, field, value) => {
        setEmbed(prev => {
            const newFields = [...prev.fields];
            newFields[index] = {
                ...newFields[index],
                [field]: value
            };
            return {
                ...prev,
                fields: newFields
            };
        });
    };

    const removeField = (index) => {
        setEmbed(prev => ({
            ...prev,
            fields: prev.fields.filter((_, i) => i !== index)
        }));
    };

    const handleSendEmbed = async () => {
        if (!selectedChannel) {
            toast.error('Please select a channel');
            return;
        }

        if (!embed.title && !embed.description) {
            toast.error('Embed must have at least a title or description');
            return;
        }

        setSending(true);
        try {
            await api.post(`/api/server/${id}/embed/send`, {
                channelId: selectedChannel,
                embed: embed
            });
            toast.success('Embed sent successfully! ');
            
            // Reset form
            setEmbed({
                title: '',
                description: '',
                color: '#5865f2',
                thumbnail: '',
                image: '',
                footer: '',
                author: {
                    name: '',
                    iconURL: ''
                },
                fields: []
            });
        } catch (error) {
            console.error('Failed to send embed:', error);
            toast.error('Failed to send embed');
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="page-layout">
                    <Sidebar />
                    <div className="loading">Loading embed builder...</div>
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
                        <div className="embed-builder-header">
                            <h1>Embed Builder</h1>
                            <div className="embed-builder-actions">
                                <select 
                                    className="form-select"
                                    value={selectedChannel}
                                    onChange={(e) => setSelectedChannel(e.target.value)}
                                    style={{ marginRight: '10px' }}
                                >
                                    <option value="">Select Channel</option>
                                    {channels.map(channel => (
                                        <option key={channel.id} value={channel.id}>
                                            #{channel.name}
                                        </option>
                                    ))}
                                </select>
                                <button 
                                    className="btn btn-primary"
                                    onClick={handleSendEmbed}
                                    disabled={sending}
                                >
                                    <FiSend /> {sending ? 'Sending.. .' : 'Send Embed'}
                                </button>
                            </div>
                        </div>

                        <div className="embed-builder-container">
                            {/* Form */}
                            <div className="embed-form">
                                <div className="card">
                                    <h2>Embed Content</h2>

                                    <div className="form-group">
                                        <label className="form-label">Author Name</label>
                                        <input 
                                            type="text"
                                            className="form-input"
                                            value={embed.author.name}
                                            onChange={(e) => updateAuthor('name', e.target.value)}
                                            placeholder="Author name"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Author Icon URL</label>
                                        <input 
                                            type="text"
                                            className="form-input"
                                            value={embed.author.iconURL}
                                            onChange={(e) => updateAuthor('iconURL', e.target.value)}
                                            placeholder="https://example.com/icon.png"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Title</label>
                                        <input 
                                            type="text"
                                            className="form-input"
                                            value={embed.title}
                                            onChange={(e) => updateEmbed('title', e.target.value)}
                                            placeholder="Embed title"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Description</label>
                                        <textarea 
                                            className="form-textarea"
                                            value={embed.description}
                                            onChange={(e) => updateEmbed('description', e.target.value)}
                                            placeholder="Embed description"
                                            rows="5"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Color</label>
                                        <div className="color-picker-group">
                                            <input 
                                                type="color"
                                                className="color-input"
                                                value={embed.color}
                                                onChange={(e) => updateEmbed('color', e.target. value)}
                                            />
                                            <input 
                                                type="text"
                                                className="form-input"
                                                value={embed.color}
                                                onChange={(e) => updateEmbed('color', e.target. value)}
                                                placeholder="#5865f2"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Thumbnail URL</label>
                                        <input 
                                            type="text"
                                            className="form-input"
                                            value={embed.thumbnail}
                                            onChange={(e) => updateEmbed('thumbnail', e.target.value)}
                                            placeholder="https://example. com/thumbnail.png"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Image URL</label>
                                        <input 
                                            type="text"
                                            className="form-input"
                                            value={embed.image}
                                            onChange={(e) => updateEmbed('image', e.target. value)}
                                            placeholder="https://example.com/image. png"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Footer</label>
                                        <input 
                                            type="text"
                                            className="form-input"
                                            value={embed.footer}
                                            onChange={(e) => updateEmbed('footer', e.target. value)}
                                            placeholder="Footer text"
                                        />
                                    </div>
                                </div>

                                <div className="card">
                                    <div className="fields-header">
                                        <h2>Fields</h2>
                                        <button 
                                            className="btn btn-secondary"
                                            onClick={addField}
                                        >
                                            <FiPlus /> Add Field
                                        </button>
                                    </div>

                                    {embed.fields.length === 0 ? (
                                        <p className="empty-state">No fields added yet</p>
                                    ) : (
                                        <div className="fields-list">
                                            {embed. fields.map((field, index) => (
                                                <div key={index} className="field-item">
                                                    <div className="field-item-header">
                                                        <span>Field {index + 1}</span>
                                                        <button 
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => removeField(index)}
                                                        >
                                                            <FiTrash2 />
                                                        </button>
                                                    </div>

                                                    <div className="form-group">
                                                        <label className="form-label">Field Name</label>
                                                        <input 
                                                            type="text"
                                                            className="form-input"
                                                            value={field.name}
                                                            onChange={(e) => updateField(index, 'name', e.target.value)}
                                                        />
                                                    </div>

                                                    <div className="form-group">
                                                        <label className="form-label">Field Value</label>
                                                        <textarea 
                                                            className="form-textarea"
                                                            value={field.value}
                                                            onChange={(e) => updateField(index, 'value', e.target.value)}
                                                            rows="3"
                                                        />
                                                    </div>

                                                    <div className="form-group">
                                                        <label className="form-label">
                                                            <input 
                                                                type="checkbox"
                                                                className="form-checkbox"
                                                                checked={field.inline}
                                                                onChange={(e) => updateField(index, 'inline', e.target.checked)}
                                                            />
                                                            {' '}Display Inline
                                                        </label>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="embed-preview-container">
                                <div className="card">
                                    <h2>Live Preview</h2>
                                    <div className="embed-preview">
                                        <div 
                                            className="embed-preview-content"
                                            style={{ borderLeftColor: embed.color }}
                                        >
                                            {embed.author.name && (
                                                <div className="embed-author">
                                                    {embed.author.iconURL && (
                                                        <img 
                                                            src={embed.author.iconURL} 
                                                            alt="Author"
                                                            className="embed-author-icon"
                                                            onError={(e) => e.target.style.display = 'none'}
                                                        />
                                                    )}
                                                    <span>{embed.author.name}</span>
                                                </div>
                                            )}

                                            {embed.title && (
                                                <div className="embed-title">{embed.title}</div>
                                            )}

                                            {embed.description && (
                                                <div className="embed-description">
                                                    {embed. description}
                                                </div>
                                            )}

                                            {embed.fields.length > 0 && (
                                                <div className="embed-fields">
                                                    {embed.fields.map((field, index) => (
                                                        <div 
                                                            key={index} 
                                                            className={`embed-field ${field.inline ? 'inline' : ''}`}
                                                        >
                                                            <div className="embed-field-name">{field.name}</div>
                                                            <div className="embed-field-value">{field.value}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {embed.image && (
                                                <img 
                                                    src={embed.image} 
                                                    alt="Embed"
                                                    className="embed-image"
                                                    onError={(e) => e. target.style.display = 'none'}
                                                />
                                            )}

                                            {embed.thumbnail && (
                                                <img 
                                                    src={embed.thumbnail} 
                                                    alt="Thumbnail"
                                                    className="embed-thumbnail"
                                                    onError={(e) => e.target.style.display = 'none'}
                                                />
                                            )}

                                            {embed.footer && (
                                                <div className="embed-footer">{embed. footer}</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default EmbedBuilder;