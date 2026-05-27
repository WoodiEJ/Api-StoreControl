import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken'

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization

    if (!header) {
        return res.status(401).json({
            success: false,
            mensagem: "Nenhum token encontrado."
        })
    }

    const token = header.slice(7)

    if (!token) {
        return res.status(401).json({
            success: false,
            mensagem: "Nenhum token encontrado."
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as unknown as {id: number; role: string;}
        req.userId = decoded.id
        req.userRole = decoded.role
        next()
    } catch (erro) { 
        console.error("Erro interno: ", erro)
        return res.status(401).json({
            success: false,
            mensagem: "Token inválido ou expirado"
        })
    }
}