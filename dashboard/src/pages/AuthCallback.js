import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');

        if (token) {
            login(token);
            toast.success('Successfully logged in!');
            navigate('/servers');
        } else {
            toast.error('Authentication failed');
            navigate('/login');
        }
    }, [searchParams, login, navigate]);

    return (
        <div className="loading">
            <div>Authenticating...</div>
        </div>
    );
}

export default AuthCallback;