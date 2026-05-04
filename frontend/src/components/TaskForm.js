import React, { useState } from 'react';
import Input from './ui/Input';
import Button from './ui/Button';

const TaskForm = ({ onSubmit, members, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [assignedTo, setAssignedTo] = useState(members[0]?._id || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ title, description, dueDate, priority, assignedTo });
  };

  return (
    <div className="glass-panel p-6 rounded-xl border border-slate-700">
      <h3 className="text-xl font-semibold text-white mb-4">Create New Task</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input 
          label="Title" 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          required 
          placeholder="E.g., Implement login page" 
        />
        
        <div className="flex flex-col space-y-1.5">
          <label className="text-sm font-medium text-slate-300">Description</label>
          <textarea 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            className="px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
            placeholder="Detailed description of the task..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Due Date" 
            type="date" 
            value={dueDate} 
            onChange={e => setDueDate(e.target.value)} 
            required 
          />
          
          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Priority</label>
            <select 
              value={priority} 
              onChange={e => setPriority(e.target.value)}
              className="px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col space-y-1.5">
          <label className="text-sm font-medium text-slate-300">Assign To</label>
          <select 
            value={assignedTo} 
            onChange={e => setAssignedTo(e.target.value)}
            required
            className="px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="" disabled>Select a member</option>
            {members.map(member => (
              <option key={member._id} value={member._id}>
                {member.name} ({member.email})
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-slate-700/50">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button type="submit" variant="primary">Create Task</Button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
