import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, CheckCircle2, Clock, ListTodo, MoreVertical, Loader2, AlertCircle } from 'lucide-react';

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '', description: '', priority: 'Medium', assigned_to: '', status: 'Todo'
  });
  const { user } = useAuth();

  const [selectedTask, setSelectedTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    if (selectedTask) {
        fetchComments(selectedTask.id);
    }
  }, [selectedTask]);

  const fetchComments = async (taskId) => {
    setLoadingComments(true);
    try {
        const res = await api.get(`/comments/${taskId}`);
        setComments(res.data);
    } catch (err) {
        console.error('Failed to fetch comments');
    } finally {
        setLoadingComments(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
        const res = await api.post('/comments', { content: newComment, task_id: selectedTask.id });
        setComments([...comments, res.data]);
        setNewComment('');
    } catch (err) {
        console.error('Failed to add comment');
    }
  };

  const fetchData = async () => {
    try {
      const [projRes, taskRes, userRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks?project_id=${id}`),
        api.get('/tasks/users')
      ]);
      setProject(projRes.data);
      setTasks(taskRes.data);
      setUsers(userRes.data);
    } catch (err) {
      console.error('Failed to fetch project data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { ...newTask, project_id: id });
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', priority: 'Medium', assigned_to: '', status: 'Todo' });
      fetchData();
    } catch (err) {
      console.error('Failed to create task');
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status: newStatus });
      fetchData();
    } catch (err) {
      console.error('Failed to update task');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-brand-primary" size={40} />
    </div>
  );

  const columns = [
    { id: 'Todo', icon: ListTodo, color: 'text-slate-400' },
    { id: 'In Progress', icon: Clock, color: 'text-amber-400' },
    { id: 'Done', icon: CheckCircle2, color: 'text-emerald-400' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">{project?.name}</h1>
          <p className="text-slate-400">{project?.description}</p>
        </div>
        {user?.role === 'Admin' && (
          <button
            onClick={() => setShowTaskModal(true)}
            className="bg-brand-primary text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus size={20} />
            <span>Add Task</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {columns.map((col) => (
          <div key={col.id} className="space-y-4">
            <div className="flex items-center space-x-3 px-2">
              <col.icon className={col.color} size={20} />
              <h2 className="text-lg font-bold text-white">{col.id}</h2>
              <span className="bg-white/5 text-slate-500 px-2 py-0.5 rounded-full text-xs">
                {tasks.filter(t => t.status === col.id).length}
              </span>
            </div>

            <div className="space-y-4 min-h-[500px]">
              {tasks.filter(t => t.status === col.id).map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="glass p-5 rounded-2xl group border-l-4 transition-all cursor-pointer hover:bg-white/5"
                  style={{ borderLeftColor: task.priority === 'High' ? '#ef4444' : task.priority === 'Medium' ? '#f59e0b' : '#3b82f6' }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                      task.priority === 'High' ? 'bg-rose-500/10 text-rose-500' : 
                      task.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500' : 
                      'bg-blue-500/10 text-blue-500'
                    }`}>
                      {task.priority}
                    </span>
                    <div className="relative group/menu">
                        <button className="text-slate-600 hover:text-white transition-colors">
                            <MoreVertical size={16} />
                        </button>
                        <div className="absolute right-0 top-6 w-32 glass rounded-xl hidden group-hover/menu:block z-10 overflow-hidden border border-white/10 shadow-xl">
                            {columns.filter(c => c.id !== task.status).map(c => (
                                <button 
                                    key={c.id}
                                    onClick={() => updateTaskStatus(task.id, c.id)}
                                    className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-white/5 transition-colors"
                                >
                                    Move to {c.id}
                                </button>
                            ))}
                        </div>
                    </div>
                  </div>
                  <h4 className="text-white font-semibold mb-2">{task.title}</h4>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">{task.description}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-brand-secondary/20 flex items-center justify-center text-[10px] text-brand-secondary font-bold">
                        {task.assigned_name?.[0] || '?'}
                      </div>
                      <span className="text-xs text-slate-500">{task.assigned_name || 'Unassigned'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass w-full max-w-lg p-8 rounded-3xl animate-in">
            <h2 className="text-2xl font-bold text-white mb-6">Add New Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Task Title</label>
                <input
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all"
                  placeholder="Task title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Description</label>
                <textarea
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all resize-none"
                  placeholder="What needs to be done?"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Priority</label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all appearance-none"
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  >
                    <option value="Low" className="bg-[#1e293b]">Low</option>
                    <option value="Medium" className="bg-[#1e293b]">Medium</option>
                    <option value="High" className="bg-[#1e293b]">High</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Assign To</label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all appearance-none"
                    value={newTask.assigned_to}
                    onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })}
                  >
                    <option value="" className="bg-[#1e293b]">Unassigned</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id} className="bg-[#1e293b]">{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl font-semibold text-slate-400 hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-brand-primary text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-brand-primary/20 hover:opacity-90 transition-all"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task View/Comment Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass w-full max-w-2xl p-8 rounded-3xl animate-in max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full mb-2 inline-block ${
                  selectedTask.priority === 'High' ? 'bg-rose-500/10 text-rose-500' : 
                  selectedTask.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500' : 
                  'bg-blue-500/10 text-blue-500'
                }`}>
                  {selectedTask.priority} Priority
                </span>
                <h2 className="text-3xl font-bold text-white">{selectedTask.title}</h2>
              </div>
              <button 
                onClick={() => setSelectedTask(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-4 space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wider">Description</h4>
                <p className="text-slate-400 leading-relaxed">{selectedTask.description || 'No description provided.'}</p>
              </div>

              <div className="pt-6 border-t border-white/5">
                <h4 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">Comments</h4>
                
                <div className="space-y-4 mb-6">
                  {loadingComments ? (
                    <div className="flex justify-center py-4"><Loader2 className="animate-spin text-brand-primary" /></div>
                  ) : comments.length === 0 ? (
                    <p className="text-slate-500 text-sm italic">No comments yet.</p>
                  ) : (
                    comments.map(c => (
                      <div key={c.id} className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-brand-secondary">{c.user_name}</span>
                          <span className="text-[10px] text-slate-500">{new Date(c.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-300 text-sm">{c.content}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddComment} className="flex space-x-2">
                  <input
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <button 
                    type="submit"
                    className="bg-brand-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
                  >
                    Post
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
