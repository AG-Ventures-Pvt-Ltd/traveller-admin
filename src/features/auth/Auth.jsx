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

const { Title, Text, Link } = Typography;

export const Auth = () => {
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [api, contextHolder] = notification.useNotification();

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
        } else if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters!');
            isValid = false;
        } else {
            setPasswordError('');
        }

        return isValid;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            api.success({
                message: 'Login Successful',
                description: `Welcome, ${username}`,
                placement: 'topRight',
            });
            console.log('Login values:', { username, password });
        }, 1500);
    };

    const handleForgotPassword = () => {
        api.info({
            message: 'Forgot Password',
            description: 'Please contact your admin for resetting/changing your password',
            placement: 'topRight',
            duration: 5,
        });
    };

    const handleKeyPress = (e) => {
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
            {contextHolder}

            <div className="min-h-screen bg-gradient-to-br from-[#0c0c0c] to-[#1a1a1a] flex items-center justify-center p-5">
                <Card
                    className="w-full max-w-[400px] bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl"
                    styles={{
                        body: { padding: '40px 32px' }, 
                    }}
                >
                    <Space direction="vertical" size="large" className="w-full">
                        <div className="text-center mb-6">
                            <div className="text-5xl text-[#1890ff] mb-4">
                                <Shield />
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
                                prefix={<User className="text-gray-500" />}
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
                                prefix={<Lock className="text-gray-500" />}
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
