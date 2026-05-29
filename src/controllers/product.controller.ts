import { Request, Response } from "express";
import * as z from "zod";
import { prisma } from "../../lib/prisma";
import { StatusProduct } from "../../generated/prisma/enums";

const schema = z
  .object({
    store_id: z.number(),
    name: z.string().min(3),
    category: z.string().min(3),
    cost_price: z.number().positive(),
    sale_price: z.number().positive(),
    status: z.nativeEnum(StatusProduct),
    quantity: z.number().positive(),
  })
  .required();

const schemaOptional = z
  .object({
    store_id: z.number(),
    name: z.string().min(3),
    category: z.string().min(3),
    cost_price: z.number().positive(),
    sale_price: z.number().positive(),
    status: z.nativeEnum(StatusProduct),
    quantity: z.number().positive(),
  })
  .partial();

export async function listarProdutos(req: Request, res: Response) {
  try {
    const produtos = await prisma.product.findMany();

    if (produtos.length === 0) {
      return res.status(404).json({
        success: false,
        mensagem: "Nenhum produto encontrado.",
      });
    }

    return res.status(200).json({
      success: true,
      produtos,
    });
  } catch (erro) {
    console.error("Erro interno: ", erro);
    return res.status(500).json({
      success: false,
      mensagem: "Erro ao buscar os produtos.",
    });
  }
}

export async function procurarProduto(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    const produto = await prisma.product.findUnique({ where: { id } });

    if (!produto) {
      return res.status(404).json({
        success: false,
        mensagem: "Não existe nenhum produto com esses dados.",
      });
    }

    return res.status(200).json({
      success: true,
      produto,
    });
  } catch (erro) {
    console.error("Erro interno: ", erro);
    return res.status(500).json({
      success: false,
      mensagem: "Erro ao procurar o produto.",
    });
  }
}

export async function criarProduto(req: Request, res: Response) {
  try {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        mensagem: "Valide os campos para poder cadastrar o produto.",
      });
    }

    const {
      store_id,
      name,
      category,
      cost_price,
      sale_price,
      status,
      quantity,
    } = result.data;
    const produtoExiste = await prisma.product.findFirst({
      where: {
        name: name,
        category: category,
        cost_price: cost_price,
        sale_price: sale_price,
      },
    });

    if (produtoExiste) {
      return res.status(409).json({
        success: false,
        mensagem: "Esse produto já existe",
      });
    }

    await prisma.product.create({
      data: {
        store_id,
        name,
        category,
        cost_price,
        sale_price,
        status: "active",
        quantity,
      },
    });

    return res.status(201).json({
      success: true,
      mensagem: "Produto criado com sucesso.",
    });
  } catch (erro) {
    console.log("Erro interno: ", erro);
    return res.status(500).json({
      success: false,
      mensagem: "Erro ao criar o produto",
    });
  }
}

export async function atualizarProduto(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const result = schemaOptional.safeParse(req.body);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        mensagem: "Valide os campos para atualizar o produto.",
        erros: result.error.format(),
      });
    }

    const produtoExiste = await prisma.product.findUnique({ where: { id } });

    if (!produtoExiste) {
      return res.status(404).json({
        success: false,
        mensagem: "Nenhum produto encontrado.",
      });
    }

    await prisma.product.update({
      where: { id },
      data: result.data,
    });

    return res.status(200).json({
      success: true,
      mensagem: "Produto atualizado com sucesso.",
    });
  } catch (erro) {
    console.error("Erro ao atualizar produto: ", erro);
    return res.status(500).json({
      success: false,
      mensagem: "Erro interno ao atualizar o produto.",
    });
  }
}

export async function deletarProduto(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const produto = await prisma.product.findUnique({ where: { id } });

    if (!produto) {
      return res.status(404).json({
        success: false,
        mensagem: "Produto não encontrado.",
      });
    }

    await prisma.product.delete({ where: { id } });
    return res.status(200).json({
      success: true,
      mensagem: "Produto deletado com sucesso.",
    });
  } catch (erro) {
    console.log("Erro interno: ", erro);
    return res.status(500).json({
      success: false,
      mensagem: "Erro ao deletar produto",
    });
  }
}
