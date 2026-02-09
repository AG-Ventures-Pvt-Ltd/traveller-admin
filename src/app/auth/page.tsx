'use client';
import React, { useState } from 'react';
import {
    Button,
    Card,
    Typography,
    Space,
    Divider,
    ConfigProvider,
    theme,
    Input,
    notification
} from 'antd';
import { User, Lock, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePostData } from '../../services/usePostData';
import { api } from '../../common/constants/api.urls';
import { useAuthStore,  } from '../../store/auth.store';

import { Role } from '@/common/constants/rolePermissions'; // Import correct Role type

const { Title, Text, Link } = Typography;

interface LoginResponse {
    data: {
        username: string;
        token: string;
        id: string;
        permissions: string[];
            
        
        
    };
}

interface LoginBody {
    username: string;
    password: string;
}

const Auth = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const router = useRouter();
    const { login } = useAuthStore();

    const { mutateAsync: loginMutation, isPending: loading } = usePostData<LoginResponse, LoginBody>(api.login, {
        onSuccess: (data) => {
            // Update auth store
      
        
            login({
                
                name: data.data.username || 'User',
                id: data.data.id || 'User',
                token: data.data.token,
                permissions: data.data.permissions
            });
            
            localStorage.setItem("user", `${data.data.token}`)
            notification.success({
                message: 'Login Successful',
                description: `Welcome, ${data.data.username || 'User'}`,
                placement: 'topRight',
            });

            // Redirect to dashboard
            router.push('/dashboard');
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            console.error('Login error:', error);
            notification.error({
                message: 'Login Failed',
                description: error.response?.data?.message || 'Invalid credentials. Please try again.',
                placement: 'topRight',
            });
        }
    });

    const validateForm = () => {
        let isValid = true;

        if (!username) {
            setUsernameError('Please enter your username!');
            isValid = false;
        } else if (username.length < 3) {
            setUsernameError('Username must be at least 3 characters!');
            isValid = false;
        } else {
            setUsernameError('');
        }

        if (!password) {
            setPasswordError('Please enter your password!');
            isValid = false;
        } else if (password.length < 5) { // Adjusted length check
            setPasswordError('Password must be at least 5 characters!');
            isValid = false;
        } else {
            setPasswordError('');
        }

        return isValid;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        // Check for dummy user credentials (for development/testing)
        // const dummyUserKey = Object.keys(DUMMY_USERS).find(key =>
        //     key.toLowerCase() === username.toLowerCase() ||
        //     DUMMY_USERS[key].name.toLowerCase() === username.toLowerCase()
        // );

        // if (dummyUserKey) {
        //     const dummyUser = DUMMY_USERS[dummyUserKey];
        //     login({
        //         ...dummyUser,
        //         token: 'dummy-token-' + Date.now(),
        //     });

        //     notification.success({
        //         message: 'Login Successful (Test Mode)',
        //         description: `Welcome Back, ${dummyUser.name}`,
        //         placement: 'topRight',
        //     });
        //     router.push('/dashboard');
        //     return;
        // }

        await loginMutation({
            username,
            password
        });
    };

    const handleForgotPassword = () => {
        notification.info({
            message: 'Forgot Password',
            description: 'Please contact your admin for resetting/changing your password',
            placement: 'topRight',
            duration: 5,
        });
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    return (
        <ConfigProvider
            theme={{
                algorithm: theme.darkAlgorithm,
                token: {
                    colorPrimary: '#1890ff',
                    borderRadius: 8,
                },
            }}
        >
            <div className="min-h-screen bg-gradient-to-br from-[#0c0c0c] to-[#1a1a1a] flex items-center justify-center p-5">
                <Card
                    className="w-full max-w-[400px] bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl"
                    styles={{
                        body: { padding: '40px 32px' },
                    }}
                >
                    <Space direction="vertical" size="large" className="w-full">
                        <div className="text-center mb-6">
                            <div className="flex justify-center text-5xl text-[#1890ff] mb-4">
                                <Shield size={48} />
                            </div>
                            <Title level={2} className="!m-0 !text-white">
                                Admin Panel
                            </Title>
                            <Text type="secondary" className="!text-base">
                                Sign in to your account
                            </Text>
                        </div>
                        <div className="mb-5">
                            <Input
                                size="large"
                                prefix={<User size={18} className="text-gray-500" />}
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className={`bg-white/5 text-white ${usernameError ? "border-red-500" : "border-white/20"
                                    }`}
                            />
                            {usernameError && (
                                <Text type="danger" className="text-xs mt-1 block">
                                    {usernameError}
                                </Text>
                            )}
                        </div>
                        <div className="mb-5">
                            <Input.Password
                                size="large"
                                prefix={<Lock size={18} className="text-gray-500" />}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className={`bg-white/5 text-white ${passwordError ? "border-red-500" : "border-white/20"
                                    }`}
                            />
                            {passwordError && (
                                <Text type="danger" className="text-xs mt-1 block">
                                    {passwordError}
                                </Text>
                            )}
                        </div>
                        <Button
                            type="primary"
                            size="large"
                            loading={loading}
                            onClick={handleSubmit}
                            className="w-full h-12 text-lg font-bold bg-gradient-to-br from-[#1890ff] to-[#096dd9] border-none shadow-lg mb-4"
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </Button>
                        <Divider className="border-white/10 my-4" />
                        <div className="text-center">
                            <Link
                                onClick={handleForgotPassword}
                                className="text-[#1890ff] text-sm cursor-pointer no-underline"
                            >
                                Forgot your password?
                            </Link>
                        </div>
                        <div className="text-center mt-6">
                            <Text type="secondary" className="text-xs">
                                Secure admin access only
                            </Text>
                        </div>
                    </Space>
                </Card>
            </div>
        </ConfigProvider>
    );
};

export default Auth;
