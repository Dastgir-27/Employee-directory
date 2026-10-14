import type { Request, Response } from "express";
import { employeeService } from "../services/employeeService";

export const employeeController = {
  async list(_req: Request, res: Response) {
    const result = await employeeService.list(res.locals.listQuery);
    res.status(200).json(result);
  },

  async create(req: Request, res: Response) {
    const employee = await employeeService.create(req.body);
    res.status(201).json({ message: "Employee created successfully", data: employee });
  },

  async update(req: Request, res: Response) {
    const employee = await employeeService.update(res.locals.id, req.body);
    res.status(200).json({ message: "Employee updated successfully", data: employee });
  },

  async remove(_req: Request, res: Response) {
    await employeeService.remove(res.locals.id);
    res.status(204).send();
  },
};
