const Project = require('../models/Project');
const Task = require('../models/Task');

const projectAdmin = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    // Check if the logged in user is the admin of the project
    if (project.admin.toString() !== req.user.id) {
      res.status(403);
      throw new Error('User is not authorized as an admin for this project');
    }

    // Pass the project to the next middleware/controller so we don't have to query it again
    req.project = project;
    next();
  } catch (error) {
    next(error);
  }
};

const projectMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    const isMember = project.members.includes(req.user.id);
    const isAdmin = project.admin.toString() === req.user.id;

    if (!isMember && !isAdmin) {
      res.status(403);
      throw new Error('User is not authorized as a member of this project');
    }

    req.project = project;
    next();
  } catch (error) {
    next(error);
  }
};

const taskOwnerOrAdmin = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId).populate('project');

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    const project = task.project;
    const isAdmin = project.admin.toString() === req.user.id;
    const isOwner = task.assignedTo.toString() === req.user.id;

    if (!isAdmin && !isOwner) {
      res.status(403);
      throw new Error('User is not authorized to manage this task');
    }

    req.task = task;
    req.project = project;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { projectAdmin, projectMember, taskOwnerOrAdmin };
