jest.mock('../models', () => ({
  Treino: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
  Aluno: {},
  Instrutor: {},
}));

const { Treino } = require('../models');
const treinoController = require('../controllers/Treinoc');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Treino Controller - Testes Unitários', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -----------------------------------------------
  // listarTreinos
  // -----------------------------------------------
  describe('listarTreinos', () => {
    test('deve retornar lista de treinos', async () => {
      const treinosFake = [
        { id: 1, aluno_id: 1, instrutor_id: 2, objetivo: 'Hipertrofia' },
        { id: 2, aluno_id: 3, instrutor_id: 2, objetivo: 'Emagrecimento' },
      ];
      Treino.findAll.mockResolvedValue(treinosFake);

      const req = {};
      const res = mockRes();

      await treinoController.listarTreinos(req, res);

      expect(Treino.findAll).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(treinosFake);
    });

    test('deve retornar 500 em caso de erro no banco', async () => {
      Treino.findAll.mockRejectedValue(new Error('Falha'));

      const req = {};
      const res = mockRes();

      await treinoController.listarTreinos(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Não foi possível buscar os treinos.' });
    });
  });

  // -----------------------------------------------
  // buscarTreino
  // -----------------------------------------------
  describe('buscarTreino', () => {
    test('deve retornar o treino quando encontrado', async () => {
      const treinoFake = { id: 1, aluno_id: 1, instrutor_id: 2, objetivo: 'Hipertrofia' };
      Treino.findByPk.mockResolvedValue(treinoFake);

      const req = { params: { id: '1' } };
      const res = mockRes();

      await treinoController.buscarTreino(req, res);

      expect(Treino.findByPk).toHaveBeenCalledWith('1', expect.any(Object));
      expect(res.json).toHaveBeenCalledWith(treinoFake);
    });

    test('deve retornar 404 quando treino não existe', async () => {
      Treino.findByPk.mockResolvedValue(null);

      const req = { params: { id: '99' } };
      const res = mockRes();

      await treinoController.buscarTreino(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Treino não encontrado.' });
    });

    test('deve retornar 500 em caso de erro no banco', async () => {
      Treino.findByPk.mockRejectedValue(new Error('Erro'));

      const req = { params: { id: '1' } };
      const res = mockRes();

      await treinoController.buscarTreino(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // -----------------------------------------------
  // criarTreino
  // -----------------------------------------------
  describe('criarTreino', () => {
    test('deve criar treino e retornar 201 com dados válidos', async () => {
      const body = { aluno_id: 1, instrutor_id: 2, objetivo: 'Resistência' };
      const treinoFake = { id: 5, ...body };
      Treino.create.mockResolvedValue(treinoFake);

      const req = { body };
      const res = mockRes();

      await treinoController.criarTreino(req, res);

      expect(Treino.create).toHaveBeenCalledWith({
        aluno_id: body.aluno_id,
        instrutor_id: body.instrutor_id,
        objetivo: body.objetivo,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(treinoFake);
    });

    test('deve retornar 400 quando aluno_id ou instrutor_id estão ausentes', async () => {
      const req = { body: { objetivo: 'Força' } }; // sem aluno_id e instrutor_id
      const res = mockRes();

      await treinoController.criarTreino(req, res);

      expect(Treino.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'aluno_id e instrutor_id são obrigatórios.',
      });
    });

    test('deve retornar 500 quando create falha', async () => {
      Treino.create.mockRejectedValue(new Error('Erro DB'));

      const req = { body: { aluno_id: 1, instrutor_id: 2, objetivo: 'Força' } };
      const res = mockRes();

      await treinoController.criarTreino(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // -----------------------------------------------
  // atualizarTreino
  // -----------------------------------------------
  describe('atualizarTreino', () => {
    test('deve atualizar e retornar o treino', async () => {
      const treinoFake = {
        id: 1,
        objetivo: 'Flexibilidade',
        update: jest.fn().mockResolvedValue(true),
      };
      Treino.findByPk.mockResolvedValue(treinoFake);

      const req = {
        params: { id: '1' },
        body: { aluno_id: 1, instrutor_id: 2, objetivo: 'Flexibilidade' },
      };
      const res = mockRes();

      await treinoController.atualizarTreino(req, res);

      expect(treinoFake.update).toHaveBeenCalledWith({
        aluno_id: 1,
        instrutor_id: 2,
        objetivo: 'Flexibilidade',
      });
      expect(res.json).toHaveBeenCalledWith(treinoFake);
    });

    test('deve retornar 404 ao atualizar treino inexistente', async () => {
      Treino.findByPk.mockResolvedValue(null);

      const req = { params: { id: '99' }, body: {} };
      const res = mockRes();

      await treinoController.atualizarTreino(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Treino não encontrado.' });
    });
  });

  // -----------------------------------------------
  // excluirTreino
  // -----------------------------------------------
  describe('excluirTreino', () => {
    test('deve excluir treino e retornar mensagem de sucesso', async () => {
      const treinoFake = { id: 1, destroy: jest.fn().mockResolvedValue(true) };
      Treino.findByPk.mockResolvedValue(treinoFake);

      const req = { params: { id: '1' } };
      const res = mockRes();

      await treinoController.excluirTreino(req, res);

      expect(treinoFake.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Treino excluído com sucesso.' });
    });

    test('deve retornar 404 ao excluir treino inexistente', async () => {
      Treino.findByPk.mockResolvedValue(null);

      const req = { params: { id: '99' } };
      const res = mockRes();

      await treinoController.excluirTreino(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Treino não encontrado.' });
    });
  });
});