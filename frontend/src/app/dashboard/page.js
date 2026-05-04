"use client";

import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Layers, Plus, CheckCircle2, Clock, AlertCircle, Users } from 'lucide-react';
import api from '@/lib/axios';
import ProjectCard from '@/components/ProjectCard';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function DashboardPage() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [fetchError, setFetchError] = useState('');
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      fetchDashboardData();
    }
  }, [user, loading, router]);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch projects
      const projRes = await api.get('/projects');
      const projectsData = projRes.data;
      setProjects(projectsData);

      // 2. Fetch tasks for all projects concurrently
      const taskPromises = projectsData.map(proj => api.get(`/tasks/${proj._id}`));
      const tasksResponses = await Promise.all(taskPromises);
      
      // Flatten arrays
      const allTasks = tasksResponses.flatMap(res => res.data);

      // 3. Aggregate Analytics
      const totalTasks = allTasks.length;
      const overdueTasks = allTasks.filter(t => t.isOverdue).length;
      
      const tasksByStatus = {
        'To Do': 0,
        'In Progress': 0,
        'Done': 0
      };
      
      const tasksByUser = {};

      allTasks.forEach(task => {
        if (tasksByStatus[task.status] !== undefined) {
          tasksByStatus[task.status]++;
        }
        
        // Ensure populated assignedTo exists
        const userName = task.assignedTo?.name || 'Unassigned';
        if (!tasksByUser[userName]) {
          tasksByUser[userName] = 0;
        }
        tasksByUser[userName]++;
      });

      setAnalytics({
        totalTasks,
        overdueTasks,
        tasksByStatus,
        tasksByUser
      });

    } catch (err) {
      setFetchError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setDataLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    
    try {
      const res = await api.post('/projects', { name: newProjectName });
      setProjects([...projects, res.data]);
      setNewProjectName('');
      setIsCreating(false);
    } catch (err) {
      alert('Failed to create project');
    }
  };

  if (loading || dataLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-slate-400">Welcome back, {user.name}!</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {fetchError && (
        <div className="text-red-400 bg-red-500/10 p-4 rounded-lg text-center">{fetchError}</div>
      )}

      {/* Analytics Section */}
      {analytics && projects.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Layers className="w-5 h-5 mr-2 text-indigo-400" /> Analytics Overview
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Tasks Card */}
            <div className="glass-panel p-6 rounded-xl border-t-4 border-indigo-500">
              <p className="text-sm font-medium text-slate-400 mb-1">Total Tasks</p>
              <h3 className="text-3xl font-bold text-white">{analytics.totalTasks}</h3>
            </div>
            
            {/* Overdue Tasks Card */}
            <div className="glass-panel p-6 rounded-xl border-t-4 border-red-500">
              <p className="text-sm font-medium text-slate-400 mb-1">Overdue Tasks</p>
              <h3 className="text-3xl font-bold text-red-400">{analytics.overdueTasks}</h3>
            </div>

            {/* Tasks by Status */}
            <div className="glass-panel p-6 rounded-xl lg:col-span-2">
              <p className="text-sm font-medium text-slate-400 mb-4">Tasks by Status</p>
              <div className="space-y-4">
                {Object.entries(analytics.tasksByStatus).map(([status, count]) => {
                  const percentage = analytics.totalTasks === 0 ? 0 : Math.round((count / analytics.totalTasks) * 100);
                  const colors = {
                    'To Do': 'bg-slate-500',
                    'In Progress': 'bg-blue-500',
                    'Done': 'bg-emerald-500'
                  };
                  return (
                    <div key={status} className="flex items-center text-sm">
                      <div className="w-24 text-slate-300 font-medium">{status}</div>
                      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden mx-4">
                        <div className={`h-full ${colors[status]}`} style={{ width: `${percentage}%` }}></div>
                      </div>
                      <div className="w-8 text-right text-slate-400">{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tasks per User */}
          <div className="glass-panel p-6 rounded-xl">
             <p className="text-sm font-medium text-slate-400 mb-4 flex items-center">
               <Users className="w-4 h-4 mr-2" /> Tasks per User
             </p>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
               {Object.entries(analytics.tasksByUser).map(([name, count]) => (
                 <div key={name} className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-lg flex justify-between items-center">
                   <span className="font-medium text-slate-200">{name}</span>
                   <span className="bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full text-xs font-bold">
                     {count} Task{count !== 1 && 's'}
                   </span>
                 </div>
               ))}
               {Object.keys(analytics.tasksByUser).length === 0 && (
                 <p className="text-slate-500 text-sm italic">No tasks assigned yet.</p>
               )}
             </div>
          </div>
        </div>
      )}

      {/* Projects Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <Layers className="w-5 h-5 mr-2 text-indigo-400" /> Your Projects
        </h2>

        {isCreating && (
          <div className="glass-panel p-6 rounded-xl border border-indigo-500/30 mb-8 animate-in fade-in slide-in-from-top-4">
            <form onSubmit={handleCreateProject} className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <Input 
                  label="Project Name" 
                  value={newProjectName} 
                  onChange={e => setNewProjectName(e.target.value)} 
                  placeholder="E.g., Website Redesign"
                  required
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="ghost" onClick={() => setIsCreating(false)} className="flex-1 sm:flex-none">Cancel</Button>
                <Button type="submit" className="flex-1 sm:flex-none">Create</Button>
              </div>
            </form>
          </div>
        )}

        {projects.length === 0 ? (
          <div className="glass-panel p-12 rounded-xl flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mb-4 border border-indigo-500/30">
              <Layers className="w-8 h-8 text-indigo-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No Projects Yet</h2>
            <p className="text-slate-400 max-w-md mb-6">
              You aren't a part of any projects. Create your first project to start managing tasks with your team.
            </p>
            <Button onClick={() => setIsCreating(true)}>Create Project</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
