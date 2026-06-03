/**
 * Shared tech-stack category config — used by ProjectCard, ProjectDetails,
 * and the Project editor so categories, colours, ordering, and keyword
 * auto-detection stay consistent. Categories are flexible: any of the presets
 * below, OR a custom string the user types in the editor.
 */

// Ordered preset categories with display styling.
// `dot`  -> small colour dot,  `text` -> label colour,  `chip` -> editor pill.
export const TECH_CATEGORIES = [
    { value: 'Frontend', label: 'Frontend', dot: 'bg-blue-400', text: 'text-blue-400/70', chip: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { value: 'Backend', label: 'Backend', dot: 'bg-emerald-400', text: 'text-emerald-400/70', chip: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { value: 'Languages', label: 'Languages', dot: 'bg-indigo-400', text: 'text-indigo-400/70', chip: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
    { value: 'Database', label: 'Database', dot: 'bg-violet-400', text: 'text-violet-400/70', chip: 'bg-violet-500/20 text-violet-400 border-violet-500/30' },
    { value: 'AI/ML', label: 'AI / ML', dot: 'bg-pink-400', text: 'text-pink-400/70', chip: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
    { value: 'Graphics', label: 'Graphics', dot: 'bg-fuchsia-400', text: 'text-fuchsia-400/70', chip: 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30' },
    { value: 'Hardware', label: 'Hardware / HDL', dot: 'bg-orange-400', text: 'text-orange-400/70', chip: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    { value: 'Embedded', label: 'Embedded', dot: 'bg-lime-400', text: 'text-lime-400/70', chip: 'bg-lime-500/20 text-lime-400 border-lime-500/30' },
    { value: 'Mobile', label: 'Mobile', dot: 'bg-teal-400', text: 'text-teal-400/70', chip: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
    { value: 'Game Dev', label: 'Game Dev', dot: 'bg-rose-400', text: 'text-rose-400/70', chip: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
    { value: 'DevOps', label: 'DevOps', dot: 'bg-amber-400', text: 'text-amber-400/70', chip: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    { value: 'Cloud', label: 'Cloud', dot: 'bg-sky-400', text: 'text-sky-400/70', chip: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
    { value: 'Tools', label: 'Tools', dot: 'bg-cyan-400', text: 'text-cyan-400/70', chip: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
    { value: 'Other', label: 'Other', dot: 'bg-gray-400', text: 'text-gray-500', chip: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
];

export const TECH_CATEGORY_ORDER = TECH_CATEGORIES.map(c => c.value);

const CATEGORY_MAP = Object.fromEntries(TECH_CATEGORIES.map(c => [c.value, c]));

// Deterministic palette for custom (user-typed) categories so each gets a
// stable colour without needing a preset entry.
const FALLBACK_PALETTE = [
    { dot: 'bg-red-400', text: 'text-red-400/70', chip: 'bg-red-500/20 text-red-400 border-red-500/30' },
    { dot: 'bg-yellow-400', text: 'text-yellow-400/70', chip: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    { dot: 'bg-green-400', text: 'text-green-400/70', chip: 'bg-green-500/20 text-green-400 border-green-500/30' },
    { dot: 'bg-purple-400', text: 'text-purple-400/70', chip: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    { dot: 'bg-cyan-400', text: 'text-cyan-400/70', chip: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
];

const hashString = (s) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
};

// Resolve display styling for any category value (preset OR custom).
export const getTechCategory = (value) => {
    if (!value) return CATEGORY_MAP['Other'];
    if (CATEGORY_MAP[value]) return CATEGORY_MAP[value];
    const pal = FALLBACK_PALETTE[hashString(value) % FALLBACK_PALETTE.length];
    return { value, label: value, ...pal };
};

// Categories treated as "unspecified" — eligible for auto-upgrade if a more
// specific category can be detected from the tech name.
const GENERIC = new Set(['', 'Tools', 'Other']);

// Short terms must match exactly (so "go" doesn't match "google");
// 3-char terms match exact or prefix; longer terms match as substrings.
const matchTerm = (t, term) => {
    if (term.length <= 2) return t === term;
    if (term.length === 3) return t === term || t.startsWith(term);
    return t.includes(term);
};

// Ordered keyword rules — first match wins, so specific buckets come first.
const KEYWORDS = [
    ['Graphics', ['opengl', 'glfw', 'glad', 'glm', 'glew', 'glut', 'webgl', 'vulkan', 'directx', 'three.js', 'threejs', 'glsl', 'shader', 'sfml', 'sdl', 'sdl2', 'raylib', 'metal', 'bgfx', 'ogre', 'pixi', 'd3.js']],
    ['Hardware', ['verilog', 'vhdl', 'systemverilog', 'fpga', 'asic', 'vivado', 'quartus', 'modelsim', 'cadence', 'altium', 'kicad', 'pcb', 'rtl', 'xilinx', 'cpld']],
    ['Embedded', ['arduino', 'esp32', 'esp8266', 'stm32', 'avr', 'raspberry', 'raspberrypi', 'microcontroller', 'embedded', 'rtos', 'freertos', 'mbed', 'platformio', 'zephyr']],
    ['AI/ML', ['tensorflow', 'pytorch', 'keras', 'scikit', 'sklearn', 'opencv', 'pandas', 'numpy', 'scipy', 'matplotlib', 'cuda', 'cudnn', 'huggingface', 'transformers', 'langchain', 'yolo', 'mediapipe', 'nltk', 'spacy']],
    ['Game Dev', ['unity', 'unreal', 'godot', 'cryengine', 'phaser', 'cocos', 'gamemaker']],
    ['Mobile', ['flutter', 'react native', 'reactnative', 'swiftui', 'swift', 'android', 'ios', 'jetpack', 'xamarin', 'ionic', 'expo']],
    ['Database', ['mongo', 'postgres', 'mysql', 'sqlite', 'redis', 'firebase', 'supabase', 'prisma', 'sequelize', 'dynamo', 'elastic', 'cassandra', 'neo4j', 'mariadb', 'mongoose', 'oracle', 'cockroach']],
    ['Frontend', ['react', 'vue', 'angular', 'svelte', 'next', 'nuxt', 'html', 'tailwind', 'bootstrap', 'typescript', 'javascript', 'jquery', 'redux', 'zustand', 'vite', 'webpack', 'gatsby', 'remix', 'sass', 'scss', 'css', 'chakra', 'framer', 'styled']],
    ['Backend', ['node', 'express', 'django', 'flask', 'fastapi', 'spring', 'laravel', 'rails', 'nestjs', 'nest.js', 'graphql', 'socket.io', 'hapi', 'koa', 'strapi', 'asp.net', '.net', 'gin', 'fiber', 'actix']],
    ['Languages', ['python', 'java', 'c++', 'c#', 'go', 'golang', 'rust', 'ruby', 'kotlin', 'scala', 'perl', 'haskell', 'lua', 'matlab', 'julia', 'assembly', 'fortran', 'cobol', 'dart', 'php', 'c', 'r']],
    ['Cloud', ['aws', 'gcp', 'azure', 'vercel', 'netlify', 'heroku', 'render', 'railway', 'cloudflare', 'digitalocean', 'lambda', 's3', 'ec2']],
    ['DevOps', ['docker', 'kubernetes', 'k8s', 'jenkins', 'terraform', 'ansible', 'nginx', 'linux', 'ci/cd', 'gitlab', 'circleci', 'prometheus', 'grafana', 'helm']],
    ['Tools', ['git', 'github', 'postman', 'figma', 'jira', 'notion', 'vscode', 'vim', 'slack', 'trello']],
];

// Best-guess category from a tech name (used when none was explicitly chosen).
export const categorizeTech = (name) => {
    const t = String(name || '').toLowerCase().trim();
    if (!t) return 'Tools';
    for (const [cat, terms] of KEYWORDS) {
        if (terms.some(term => matchTerm(t, term))) return cat;
    }
    return 'Tools';
};

/**
 * Effective category for a tech chip: keep an explicit, specific category;
 * otherwise (missing or generic default) auto-detect a better one.
 */
export const resolveTechCategory = (name, storedCategory) => {
    if (storedCategory && !GENERIC.has(storedCategory)) return storedCategory;
    const detected = categorizeTech(name);
    if (detected !== 'Tools') return detected;
    return storedCategory || 'Tools';
};

/**
 * Group a techStack array into ordered [category, names[]] entries, splitting
 * comma-joined names and resolving each chip's category. Custom categories are
 * appended after the known preset order.
 */
export const groupTechStack = (techStack) => {
    if (!Array.isArray(techStack) || techStack.length === 0) return [];
    const map = {};
    techStack.forEach(tech => {
        const rawName = typeof tech === 'string' ? tech : tech?.name;
        const storedCat = (tech && typeof tech === 'object') ? tech.category : null;
        if (!rawName) return;
        String(rawName).split(',').map(s => s.trim()).filter(Boolean).forEach(name => {
            const cat = resolveTechCategory(name, storedCat);
            (map[cat] = map[cat] || []).push(name);
        });
    });
    const known = TECH_CATEGORY_ORDER.filter(c => map[c]?.length).map(c => [c, map[c]]);
    const custom = Object.keys(map)
        .filter(c => !TECH_CATEGORY_ORDER.includes(c))
        .sort()
        .map(c => [c, map[c]]);
    return [...known, ...custom];
};
