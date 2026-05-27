import { Request, Response } from "express";
import z, { email } from "zod";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'

const logar = z.object({
    email: z.string().email(),
    password: z.string().min(6, "A senha deve conter no minimo 6 caracteres")
})

export async function login(req: Request, res: Response) {
    try {
        const result = logar.safeParse(req.body)

        if (!result.success) {
            return res.status(400).json({
                success: false,
                mensagem: "Valide os campos para logar."
            })
        }

        const {email, password} = result.data

        const usuario = await prisma.user.findUnique({where:{email}})

        if (!usuario) {
            return res.status(404).json({
                success: false,
                mensagem: "Nenhum usuário encontrado com essas credenciais."
            })
        }

        const senha = await bcrypt.compare(password, usuario.password)
        
        if (!senha) {
            return res.status(400).json({
                success: false,
                mensagem: "Credenciais inválidos."
            })
        }

        const token = jwt.sign(
            {id: usuario.id, role: usuario.role},
            process.env.JWT_SECRET!,
            {expiresIn: '3h'}
        )

        return res.status(200).json({
            success: true,
            mensagem: "Logado com sucesso.",
            token
        })
    } catch (erro) {
        console.error("Erro interno: ", erro)
        return res.status(500).json({
            success: false,
            mensagem: "Erro ao logar."
        })
    }
}