const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getMyTasks,
  updateTask,
  deleteTask,
  reassignTasks,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { 
  projectAdmin, 
  projectMember, 
  taskOwnerOrAdmin 
} = require('../middleware/roleMiddleware');

// Bonus API
router.get('/my', protect, getMyTasks);

// Reassignment API
router.put('/reassign', protect, reassignTasks);

router.route('/:projectId')
  .post(protect, projectAdmin, createTask)
  .get(protect, projectMember, getTasks);

router.route('/:taskId')
  .put(protect, taskOwnerOrAdmin, updateTask)
  .delete(protect, taskOwnerOrAdmin, deleteTask);

module.exports = router;
