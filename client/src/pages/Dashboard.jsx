import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Folder, Calendar, Users, ChevronRight, Loader2, ListTodo, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const { user } = useAuth();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', newProject);
      setNewProject({ name: '', description: '' });
      setShowModal(false);
      fetchProjects();
    } catch (err) {
      console.error('Failed to create project');
    }
  };

  const stats = {
    total: projects.length,
    tasks: 0, // In a real app, you'd fetch these or calculate them
    overdue: 0
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-brand-primary" size={40} />
    </div>
  );

  return (
    <div className="space-y-10 animate-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black text-white mb-3 tracking-tight">Workspace <span className="text-gradient">Overview</span></h1>
          <p className="text-slate-400 text-lg">Manage your team and track project progress.</p>
        </div>
        {user?.role === 'Admin' && (
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            <Plus size={20} />
            <span>New Project</span>
          </button>
        )}
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center space-x-4">
            <div className="p-4 bg-brand-primary/10 rounded-2xl text-brand-primary">
                <Folder size={24} />
            </div>
            <div>
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Total Projects</p>
                <h4 className="text-3xl font-bold text-white">{projects.length}</h4>
            </div>
        </div>
        <div className="glass-card p-6 flex items-center space-x-4">
            <div className="p-4 bg-brand-secondary/10 rounded-2xl text-brand-secondary">
                <ListTodo size={24} />
            </div>
            <div>
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Active Tasks</p>
                <h4 className="text-3xl font-bold text-white">Active</h4>
            </div>
        </div>
        <div className="glass-card p-6 flex items-center space-x-4">
            <div className="p-4 bg-rose-500/10 rounded-2xl text-rose-500">
                <AlertCircle size={24} />
            </div>
            <div>
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Overdue</p>
                <h4 className="text-3xl font-bold text-white">0</h4>
            </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Your Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
          <Link
            key={project.id}
            to={`/projects/${project.id}`}
            className="glass p-6 rounded-2xl group hover:border-brand-primary/50 transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-brand-primary/10 rounded-xl text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors">
                <Folder size={24} />
              </div>
              <ChevronRight className="text-slate-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{project.name}</h3>
            <p className="text-slate-400 text-sm line-clamp-2 mb-6">{project.description}</p>
            
            <div className="flex items-center space-x-4 text-slate-500 text-xs font-medium">
              <div className="flex items-center space-x-1">
                <Calendar size={14} />
                <span>{new Date(project.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </Link>
        ))}
        
        {projects.length === 0 && (
          <div className="col-span-full py-20 text-center glass rounded-3xl">
            <Folder size={48} className="mx-auto text-slate-700 mb-4" />
            <h3 className="text-xl font-bold text-slate-500">No projects found</h3>
            <p className="text-slate-600">Start by creating your first project.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass w-full max-w-lg p-8 rounded-3xl animate-in">
            <h2 className="text-2xl font-bold text-white mb-6">Create New Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Project Name</label>
                <input
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all"
                  placeholder="E.g. Website Redesign"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Description</label>
                <textarea
                  rows="4"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all resize-none"
                  placeholder="What is this project about?"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl font-semibold text-slate-400 hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-brand-primary text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-brand-primary/20 hover:opacity-90 transition-all"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
