'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Menu,
  Plus,
  MessageSquare,
  Clock,
  BookOpen,
  Zap,
  Compass,
  Settings,
  LogOut,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Trash2,
  Archive,
  Pin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Project {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface Conversation {
  id: string;
  title: string;
  date: string;
  pinned?: boolean;
}

export function Sidebar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [showMoreProjects, setShowMoreProjects] = useState(false);
  const [showMoreConversations, setShowMoreConversations] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Mock data - replace with real data from backend
  const projects: Project[] = [
    { id: '1', name: 'Lead Generation', icon: '📊', color: 'bg-vantiq-violet' },
    { id: '2', name: 'Business Loans', icon: '💼', color: 'bg-vantiq-gold' },
    { id: '3', name: 'Personal Loans', icon: '💰', color: 'bg-vantiq-sage' },
    { id: '4', name: 'Apollo Research', icon: '🔍', color: 'bg-vantiq-rosewood' },
    { id: '5', name: 'ERP Backend', icon: '⚙️', color: 'bg-vantiq-terracotta' },
    { id: '6', name: 'Website Project', icon: '🌐', color: 'bg-vantiq-violet' },
  ];

  const conversations: Conversation[] = [
    { id: '1', title: 'AI Model Name & Logo', date: 'Today' },
    { id: '2', title: 'Write Kiro App Prompt', date: 'Yesterday' },
    { id: '3', title: 'Electrical Engineering', date: '2 days ago' },
    { id: '4', title: 'NOC Support Engineer', date: '3 days ago' },
    { id: '5', title: 'Lead Strategy Discussion', date: '1 week ago' },
    { id: '6', title: 'Dashboard Design', date: '1 week ago' },
  ];

  const displayedProjects = showMoreProjects ? projects : projects.slice(0, 4);
  const displayedConversations = showMoreConversations
    ? conversations
    : conversations.slice(0, 4);

  const handleNewChat = () => {
    router.push('/chat/new');
  };

  const handleSignOut = () => {
    // TODO: Implement sign out with Clerk
    router.push('/');
  };

  const handleDeleteConversation = (id: string) => {
    // TODO: Implement delete
    console.log('Delete conversation:', id);
  };

  const handlePinConversation = (id: string) => {
    // TODO: Implement pin
    console.log('Pin conversation:', id);
  };

  const handleArchiveConversation = (id: string) => {
    // TODO: Implement archive
    console.log('Archive conversation:', id);
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 p-2 rounded-lg bg-vantiq-charcoal border border-vantiq-violet/20 lg:hidden"
      >
        <Menu className="w-5 h-5 text-vantiq-ivory" />
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-vantiq-navy border-r border-vantiq-violet/20 flex flex-col z-40 transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-vantiq-violet/20">
          <Button
            onClick={handleNewChat}
            className="w-full bg-vantiq-violet hover:bg-vantiq-violet/80 text-vantiq-ivory flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </Button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-2">
            {/* Dashboard */}
            <Link href="/dashboard">
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-vantiq-charcoal/50 text-vantiq-ivory/80 hover:text-vantiq-ivory transition flex items-center gap-3">
                <MessageSquare className="w-5 h-5" />
                <span>Dashboard</span>
              </button>
            </Link>

            {/* Leads */}
            <Link href="/leads">
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-vantiq-charcoal/50 text-vantiq-ivory/80 hover:text-vantiq-ivory transition flex items-center gap-3">
                <Zap className="w-5 h-5" />
                <span>Lead Generation</span>
              </button>
            </Link>

            {/* Lead Database */}
            <Link href="/leads/database">
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-vantiq-charcoal/50 text-vantiq-ivory/80 hover:text-vantiq-ivory transition flex items-center gap-3">
                <BookOpen className="w-5 h-5" />
                <span>Lead Database</span>
              </button>
            </Link>

            {/* Campaigns */}
            <Link href="/campaigns">
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-vantiq-charcoal/50 text-vantiq-ivory/80 hover:text-vantiq-ivory transition flex items-center gap-3">
                <MessageSquare className="w-5 h-5" />
                <span>Campaigns</span>
              </button>
            </Link>

            {/* Lead Qualification */}
            <Link href="/leads/qualify">
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-vantiq-charcoal/50 text-vantiq-ivory/80 hover:text-vantiq-ivory transition flex items-center gap-3">
                <Zap className="w-5 h-5" />
                <span>Lead Qualification</span>
              </button>
            </Link>

            {/* Lead Distribution */}
            <Link href="/distributions">
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-vantiq-charcoal/50 text-vantiq-ivory/80 hover:text-vantiq-ivory transition flex items-center gap-3">
                <MessageSquare className="w-5 h-5" />
                <span>Lead Distribution</span>
              </button>
            </Link>

            {/* Buyers */}
            <Link href="/buyers">
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-vantiq-charcoal/50 text-vantiq-ivory/80 hover:text-vantiq-ivory transition flex items-center gap-3">
                <BookOpen className="w-5 h-5" />
                <span>Buyers / Clients</span>
              </button>
            </Link>

            {/* Commission Tracking */}
            <Link href="/commissions">
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-vantiq-charcoal/50 text-vantiq-ivory/80 hover:text-vantiq-ivory transition flex items-center gap-3">
                <Zap className="w-5 h-5" />
                <span>Commission Tracking</span>
              </button>
            </Link>

            {/* Analytics */}
            <Link href="/analytics">
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-vantiq-charcoal/50 text-vantiq-ivory/80 hover:text-vantiq-ivory transition flex items-center gap-3">
                <MessageSquare className="w-5 h-5" />
                <span>Analytics</span>
              </button>
            </Link>

            {/* Scheduled */}
            <Link href="/scheduled">
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-vantiq-charcoal/50 text-vantiq-ivory/80 hover:text-vantiq-ivory transition flex items-center gap-3">
                <Clock className="w-5 h-5" />
                <span>Scheduled</span>
              </button>
            </Link>

            {/* Library */}
            <Link href="/library">
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-vantiq-charcoal/50 text-vantiq-ivory/80 hover:text-vantiq-ivory transition flex items-center gap-3">
                <BookOpen className="w-5 h-5" />
                <span>Library</span>
              </button>
            </Link>

            {/* Plugins */}
            <Link href="/plugins">
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-vantiq-charcoal/50 text-vantiq-ivory/80 hover:text-vantiq-ivory transition flex items-center gap-3">
                <Zap className="w-5 h-5" />
                <span>Plugins</span>
              </button>
            </Link>

            {/* Explore */}
            <Link href="/explore">
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-vantiq-charcoal/50 text-vantiq-ivory/80 hover:text-vantiq-ivory transition flex items-center gap-3">
                <Compass className="w-5 h-5" />
                <span>Explore</span>
              </button>
            </Link>

            {/* Settings */}
            <Link href="/settings">
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-vantiq-charcoal/50 text-vantiq-ivory/80 hover:text-vantiq-ivory transition flex items-center gap-3">
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>
            </Link>
          </div>

          {/* Divider */}
          <div className="h-px bg-vantiq-violet/20 mx-4" />

          {/* Projects Section */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-vantiq-ivory">Projects</h3>
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6"
                onClick={() => router.push('/projects/new')}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-1">
              {displayedProjects.map((project) => (
                <div
                  key={project.id}
                  className="group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-vantiq-charcoal/50 cursor-pointer transition"
                >
                  <span className="text-lg">{project.icon}</span>
                  <span className="flex-1 text-sm text-vantiq-ivory/80 truncate">
                    {project.name}
                  </span>
                </div>
              ))}
            </div>

            {projects.length > 4 && (
              <button
                onClick={() => setShowMoreProjects(!showMoreProjects)}
                className="w-full mt-2 px-3 py-2 text-sm text-vantiq-violet hover:text-vantiq-gold transition flex items-center justify-center gap-1"
              >
                {showMoreProjects ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Show More
                  </>
                )}
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-vantiq-violet/20 mx-4" />

          {/* Recents Section */}
          <div className="p-4">
            <h3 className="text-sm font-semibold text-vantiq-ivory mb-3">Recents</h3>

            <div className="space-y-1">
              {displayedConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-vantiq-charcoal/50 transition"
                  onMouseEnter={() => setHoveredId(conversation.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <Link href={`/chat/${conversation.id}`} className="flex-1 min-w-0">
                    <div className="text-sm text-vantiq-ivory/80 truncate hover:text-vantiq-ivory">
                      {conversation.title}
                    </div>
                  </Link>

                  {hoveredId === conversation.id && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => handlePinConversation(conversation.id)}
                        className="p-1 hover:bg-vantiq-violet/20 rounded transition"
                        title="Pin"
                      >
                        <Pin className="w-3.5 h-3.5 text-vantiq-ivory/60" />
                      </button>

                      <div className="relative group/menu">
                        <button className="p-1 hover:bg-vantiq-violet/20 rounded transition">
                          <MoreHorizontal className="w-3.5 h-3.5 text-vantiq-ivory/60" />
                        </button>

                        {/* Dropdown Menu */}
                        <div className="absolute right-0 mt-1 w-32 bg-vantiq-charcoal border border-vantiq-violet/20 rounded-lg shadow-lg opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition z-50">
                          <button
                            onClick={() => handleArchiveConversation(conversation.id)}
                            className="w-full text-left px-3 py-2 text-sm text-vantiq-ivory/80 hover:text-vantiq-ivory hover:bg-vantiq-violet/10 transition flex items-center gap-2"
                          >
                            <Archive className="w-3.5 h-3.5" />
                            Archive
                          </button>
                          <button
                            onClick={() => handleDeleteConversation(conversation.id)}
                            className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition flex items-center gap-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {conversations.length > 4 && (
              <button
                onClick={() => setShowMoreConversations(!showMoreConversations)}
                className="w-full mt-2 px-3 py-2 text-sm text-vantiq-violet hover:text-vantiq-gold transition flex items-center justify-center gap-1"
              >
                {showMoreConversations ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Show More
                  </>
                )}
              </button>
            )}
          </div>
        </nav>

        {/* Divider */}
        <div className="h-px bg-vantiq-violet/20 mx-4" />

        {/* User Profile Section */}
        <div className="p-4 border-t border-vantiq-violet/20">
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-vantiq-charcoal/50 cursor-pointer transition">
            <div className="w-8 h-8 rounded-full bg-vantiq-violet flex items-center justify-center">
              <span className="text-sm font-semibold text-vantiq-ivory">
                V
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-vantiq-ivory truncate">
                User Profile
              </p>
              <p className="text-xs text-vantiq-ivory/60">Account • Settings</p>
            </div>
          </div>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="w-full mt-2 px-3 py-2 text-sm text-vantiq-ivory/80 hover:text-vantiq-ivory hover:bg-vantiq-violet/10 transition flex items-center justify-center gap-2 rounded-lg"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
