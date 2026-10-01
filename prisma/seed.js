const { PrismaClient } = require('@prisma/client');
const { hashSenha } = require('../src/lib/auth');
const prisma = new PrismaClient();

// Helper para gerar datas relativas a hoje
function diasAPartirDeHoje(dias) {
  const data = new Date();
  data.setDate(data.getDate() + dias);
  return data;
}

async function main() {
  console.log('Limpando dados existentes...');
  await prisma.movimentacao.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.produto.deleteMany();
  await prisma.usuario.deleteMany();

  console.log('Criando usuário admin...');
  await prisma.usuario.create({
    data: {
      email: 'admin@solarshelf.local',
      nome: 'Administrador',
      senhaHash: hashSenha('admin123'),
      perfil: 'ADMIN',
    },
  });

  console.log('Criando produtos...');
  const cocaZero600 = await prisma.produto.create({
    data: {
      nome: 'Coca-Cola Zero 600ml',
      descricao: 'Refrigerante Coca-Cola Zero Açúcar - garrafa PET 600ml',
    },
  });

  const cocaOriginal2L = await prisma.produto.create({
    data: {
      nome: 'Coca-Cola Original 2L',
      descricao: 'Refrigerante Coca-Cola sabor original - garrafa PET 2 litros',
    },
  });

  const cocaLata350 = await prisma.produto.create({
    data: {
      nome: 'Coca-Cola Original Lata 350ml',
      descricao: 'Refrigerante Coca-Cola sabor original - lata 350ml',
    },
  });

  const cocaSemAcucar1L = await prisma.produto.create({
    data: {
      nome: 'Coca-Cola Sem Açúcar 1L',
      descricao: 'Refrigerante Coca-Cola Sem Açúcar - garrafa PET 1 litro',
    },
  });

  console.log('Criando tags (pallets)...');

  const tags = [
    // --- Coca-Cola Zero 600ml: 3 pallets ativos + 1 com saída registrada ---
    {
      id: 'E2801160600002052A5D0001',
      produtoId: cocaZero600.id,
      lote: '24051201',
      quantidade: 240,
      dataFabricacao: diasAPartirDeHoje(-60),
      validade: diasAPartirDeHoje(120),
      dataEntrada: diasAPartirDeHoje(-58),
      dataSaida: null,
    },
    {
      id: 'E2801160600002052A5D0002',
      produtoId: cocaZero600.id,
      lote: '24052003',
      quantidade: 240,
      dataFabricacao: diasAPartirDeHoje(-45),
      validade: diasAPartirDeHoje(135),
      dataEntrada: diasAPartirDeHoje(-43),
      dataSaida: null,
    },
    {
      id: 'E2801160600002052A5D0003',
      produtoId: cocaZero600.id,
      lote: '24060110',
      quantidade: 180,
      dataFabricacao: diasAPartirDeHoje(-20),
      validade: diasAPartirDeHoje(160),
      dataEntrada: diasAPartirDeHoje(-18),
      dataSaida: null,
    },
    {
      id: 'E2801160600002052A5D0004',
      produtoId: cocaZero600.id,
      lote: '24040507',
      quantidade: 240,
      dataFabricacao: diasAPartirDeHoje(-90),
      validade: diasAPartirDeHoje(90),
      dataEntrada: diasAPartirDeHoje(-88),
      dataSaida: diasAPartirDeHoje(-5), // já saiu do estoque
    },

    // --- Coca-Cola Original 2L: 2 pallets ativos ---
    {
      id: 'E2801160600002052A5D0101',
      produtoId: cocaOriginal2L.id,
      lote: '24051502',
      quantidade: 108,
      dataFabricacao: diasAPartirDeHoje(-40),
      validade: diasAPartirDeHoje(140),
      dataEntrada: diasAPartirDeHoje(-38),
      dataSaida: null,
    },
    {
      id: 'E2801160600002052A5D0102',
      produtoId: cocaOriginal2L.id,
      lote: '24060809',
      quantidade: 108,
      dataFabricacao: diasAPartirDeHoje(-15),
      validade: diasAPartirDeHoje(165),
      dataEntrada: diasAPartirDeHoje(-13),
      dataSaida: null,
    },

    // --- Coca-Cola Lata 350ml: 3 pallets ativos, 1 vencendo em breve ---
    {
      id: 'E2801160600002052A5D0201',
      produtoId: cocaLata350.id,
      lote: '24030112',
      quantidade: 480,
      dataFabricacao: diasAPartirDeHoje(-150),
      validade: diasAPartirDeHoje(10), // vence em 10 dias
      dataEntrada: diasAPartirDeHoje(-148),
      dataSaida: null,
    },
    {
      id: 'E2801160600002052A5D0202',
      produtoId: cocaLata350.id,
      lote: '24052506',
      quantidade: 480,
      dataFabricacao: diasAPartirDeHoje(-35),
      validade: diasAPartirDeHoje(145),
      dataEntrada: diasAPartirDeHoje(-33),
      dataSaida: null,
    },
    {
      id: 'E2801160600002052A5D0203',
      produtoId: cocaLata350.id,
      lote: '24061004',
      quantidade: 480,
      dataFabricacao: diasAPartirDeHoje(-8),
      validade: diasAPartirDeHoje(172),
      dataEntrada: diasAPartirDeHoje(-6),
      dataSaida: null,
    },

    // --- Coca-Cola Sem Açúcar 1L: 1 pallet ativo + 1 com saída registrada ---
    {
      id: 'E2801160600002052A5D0301',
      produtoId: cocaSemAcucar1L.id,
      lote: '24052210',
      quantidade: 156,
      dataFabricacao: diasAPartirDeHoje(-30),
      validade: diasAPartirDeHoje(150),
      dataEntrada: diasAPartirDeHoje(-28),
      dataSaida: null,
    },
    {
      id: 'E2801160600002052A5D0302',
      produtoId: cocaSemAcucar1L.id,
      lote: '24041508',
      quantidade: 156,
      dataFabricacao: diasAPartirDeHoje(-70),
      validade: diasAPartirDeHoje(110),
      dataEntrada: diasAPartirDeHoje(-68),
      dataSaida: diasAPartirDeHoje(-2), // já saiu do estoque
    },
  ];

  for (const tag of tags) {
    const criada = await prisma.tag.create({ data: tag });
    await prisma.movimentacao.create({
      data: {
        tipo: 'ENTRADA',
        tagId: criada.id,
        produtoId: criada.produtoId,
        quantidade: criada.quantidade,
        data: criada.dataEntrada,
      },
    });
    if (criada.dataSaida) {
      await prisma.movimentacao.create({
        data: {
          tipo: 'SAIDA',
          tagId: criada.id,
          produtoId: criada.produtoId,
          quantidade: criada.quantidade,
          data: criada.dataSaida,
        },
      });
    }
  }

  console.log(`Seed concluído: ${tags.length} tags criadas para 4 produtos.`);
}

main()
  .catch((e) => {
    console.error('Erro ao rodar o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
