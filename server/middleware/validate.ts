import { type Request, type Response, type NextFunction } from "express";
import { type AnyZodObject } from "zod";

export function validateRequest(schema: { body?: AnyZodObject; query?: AnyZodObject; params?: AnyZodObject }) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query);
      }
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params);
      }
      next();
    } catch (error) {
      res.status(400).json({ message: "Invalid request", error });
    }
  };
}
