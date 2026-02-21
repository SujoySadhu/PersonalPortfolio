import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiSend, FiShield, FiLock, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';
import { authAPI } from '../../services/api';

const ForgotPassword = () => {
    const navigate = useNavigate();

    // Step: 'email' | 'code' | 'password' | 'success'
    const [step, setStep] = useState('email');
    const [email, setEmail] = useState('');
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);
    const inputRefs = useRef([]);

    // Auto-focus first code input
    useEffect(() => {
        if (step === 'code' && inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [step]);

    // Resend cooldown timer
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    // Step 1: Send code to email
    const handleSendCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await authAPI.forgotPassword({ email });
            setStep('code');
            setResendCooldown(30);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Code input handlers
    const handleCodeChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newCode = [...code];
        newCode[index] = value.slice(-1);
        setCode(newCode);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // When all 6 digits entered, move to password step
        const fullCode = newCode.join('');
        if (fullCode.length === 6) {
            setStep('password');
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
            setStep('password');
        }
    };

    // Step 3: Reset password with code
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);

        try {
            await authAPI.resetPassword({ email, code: code.join(''), password });
            setStep('success');
            setTimeout(() => navigate('/admin/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    // Resend code
    const handleResendCode = async () => {
        if (resendCooldown > 0) return;
        try {
            await authAPI.forgotPassword({ email });
            setResendCooldown(30);
            setCode(['', '', '', '', '', '']);
            setError('');
            inputRefs.current[0]?.focus();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend code.');
        }
    };

    // Step titles
    const titles = {
        email: { heading: 'Reset Password', sub: 'Enter your email to receive a verification code' },
        code: { heading: 'Enter Code', sub: `6-digit code sent to ${email}` },
        password: { heading: 'New Password', sub: 'Create a new password for your account' },
        success: { heading: 'Password Reset!', sub: 'Redirecting to login...' }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full">
                {/* Step indicator */}
                {step !== 'success' && (
                    <div className="flex items-center justify-center gap-2 mb-8">
                        {['email', 'code', 'password'].map((s, i) => (
                            <div key={s} className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step === s ? 'bg-primary-600 text-white' :
                                        ['email', 'code', 'password'].indexOf(step) > i ? 'bg-green-600 text-white' :
                                            'bg-dark-300 text-gray-500'
                                    }`}>
                                    {['email', 'code', 'password'].indexOf(step) > i ? '✓' : i + 1}
                                </div>
                                {i < 2 && <div className={`w-12 h-0.5 ${['email', 'code', 'password'].indexOf(step) > i ? 'bg-green-600' : 'bg-dark-300'}`} />}
                            </div>
                        ))}
                    </div>
                )}

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">{titles[step].heading}</h1>
                    <p className="text-gray-400">{titles[step].sub}</p>
                </div>

                <div className="card p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Step 1: Email */}
                    {step === 'email' && (
                        <form onSubmit={handleSendCode} className="space-y-6">
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
                                        autoFocus
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
                                        Sending Code...
                                    </>
                                ) : (
                                    <>
                                        <FiSend /> Send Verification Code
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Step 2: 6-digit Code */}
                    {step === 'code' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-center">
                                <div className="w-16 h-16 bg-primary-600/20 rounded-full flex items-center justify-center">
                                    <FiShield className="text-primary-400" size={28} />
                                </div>
                            </div>

                            <p className="text-center text-gray-400 text-sm">
                                Enter the 6-digit code from your email
                            </p>

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

                            <div className="flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => { setStep('email'); setCode(['', '', '', '', '', '']); setError(''); }}
                                    className="text-gray-400 hover:text-white text-sm flex items-center gap-1 transition-colors"
                                >
                                    <FiArrowLeft size={14} /> Change email
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

                    {/* Step 3: New Password */}
                    {step === 'password' && (
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div>
                                <label className="label">New Password</label>
                                <div className="relative">
                                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="input-field pl-10 pr-10"
                                        placeholder="Minimum 6 characters"
                                        minLength={6}
                                        required
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                    >
                                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="label">Confirm Password</label>
                                <div className="relative">
                                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input
                                        type={showConfirm ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="input-field pl-10 pr-10"
                                        placeholder="Re-enter password"
                                        minLength={6}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                    >
                                        {showConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Password strength indicator */}
                            {password && (
                                <div className="space-y-2">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4].map((level) => (
                                            <div
                                                key={level}
                                                className={`h-1.5 flex-1 rounded-full transition-colors ${password.length >= level * 3
                                                        ? password.length >= 12 ? 'bg-green-500'
                                                            : password.length >= 8 ? 'bg-yellow-500'
                                                                : 'bg-red-500'
                                                        : 'bg-gray-700'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {password.length < 6 ? 'Too short' :
                                            password.length < 8 ? 'Weak' :
                                                password.length < 12 ? 'Good' : 'Strong'}
                                    </p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Resetting...
                                    </>
                                ) : (
                                    <>
                                        <FiLock /> Reset Password
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => { setStep('code'); setCode(['', '', '', '', '', '']); setError(''); }}
                                className="w-full text-gray-400 hover:text-white text-sm flex items-center justify-center gap-1 transition-colors"
                            >
                                <FiArrowLeft size={14} /> Go back to code entry
                            </button>
                        </form>
                    )}

                    {/* Step 4: Success */}
                    {step === 'success' && (
                        <div className="text-center space-y-6">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                                <FiCheck className="text-green-400" size={28} />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold text-lg mb-2">Success!</h3>
                                <p className="text-gray-400 text-sm">
                                    Your password has been updated. Redirecting to login...
                                </p>
                            </div>
                            <Link
                                to="/admin/login"
                                className="btn-primary inline-flex items-center gap-2"
                            >
                                Go to Login Now
                            </Link>
                        </div>
                    )}
                </div>

                {step !== 'success' && (
                    <div className="text-center mt-6">
                        <Link
                            to="/admin/login"
                            className="text-gray-400 hover:text-white text-sm flex items-center justify-center gap-1 transition-colors"
                        >
                            <FiArrowLeft size={14} /> Back to login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
