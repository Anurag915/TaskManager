import React from 'react';
import { Calendar, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

const TaskCard = ({ task, onStatusChange, currentUserId }) => {
  const isOverdue = task.isOverdue;
  const canUpdate = true; // Based on requirements: admins can update all, members can update assigned. Wait, let's just show dropdown and let backend handle auth, or disable if not authorized.

  const statusColors = {
    'To Do': 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    'In Progress': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'Done': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
  };

  const priorityColors = {
    'Low': 'text-emerald-400',
    'Medium': 'text-amber-400',
    'High': 'text-rose-400'
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'To Do': return <Clock className="w-4 h-4 mr-1.5" />;
      case 'In Progress': return <Clock className="w-4 h-4 mr-1.5" />; // Could use different icon
      case 'Done': return <CheckCircle2 className="w-4 h-4 mr-1.5" />;
      default: return null;
    }
  };

  return (
    <div className={`glass-panel p-5 rounded-xl border-l-4 ${isOverdue ? 'border-l-red-500' : 'border-l-indigo-500'}`}>
      <div className="flex justify-between items-start mb-3">
        <h4 className="text-lg font-semibold text-white">{task.title}</h4>
        <select 
          value={task.status} 
          onChange={(e) => onStatusChange(task._id, e.target.value)}
          className={`text-xs font-medium px-2.5 py-1 rounded-full border outline-none cursor-pointer appearance-none ${statusColors[task.status]}`}
        >
          <option value="To Do" className="bg-slate-800 text-white">To Do</option>
          <option value="In Progress" className="bg-slate-800 text-white">In Progress</option>
          <option value="Done" className="bg-slate-800 text-white">Done</option>
        </select>
      </div>
      
      {task.description && (
        <p className="text-sm text-slate-400 mb-4 line-clamp-2">{task.description}</p>
      )}

      <div className="flex flex-wrap gap-4 mt-auto pt-4 border-t border-slate-700/50 text-xs font-medium">
        <div className={`flex items-center ${priorityColors[task.priority]}`}>
          <AlertCircle className="w-4 h-4 mr-1.5" />
          {task.priority} Priority
        </div>
        
        <div className={`flex items-center ${isOverdue ? 'text-red-400' : 'text-slate-400'}`}>
          <Calendar className="w-4 h-4 mr-1.5" />
          {new Date(task.dueDate).toLocaleDateString()}
          {isOverdue && <span className="ml-1.5 px-1.5 py-0.5 bg-red-500/20 rounded text-red-300">Overdue</span>}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
