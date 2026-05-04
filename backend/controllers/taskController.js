const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Create a new task
// @route   POST /api/tasks/:projectId
// @access  Private/Admin
const createTask = async (req, res, next) => {
  try {
    const { title, description, dueDate, priority, status, assignedTo } = req.body;
    const project = req.project; // From projectAdmin middleware

    if (!title || !dueDate || !assignedTo) {
      res.status(400);
      throw new Error('Please provide title, dueDate, and assignedTo');
    }

    // Ensure assignedTo user belongs to the project
    if (!project.members.includes(assignedTo)) {
      res.status(400);
      throw new Error('Assigned user must be a member of the project');
    }

    const task = await Task.create({
      title,
      description,
      dueDate,
      priority,
      status,
      project: project._id,
      assignedTo,
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Get tasks by project (RBAC)
// @route   GET /api/tasks/:projectId
// @access  Private/Member
const getTasks = async (req, res, next) => {
  try {
    const project = req.project; // From projectMember middleware
    const isAdmin = project.admin.toString() === req.user.id;

    // RBAC: Admin sees all, Member sees only assigned
    let query = { project: project._id };
    if (!isAdmin) {
      query.assignedTo = req.user.id;
    }

    const tasks = await Task.find(query).populate('assignedTo', 'name email');

    // Add dynamically calculated isOverdue flag
    const currentDate = new Date();
    
    const tasksWithOverdue = tasks.map((task) => {
      const taskObj = task.toObject();
      taskObj.isOverdue = task.dueDate < currentDate && task.status !== 'Done';
      return taskObj;
    });

    res.status(200).json(tasksWithOverdue);
  } catch (error) {
    next(error);
  }
};

// @desc    Get only tasks assigned to logged-in user (Bonus)
// @route   GET /api/tasks/my
// @access  Private
const getMyTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user.id }).populate('project', 'name');
    
    const currentDate = new Date();
    const tasksWithOverdue = tasks.map((task) => {
      const taskObj = task.toObject();
      taskObj.isOverdue = task.dueDate < currentDate && task.status !== 'Done';
      return taskObj;
    });

    res.status(200).json(tasksWithOverdue);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a task (RBAC)
// @route   PUT /api/tasks/:taskId
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    const task = req.task; // From taskOwnerOrAdmin middleware
    const project = req.project; // From taskOwnerOrAdmin middleware
    const isAdmin = project.admin.toString() === req.user.id;

    const { title, description, dueDate, priority, status, assignedTo } = req.body;

    // Members can ONLY update status. Admin can update everything.
    if (!isAdmin) {
      // If member, only allow status update
      if (title || description || dueDate || priority || assignedTo) {
        res.status(403);
        throw new Error('Members can only update task status');
      }
      task.status = status || task.status;
    } else {
      // Admin update logic
      if (assignedTo && !project.members.includes(assignedTo)) {
        res.status(400);
        throw new Error('Assigned user must be a member of the project');
      }

      task.title = title || task.title;
      task.description = description || task.description;
      task.dueDate = dueDate || task.dueDate;
      task.priority = priority || task.priority;
      task.status = status || task.status;
      task.assignedTo = assignedTo || task.assignedTo;
    }

    await task.save();
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:taskId
// @access  Private/Admin
const deleteTask = async (req, res, next) => {
  try {
    const task = req.task; // From taskOwnerOrAdmin middleware
    const project = req.project;
    const isAdmin = project.admin.toString() === req.user.id;

    if (!isAdmin) {
      res.status(403);
      throw new Error('Only admins can delete tasks');
    }

    await task.deleteOne();
    res.status(200).json({ id: req.params.taskId });
  } catch (error) {
    next(error);
  }
};

// @desc    Reassign all tasks from one user to another in a project
// @route   PUT /api/tasks/reassign
// @access  Private/Admin
const reassignTasks = async (req, res, next) => {
  try {
    const { projectId, fromUserId, toUserId } = req.body;

    if (!projectId || !fromUserId || !toUserId) {
      res.status(400);
      throw new Error('Please provide projectId, fromUserId, and toUserId');
    }

    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    // Admin check
    if (project.admin.toString() !== req.user.id) {
      res.status(403);
      throw new Error('Only project admin can reassign tasks');
    }

    // Validate users are in project
    if (!project.members.includes(fromUserId) || !project.members.includes(toUserId)) {
      res.status(400);
      throw new Error('Both users must be members of the project');
    }

    // Reassign
    const result = await Task.updateMany(
      { project: projectId, assignedTo: fromUserId },
      { assignedTo: toUserId }
    );

    res.status(200).json({
      message: `Successfully reassigned ${result.modifiedCount} tasks`,
      count: result.modifiedCount
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  getMyTasks,
  updateTask,
  deleteTask,
  reassignTasks,
};
