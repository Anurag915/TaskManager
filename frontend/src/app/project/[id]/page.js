"use client";

import React, { useEffect, useState, useContext, use } from 'react';
import { AuthContext } from '@/context/AuthContext';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { Plus, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import TaskCard from '@/components/TaskCard';
import TaskForm from '@/components/TaskForm';
import MemberList from '@/components/MemberList';
import Link from 'next/link';

export default function ProjectPage({ params }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;
  
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      fetchData();
    }
  }, [user, loading, projectId, router]);

  const fetchData = async () => {
    try {
      const projRes = await api.get('/projects');
      const currentProj = projRes.data.find(p => p._id === projectId);
      
      if (!currentProj) {
        router.push('/dashboard');
        return;
      }
      
      setProject(currentProj);

      const tasksRes = await api.get(`/tasks/${projectId}`);
      setTasks(tasksRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setPageLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      const res = await api.post(`/tasks/${projectId}`, taskData);
      setTasks([...tasks, res.data]);
      setIsCreatingTask(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      
      const tasksRes = await api.get(`/tasks/${projectId}`);
      setTasks(tasksRes.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
      fetchData(); 
    }
  };

  const handleAddMember = async (memberId) => {
    try {
      await api.put(`/projects/${projectId}/members/add`, { memberId });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await api.delete(`/projects/${projectId}/remove-member/${userId}`);
      fetchData();
      return { success: true };
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message.includes('Reassign tasks')) {
        return { 
          needsReassignment: true, 
          message: err.response.data.message 
        };
      }
      alert(err.response?.data?.message || 'Failed to remove member');
      return { success: false };
    }
  };

  const handleReassignAndRemove = async (fromUserId, toUserId) => {
    try {
      await api.put('/tasks/reassign', {
        projectId,
        fromUserId,
        toUserId
      });
      await api.delete(`/projects/${projectId}/remove-member/${fromUserId}`);
      fetchData();
      return true;
    } catch (err) {
      alert(err.response?.data?.message || 'Reassignment failed');
      return false;
    }
  };

  if (loading || pageLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const isAdmin = project?.admin === user?._id;

  return (
    <div className="space-y-6">
      <div className="flex items-center text-slate-400 text-sm mb-2 hover:text-white transition-colors w-fit">
        <Link href="/dashboard" className="flex items-center">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/50 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">{project.name}</h1>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsCreatingTask(!isCreatingTask)}>
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {isCreatingTask && (
            <div className="animate-in fade-in slide-in-from-top-4">
              <TaskForm 
                members={project.members} 
                onSubmit={handleCreateTask} 
                onCancel={() => setIsCreatingTask(false)} 
              />
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Tasks</h2>
            {tasks.length === 0 ? (
              <div className="glass-panel p-8 text-center rounded-xl text-slate-400">
                No tasks found. {isAdmin ? 'Create one above!' : ''}
              </div>
            ) : (
              <div className="grid gap-4">
                {tasks.map(task => (
                  <TaskCard 
                    key={task._id} 
                    task={task} 
                    onStatusChange={handleStatusChange}
                    currentUserId={user._id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <MemberList 
            members={project.members} 
            adminId={project.admin} 
            onAddMember={handleAddMember}
            onRemoveMember={handleRemoveMember}
            onReassignAndRemove={handleReassignAndRemove}
            currentUserId={user._id}
          />
        </div>
      </div>
    </div>
  );
}
