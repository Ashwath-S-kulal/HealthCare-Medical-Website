import React, { useState, useEffect } from 'react';
import {
    HeartPulse, Search, Bell, Sparkles, User, Sun, Moon,
    ChevronRight, Activity, PlusCircle, Calendar, ShieldAlert
} from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const SEARCHABLE_PAGES = [
    { label: 'Dashboard', path: '/' },
    { label: 'Patient Portal', path: '/patienthub' },
    { label: 'Medical Facilities', path: '/medical' },
    { label: 'Hospital Facilities', path: '/hospital' },
    { label: 'Medicine Data', path: '/medicinefinderourdata' },
    { label: 'Medicine Scan', path: '/medicinefinder' },
    { label: 'Doctor Consult', path: '/doctors' },
    { label: 'Disease Encyclopedia', path: '/diseasedesc' },
    { label: 'Volunteer Network', path: '/doctormailtoadmin' },
    { label: 'Profile', path: '/profile' },
    { label: 'Symptoms Collection', path: '/symptoms' },
    { label: 'Precautionary Measures', path: '/precaution' },
    { label: 'Diet Plan', path: '/diet' },
];

export default function Header() {
    const { currentUser } = useSelector(state => state.user || { currentUser: null });
    const location = useLocation();
    const navigate = useNavigate();

    const [showAssistant, setShowAssistant] = useState(false);

    // Search states
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [messages, setMessages] = useState([{ role: 'assistant', content: 'How can I assist with your clinical data today?' }]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [loading, setLoading] = useState(false)

    const sendMessage = async () => {
        if (!currentUser || !input.trim() || loading) return;
        setLoading(true);
        const userMessage = { role: 'user', content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");

        try {
            const response = await fetch(`${import.meta.env.VITE_BASE_URI}/api/chatbot/assistant`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: input }),
            });

            const data = await response.json();
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: data.reply || "No response received." }
            ]);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: "Error fetching response. Please try again." }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filteredRoutes = searchQuery
        ? SEARCHABLE_PAGES.filter(p => p.label.toLowerCase().includes(searchQuery.toLowerCase()))
        : [];


    const getBreadcrumbs = () => {
        const paths = location.pathname.split('/').filter(Boolean);
        if (paths.length === 0) return [{ label: 'Dashboard', path: '/' }];

        const crumbs = [{ label: 'Dashboard', path: '/' }];
        let currentPath = '';

        paths.forEach((p) => {
            currentPath += `/${p}`;
            let label = p.charAt(0).toUpperCase() + p.slice(1);
            if (p === 'patienthub') label = 'Patient Portal';
            if (p === 'nearbyfacility') label = 'Medical Facilities';
            if (p === 'medicinefinderourdata') label = 'MediVault';
            if (p === 'diseasevault') label = 'Disease Vault';
            if (p === 'diseasedesc') label = 'Encyclopedia';
            if (p === 'doctormailtoadmin') label = 'Volunteer Network';
            crumbs.push({ label, path: currentPath });
        });
        return crumbs;
    };

    const breadcrumbs = getBreadcrumbs();

    const notifications = [
        { id: 1, text: "Dr. Carter verified your clinical file", time: "10m ago", read: false },
        { id: 2, text: "New precaution guide available: Influenza", time: "2h ago", read: true },
        { id: 3, text: "Emergency unit capacity updated: 24 active beds", time: "5h ago", read: true }
    ];


    return (
        <header className="sticky top-0 z-40 w-full glassmorphism border-b border-slate-100 px-4 py-3 md:px-8 flex items-center justify-between select-none bg-white/80 backdrop-blur-md">
            <div className="flex items-center gap-2 md:gap-3">
                <div className="flex items-center gap-1.5 md:gap-2">
                    {breadcrumbs.map((crumb, idx) => (
                        <React.Fragment key={idx}>
                            {idx > 0 && <ChevronRight size={12} className="text-slate-300" />}
                            <NavLink
                                to={crumb.path}
                                className={`text-[11px] md:text-xs font-bold tracking-wide uppercase transition-colors
                                  ${idx === breadcrumbs.length - 1
                                        ? 'text-primary'
                                        : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                {crumb.label}
                            </NavLink>
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <div className="hidden md:block relative">
                <div className="flex items-center bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-1.5 w-60 lg:w-80 gap-2 focus-within:border-primary/50 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary-light/50">
                    <Search size={15} className="text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search features..."
                        className="bg-transparent text-xs text-slate-800 outline-none w-full"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setShowSearch(true);
                        }}
                        onBlur={() => setTimeout(() => setShowSearch(false), 200)}
                    />
                </div>

                {showSearch && searchQuery && (
                    <div className="absolute top-full mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-xl p-2 z-50">
                        {filteredRoutes.length > 0 ? (
                            filteredRoutes.map((route) => (
                                <button
                                    key={route.path}
                                    onClick={() => {
                                        navigate(route.path);
                                        setSearchQuery('');
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-primary rounded-lg transition-colors"
                                >
                                    {route.label}
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-2 text-xs text-slate-400 italic">No features found</div>
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 md:gap-3">
                <div className="relative">
                    <button
                        onClick={() => currentUser && setShowAssistant(!showAssistant)}
                        disabled={!currentUser}
                        title={!currentUser ? "Please log in to use the chatbot" : ""}
                        className={`flex items-center gap-1.5 bg-gradient-to-r from-primary to-secondary text-white px-2 md:px-3 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-wider shadow-md shadow-primary/10 transition-all ${!currentUser
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:from-primary-dark hover:to-secondary-dark hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer"
                            }`}
                    >
                        <Sparkles size={13} className={currentUser ? "animate-pulse" : ""} />
                        <span className="hidden sm:inline">Clinical AI</span>
                        {!currentUser && <span className="text-[9px] lowercase font-normal ml-1">(Login required)</span>}
                    </button>

                    {showAssistant && currentUser && (
                        <div className="absolute right-0 mt-3 w-72 md:w-96 bg-white border border-slate-200 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex flex-col h-[480px] animate-in fade-in zoom-in-95 duration-300 overflow-hidden">

                            {/* Header with Gradient */}
                            <div className="px-5 py-4 bg-blue-600 flex justify-between items-center text-white">
                                <h4 className="font-black text-xs uppercase tracking-widest flex items-center gap-2">
                                    <Sparkles size={14} className="text-cyan-300" /> Clinical Intelligence
                                </h4>
                                <button
                                    onClick={() => setShowAssistant(false)}
                                    className="text-white/70 hover:text-white transition-colors"
                                >
                                    <span className="text-xs font-bold">Close</span>
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50 scrollbar-thin scrollbar-thumb-slate-200">
                                {!currentUser ? (
                                    <div className="flex h-full items-center justify-center text-center p-4">
                                        <p className="text-xs font-bold text-slate-500">Please log in to use the chatbot.</p>
                                    </div>
                                ) : (
                                    <>
                                        {messages.map((m, i) => (
                                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`px-4 py-2.5 rounded-2xl text-xs max-w-[85%] leading-relaxed shadow-sm ${m.role === 'user'
                                                    ? 'bg-indigo-600 text-white rounded-tr-none'
                                                    : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
                                                    }`}>
                                                    {m.content}
                                                </div>
                                            </div>
                                        ))}
                                        {isTyping && (
                                            <div className="text-[10px] text-slate-400 font-bold flex gap-1 items-center px-2">
                                                <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" />
                                                <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                                <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="p-4 bg-white border-t border-slate-100">
                                <div className="relative flex items-center">
                                    <input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && user && sendMessage()}
                                        disabled={!user}
                                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder={user ? "Ask clinical queries..." : "Please log in to chat"}
                                    />
                                    <button
                                        onClick={sendMessage}
                                        disabled={!user}
                                        className="absolute right-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>






                {/* --- ADDED: PROFILE REDIRECT ICON --- */}
                <NavLink
                    to={currentUser ? "/profile" : "/login"}
                    className="ml-1 flex items-center justify-center h-8 md:h-10 w-8 md:w-10 rounded-xl border border-slate-200 hover:border-primary/50 hover:shadow-sm overflow-hidden transition-all bg-slate-50"
                    title="Profile"
                >
                    {currentUser?.profilePicture ? (
                        <img
                            src={currentUser.profilePicture}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <User size={18} className="text-slate-500" />
                    )}
                </NavLink>

            </div>
        </header>
    );
}