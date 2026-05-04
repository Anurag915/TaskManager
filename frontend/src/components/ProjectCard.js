import React from 'react';
import Link from 'next/link';
import { Users, ChevronRight } from 'lucide-react';

const ProjectCard = ({ project }) => {
  return (
    <Link href={`/project/${project._id}`} className="block">
      <div className="glass-panel p-6 rounded-xl hover:scale-[1.02] transition-transform duration-200 cursor-pointer h-full flex flex-col justify-between group">
        <div>
          <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-indigo-400 transition-colors">
            {project.name}
          </h3>
          <div className="flex items-center text-slate-400 text-sm mt-4">
            <Users className="w-4 h-4 mr-2" />
            <span>{project.members?.length || 0} Member{(project.members?.length !== 1) ? 's' : ''}</span>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <div className="flex items-center text-indigo-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            View Project <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;
