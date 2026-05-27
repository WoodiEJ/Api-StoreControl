import { Request, Response } from "express";
import * as z from 'zod'
import { Role } from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";

const schema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.nativeEnum(Role),
    status: z.boolean()
}).required()

const schemaOptional = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.nativeEnum(Role),
    status: z.boolean()
}).partial()

export async function listarUsuarios(req: Request, res: Response) {
    try {
        const usuarios = await prisma.user.findMany({
            select: {
                name: true,
                email: true,
                role: true,
                status: true,
                created_at: true,
                updated_at: true
            }
        })

        if (usuarios.length === 0) {
            return res.status(404).json({
                success: false,
                mensagem: "Nenhum usuario encontrado."
            })
        }

        return res.status(200).json({
            success: true,
            usuarios
        })
    } catch (erro) {
        console.error("Erro interno: ", erro)
        return res.status(500).json({
            success: false,
            mensagem: "Erro ao listar os usuarios."
        })
    }
}

export async function procurarUsuario(req: Request, res: Response) {
    try {
        const id = Number(req.params.id)
        const usuario = await prisma.user.findUnique({
            where: {id},
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                created_at: true,
            }
        })

        if (!usuario) {
            return res.status(404).json({
                success: true,
                mensagem: "Usuario não encontrado."
            })
        }

        return res.status(200).json({
            success: true,
            usuario
        })
    } catch (erro) {
        console.error("Erro interno: ", erro)
        return res.status(500).json({
            success: true,
            mensagem: "Erro ao procurar o usuario."
        })
    }
}

export async function criarUsuario(req: Request, res: Response) {
    try {
        const result = schema.safeParse(req.body)

        if (!result.success) {
            return res.status(400).json({
                success: false,
                mensagem: "Valide os campos para criar o usuario."
            })
        }

        const {name, email, password, role, status} = result.data
        const usuarioExiste = await prisma.user.findFirst({where: {email: result.data.email}})

        if (usuarioExiste) {
            return res.status(400).json({
                success: false,
                mensagem: "Usuario já existe."
            })
        }

        const chaveCriptografada = await bcrypt.hash(password, 10)

        await prisma.user.create({
            data: {
                name,
                email,
                password: chaveCriptografada,
                role, 
                status
            }
        })

        return res.status(201).json({
            success: true,
            mensagem: "Usuario criado com sucesso."
        })
    } catch (erro) {
        console.error("Erro interno: ", erro)
        return res.status(500).json({
            success: false,
            mensagem: "Erro ao criar usuario."
        })
    }
}

export async function atualizarUsuario(req: Request, res: Response) {
    try {
        const id = Number(req.params.id)
        const result = schemaOptional.safeParse(req.body)
        
        if (!result.success) {
            return res.status(400).json({
                success: false,
                mensagem: "Valide os campos para atualizar o usuario."
            })
        }

        const usuarioExiste = await prisma.user.findUnique({where: {id}})

        if (!usuarioExiste) {
            return res.status(404).json({
                success: false,
                mensagem: "Usuario não existe."
            })
        }

        const data = {...result.data}

        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10) 
        }

        await prisma.user.update({
            where: {id},
            data: data
        })

        return res.status(200).json({
            success: true,
            mensagem: "Usuario atualizado com sucesso."
        })
    } catch (erro) {
        console.error("Erro interno: ", erro)
        return res.status(500).json({
            success: false,
            mensagem: "Erro ao atualizar usuario"
        })
    }
}

export async function deletarUsuario(req: Request, res: Response) {
    try {
        const id = Number(req.params.id)
        const usuarioExiste = await prisma.user.findUnique({where: {id}})

        if (!usuarioExiste) {
            return res.status(404).json({
                mensagem: "Usuario não existe."
            })
        }

        await prisma.product.deleteMany({
            where: {
                store: {
                    user_id: id
                }
            }
        })
        await prisma.store.deleteMany({
            where: {
                user_id: id
            }
        })
        await prisma.user.delete({where: {id}})
        return res.status(200).json({
            success: true, 
            mensagem: "Usuario deletado com sucesso."
        })
    } catch (erro) {
        console.error("Erro interno: ", erro)
        return res.status(500).json({
            success: false,
            mensagem: "Erro ao deletar usuario."
        })
    }
}

export async function listarAdmins(req: Request, res: Response) {
    try {
        const admins = prisma.user.findMany({
            where: {
                OR: [
                    {role: "admin"},
                    {role: "super_admin"}
                ]
            }
        })

        if (!admins) {
            return res.status(404).json({
                success: false,
                mensagem: "Nenhum admin encontrado."
            })
        }

        return res.status(200).json({
            success: true,
            admins
        })
    } catch (erro) {
        console.error("Erro interno: ", erro)
        return res.status(500).json({
            success: false,
            mensagem: "Erro ao listar os Admins."
        })
    }
}