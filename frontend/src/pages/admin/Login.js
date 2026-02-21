import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLock, FiLogIn, FiShield, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // 2FA state
    const [show2FA, setShow2FA] = useState(false);
    const [tempUserId, setTempUserId] = useState('');
    const [twoFAMessage, setTwoFAMessage] = useState('');
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [resendCooldown, setResendCooldown] = useState(0);
    const inputRefs = useRef([]);

    const { login, verify2FA, resend2FA } = useAuth();
    const navigate = useNavigate();

    // Auto-focus first code input when 2FA shows
    useEffect(() => {
        if (show2FA && inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [show2FA]);

    // Resend cooldown timer
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await login(email, password);

        if (result.success) {
            if (result.requires2FA) {
                // Show 2FA code input
                setShow2FA(true);
                setTempUserId(result.tempUserId);
                setTwoFAMessage(result.message);
                setResendCooldown(30);
            } else {
                // Direct login (2FA disabled)
                navigate('/admin/dashboard');
            }
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    const handleCodeChange = (index, value) => {
        if (!/^\d*$/.test(value)) return; // Only allow digits

        const newCode = [...code];
        newCode[index] = value.slice(-1); // Take last digit only
        setCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all 6 digits entered
        const fullCode = newCode.join('');
        if (fullCode.length === 6) {
            handleVerifyCode(fullCode);
        }
    };

    const handleCodeKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleCodePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pastedData.length === 6) {
            const newCode = pastedData.split('');
            setCode(newCode);
            inputRefs.current[5]?.focus();
            handleVerifyCode(pastedData);
        }
    };

    const handleVerifyCode = async (fullCode) => {
        setLoading(true);
        setError('');

        const result = await verify2FA(tempUserId, fullCode);

        if (result.success) {
            navigate('/admin/dashboard');
        } else {
            setError(result.error);
            setCode(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        }

        setLoading(false);
    };

    const handleResendCode = async () => {
        if (resendCooldown > 0) return;

        const result = await resend2FA(tempUserId);
        if (result.success) {
            setTwoFAMessage('New verification code sent!');
            setResendCooldown(30);
            setCode(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } else {
            setError(result.error);
        }
    };

    const handleBack = () => {
        setShow2FA(false);
        setCode(['', '', '', '', '', '']);
        setError('');
        setTwoFAMessage('');
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {show2FA ? 'Verify Your Identity' : 'Admin Login'}
                    </h1>
                    <p className="text-gray-400">
                        {show2FA ? twoFAMessage : 'Sign in to manage your portfolio'}
                    </p>
                </div>

                <div className="card p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {!show2FA ? (
                        /* Step 1: Email & Password */
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="label">Email Address</label>
                                <div className="relative">
                                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="input-field pl-10"
                                        placeholder="admin@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="label">Password</label>
                                <div className="relative">
                                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="input-field pl-10"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        <FiLogIn /> Sign In
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        /* Step 2: 2FA Code Entry */
                        <div className="space-y-6">
                            <div className="flex items-center justify-center">
                                <div className="w-16 h-16 bg-primary-600/20 rounded-full flex items-center justify-center">
                                    <FiShield className="text-primary-400" size={28} />
                                </div>
                            </div>

                            <p className="text-center text-gray-400 text-sm">
                                Enter the 6-digit code sent to your email
                            </p>

                            {/* 6-digit code inputs */}
                            <div className="flex justify-center gap-2" onPaste={handleCodePaste}>
                                {code.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => (inputRefs.current[index] = el)}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleCodeChange(index, e.target.value)}
                                        onKeyDown={(e) => handleCodeKeyDown(index, e)}
                                        className="w-12 h-14 text-center text-xl font-bold bg-dark-200 border border-gray-700 rounded-lg text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                                    />
                                ))}
                            </div>

                            {loading && (
                                <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Verifying...
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="text-gray-400 hover:text-white text-sm flex items-center gap-1 transition-colors"
                                >
                                    <FiArrowLeft size={14} /> Back to login
                                </button>

                                <button
                                    type="button"
                                    onClick={handleResendCode}
                                    disabled={resendCooldown > 0}
                                    className="text-sm text-primary-400 hover:text-primary-300 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
                                >
                                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {!show2FA && (
                    <Link
                        to="/admin/forgot-password"
                        className="text-gray-400 hover:text-primary-400 text-sm transition-colors"
                    >
                        Forgot your password?
                    </Link>
                )}
            </div>
        </div>
    );
};

export default Login;
