import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiGithub, FiLinkedin, FiTwitter, FiDownload, FiMail, FiMapPin, FiCode, FiAward, FiX, FiCalendar, FiExternalLink, FiLink } from 'react-icons/fi';
import { SiLeetcode, SiCodeforces, SiCodechef, SiHackerrank } from 'react-icons/si';
import { publicAPI, getImageUrl } from '../services/api';
import { useSettings } from '../context/SettingsContext';
import { ScrollAnimation } from '../hooks/useScrollAnimation';
import ProjectCard from '../components/projects/ProjectCard';
import SkillCard from '../components/skills/SkillCard';
import { ProjectCardSkeleton, SkillCardSkeleton } from '../components/common/Skeleton';

const Home = () => {
    const { settings } = useSettings();
    const [featuredProjects, setFeaturedProjects] = useState([]);
    const [skills, setSkills] = useState([]);
    const [research, setResearch] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [interests, setInterests] = useState([]);
    const [currentWork, setCurrentWork] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAchievement, setSelectedAchievement] = useState(null);
    const [imageZoom, setImageZoom] = useState(false);
    const [isTakingLong, setIsTakingLong] = useState(false);

    useEffect(() => {
        let timer;
        if (loading) {
            timer = setTimeout(() => {
                setIsTakingLong(true);
            }, 5000);
        }
        return () => clearTimeout(timer);
    }, [loading]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await publicAPI.getHomeData();
            const data = response.data.data;

            setFeaturedProjects(data.featuredProjects || []);
            setSkills(data.skills || []);
            setResearch(data.research || []);
            setAchievements(data.achievements || []);
            setBlogs(data.blogs || []);
            setInterests(data.interests || []);
            setCurrentWork(data.currentWork || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
            setIsTakingLong(false);
        }
    };

    const LOCAL_PROFILE_IMAGE = '/profile.jpeg';

    return (
        <div className="min-h-screen">
            {/* ============================================ */}
            {/* NON-BLOCKING SERVER WAKING UP BANNER */}
            {/* ============================================ */}
            {isTakingLong && loading && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fade-in w-[90%] md:w-auto">
                    <div className="bg-dark-100/90 backdrop-blur-md border border-primary-500/30 px-5 py-3 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.15)] flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full border-2 border-primary-500 border-t-transparent animate-spin flex-shrink-0"></div>
                        <span className="text-primary-400 text-sm font-medium leading-relaxed">Loading dynamic content... Server is waking up, please wait.</span>
                    </div>
                </div>
            )}

            {/* ============================================ */}
            {/* HERO SECTION — RENDERS INSTANTLY */}
            {/* ============================================ */}
            <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 sm:py-20 pt-24 overflow-hidden">
                {/* Animated gradient mesh orbs */}
                <div className="hero-orb hero-orb-1 animate-float" />
                <div className="hero-orb hero-orb-2 animate-float-delay" />
                <div className="hero-orb hero-orb-3 animate-float-slow" />

                <div className="relative z-10 max-w-5xl mx-auto w-full">
                    <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

                        {/* Profile Image with gradient glow ring */}
                        <div className="flex-shrink-0 animate-fade-in">
                            <div className="profile-ring">
                                <div className="relative w-44 h-44 sm:w-56 sm:h-56 lg:w-64 lg:h-64 rounded-full overflow-hidden bg-dark-200">
                                    <img
                                        src={LOCAL_PROFILE_IMAGE}
                                        alt="Profile"
                                        className="w-full h-full object-cover object-top"
                                        loading="eager"
                                        onError={(e) => {
                                            const apiImage = getImageUrl(settings?.profileImage);
                                            if (apiImage) {
                                                e.target.onerror = null;
                                                e.target.src = apiImage;
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Content — uses settings which always has defaults */}
                        <div className="text-center lg:text-left flex-1 animate-fade-in">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 tracking-tight">
                                <span className="text-gradient">{settings?.name || 'Your Name'}</span>
                            </h1>

                            <p className="text-lg text-primary-400 font-medium mb-4">
                                {settings?.title || 'Full Stack Developer'}
                            </p>

                            <p className="text-gray-400 text-base leading-relaxed max-w-lg mb-6">
                                {settings?.bio || "I'm a full-stack developer specializing in building exceptional digital experiences."}
                            </p>

                            {/* Info Row */}
                            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-3 text-sm text-gray-400 mb-6">
                                {settings?.location && (
                                    <span className="flex items-center gap-1.5">
                                        <FiMapPin size={13} />
                                        {settings.location}
                                    </span>
                                )}
                                {settings?.location && settings?.email && <span className="text-gray-600">·</span>}
                                {settings?.email && (
                                    <a href={`mailto:${settings.email}`} className="flex items-center gap-1.5 hover:text-gray-400 transition-colors">
                                        <FiMail size={13} />
                                        {settings.email}
                                    </a>
                                )}
                                {settings?.isAvailableForHire && (
                                    <>
                                        <span className="text-gray-600">·</span>
                                        <span className="flex items-center gap-1.5 text-emerald-500">
                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                            Available
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-6">
                                <Link to="/projects" className="group px-5 py-2.5 btn-gradient rounded-lg font-medium flex items-center gap-2 text-sm">
                                    View Projects
                                    <FiArrowRight className="group-hover:translate-x-0.5 transition-transform" size={15} />
                                </Link>

                                {settings?.resumeLink && (
                                    <a href={settings.resumeLink} target="_blank" rel="noopener noreferrer"
                                        className="px-5 py-2.5 border border-gray-800 hover:border-gray-700 rounded-lg text-gray-400 hover:text-white font-medium transition-all duration-200 flex items-center gap-2 text-sm">
                                        <FiDownload size={14} />
                                        Resume
                                    </a>
                                )}

                                <Link to="/contact" className="px-5 py-2.5 border border-gray-800 hover:border-gray-700 rounded-lg text-gray-400 hover:text-white font-medium transition-all duration-200 text-sm">
                                    Contact
                                </Link>
                            </div>

                            {/* Social Links */}
                            <div className="flex flex-wrap justify-center lg:justify-start gap-1">
                                {settings?.socialLinks?.github && (
                                    <a href={settings.socialLinks.github} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors" title="GitHub"><FiGithub size={17} /></a>
                                )}
                                {settings?.socialLinks?.linkedin && (
                                    <a href={settings.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg flex items-center justify-center text-[#0A66C2] hover:text-[#0A66C2]/80 transition-colors" title="LinkedIn"><FiLinkedin size={17} /></a>
                                )}
                                {settings?.socialLinks?.twitter && (
                                    <a href={settings.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors" title="Twitter"><FiTwitter size={17} /></a>
                                )}
                                {settings?.socialLinks?.leetcode && (
                                    <a href={settings.socialLinks.leetcode} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg flex items-center justify-center text-[#FFA116] hover:text-[#FFA116]/80 transition-colors" title="LeetCode"><SiLeetcode size={15} /></a>
                                )}
                                {settings?.socialLinks?.codeforces && (
                                    <a href={settings.socialLinks.codeforces} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg flex items-center justify-center text-[#1F8ACB] hover:text-[#1F8ACB]/80 transition-colors" title="Codeforces"><SiCodeforces size={15} /></a>
                                )}
                                {settings?.socialLinks?.codechef && (
                                    <a href={settings.socialLinks.codechef} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg flex items-center justify-center text-[#D4A96A] hover:text-[#D4A96A]/80 transition-colors" title="CodeChef"><SiCodechef size={15} /></a>
                                )}
                                {settings?.socialLinks?.hackerrank && (
                                    <a href={settings.socialLinks.hackerrank} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg flex items-center justify-center text-[#2EC866] hover:text-[#2EC866]/80 transition-colors" title="HackerRank"><SiHackerrank size={15} /></a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURED PROJECTS */}
            <section className="py-20 px-6 lg:px-12">
                <div className="max-w-6xl mx-auto">
                    <ScrollAnimation className="mb-12" animation="fade-up">
                        <div className="section-ornament" />
                        <h2 className="text-3xl font-bold text-white mb-2">
                            {!loading && featuredProjects.length > 0 && featuredProjects.every(p => p.featured) ? 'Featured Projects' : 'Projects'}
                        </h2>
                        <p className="text-gray-400 text-base">A selection of recent work</p>
                    </ScrollAnimation>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {[1, 2, 3, 4, 5, 6].map(i => <ProjectCardSkeleton key={i} />)}
                        </div>
                    ) : featuredProjects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredProjects.map((project, index) => (
                                <ScrollAnimation
                                    key={project._id}
                                    animation="fade-up"
                                    delay={index * 80}
                                    duration={500}
                                >
                                    <ProjectCard project={project} />
                                </ScrollAnimation>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <FiCode className="text-gray-700 mx-auto mb-3" size={32} />
                            <p className="text-gray-500 text-sm">No projects yet</p>
                        </div>
                    )}

                    <ScrollAnimation className="mt-10" animation="fade-up" delay={300}>
                        <Link to="/projects" className="inline-flex items-center gap-2 text-gray-500 hover:text-white text-sm font-medium transition-colors group">
                            All projects <FiArrowRight className="group-hover:translate-x-0.5 transition-transform" size={14} />
                        </Link>
                    </ScrollAnimation>
                </div>
            </section>

            {/* SKILLS */}
            <section className="py-20 px-6 lg:px-12 border-t border-gray-800/40">
                <div className="max-w-6xl mx-auto">
                    <ScrollAnimation className="mb-12" animation="fade-up">
                        <div className="section-ornament" />
                        <h2 className="text-3xl font-bold text-white mb-2">Skills & Technologies</h2>
                        <p className="text-gray-500 text-base">Technologies and tools I work with</p>
                    </ScrollAnimation>

                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <SkillCardSkeleton key={i} />)}
                        </div>
                    ) : skills.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {Object.entries(
                                skills.reduce((acc, s) => { (acc[s.category] = acc[s.category] || []).push(s); return acc; }, {})
                            ).map(([cat, catSkills]) => (
                                <ScrollAnimation key={cat} animation="fade-up" duration={400}>
                                    <div className="bg-dark-100 border border-gray-800/60 rounded-2xl p-5 hover:border-gray-700 transition-colors">
                                        <h4 className="text-white font-semibold text-sm capitalize mb-3">{cat}</h4>
                                        {catSkills.map(skill => <SkillCard key={skill._id} skill={skill} />)}
                                    </div>
                                </ScrollAnimation>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <FiCode className="text-gray-700 mx-auto mb-3" size={32} />
                            <p className="text-gray-500 text-sm">No skills added yet</p>
                        </div>
                    )}

                    <ScrollAnimation className="mt-10" animation="fade-up" delay={300}>
                        <Link to="/skills" className="inline-flex items-center gap-2 text-gray-500 hover:text-white text-sm font-medium transition-colors group">
                            All skills <FiArrowRight className="group-hover:translate-x-0.5 transition-transform" size={14} />
                        </Link>
                    </ScrollAnimation>
                </div>
            </section>

            {/* RESEARCH */}
            {!loading && research.length > 0 && (
                <section className="py-20 px-6 lg:px-12 border-t border-gray-800/40">
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-12">
                            <div className="section-ornament" />
                            <h2 className="text-3xl font-bold text-white mb-2">Research & Publications</h2>
                            <p className="text-gray-400 text-base">Academic contributions and papers</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {research.map((item) => (
                                <div key={item._id} className="bg-dark-100 border border-gray-800/60 rounded-2xl p-6 hover:border-gray-700 transition-all duration-300">
                                    <h3 className="text-base font-semibold text-white mb-2 leading-snug">{item.title}</h3>
                                    <p className="text-gray-300 text-sm mb-3 line-clamp-2 leading-relaxed">{item.abstract}</p>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>{item.journal || item.conference}</span>
                                        {item.year && <span>· {item.year}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-10">
                            <Link to="/research" className="inline-flex items-center gap-2 text-gray-500 hover:text-white text-sm font-medium transition-colors group">
                                All research <FiArrowRight className="group-hover:translate-x-0.5 transition-transform" size={14} />
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* ACHIEVEMENTS */}
            {!loading && achievements.length > 0 && (
                <section className="py-20 px-6 lg:px-12 border-t border-gray-800/40">
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-12">
                            <div className="section-ornament" />
                            <h2 className="text-3xl font-bold text-white mb-2">Achievements</h2>
                            <p className="text-gray-400 text-base">Awards, certifications, and milestones</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {achievements.map((item) => (
                                <div key={item._id} className="group cursor-pointer" onClick={() => setSelectedAchievement(item)}>
                                    <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-pink-500/40 via-purple-500/30 to-emerald-500/40 hover:from-pink-500/60 hover:via-purple-500/50 hover:to-emerald-500/60 transition-all duration-500">
                                        <div className="bg-dark-100 rounded-2xl overflow-hidden">
                                            {item.image && (
                                                <div className="aspect-[4/3] overflow-hidden">
                                                    <img src={getImageUrl(item.image)} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                                </div>
                                            )}
                                            <div className="p-5">
                                                <h3 className="text-lg font-bold text-white mb-2 leading-snug group-hover:text-primary-400 transition-colors">{item.title}</h3>
                                                {item.description && (
                                                    <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">{item.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-10">
                            <Link to="/achievements" className="inline-flex items-center gap-2 text-gray-500 hover:text-white text-sm font-medium transition-colors group">
                                All achievements <FiArrowRight className="group-hover:translate-x-0.5 transition-transform" size={14} />
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Achievement Modal */}
            {selectedAchievement && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => { setSelectedAchievement(null); setImageZoom(false); }}>
                    <div className="relative bg-dark-100 border border-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => { setSelectedAchievement(null); setImageZoom(false); }} className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white rounded-lg transition-colors z-10">
                            <FiX className="w-5 h-5" />
                        </button>
                        <div className="p-8">
                            {selectedAchievement.image && (
                                <div className="flex justify-center mb-6">
                                    <img
                                        src={getImageUrl(selectedAchievement.image)}
                                        alt={selectedAchievement.title}
                                        className="w-24 h-24 rounded-2xl object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={() => setImageZoom(true)}
                                    />
                                </div>
                            )}
                            <h3 className="text-2xl font-bold text-white text-center mb-2">{selectedAchievement.title}</h3>
                            <p className="text-primary-400 text-center mb-6">{selectedAchievement.issuer}</p>

                            <div className="flex flex-wrap justify-center gap-4 mb-6 text-sm text-gray-500">
                                {selectedAchievement.date && (
                                    <span className="flex items-center gap-1.5">
                                        <FiCalendar size={13} />
                                        {new Date(selectedAchievement.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </span>
                                )}
                                {selectedAchievement.credentialId && (
                                    <span className="flex items-center gap-1.5">
                                        <FiAward size={13} />
                                        {selectedAchievement.credentialId}
                                    </span>
                                )}
                            </div>

                            {selectedAchievement.description && (
                                <p className="text-gray-400 text-sm leading-relaxed mb-6 border-t border-gray-800 pt-6">{selectedAchievement.description}</p>
                            )}

                            <div className="flex flex-col sm:flex-row gap-3">
                                {selectedAchievement.credentialLink && (
                                    <a href={selectedAchievement.credentialLink} target="_blank" rel="noopener noreferrer" className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-dark-200 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm">
                                        <FiExternalLink size={14} /> View Credential
                                    </a>
                                )}
                                {selectedAchievement.certificateUrl && (
                                    <a href={getImageUrl(selectedAchievement.certificateUrl)} target="_blank" rel="noopener noreferrer" className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-800 text-gray-400 font-medium rounded-lg hover:border-gray-700 hover:text-white transition-colors text-sm">
                                        <FiDownload size={14} /> Certificate
                                    </a>
                                )}
                                {selectedAchievement.profileUrl && (
                                    <a href={selectedAchievement.profileUrl} target="_blank" rel="noopener noreferrer" className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-800 text-gray-400 font-medium rounded-lg hover:border-gray-700 hover:text-white transition-colors text-sm">
                                        <FiLink size={14} /> Profile
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Zoom Modal */}
            {imageZoom && selectedAchievement?.image && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 cursor-zoom-out" onClick={() => setImageZoom(false)}>
                    <button onClick={() => setImageZoom(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white transition-colors z-10">
                        <FiX className="w-6 h-6" />
                    </button>
                    <img src={getImageUrl(selectedAchievement.image)} alt={selectedAchievement.title} className="max-w-full max-h-[90vh] rounded-xl object-contain" onClick={(e) => e.stopPropagation()} />
                </div>
            )}

            {/* BLOG */}
            {!loading && blogs.length > 0 && (
                <section className="py-20 px-6 lg:px-12 border-t border-gray-800/40">
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-12">
                            <div className="section-ornament" />
                            <h2 className="text-3xl font-bold text-white mb-2">Latest Articles</h2>
                            <p className="text-gray-400 text-base">Thoughts and insights</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {blogs.map((blog) => (
                                <Link key={blog._id} to={`/blog/${blog.slug}`} className="group bg-dark-100 border border-gray-800/60 rounded-2xl overflow-hidden hover:border-gray-700 transition-all duration-300">
                                    {blog.coverImage && (
                                        <div className="h-40 overflow-hidden">
                                            <img src={getImageUrl(blog.coverImage)} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                        </div>
                                    )}
                                    <div className="p-5">
                                        <h3 className="text-base font-semibold text-white mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors leading-snug">{blog.title}</h3>
                                        <p className="text-gray-300 text-sm line-clamp-2 leading-relaxed">{blog.excerpt}</p>
                                        <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                                            <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                            <span>·</span>
                                            <span>{blog.readTime || '5 min'} read</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <div className="mt-10">
                            <Link to="/blog" className="inline-flex items-center gap-2 text-gray-500 hover:text-white text-sm font-medium transition-colors group">
                                All articles <FiArrowRight className="group-hover:translate-x-0.5 transition-transform" size={14} />
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* INTERESTS */}
            {!loading && interests.length > 0 && (
                <section className="py-20 px-6 lg:px-12 border-t border-gray-800/40">
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-12">
                            <div className="section-ornament" />
                            <h2 className="text-3xl font-bold text-white mb-2">Interests</h2>
                            <p className="text-gray-400 text-base">Beyond the code</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {interests.map((interest) => (
                                <div key={interest._id} className="bg-dark-100 border border-gray-800/60 rounded-2xl p-5 text-center hover:border-gray-700 transition-all duration-300">
                                    {interest.image && (
                                        <img src={getImageUrl(interest.image)} alt={interest.name} className="w-14 h-14 rounded-full mx-auto mb-3 object-cover" loading="lazy" />
                                    )}
                                    <h3 className="text-white text-sm font-medium">{interest.name}</h3>
                                </div>
                            ))}
                        </div>
                        <div className="mt-10">
                            <Link to="/interests" className="inline-flex items-center gap-2 text-gray-500 hover:text-white text-sm font-medium transition-colors group">
                                All interests <FiArrowRight className="group-hover:translate-x-0.5 transition-transform" size={14} />
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* CURRENTLY WORKING ON */}
            {!loading && currentWork.length > 0 && (
                <section className="py-20 px-6 lg:px-12 border-t border-gray-800/40">
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-12">
                            <div className="section-ornament" />
                            <h2 className="text-3xl font-bold text-white mb-2">Currently Building</h2>
                            <p className="text-gray-400 text-base">What I'm working on right now</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {currentWork.map((work) => (
                                <div key={work._id} className="bg-dark-100 border border-gray-800/60 rounded-2xl p-6 hover:border-gray-700 transition-all duration-300">
                                    <div className="flex items-start gap-4 mb-4">
                                        {work.image && (
                                            <img src={getImageUrl(work.image)} alt={work.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" loading="lazy" />
                                        )}
                                        <div className="flex-1">
                                            <h3 className="text-base font-semibold text-white mb-1 leading-snug">{work.title}</h3>
                                            <p className="text-gray-300 text-sm line-clamp-2 leading-relaxed">{work.description}</p>
                                        </div>
                                    </div>
                                    {work.progress !== undefined && (
                                        <div>
                                            <div className="flex justify-between text-xs mb-1.5">
                                                <span className="text-gray-500">Progress</span>
                                                <span className="text-gray-400 font-medium">{work.progress}%</span>
                                            </div>
                                            <div className="h-1.5 bg-gray-800/60 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${work.progress}%` }}></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="mt-10">
                            <Link to="/current-work" className="inline-flex items-center gap-2 text-gray-500 hover:text-white text-sm font-medium transition-colors group">
                                All projects <FiArrowRight className="group-hover:translate-x-0.5 transition-transform" size={14} />
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* CTA SECTION */}
            <section className="py-20 px-6 lg:px-12 border-t border-gray-800/40 cta-mesh">
                <div className="relative z-10 max-w-6xl mx-auto text-center">
                    <div className="card-gradient-border p-12 md:p-16">
                        <h2 className="text-3xl font-bold text-white mb-4">Let's Work Together</h2>
                        <p className="text-gray-400 text-base mb-8 max-w-xl mx-auto">I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.</p>

                        <div className="flex flex-wrap justify-center gap-3">
                            <Link to="/contact" className="group px-6 py-2.5 btn-gradient rounded-lg font-medium flex items-center gap-2 text-sm">
                                Get in touch <FiArrowRight className="group-hover:translate-x-0.5 transition-transform" size={15} />
                            </Link>

                            {settings?.email && (
                                <a href={`mailto:${settings.email}`} className="px-6 py-2.5 border border-gray-800 rounded-lg text-gray-400 font-medium hover:border-gray-700 hover:text-white transition-all duration-200 flex items-center gap-2 text-sm">
                                    <FiMail size={14} /> {settings.email}
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
