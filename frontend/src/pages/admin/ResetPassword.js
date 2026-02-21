import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiLock, FiEye, FiEyeOff, FiCheck, FiArrowLeft } from 'react-icons/fi';
import { authAPI } from '../../services/api';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
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
            await authAPI.resetPassword(token, { password });
            setSuccess(true);
            // Redirect to login after 3 seconds
            setTimeout(() => navigate('/admin/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {success ? 'Password Reset!' : 'Set New Password'}
                    </h1>
                    <p className="text-gray-400">
                        {success ? 'Redirecting to login...' : 'Enter your new password below'}
                    </p>
                </div>

                <div className="card p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {success ? (
                        /* Success State */
                        <div className="text-center space-y-6">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                                <FiCheck className="text-green-400" size={28} />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold text-lg mb-2">Success!</h3>
                                <p className="text-gray-400 text-sm">
                                    Your password has been updated. You'll be redirected to the login page in a moment.
                                </p>
                            </div>
                            <Link
                                to="/admin/login"
                                className="btn-primary inline-flex items-center gap-2"
                            >
                                Go to Login
                            </Link>
                        </div>
                    ) : (
                        /* Reset Form */
                        <form onSubmit={handleSubmit} className="space-y-6">
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
                                <label className="label">Confirm New Password</label>
                                <div className="relative">
                                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input
                                        type={showConfirm ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="input-field pl-10 pr-10"
                                        placeholder="Re-enter your password"
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
                        </form>
                    )}
                </div>

                {!success && (
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

export default ResetPassword;
