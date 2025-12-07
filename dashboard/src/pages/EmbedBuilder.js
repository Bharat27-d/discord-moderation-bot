import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiSend, FiBold, FiItalic, FiCode, FiLink, FiClock, FiAtSign, FiUsers } from 'react-icons/fi';
import './EmbedBuilder.css';

function EmbedBuilder() {
    const { id } = useParams();
    const [channels, setChannels] = useState([]);
    const [members, setMembers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [activeField, setActiveField] = useState(null);
    
    const [embed, setEmbed] = useState({
        title: '',
        description: '',
        color: '#5865f2',
        url: '',
        thumbnail: '',
        image: '',
        footer: {
            text: '',
            iconURL: ''
        },
        timestamp: false,
        author: {
            name: '',
            iconURL: ''
        },
        fields: []
    });
    
    const [selectedChannel, setSelectedChannel] = useState('');

    const fetchChannels = React.useCallback(async () => {
        try {
            const response = await api.get(`/api/server/${id}/channels`);
            setChannels(response.data.channels);
        } catch (error) {
            console.error('Failed to fetch channels:', error);
            toast.error('Failed to load channels');
        } finally {
            setLoading(false);
        }
    }, [id]);

    const fetchMembers = React.useCallback(async () => {
        try {
            const response = await api.get(`/api/server/${id}/members`);
            setMembers(response.data.members || []);
        } catch (error) {
            console.error('Failed to fetch members:', error);
        }
    }, [id]);

    const fetchRoles = React.useCallback(async () => {
        try {
            const response = await api.get(`/api/server/${id}/roles`);
            setRoles(response.data.roles || []);
        } catch (error) {
            console.error('Failed to fetch roles:', error);
        }
    }, [id]);

    useEffect(() => {
        fetchChannels();
        fetchMembers();
        fetchRoles();
    }, [fetchChannels, fetchMembers, fetchRoles]);

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

    const updateFooter = (field, value) => {
        setEmbed(prev => ({
            ...prev,
            footer: {
                ...prev.footer,
                [field]: value
            }
        }));
    };

    const insertFormatting = (field, format) => {
        const textarea = document.querySelector(`textarea[data-field="${field}"]`);
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selectedText = text.substring(start, end) || 'text';
        
        let formattedText = '';
        let cursorOffset = 0;

        switch(format) {
            case 'bold':
                formattedText = `**${selectedText}**`;
                cursorOffset = 2;
                break;
            case 'italic':
                formattedText = `*${selectedText}*`;
                cursorOffset = 1;
                break;
            case 'underline':
                formattedText = `__${selectedText}__`;
                cursorOffset = 2;
                break;
            case 'strikethrough':
                formattedText = `~~${selectedText}~~`;
                cursorOffset = 2;
                break;
            case 'code':
                formattedText = `\`${selectedText}\``;
                cursorOffset = 1;
                break;
            case 'codeblock':
                formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
                cursorOffset = 4;
                break;
            case 'link':
                formattedText = `[${selectedText}](url)`;
                cursorOffset = selectedText.length + 3;
                break;
            default:
                return;
        }

        const newText = text.substring(0, start) + formattedText + text.substring(end);
        
        if (field === 'description') {
            updateEmbed('description', newText);
        } else {
            const fieldIndex = parseInt(field.replace('field-', ''));
            updateField(fieldIndex, 'value', newText);
        }

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + cursorOffset, start + cursorOffset + selectedText.length);
        }, 0);
    };

    const insertMention = (field, type, id, name) => {
        const textarea = document.querySelector(`textarea[data-field="${field}"]`);
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        
        const mention = type === 'user' ? `<@${id}>` : `<@&${id}>`;
        const newText = text.substring(0, start) + mention + text.substring(end);
        
        if (field === 'description') {
            updateEmbed('description', newText);
        } else {
            const fieldIndex = parseInt(field.replace('field-', ''));
            updateField(fieldIndex, 'value', newText);
        }

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + mention.length, start + mention.length);
        }, 0);
        
        setShowMemberModal(false);
        setShowRoleModal(false);
        toast.success(`Added ${type} mention: ${name}`);
    };

    const formatMarkdownForPreview = (text) => {
        if (!text) return '';
        return text
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/__(.+?)__/g, '<u>$1</u>')
            .replace(/~~(.+?)~~/g, '<del>$1</del>')
            .replace(/`(.+?)`/g, '<code>$1</code>')
            .replace(/<@!?(\d+)>/g, '<span class="mention-user">@user</span>')
            .replace(/<@&(\d+)>/g, '<span class="mention-role">@role</span>')
            .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>')
            .replace(/\n/g, '<br/>');
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
                url: '',
                thumbnail: '',
                image: '',
                footer: {
                    text: '',
                    iconURL: ''
                },
                timestamp: false,
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
                                        <label className="form-label">URL (Title Link)</label>
                                        <input 
                                            type="text"
                                            className="form-input"
                                            value={embed.url}
                                            onChange={(e) => updateEmbed('url', e.target.value)}
                                            placeholder="https://example.com"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Description</label>
                                        <div className="formatting-toolbar">
                                            <button type="button" className="format-btn" onClick={() => insertFormatting('description', 'bold')} title="Bold">
                                                <FiBold />
                                            </button>
                                            <button type="button" className="format-btn" onClick={() => insertFormatting('description', 'italic')} title="Italic">
                                                <FiItalic />
                                            </button>
                                            <button type="button" className="format-btn" onClick={() => insertFormatting('description', 'underline')} title="Underline">
                                                <span style={{fontWeight: 'bold', textDecoration: 'underline'}}>U</span>
                                            </button>
                                            <button type="button" className="format-btn" onClick={() => insertFormatting('description', 'strikethrough')} title="Strikethrough">
                                                <span style={{textDecoration: 'line-through'}}>S</span>
                                            </button>
                                            <button type="button" className="format-btn" onClick={() => insertFormatting('description', 'code')} title="Inline Code">
                                                <FiCode />
                                            </button>
                                            <button type="button" className="format-btn" onClick={() => insertFormatting('description', 'codeblock')} title="Code Block">
                                                <span style={{fontFamily: 'monospace'}}>{'{}'}</span>
                                            </button>
                                            <button type="button" className="format-btn" onClick={() => insertFormatting('description', 'link')} title="Link">
                                                <FiLink />
                                            </button>
                                            <div className="toolbar-divider"></div>
                                            <button type="button" className="format-btn" onClick={() => { setActiveField('description'); setShowMemberModal(true); }} title="Mention User">
                                                <FiAtSign />
                                            </button>
                                            <button type="button" className="format-btn" onClick={() => { setActiveField('description'); setShowRoleModal(true); }} title="Mention Role">
                                                <FiUsers />
                                            </button>
                                        </div>
                                        <textarea 
                                            className="form-textarea"
                                            data-field="description"
                                            value={embed.description}
                                            onChange={(e) => updateEmbed('description', e.target.value)}
                                            placeholder="Embed description\n\nSupports: **bold** *italic* __underline__ ~~strikethrough~~ `code` [link](url)"
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
                                            placeholder="https://example.com/thumbnail.png"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Image URL</label>
                                        <input 
                                            type="text"
                                            className="form-input"
                                            value={embed.image}
                                            onChange={(e) => updateEmbed('image', e.target.value)}
                                            placeholder="https://example.com/image.png"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Footer Text</label>
                                        <input 
                                            type="text"
                                            className="form-input"
                                            value={embed.footer.text}
                                            onChange={(e) => updateFooter('text', e.target.value)}
                                            placeholder="Footer text"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Footer Icon URL</label>
                                        <input 
                                            type="text"
                                            className="form-input"
                                            value={embed.footer.iconURL}
                                            onChange={(e) => updateFooter('iconURL', e.target.value)}
                                            placeholder="https://example.com/footer-icon.png"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">
                                            <input 
                                                type="checkbox"
                                                className="form-checkbox"
                                                checked={embed.timestamp}
                                                onChange={(e) => updateEmbed('timestamp', e.target.checked)}
                                            />
                                            {' '}<FiClock style={{verticalAlign: 'middle'}} /> Include Timestamp
                                        </label>
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
                                            {embed.fields.map((field, index) => (
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
                                                        <div className="formatting-toolbar">
                                                            <button type="button" className="format-btn" onClick={() => insertFormatting(`field-${index}`, 'bold')} title="Bold">
                                                                <FiBold />
                                                            </button>
                                                            <button type="button" className="format-btn" onClick={() => insertFormatting(`field-${index}`, 'italic')} title="Italic">
                                                                <FiItalic />
                                                            </button>
                                                            <button type="button" className="format-btn" onClick={() => insertFormatting(`field-${index}`, 'code')} title="Code">
                                                                <FiCode />
                                                            </button>
                                                            <button type="button" className="format-btn" onClick={() => insertFormatting(`field-${index}`, 'link')} title="Link">
                                                                <FiLink />
                                                            </button>
                                                            <div className="toolbar-divider"></div>
                                                            <button type="button" className="format-btn" onClick={() => { setActiveField(`field-${index}`); setShowMemberModal(true); }} title="Mention User">
                                                                <FiAtSign />
                                                            </button>
                                                            <button type="button" className="format-btn" onClick={() => { setActiveField(`field-${index}`); setShowRoleModal(true); }} title="Mention Role">
                                                                <FiUsers />
                                                            </button>
                                                        </div>
                                                        <textarea 
                                                            className="form-textarea"
                                                            data-field={`field-${index}`}
                                                            value={field.value}
                                                            onChange={(e) => updateField(index, 'value', e.target.value)}
                                                            placeholder="Supports markdown formatting"
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
                                                <div className="embed-title">
                                                    {embed.url ? (
                                                        <a href={embed.url} target="_blank" rel="noopener noreferrer" style={{color: '#64ffda', textDecoration: 'none'}}>
                                                            {embed.title}
                                                        </a>
                                                    ) : embed.title}
                                                </div>
                                            )}

                                            {embed.description && (
                                                <div 
                                                    className="embed-description"
                                                    dangerouslySetInnerHTML={{__html: formatMarkdownForPreview(embed.description)}}
                                                />
                                            )}

                                            {embed.fields.length > 0 && (
                                                <div className="embed-fields">
                                                    {embed.fields.map((field, index) => (
                                                        <div 
                                                            key={index} 
                                                            className={`embed-field ${field.inline ? 'inline' : ''}`}
                                                        >
                                                            <div className="embed-field-name">{field.name}</div>
                                                            <div 
                                                                className="embed-field-value"
                                                                dangerouslySetInnerHTML={{__html: formatMarkdownForPreview(field.value)}}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {embed.image && (
                                                <img 
                                                    src={embed.image} 
                                                    alt="Embed"
                                                    className="embed-image"
                                                    onError={(e) => e.target.style.display = 'none'}
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

                                            {(embed.footer.text || embed.timestamp) && (
                                                <div className="embed-footer">
                                                    {embed.footer.iconURL && (
                                                        <img 
                                                            src={embed.footer.iconURL} 
                                                            alt="Footer"
                                                            className="embed-footer-icon"
                                                            onError={(e) => e.target.style.display = 'none'}
                                                        />
                                                    )}
                                                    <span>
                                                        {embed.footer.text}
                                                        {embed.footer.text && embed.timestamp && ' • '}
                                                        {embed.timestamp && new Date().toLocaleString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Member Selection Modal */}
                    {showMemberModal && (
                        <div className="modal-overlay" onClick={() => setShowMemberModal(false)}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h2>Select Member to Mention</h2>
                                    <button className="modal-close" onClick={() => setShowMemberModal(false)}>×</button>
                                </div>
                                <div className="modal-body">
                                    <div className="mention-list">
                                        {members.length === 0 ? (
                                            <p className="empty-state">No members available</p>
                                        ) : (
                                            members.slice(0, 50).map(member => (
                                                <div 
                                                    key={member.id} 
                                                    className="mention-item"
                                                    onClick={() => insertMention(activeField, 'user', member.id, member.username)}
                                                >
                                                    {member.avatar && (
                                                        <img 
                                                            src={member.avatar} 
                                                            alt={member.username}
                                                            className="mention-avatar"
                                                        />
                                                    )}
                                                    <div className="mention-info">
                                                        <span className="mention-name">{member.username}</span>
                                                        {member.nickname && (
                                                            <span className="mention-nickname">({member.nickname})</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Role Selection Modal */}
                    {showRoleModal && (
                        <div className="modal-overlay" onClick={() => setShowRoleModal(false)}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h2>Select Role to Mention</h2>
                                    <button className="modal-close" onClick={() => setShowRoleModal(false)}>×</button>
                                </div>
                                <div className="modal-body">
                                    <div className="mention-list">
                                        {roles.length === 0 ? (
                                            <p className="empty-state">No roles available</p>
                                        ) : (
                                            roles.filter(role => role.name !== '@everyone').map(role => (
                                                <div 
                                                    key={role.id} 
                                                    className="mention-item"
                                                    onClick={() => insertMention(activeField, 'role', role.id, role.name)}
                                                >
                                                    <div 
                                                        className="role-color-dot"
                                                        style={{backgroundColor: role.color || '#99aab5'}}
                                                    ></div>
                                                    <span className="mention-name">{role.name}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default EmbedBuilder;