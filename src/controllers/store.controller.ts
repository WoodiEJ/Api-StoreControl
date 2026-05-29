import { Request, Response } from "express";
import * as z from 'zod'
import { StatusStore } from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const schema = z.object({
    user_id: z.number(),
    cnpj: z.string().min(14),
    name: z.string().min(6),
    category: z.string(),
    status: z.nativeEnum(StatusStore),
    country: z.string(),
    state: z.string(),
    city: z.string()
}).required()

const schemaOptional = z.object({
    user_id: z.number(),
    cnpj: z.string(),
    name: z.string(),
    category: z.string(),
    status: z.nativeEnum(StatusStore),
    country: z.string(),
    state: z.string(),
    city: z.string()
}).partial()

export async function listarLojas(req: Request, res: Response) {
    try {
        const lojas = await prisma.store.findMany()

        if (lojas.length === 0) {
            return res.status(404).json({
                success: false,
                mensagem: "Nenhuma loja foi encontrado."
            })
        }

        return res.status(200).json({
            success: true,
            lojas
        })
    } catch (erro) {
        console.error("Erro interno: ", erro)
        return res.status(500).json({
            success: false,
            mensagem: "Erro ao listar as lojas."
        })
    }
}

export async function procurarLoja(req: Request, res: Response) {
    try {
        const id = Number(req.params.id)
        const loja = await prisma.store.findUnique({where: {id}})

        if (!loja) {
            return res.status(404).json({
                success: false,
                mensagem: "Loja não encontrada."
            })
        }

        return res.status(200).json({
            success: true,
            loja
        })
    } catch (erro) {
        console.error("Erro interno: ", erro)
        return res.status(500).json({
            success: false,
            mensagem: "Erro ao procurar a loja."
        })
    }
}

export async function criarLoja(req: Request, res: Response) {
    try {
        const result = schema.safeParse(req.body)

        if (!result.success) {
            return res.status(400).json({
                success: false,
                mensagem: "Valide os campos."
            })
        }

        const {user_id, cnpj, name, category, status, country, state, city} = result.data
        const lojaExiste = await prisma.store.findFirst({
            where: {
                cnpj: result.data.cnpj
            }
        })

        if (lojaExiste) {
            return res.status(400).json({
                success: false,
                mensagem: "Essa loja já existe"
            })
        }

        await prisma.store.create({
            data: {
                user_id,
                cnpj,
                name,
                category,
                status: "inactive",
                country,
                state,
                city
            }
        })

        const usuario = await prisma.user.findUnique({where: {id: user_id}})

        if (!usuario) {
            return res.status(404).json({
                success: false,
                mensagem: "Usuario não encontrado."
            })
        }        

        await prisma.request.create({
            data: {
                status: "pending",
                name,
                email: usuario.email,
                cnpj,
                category: category,
                country: country,
                state: state,
                city: city
            }
        })

        return res.status(200).json({
            success: true,
            mensagem: "Loja criada com sucesso"
        })
    } catch (erro) {
        console.error("Erro interno: ", erro)
        return res.status(500).json({
            success: false,
            mensagem: "Erro ao criar a loja."
        })
    }
}

export async function atualizarLoja(req: Request, res: Response) {
    try {
        const id = Number(req.params.id)
        const loja = await prisma.store.findUnique({where: {id}})

        if (!loja) {
            return res.status(404).json({
                success: false,
                mensagem: "Loja não encontrada."
            })
        }

        const result = schemaOptional.safeParse(req.body)

        if (!result.success) {
            return res.status(400).json({
                success: false,
                mensagem: "Valide os campos."
            })
        }

        await prisma.store.update({
            where: {id},
            data: result.data
        })

        return res.status(200).json({
            success: true, 
            mensagem: "Loja atualizado com sucesso."
        })
    } catch (erro) {
        console.error("Erro interno: ", erro)
        return res.status(500).json({
            success: false,
            mensagem: "Erro ao atualizar a loja."
        })
    }
}

export async function deletarLoja(req: Request, res: Response) {
    try {
        const id = Number(req.params.id)
        const loja = prisma.store.findUnique({where: {id}})

        if (!loja) {
            return res.status(404).json({
                success: false,
                mensagem: "A loja não existe."
            })
        }

        await prisma.product.deleteMany({
            where: {
                store_id: id
            }
        })
        await prisma.store.delete({where: {id}})

        return res.status(200).json({
            success: true,
            mensagem: "Loja deletado com sucesso."
        })
    } catch (erro) {
        console.error("Erro interno: ", erro)
        return res.status(500).json({
            success: false,
            mensagem: "Erro ao deletar a loja."
        })
    }
}