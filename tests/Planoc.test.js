jest.mock('../models', () => ({
  Plano: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
}));

const { Plano } = require('../models');
const planoController = require('../controllers/Planoc');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Plano Controller - Testes Unitários', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -----------------------------------------------
  // listarPlanos
  // -----------------------------------------------
  describe('listarPlanos', () => {
    test('deve retornar lista de planos', async () => {
      const planosFake = [
        { id: 1, nome: 'Básico',   preco: 99.9,  duracao: '30 dias' },
        { id: 2, nome: 'Premium', preco: 199.9, duracao: '30 dias' },
      ];
      Plano.findAll.mockResolvedValue(planosFake);

      const req = {};
      const res = mockRes();

      await planoController.listarPlanos(req, res);

      expect(Plano.findAll).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(planosFake);
    });

    test('deve retornar 500 em caso de erro', async () => {
      Plano.findAll.mockRejectedValue(new Error('Falha no banco'));

      const req = {};
      const res = mockRes();

      await planoController.listarPlanos(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao buscar planos.' });
    });
  });

  // -----------------------------------------------
  // buscarPlano
  // -----------------------------------------------
  describe('buscarPlano', () => {
    test('deve retornar o plano quando encontrado', async () => {
      const planoFake = { id: 1, nome: 'Básico', preco: 99.9 };
      Plano.findByPk.mockResolvedValue(planoFake);

      const req = { params: { id: '1' } };
      const res = mockRes();

      await planoController.buscarPlano(req, res);

      expect(Plano.findByPk).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith(planoFake);
    });

    test('deve retornar 404 quando plano não existe', async () => {
      Plano.findByPk.mockResolvedValue(null);

      const req = { params: { id: '99' } };
      const res = mockRes();

      await planoController.buscarPlano(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Plano não encontrado.' });
    });

    test('deve retornar 500 em caso de erro no banco', async () => {
      Plano.findByPk.mockRejectedValue(new Error('Erro'));

      const req = { params: { id: '1' } };
      const res = mockRes();

      await planoController.buscarPlano(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // -----------------------------------------------
  // criarPlano
  // -----------------------------------------------
  describe('criarPlano', () => {
    test('deve criar plano e retornar 201', async () => {
      const body = { nome: 'Gold', preco: 149.9, duracao: '30 dias' };
      const planoFake = { id: 3, ...body };
      Plano.create.mockResolvedValue(planoFake);

      const req = { body };
      const res = mockRes();

      await planoController.criarPlano(req, res);

      expect(Plano.create).toHaveBeenCalledWith(body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(planoFake);
    });

    test('deve retornar 500 quando create falha', async () => {
      Plano.create.mockRejectedValue(new Error('Erro DB'));

      const req = { body: { nome: 'Gold' } };
      const res = mockRes();

      await planoController.criarPlano(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao criar plano.' });
    });
  });

  // -----------------------------------------------
  // atualizarPlano
  // -----------------------------------------------
  describe('atualizarPlano', () => {
    test('deve atualizar e retornar o plano', async () => {
      const planoFake = {
        id: 1,
        nome: 'Básico Plus',
        update: jest.fn().mockResolvedValue(true),
      };
      Plano.findByPk.mockResolvedValue(planoFake);

      const req = { params: { id: '1' }, body: { nome: 'Básico Plus' } };
      const res = mockRes();

      await planoController.atualizarPlano(req, res);

      expect(planoFake.update).toHaveBeenCalledWith({ nome: 'Básico Plus' });
      expect(res.json).toHaveBeenCalledWith(planoFake);
    });

    test('deve retornar 404 ao atualizar plano inexistente', async () => {
      Plano.findByPk.mockResolvedValue(null);

      const req = { params: { id: '99' }, body: {} };
      const res = mockRes();

      await planoController.atualizarPlano(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Plano não encontrado.' });
    });
  });

  // -----------------------------------------------
  // excluirPlano
  // -----------------------------------------------
  describe('excluirPlano', () => {
    test('deve excluir plano e retornar mensagem de sucesso', async () => {
      const planoFake = { id: 1, destroy: jest.fn().mockResolvedValue(true) };
      Plano.findByPk.mockResolvedValue(planoFake);

      const req = { params: { id: '1' } };
      const res = mockRes();

      await planoController.excluirPlano(req, res);

      expect(planoFake.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Plano excluído com sucesso.' });
    });

    test('deve retornar 404 ao excluir plano inexistente', async () => {
      Plano.findByPk.mockResolvedValue(null);

      const req = { params: { id: '99' } };
      const res = mockRes();

      await planoController.excluirPlano(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});