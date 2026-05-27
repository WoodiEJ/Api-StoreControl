import { Request, Response } from "express";
import * as z from 'zod'
import { StatusRequest } from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const schema = z.object({
    status: z.nativeEnum(StatusRequest),
    name: z.string(),
    email: z.string().email(),
    cnpj: z.string(),
    category: z.string(),
    country: z.string(),
    state: z.string(),
    city: z.string()
}).required()

const schemaOptional = z.object({
    status: z.nativeEnum(StatusRequest),
    name: z.string(),
    email: z.string().email(),
    cnpj: z.string(),
    category: z.string(),
    country: z.string(),
    state: z.string(),
    city: z.string()
}).partial()

export async function listarSolicitacoes(req: Request, res: Response) {
    try {
        const solicitacoes = await prisma.request.findMany()

        if (solicitacoes.length === 0) {
            return res.status(404).json({
                success: false,
                mensagem: "Nenhuma solicitação encontrada."
            })
        }

        return res.status(200).json({
            success: true,
            solicitacoes
        })
    } catch (erro) {
        console.error("Erro interno: ", erro)
        return res.status(500).json({
            success: false,
            mensagem: "Erro ao procurar as solicitações"
        })
    }
}

export async function procurarSolicitacao(req: Request, res: Response) {
    try {
        const id = Number(req.params.id)
        const solicitacao = await prisma.request.findUnique({where: {id}})

        if (!solicitacao) {
            return res.status(404).json({
                success: false,
                mensagem: "Nenhum solicitação encontrada com esse dado."
            })
        }

        return res.status(200).json({
            success: true,
            solicitacao
        })
    } catch (erro) {
        console.error("Erro interno: ", erro)
        return res.status(500).json({
            success: false,
            mensagem: "Erro ao procurar a solicitação"
        })
    }
}