import { Request, Response } from "express";
import * as z from "zod";
import { Role } from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";

const schema = z
  .object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
    status: z.boolean(),
  })
  .required();

const schemaOptional = z
  .object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.nativeEnum(Role),
    status: z.boolean(),
  })
  .partial();

export async function listarUsuarios(req: Request, res: Response) {
  try {
    const usuarios = await prisma.user.findMany({
      select: {
        name: true,
        email: true,
        role: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (usuarios.length === 0) {
      return res.status(404).json({
        success: false,
        mensagem: "Nenhum usuario encontrado.",
      });
    }

    return res.status(200).json({
      success: true,
      usuarios,
    });
  } catch (erro) {
    console.error("Erro interno: ", erro);
    return res.status(500).json({
      success: false,
      mensagem: "Erro ao listar os usuarios.",
    });
  }
}

export async function procurarUsuario(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const usuario = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        created_at: true,
      },
    });

    if (!usuario) {
      return res.status(404).json({
        success: true,
        mensagem: "Usuario não encontrado.",
      });
    }

    return res.status(200).json({
      success: true,
      usuario,
    });
  } catch (erro) {
    console.error("Erro interno: ", erro);
    return res.status(500).json({
      success: true,
      mensagem: "Erro ao procurar o usuario.",
    });
  }
}

export async function createAdminUser(req: Request, res: Response) {
  try {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        mensagem: "Valide os campos para criar o usuario.",
      });
    }

    const { name, email, password, status } = result.data;
    const usuarioExiste = await prisma.user.findFirst({
      where: { email: result.data.email },
    });

    if (usuarioExiste) {
      return res.status(400).json({
        success: false,
        mensagem: "Admin já existe.",
      });
    }

    const chaveCriptografada = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: chaveCriptografada,
        role: "admin",
        status,
      },
    });

    return res.status(201).json({
      success: true,
      mensagem: "Usuario criado com sucesso.",
    });
  } catch (erro) {
    console.error("Erro interno: ", erro);
    return res.status(500).json({
      success: false,
      mensagem: "Erro ao criar usuario.",
    });
  }
}

export async function createUserStore(req: Request, res: Response) {
  try {
    const id = Number(req.params.id)
    const request = await prisma.request.findFirst({where: {id}})

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Nenhuma solicitação encontrada."
      })
    }

    const ifUserExist = await prisma.user.findUnique({
      where: {
        email: request.email
      }
    })

    if (ifUserExist) {
      return res.status(400).json({
        success: false,
        message: "Usuário já existe."
      })
    }

    const passwordCript = await bcrypt.hash("novalojacadastro123", 10)

    await prisma.user.create({
      data: {
        name: request.name,
        email: request.email,
        password: passwordCript,
        role: "store",
        store: {
          create: {
            cnpj: request.cnpj,
            name: request.name,
            category: request.category,
            status: "approved",
            country: request.country,
            state: request.state,
            city: request.city
          }
        }
      },
    })

    return res.status(201).json({
      success: true,
      message: "Usuário e loja criado com sucesso."
    })
  } catch (erro) {
    console.error("Erro interno: ", erro)
    return res.status(500).json({
      success: false, 
      mensagem: "Erro ao criar o user store"
    })
  }
}

export async function atualizarUsuario(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const result = schemaOptional.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        mensagem: "Valide os campos para atualizar o usuario.",
      });
    }

    const usuarioExiste = await prisma.user.findUnique({ where: { id } });

    if (!usuarioExiste) {
      return res.status(404).json({
        success: false,
        mensagem: "Usuario não existe.",
      });
    }

    const data = { ...result.data };

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    await prisma.user.update({
      where: { id },
      data: data,
    });

    return res.status(200).json({
      success: true,
      mensagem: "Usuario atualizado com sucesso.",
    });
  } catch (erro) {
    console.error("Erro interno: ", erro);
    return res.status(500).json({
      success: false,
      mensagem: "Erro ao atualizar usuario",
    });
  }
}

export async function deletarUsuario(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const usuarioExiste = await prisma.user.findUnique({ where: { id } });

    if (!usuarioExiste) {
      return res.status(404).json({
        mensagem: "Usuario não existe.",
      });
    }

    const deletedStore = prisma.store.deleteMany({
      where: {userId: id}
    })
    const deletedProducts = prisma.product.deleteMany({
      where: {
        store: {
          userId: id
        }
      }
    })
    const deletedUser = prisma.user.delete({where: {id}})

    await prisma.$transaction([deletedProducts, deletedStore, deletedUser])

    return res.status(200).json({
      success: true,
      mensagem: "Usuario deletado com sucesso.",
    });
  } catch (erro) {
    console.error("Erro interno: ", erro);
    return res.status(500).json({
      success: false,
      mensagem: "Erro ao deletar usuario.",
    });
  }
}

export async function listarAdmins(req: Request, res: Response) {
  try {
    const admins = await prisma.user.findMany({
      where: {
        OR: [{ role: "admin" }, { role: "super_admin" }],
      },
    });

    if (!admins) {
      return res.status(404).json({
        success: false,
        mensagem: "Nenhum admin encontrado.",
      });
    }

    return res.status(200).json({
      success: true,
      admins,
    });
  } catch (erro) {
    console.error("Erro interno: ", erro);
    return res.status(500).json({
      success: false,
      mensagem: "Erro ao listar os Admins.",
    });
  }
}
