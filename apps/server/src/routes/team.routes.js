import { Router } from 'express';
import { createTeam, deleteTeam, joinTeam, leaveTeam, listTeams, removeMember, updateMemberRole, updateTeam } from '../controllers/team.controller.js';
import { auth } from '../middleware/auth.js';
import { minRole, requireTeamRole } from '../middleware/permissions.js';
import { memberRoleSchema, teamSchema, validate } from '../validations/schemas.js';

export const teamRoutes = Router();

teamRoutes.use(auth);
teamRoutes.get('/', listTeams);
teamRoutes.post('/', validate(teamSchema), createTeam);
teamRoutes.post('/join', joinTeam);
teamRoutes.patch('/:teamId', requireTeamRole, minRole('ADMIN'), validate(teamSchema), updateTeam);
teamRoutes.post('/:teamId/leave', requireTeamRole, leaveTeam);
teamRoutes.patch('/:teamId/members/:memberId/role', requireTeamRole, minRole('OWNER'), validate(memberRoleSchema), updateMemberRole);
teamRoutes.delete('/:teamId/members/:memberId', requireTeamRole, minRole('OWNER'), removeMember);
teamRoutes.delete('/:teamId', requireTeamRole, minRole('OWNER'), deleteTeam);
