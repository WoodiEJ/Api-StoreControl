import { NextFunction, Request, Response } from "express";

export async function superadminMiddleware(req: Request, res: Response, next: NextFunction) {
    if (req.userRole !== "super_admin") {
        return res.status(301).json({
            success: false,
            mensagem: "Acesso negado."
        })
    }
    next()
}