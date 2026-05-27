import { login } from "@/controllers/login.controller";
import { atualizarProduto, criarProduto, deletarProduto, listarProdutos, procurarProduto } from "@/controllers/product.controller";
import { aceitarSolicitacao, deletarSolicitacao, listarSolicitacoes, procurarSolicitacao, rejeitarSolicitacao } from "@/controllers/request.controller";
import { atualizarLoja, criarLoja, deletarLoja, listarLojas, procurarLoja } from "@/controllers/store.controller";
import { atualizarUsuario, criarUsuario, deletarUsuario, listarAdmins, listarUsuarios, procurarUsuario } from "@/controllers/user.controller";
import { adminQualquerLiberado } from "@/middlewares/admin-superadmin";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { storeMiddleware } from "@/middlewares/store.middleware";
import { superadminMiddleware } from "@/middlewares/superadmin.middleware";
import { Router } from "express";

const router = Router()

//Rotas produtos
router.get('/produtos', authMiddleware, storeMiddleware, listarProdutos)
router.get('/produtos/:id', authMiddleware, storeMiddleware, procurarProduto)
router.post('/produtos/registrar', authMiddleware, storeMiddleware, criarProduto)
router.put('/produtos/:id', authMiddleware, storeMiddleware, atualizarProduto)
router.delete('/produtos/:id', authMiddleware, storeMiddleware, deletarProduto)


// Rotas lojas
router.get('/lojas', authMiddleware, adminQualquerLiberado, listarLojas)
router.get('lojas/:id', authMiddleware, adminQualquerLiberado, procurarLoja)
router.post('lojas/registrar', authMiddleware, storeMiddleware, criarLoja)
router.put('/lojas/atualizar', authMiddleware, superadminMiddleware, atualizarLoja)
router.delete('/lojas/deletar', authMiddleware, superadminMiddleware, deletarLoja)

// Rotas solicitações
router.get('/solicitacoes', authMiddleware, adminQualquerLiberado, listarSolicitacoes)
router.get('/solicitacoes/:id', authMiddleware, adminQualquerLiberado, procurarSolicitacao)
router.patch('/solicitacoes/:id', authMiddleware, adminQualquerLiberado, aceitarSolicitacao)
router.patch('/solicitacoes/:id', authMiddleware, adminQualquerLiberado, rejeitarSolicitacao)
router.delete('/solicitacoes/:id', authMiddleware, adminQualquerLiberado, deletarSolicitacao)

// Rotas usuarios
router.get('/usuarios', authMiddleware, superadminMiddleware, listarUsuarios)
router.get('/admins', authMiddleware, superadminMiddleware, listarAdmins)
router.get('/usuarios/:id', authMiddleware, superadminMiddleware, procurarUsuario)
router.post('/admins/criar', authMiddleware, superadminMiddleware, criarUsuario)
router.put('/usuarios/:id', authMiddleware, superadminMiddleware, atualizarUsuario)
router.delete('/usuarios/deletar', authMiddleware, superadminMiddleware, deletarUsuario)

// Login
router.post('/login', login)

export default router