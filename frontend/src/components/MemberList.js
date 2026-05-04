"use client";

import React, { useState, useEffect } from 'react';
import { User, Shield, UserPlus, Search, Trash2, AlertCircle } from 'lucide-react';
import Button from './ui/Button';
import api from '@/lib/axios';

const MemberList = ({ members, adminId, onAddMember, onRemoveMember, onReassignAndRemove, currentUserId }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Reassignment state
  const [reassigningId, setReassigningId] = useState(null);
  const [selectedReassignee, setSelectedReassignee] = useState('');
  const [reassignError, setReassignError] = useState('');

  const isAdmin = currentUserId === adminId;

  useEffect(() => {
    if (showAddForm) {
      fetchUsers();
    }
  }, [showAddForm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/users');
      // Filter out users already in project
      const memberIds = members.map(m => m._id);
      const filteredUsers = res.data.filter(u => !memberIds.includes(u._id));
      setUsers(filteredUsers);
    } catch (err) {
      console.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveClick = async (userId) => {
    setReassigningId(null);
    setReassignError('');
    
    const result = await onRemoveMember(userId);
    
    // If the error indicates tasks need reassignment
    if (result?.needsReassignment) {
      setReassigningId(userId);
      setReassignError(result.message);
      // Default to first available other member (usually the admin themselves)
      const otherMembers = members.filter(m => m._id !== userId);
      if (otherMembers.length > 0) {
        // Prefer admin if available in the filter
        const adminObj = otherMembers.find(m => m._id === adminId);
        setSelectedReassignee(adminObj ? adminObj._id : otherMembers[0]._id);
      }
    }
  };

  const handleReassignConfirm = async () => {
    if (!selectedReassignee) return;
    setLoading(true);
    const success = await onReassignAndRemove(reassigningId, selectedReassignee);
    if (success) {
      setReassigningId(null);
      setSelectedReassignee('');
    }
    setLoading(false);
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="glass-panel p-6 rounded-xl flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <User className="w-5 h-5 mr-2 text-indigo-400" />
          Project Members
        </h3>
        {isAdmin && (
          <Button 
            variant="ghost" 
            onClick={() => {
              setShowAddForm(!showAddForm);
              setReassigningId(null);
            }}
            className="!p-2"
          >
            <UserPlus className="w-4 h-4" />
          </Button>
        )}
      </div>

      {showAddForm && (
        <div className="mb-6 space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          
          <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {loading ? (
              <p className="text-xs text-slate-500 text-center py-4">Loading users...</p>
            ) : filteredUsers.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No other users found</p>
            ) : (
              filteredUsers.map(u => (
                <div key={u._id} className="flex items-center justify-between p-2 rounded-md bg-slate-800/30 border border-slate-700/30 hover:bg-slate-700/30 transition-colors">
                  <div className="truncate mr-2">
                    <p className="text-xs font-medium text-slate-200 truncate">{u.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{u.email}</p>
                  </div>
                  <Button 
                    variant="primary" 
                    className="!py-1 !px-2 text-[10px]"
                    onClick={() => {
                      onAddMember(u._id);
                      setShowAddForm(false);
                      setSearch('');
                    }}
                  >
                    Add
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
        {members.map(member => (
          <div key={member._id} className="flex flex-col p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="truncate">
                <p className="text-sm font-medium text-slate-200 truncate">{member.name}</p>
                <p className="text-xs text-slate-400 truncate">{member.email}</p>
              </div>
              <div className="flex items-center space-x-2 ml-2">
                {adminId === member._id ? (
                  <span className="flex items-center text-xs font-medium text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-full shrink-0">
                    <Shield className="w-3 h-3 mr-1" />
                    Admin
                  </span>
                ) : (
                  isAdmin && (
                    <button 
                      onClick={() => handleRemoveClick(member._id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                      title="Remove Member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Reassignment Flow UI */}
            {reassigningId === member._id && (
              <div className="mt-4 pt-4 border-t border-slate-700 animate-in zoom-in-95 duration-200">
                <div className="flex items-start text-[10px] text-amber-400 mb-3 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                  <AlertCircle className="w-3 h-3 mr-1.5 shrink-0 mt-0.5" />
                  <p>{reassignError}</p>
                </div>
                
                <label className="text-[10px] font-medium text-slate-400 mb-1.5 block">Reassign tasks to:</label>
                <select 
                  value={selectedReassignee}
                  onChange={(e) => setSelectedReassignee(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-md py-1.5 px-2 text-xs text-slate-200 mb-3 outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="" disabled>Select member</option>
                  {members.filter(m => m._id !== member._id).map(m => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>

                <div className="flex space-x-2">
                  <Button 
                    variant="primary" 
                    className="flex-1 !py-1.5 text-[10px]"
                    onClick={handleReassignConfirm}
                    isLoading={loading}
                    disabled={!selectedReassignee}
                  >
                    Confirm & Remove
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="!py-1.5 text-[10px]"
                    onClick={() => setReassigningId(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberList;
