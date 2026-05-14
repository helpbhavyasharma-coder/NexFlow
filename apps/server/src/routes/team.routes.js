import { Router } from 'express';
import { createTeam, deleteTeam, joinTeam, listTeams, updateTeam } from '../controllers/team.controller.js';
import { auth } from '../middleware/auth.js';
import { minRole, requireTeamRole } from '../middleware/permissions.js';
import { teamSchema, validate } from '../validations/schemas.js';

export const teamRoutes = Router();

teamRoutes.use(auth);
teamRoutes.get('/', listTeams);
teamRoutes.post('/', validate(teamSchema), createTeam);
teamRoutes.post('/join', joinTeam);
teamRoutes.patch('/:teamId', requireTeamRole, minRole('ADMIN'), validate(teamSchema), updateTeam);
teamRoutes.delete('/:teamId', requireTeamRole, minRole('OWNER'), deleteTeam);
