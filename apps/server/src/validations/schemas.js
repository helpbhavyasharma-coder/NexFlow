import { z } from 'zod';

export const registerSchema = z.object({ username: z.string().min(2), email: z.string().email(), password: z.string().min(8) });
export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
export const teamSchema = z.object({ name: z.string().min(2), description: z.string().optional().nullable() });
export const taskSchema = z.object({ teamId: z.string(), title: z.string().min(2), description: z.string().optional().nullable(), priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(), deadline: z.string().datetime().optional().nullable(), assignedTo: z.string().optional().nullable() });
export const commentSchema = z.object({ content: z.string().min(1).max(2000) });

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) return res.status(422).json({ message: 'Validation failed', issues: result.error.flatten() });
    req.body = result.data;
    next();
  };
}
