const prisma = require('../lib/prisma');
const { compararSenha, gerarToken } = require('../lib/auth');

async function login(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario || !usuario.ativo) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    if (!compararSenha(senha, usuario.senhaHash)) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = gerarToken({
      id: usuario.id,
      email: usuario.email,
      nome: usuario.nome,
      perfil: usuario.perfil,
    });

    res.json({
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        perfil: usuario.perfil,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao autenticar', detalhe: err.message });
  }
}

async function me(req, res) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuario.id },
      select: { id: true, email: true, nome: true, perfil: true, ativo: true },
    });
    if (!usuario) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }
    res.json(usuario);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuário', detalhe: err.message });
  }
}

module.exports = { login, me };
