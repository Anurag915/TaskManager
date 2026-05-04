const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      res.status(400);
      throw new Error('Please add a project name');
    }

    let project = await Project.create({
      name,
      admin: req.user.id,
      members: [req.user.id],
    });

    // Add project to user's projects array
    await User.findByIdAndUpdate(req.user.id, {
      $push: { projects: project._id }
    });

    project = await project.populate('members', 'name email');

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ members: req.user.id }).populate('members', 'name email');
    res.status(200).json(projects);
  } catch (error) {
    next(error);
  }
};

// @desc    Add member to project
// @route   PUT /api/projects/:projectId/members/add
// @access  Private/Admin
const addMember = async (req, res, next) => {
  try {
    const { memberId } = req.body;
    const project = req.project; // From projectAdmin middleware

    if (!memberId) {
      res.status(400);
      throw new Error('Please provide a user ID to add');
    }

    if (project.members.includes(memberId)) {
      res.status(400);
      throw new Error('User is already a member of this project');
    }

    // Verify user exists
    const user = await User.findById(memberId);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    project.members.push(memberId);
    await project.save();

    user.projects.push(project._id);
    await user.save();

    res.status(200).json(project);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks assigned to a specific member in a project
// @route   GET /api/projects/:projectId/member-tasks/:userId
// @access  Private/Admin
const getMemberTasks = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const project = req.project; // From projectAdmin middleware

    const tasks = await Task.find({ project: project._id, assignedTo: userId });
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member with validation (no assigned tasks allowed)
// @route   DELETE /api/projects/:projectId/remove-member/:userId
// @access  Private/Admin
const removeMemberWithValidation = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const project = req.project; // From projectAdmin middleware

    // Prevent admin from removing themselves
    if (project.admin.toString() === userId) {
      res.status(400);
      throw new Error('Cannot remove the project admin. Reassign admin role first.');
    }

    // Check if user is a member
    if (!project.members.includes(userId)) {
      res.status(404);
      throw new Error('User is not a member of this project');
    }

    // Check for assigned tasks
    const taskCount = await Task.countDocuments({ project: project._id, assignedTo: userId });

    if (taskCount > 0) {
      res.status(400);
      throw new Error(`User has ${taskCount} assigned tasks. Reassign tasks before removal.`);
    }

    // Proceed with removal
    project.members = project.members.filter(id => id.toString() !== userId);
    await project.save();

    await User.findByIdAndUpdate(userId, {
      $pull: { projects: project._id }
    });

    res.status(200).json({ message: 'Member removed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getProjects,
  addMember,
  getMemberTasks,
  removeMemberWithValidation,
};
