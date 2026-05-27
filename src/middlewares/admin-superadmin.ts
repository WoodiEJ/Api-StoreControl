import { NextFunction, Request, Response } from "express";

export async function adminQualquerLiberado(req: Request, res: Response, next: NextFunction) {
    if (req.userRole === "store") {
        return res.status(301).json({
            success: false,
            mensagem: "Acesso negado"
        })
    }
    next()
}