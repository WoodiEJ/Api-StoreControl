import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

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

export async function rejeitarSolicitacao(req: Request, res: Response) {
    try {
        const id = Number(req.params.id)
        const solicitacao = await prisma.request.findUnique({where: {id}})

        if (!solicitacao) {
            return res.status(404).json({
                success: false,
                mensagem: "Nenhuma solicitação encontrada."
            })
        }

        await prisma.request.update({
            where: {id: id},
            data: {
                status: "rejected"
            }
        })

        return res.status(200).json({
            success: true,
            mensagem: "A solicitação foi rejeitado com sucesso."
        })
    } catch (erro) {
        console.error("Erro interno: ", erro)
        return res.status(500).json({
            success: false,
            mensagem: "Erro ao rejeitar a solicitação."
        })
    }
}

export async function aceitarSolicitacao(req: Request, res: Response) {
     try {
        const id = Number(req.params.id)
        const solicitacao = await prisma.request.findUnique({where: {id}})

        if (!solicitacao) {
            return res.status(404).json({
                success: false,
                mensagem: "Nenhuma solicitação encontrada."
            })
        }

        await prisma.request.update({
            where: {id: id},
            data: {
                status: "approved"
            }
        })

        return res.status(200).json({
            success: true,
            mensagem: "A solicitação foi aprovado com sucesso."
        })
    } catch (erro) {
        console.error("Erro interno: ", erro)
        return res.status(500).json({
            success: false,
            mensagem: "Erro ao aprovar a solicitação."
        })
    }
}

export async function deletarSolicitacao(req: Request, res: Response) {
    try {
        const id = Number(req.params.id)
        const solicitacao = await prisma.request.findUnique({where: {id}})

        if (!solicitacao) {
            return res.status(404).json({
                success: false,
                mensagem: "Nenhuma solicitação encontrada."
            })
        }

        await prisma.request.delete({where: {id}})
        return res.status(200).json({
            success: true,
            mensagem: "Solicitação deletado com sucesso."
        })
    } catch (erro) {
        console.error("Erro interno: ", erro)
        return res.status(500).json({
            success: false,
            mensagem: "Erro ao aprovar a solicitação."
        })
    }
}