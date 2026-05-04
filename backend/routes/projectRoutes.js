const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  addMember,
  getMemberTasks,
  removeMemberWithValidation,
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { projectAdmin } = require('../middleware/roleMiddleware');

router.route('/')
  .post(protect, createProject)
  .get(protect, getProjects);

router.route('/:projectId/members/add')
  .put(protect, projectAdmin, addMember);

// New Routes for forced reassignment flow
router.route('/:projectId/member-tasks/:userId')
  .get(protect, projectAdmin, getMemberTasks);

router.route('/:projectId/remove-member/:userId')
  .delete(protect, projectAdmin, removeMemberWithValidation);

module.exports = router;
