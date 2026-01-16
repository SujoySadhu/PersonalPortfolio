import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiGithub, FiLinkedin, FiTwitter, FiDownload, FiMail, FiMapPin, FiCode, FiBookOpen, FiAward, FiEdit3, FiHeart, FiActivity, FiX, FiCalendar, FiExternalLink, FiMaximize2, FiEye, FiLink } from 'react-icons/fi';
import { SiLeetcode, SiCodeforces, SiCodechef, SiHackerrank } from 'react-icons/si';
import { projectsAPI, skillsAPI, settingsAPI, researchAPI, achievementsAPI, blogsAPI, interestsAPI, currentWorkAPI, getImageUrl } from '../services/api';
import ProjectCard from '../components/projects/ProjectCard';
import SkillCard from '../components/skills/SkillCard';
import Loading from '../components/common/Loading';

const Home = () => {
    const [featuredProjects, setFeaturedProjects] = useState([]);
    const [skills, setSkills] = useState([]);
    const [settings, setSettings] = useState(null);
    const [research, setResearch] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [interests, setInterests] = useState([]);
    const [currentWork, setCurrentWork] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAchievement, setSelectedAchievement] = useState(null);
    const [imageZoom, setImageZoom] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [projectsRes, skillsRes, settingsRes, researchRes, achievementsRes, blogsRes, interestsRes, currentWorkRes] = await Promise.all([
                projectsAPI.getAll({ featured: true }),
                skillsAPI.getAll(),
                settingsAPI.get(),
                researchAPI.getAll({ featured: true }),
                achievementsAPI.getAll({ featured: true }),
                blogsAPI.getAll({ featured: true, published: true }),
                interestsAPI.getAll({ active: true }),
                currentWorkAPI.getAll({ featured: true })
            ]);
            setFeaturedProjects(projectsRes.data.data?.slice(0, 3) || []);
            setSkills(skillsRes.data.data?.slice(0, 8) || []);
            setSettings(settingsRes.data.data);
            setResearch(researchRes.data.data?.slice(0, 3) || []);
            setAchievements(achievementsRes.data.data?.slice(0, 3) || []);
            setBlogs(blogsRes.data.data?.slice(0, 3) || []);
            setInterests(interestsRes.data.data?.slice(0, 4) || []);
            setCurrentWork(currentWorkRes.data.data?.slice(0, 3) || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Use local profile image from public folder for faster loading
    // Place your profile image as "profile.jpeg" in the frontend/public folder
    const LOCAL_PROFILE_IMAGE = '/profile.jpeg';

    return (
        <div className="min-h-screen pt-16">
            {/* Hero Section - Clean & Professional */}
            <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8 sm:py-16 overflow-hidden">
                {/* Subtle Background */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px]"></div>
                </div>

                <div className="relative z-10 max-w-6xl mx-auto w-full">
                    <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-12 lg:gap-20">
                        
                        {/* Profile Image - Responsive Size */}
                        <div className="flex-shrink-0 animate-fade-in">
                            <div className="relative">
                                {/* Gradient Ring */}
                                <div className="absolute -inset-1 bg-gradient-to-br from-primary-500 via-purple-500 to-cyan-500 rounded-full opacity-60 blur-sm"></div>
                                
                                {/* Image - Responsive sizing for all screens */}
                                {/* Uses local image from public folder for instant loading */}
                                <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 rounded-full overflow-hidden border-4 border-dark-100">
                                    <img 
                                        src={LOCAL_PROFILE_IMAGE} 
                                        alt="Profile" 
                                        className="w-full h-full object-cover object-top"
                                        onError={(e) => {
                                            // Fallback to API image if local doesn't exist
                                            const apiImage = getImageUrl(settings?.profileImage);
                                            if (apiImage) {
                                                e.target.onerror = null; // Prevent infinite loop
                                                e.target.src = apiImage;
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Content - Clean Typography */}
                        <div className="text-center lg:text-left flex-1 animate-fade-in">
                            
                            {/* Name - Large & Bold */}
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
                                {settings?.name || 'Your Name'}
                            </h1>
                            
                            {/* Title - Single Line, Elegant */}
                            <p className="text-lg sm:text-xl text-primary-400 font-medium mb-5">
                                {settings?.title || 'Full Stack Developer'}
                            </p>
                            
                            {/* Bio - Clean & Readable */}
                            <p className="text-gray-400 text-base leading-relaxed max-w-xl mb-6">
                                {settings?.bio || "I'm a full-stack developer specializing in building exceptional digital experiences."}
                            </p>
                            
                            {/* Info Row - Minimal */}
                            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-3 text-sm text-gray-500 mb-6">
                                {settings?.location && (
                                    <span className="flex items-center gap-1.5">
                                        <FiMapPin size={14} className="text-primary-500" />
                                        {settings.location}
                                    </span>
                                )}
                                {settings?.location && settings?.email && (
                                    <span className="text-gray-700">•</span>
                                )}
                                {settings?.email && (
                                    <a href={`mailto:${settings.email}`} className="flex items-center gap-1.5 hover:text-primary-400 transition-colors">
                                        <FiMail size={14} className="text-primary-500" />
                                        {settings.email}
                                    </a>
                                )}
                                {settings?.isAvailableForHire && (
                                    <>
                                        <span className="text-gray-700">•</span>
                                        <span className="flex items-center gap-1.5 text-green-400">
                                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                            Available for hire
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* CTA Buttons - Clean */}
                            <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-6">
                                <Link 
                                    to="/projects" 
                                    className="group px-6 py-3 bg-primary-600 hover:bg-primary-500 rounded-lg text-white font-medium transition-all duration-300 flex items-center gap-2 text-sm"
                                >
                                    View Projects
                                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                                
                                {settings?.resumeLink && (
                                    <a 
                                        href={settings.resumeLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="px-6 py-3 border border-gray-700 hover:border-gray-500 rounded-lg text-gray-300 hover:text-white font-medium transition-all duration-300 flex items-center gap-2 text-sm"
                                    >
                                        <FiDownload size={16} />
                                        Resume
                                    </a>
                                )}
                                
                                <Link 
                                    to="/contact" 
                                    className="px-6 py-3 border border-gray-700 hover:border-gray-500 rounded-lg text-gray-300 hover:text-white font-medium transition-all duration-300 text-sm"
                                >
                                    Contact
                                </Link>
                            </div>

                            {/* Social Links - Minimal Icons */}
                            <div className="flex flex-wrap justify-center lg:justify-start gap-1">
                                {settings?.socialLinks?.github && (
                                    <a href={settings.socialLinks.github} target="_blank" rel="noopener noreferrer" 
                                       className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-gray-800 transition-all duration-300" title="GitHub">
                                        <FiGithub size={18} />
                                    </a>
                                )}
                                {settings?.socialLinks?.linkedin && (
                                    <a href={settings.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                                       className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#0A66C2] hover:bg-[#0A66C2]/10 transition-all duration-300" title="LinkedIn">
                                        <FiLinkedin size={18} />
                                    </a>
                                )}
                                {settings?.socialLinks?.twitter && (
                                    <a href={settings.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                                       className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-sky-400 hover:bg-sky-400/10 transition-all duration-300" title="Twitter">
                                        <FiTwitter size={18} />
                                    </a>
                                )}
                                {settings?.socialLinks?.leetcode && (
                                    <a href={settings.socialLinks.leetcode} target="_blank" rel="noopener noreferrer"
                                       className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-yellow-500 hover:bg-yellow-500/10 transition-all duration-300" title="LeetCode">
                                        <SiLeetcode size={16} />
                                    </a>
                                )}
                                {settings?.socialLinks?.codeforces && (
                                    <a href={settings.socialLinks.codeforces} target="_blank" rel="noopener noreferrer"
                                       className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-blue-400 hover:bg-blue-400/10 transition-all duration-300" title="Codeforces">
                                        <SiCodeforces size={16} />
                                    </a>
                                )}
                                {settings?.socialLinks?.codechef && (
                                    <a href={settings.socialLinks.codechef} target="_blank" rel="noopener noreferrer"
                                       className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-amber-600 hover:bg-amber-600/10 transition-all duration-300" title="CodeChef">
                                        <SiCodechef size={16} />
                                    </a>
                                )}
                                {settings?.socialLinks?.hackerrank && (
                                    <a href={settings.socialLinks.hackerrank} target="_blank" rel="noopener noreferrer"
                                       className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-green-500 hover:bg-green-500/10 transition-all duration-300" title="HackerRank">
                                        <SiHackerrank size={16} />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator - Hidden on mobile for space */}
                <div className="hidden sm:block absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <div className="w-5 h-8 border-2 border-gray-700 rounded-full flex justify-center pt-1.5">
                        <div className="w-1 h-2 bg-gray-500 rounded-full"></div>
                    </div>
                </div>
            </section>

            {/* Featured Projects Section */}
            <section className="py-24 px-4 relative overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-b from-dark-200 via-dark-300/50 to-dark-200"></div>
                
                <div className="relative z-10 max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-400 text-sm font-medium mb-4">
                            Portfolio
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Featured <span className="gradient-text">Projects</span>
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Here are some of my recent works that showcase my skills and expertise
                        </p>
                    </div>

                    {loading ? (
                        <Loading />
                    ) : featuredProjects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {featuredProjects.map((project) => (
                                <ProjectCard key={project._id} project={project} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiCode className="text-gray-600" size={32} />
                            </div>
                            <p className="text-gray-500">No featured projects yet</p>
                        </div>
                    )}
                    
                    <div className="text-center mt-12">
                        <Link 
                            to="/projects" 
                            className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 font-medium transition-colors group"
                        >
                            View All Projects 
                            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Skills Section */}
            <section className="py-24 px-4 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm font-medium mb-4">
                            Expertise
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Skills & <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Technologies</span>
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Technologies and tools I use to bring ideas to life
                        </p>
                    </div>

                    {loading ? (
                        <Loading />
                    ) : skills.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {skills.map((skill) => (
                                <SkillCard key={skill._id} skill={skill} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiCode className="text-gray-600" size={32} />
                            </div>
                            <p className="text-gray-500">No skills added yet</p>
                        </div>
                    )}
                    
                    <div className="text-center mt-12">
                        <Link 
                            to="/skills" 
                            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium transition-colors group"
                        >
                            View All Skills 
                            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Research Section */}
            {research.length > 0 && (
                <section className="py-20 px-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-dark-200 via-dark-300/50 to-dark-200"></div>
                    <div className="relative z-10 max-w-7xl mx-auto">
                        <div className="text-center mb-12">
                            <span className="inline-block px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-sm font-medium mb-4">
                                <FiBookOpen className="inline mr-2" />Research
                            </span>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                Research & <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Publications</span>
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {research.map((item) => (
                                <div key={item._id} className="bg-dark-200 border border-gray-800 rounded-xl p-6 hover:border-cyan-500/50 transition-all">
                                    <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">{item.abstract}</p>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>{item.journal || item.conference}</span>
                                        {item.year && <span>• {item.year}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="text-center mt-10">
                            <Link to="/research" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-medium transition-colors group">
                                View All Research <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Achievements Section */}
            {achievements.length > 0 && (
                <section className="py-20 px-4 relative">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-12">
                            <span className="inline-block px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-400 text-sm font-medium mb-4">
                                <FiAward className="inline mr-2" />Achievements
                            </span>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                Awards & <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Certifications</span>
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {achievements.map((item) => (
                                <div 
                                    key={item._id} 
                                    className="group bg-dark-200 border border-gray-800 rounded-2xl p-6 hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/10 transition-all duration-300"
                                >
                                    {/* Trophy Icon or Image */}
                                    <div className="flex justify-center mb-5">
                                        {item.image ? (
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all"></div>
                                                <img src={getImageUrl(item.image)} alt={item.title} className="relative w-20 h-20 rounded-xl object-cover border-2 border-yellow-500/30" />
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl blur-xl"></div>
                                                <div className="relative w-20 h-20 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 flex items-center justify-center">
                                                    <FiAward className="w-10 h-10 text-yellow-400" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {/* Content */}
                                    <div className="text-center">
                                        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-yellow-400 transition-colors">{item.title}</h3>
                                        <p className="text-gray-400 text-sm mb-3">{item.issuer}</p>
                                        {item.date && (
                                            <span className="inline-block px-3 py-1 bg-yellow-500/10 rounded-full text-xs text-yellow-400 font-medium">
                                                {new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                                            </span>
                                        )}
                                        {/* View Details Link */}
                                        <div 
                                            onClick={() => setSelectedAchievement(item)}
                                            className="mt-4 pt-4 border-t border-gray-700/50 cursor-pointer"
                                        >
                                            <span className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-yellow-400 transition-colors">
                                                <FiEye className="w-4 h-4" /> 
                                                <span className="group-hover:underline">View Details</span>
                                                <FiArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="text-center mt-10">
                            <Link to="/achievements" className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 font-medium transition-colors group">
                                View All Achievements <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Achievement Modal */}
            {selectedAchievement && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    onClick={() => { setSelectedAchievement(null); setImageZoom(false); }}
                >
                    <div 
                        className="relative bg-dark-200 border border-gray-700 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button 
                            onClick={() => { setSelectedAchievement(null); setImageZoom(false); }}
                            className="absolute top-5 right-5 p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors z-10"
                        >
                            <FiX className="w-6 h-6" />
                        </button>

                        {/* Modal Content */}
                        <div className="p-8 md:p-10">
                            {/* Image/Icon - Clickable to enlarge */}
                            <div className="flex justify-center mb-8">
                                {selectedAchievement.image ? (
                                    <div className="relative group cursor-pointer" onClick={() => setImageZoom(true)}>
                                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/40 to-orange-500/40 rounded-3xl blur-3xl"></div>
                                        <img 
                                            src={getImageUrl(selectedAchievement.image)} 
                                            alt={selectedAchievement.title} 
                                            className="relative w-48 h-48 md:w-56 md:h-56 rounded-3xl object-cover border-4 border-yellow-500/50 shadow-2xl transition-transform group-hover:scale-105" 
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity">
                                            <FiMaximize2 className="w-8 h-8 text-white" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/40 to-orange-500/40 rounded-3xl blur-3xl"></div>
                                        <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-3xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-4 border-yellow-500/50 flex items-center justify-center shadow-2xl">
                                            <FiAward className="w-24 h-24 text-yellow-400" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Title */}
                            <h3 className="text-3xl md:text-4xl font-bold text-white text-center mb-3">{selectedAchievement.title}</h3>
                            
                            {/* Issuer */}
                            <p className="text-xl text-yellow-400 text-center mb-6">{selectedAchievement.issuer}</p>

                            {/* Info Cards - Date, Certificate, Profile Link */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                {/* Achievement Date */}
                                {selectedAchievement.date && (
                                    <div className="bg-dark-300/50 border border-gray-700 rounded-xl p-4 text-center">
                                        <FiCalendar className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Achieved On</p>
                                        <p className="text-sm text-white font-medium">
                                            {new Date(selectedAchievement.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>
                                )}

                                {/* Certificate/Credential ID */}
                                {selectedAchievement.credentialId && (
                                    <div className="bg-dark-300/50 border border-gray-700 rounded-xl p-4 text-center">
                                        <FiAward className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Certificate ID</p>
                                        <p className="text-sm text-white font-medium truncate">{selectedAchievement.credentialId}</p>
                                    </div>
                                )}

                                {/* Profile Link - e.g., Codeforces, LeetCode profile */}
                                {selectedAchievement.profileUrl && (
                                    <a 
                                        href={selectedAchievement.profileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-dark-300/50 border border-gray-700 rounded-xl p-4 text-center hover:border-yellow-500/50 hover:bg-dark-300 transition-all group"
                                    >
                                        <FiLink className="w-6 h-6 text-yellow-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Profile</p>
                                        <p className="text-sm text-white font-medium group-hover:text-yellow-400 transition-colors">View Profile</p>
                                    </a>
                                )}
                            </div>

                            {/* Description */}
                            {selectedAchievement.description && (
                                <div className="border-t border-gray-700 pt-6 mb-6">
                                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Description</h4>
                                    <p className="text-gray-300 text-lg leading-relaxed">{selectedAchievement.description}</p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* View Credential Link */}
                                {selectedAchievement.credentialLink && (
                                    <a 
                                        href={selectedAchievement.credentialLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
                                    >
                                        <FiExternalLink className="w-5 h-5" /> View Credential
                                    </a>
                                )}

                                {/* Certificate Download if available */}
                                {selectedAchievement.certificateUrl && (
                                    <a 
                                        href={getImageUrl(selectedAchievement.certificateUrl)} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-dark-300 border border-yellow-500/50 text-yellow-400 font-semibold rounded-xl hover:bg-yellow-500/10 transition-colors"
                                    >
                                        <FiDownload className="w-5 h-5" /> Download Certificate
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Zoom Modal */}
            {imageZoom && selectedAchievement?.image && (
                <div 
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md cursor-zoom-out"
                    onClick={() => setImageZoom(false)}
                >
                    <button 
                        onClick={() => setImageZoom(false)}
                        className="absolute top-6 right-6 p-3 text-white hover:text-yellow-400 bg-dark-200/80 rounded-full transition-colors z-10"
                    >
                        <FiX className="w-8 h-8" />
                    </button>
                    <img 
                        src={getImageUrl(selectedAchievement.image)} 
                        alt={selectedAchievement.title} 
                        className="max-w-full max-h-[90vh] rounded-2xl object-contain shadow-2xl border-2 border-yellow-500/30" 
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            {/* Blog Section */}
            {blogs.length > 0 && (
                <section className="py-20 px-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-dark-200 via-dark-300/50 to-dark-200"></div>
                    <div className="relative z-10 max-w-7xl mx-auto">
                        <div className="text-center mb-12">
                            <span className="inline-block px-4 py-2 bg-pink-500/10 border border-pink-500/20 rounded-full text-pink-400 text-sm font-medium mb-4">
                                <FiEdit3 className="inline mr-2" />Blog
                            </span>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                Latest <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">Articles</span>
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {blogs.map((blog) => (
                                <Link key={blog._id} to={`/blog/${blog.slug}`} className="bg-dark-200 border border-gray-800 rounded-xl overflow-hidden hover:border-pink-500/50 transition-all group">
                                    {blog.coverImage && (
                                        <div className="h-40 overflow-hidden">
                                            <img src={getImageUrl(blog.coverImage)} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                        </div>
                                    )}
                                    <div className="p-5">
                                        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">{blog.title}</h3>
                                        <p className="text-gray-400 text-sm line-clamp-2">{blog.excerpt}</p>
                                        <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                                            <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                            <span>•</span>
                                            <span>{blog.readTime || '5 min'} read</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <div className="text-center mt-10">
                            <Link to="/blog" className="inline-flex items-center gap-2 text-pink-400 hover:text-pink-300 font-medium transition-colors group">
                                View All Articles <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Interests Section */}
            {interests.length > 0 && (
                <section className="py-20 px-4 relative">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-12">
                            <span className="inline-block px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-sm font-medium mb-4">
                                <FiHeart className="inline mr-2" />Interests
                            </span>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                Beyond <span className="bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">Coding</span>
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {interests.map((interest) => (
                                <div key={interest._id} className="bg-dark-200 border border-gray-800 rounded-xl p-5 text-center hover:border-red-500/50 transition-all">
                                    {interest.image && (
                                        <img src={getImageUrl(interest.image)} alt={interest.name} className="w-16 h-16 rounded-full mx-auto mb-3 object-cover" />
                                    )}
                                    <h3 className="text-white font-medium">{interest.name}</h3>
                                </div>
                            ))}
                        </div>
                        <div className="text-center mt-10">
                            <Link to="/interests" className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 font-medium transition-colors group">
                                View All Interests <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Currently Working Section */}
            {currentWork.length > 0 && (
                <section className="py-20 px-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-dark-200 via-dark-300/50 to-dark-200"></div>
                    <div className="relative z-10 max-w-7xl mx-auto">
                        <div className="text-center mb-12">
                            <span className="inline-block px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm font-medium mb-4">
                                <FiActivity className="inline mr-2" />Currently Working
                            </span>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                What I'm <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Building</span>
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {currentWork.map((work) => (
                                <div key={work._id} className="bg-dark-200 border border-gray-800 rounded-xl p-6 hover:border-green-500/50 transition-all">
                                    <div className="flex items-start gap-4 mb-4">
                                        {work.image && (
                                            <img src={getImageUrl(work.image)} alt={work.title} className="w-12 h-12 rounded-lg object-cover" />
                                        )}
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-white mb-1">{work.title}</h3>
                                            <p className="text-gray-400 text-sm line-clamp-2">{work.description}</p>
                                        </div>
                                    </div>
                                    {work.progress !== undefined && (
                                        <div>
                                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                                                <span>Progress</span>
                                                <span>{work.progress}%</span>
                                            </div>
                                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all" style={{ width: `${work.progress}%` }}></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="text-center mt-10">
                            <Link to="/current-work" className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-medium transition-colors group">
                                View All Projects <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* CTA Section */}
            <section className="py-24 px-4 relative overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-900/30 via-purple-900/30 to-primary-900/30"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-600/10 via-transparent to-transparent"></div>
                
                <div className="relative z-10 max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-8">
                        <span className="text-xl">🤝</span>
                        <span className="text-gray-300 font-medium">Let's Collaborate</span>
                    </div>
                    
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                        Have a project in mind?
                    </h2>
                    <p className="text-gray-400 text-xl mb-10 max-w-2xl mx-auto">
                        I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
                    </p>
                    
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link 
                            to="/contact" 
                            className="group px-10 py-4 bg-gradient-to-r from-primary-600 to-purple-600 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/25"
                        >
                            <span className="flex items-center gap-2">
                                Get In Touch 
                                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Link>
                        
                        {settings?.email && (
                            <a 
                                href={`mailto:${settings.email}`}
                                className="px-10 py-4 bg-white/5 border border-white/10 rounded-xl text-white font-semibold hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
                            >
                                <FiMail /> {settings.email}
                            </a>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
