// Mock do módulo de models antes de importar o controller
jest.mock('../models', () => ({
  Aluno: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
}));

const { Aluno } = require('../models');
const alunoController = require('../controllers/Alunoc');

// Helper para criar mocks de req/res
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Aluno Controller - Testes Unitários', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -----------------------------------------------
  // listarAlunos
  // -----------------------------------------------
  describe('listarAlunos', () => {
    test('deve retornar lista de alunos com status 200', async () => {
      const alunosFake = [
        { id: 1, nome: 'Carlos', email: 'carlos@email.com' },
        { id: 2, nome: 'Ana',    email: 'ana@email.com' },
      ];
      Aluno.findAll.mockResolvedValue(alunosFake);

      const req = {};
      const res = mockRes();

      await alunoController.listarAlunos(req, res);

      expect(Aluno.findAll).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(alunosFake);
    });

    test('deve retornar status 500 quando ocorrer erro no banco', async () => {
      Aluno.findAll.mockRejectedValue(new Error('Erro de banco'));

      const req = {};
      const res = mockRes();

      await alunoController.listarAlunos(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Não foi possível buscar os alunos.' });
    });
  });

  // -----------------------------------------------
  // buscarAluno
  // -----------------------------------------------
  describe('buscarAluno', () => {
    test('deve retornar o aluno quando encontrado', async () => {
      const alunoFake = { id: 1, nome: 'Carlos', email: 'carlos@email.com' };
      Aluno.findByPk.mockResolvedValue(alunoFake);

      const req = { params: { id: '1' } };
      const res = mockRes();

      await alunoController.buscarAluno(req, res);

      expect(Aluno.findByPk).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith(alunoFake);
    });

    test('deve retornar 404 quando aluno não existe', async () => {
      Aluno.findByPk.mockResolvedValue(null);

      const req = { params: { id: '99' } };
      const res = mockRes();

      await alunoController.buscarAluno(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Aluno não encontrado.' });
    });

    test('deve retornar 500 em caso de erro no banco', async () => {
      Aluno.findByPk.mockRejectedValue(new Error('Falha'));

      const req = { params: { id: '1' } };
      const res = mockRes();

      await alunoController.buscarAluno(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // -----------------------------------------------
  // criarAluno
  // -----------------------------------------------
  describe('criarAluno', () => {
    test('deve criar aluno e retornar 201 com dados válidos', async () => {
      const body = {
        nome: 'Lucas',
        data_nascimento: '2000-01-15',
        email: 'lucas@email.com',
        telefone: '11999999999',
        senha: 'senha123',
      };
      const alunoFake = { id: 3, ...body };
      Aluno.create.mockResolvedValue(alunoFake);

      const req = { body };
      const res = mockRes();

      await alunoController.criarAluno(req, res);

      expect(Aluno.create).toHaveBeenCalledWith({
        nome: body.nome,
        data_nascimento: body.data_nascimento,
        email: body.email,
        telefone: body.telefone,
        senha: body.senha,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(alunoFake);
    });

    test('deve retornar 400 quando campos obrigatórios estão ausentes', async () => {
      const req = { body: { nome: 'Lucas' } }; // falta email, senha, data_nascimento
      const res = mockRes();

      await alunoController.criarAluno(req, res);

      expect(Aluno.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Nome, data_nascimento, email e senha são obrigatórios.',
      });
    });

    test('deve retornar 500 quando create falha', async () => {
      Aluno.create.mockRejectedValue(new Error('Erro DB'));

      const req = {
        body: {
          nome: 'Lucas',
          data_nascimento: '2000-01-15',
          email: 'lucas@email.com',
          senha: 'senha123',
        },
      };
      const res = mockRes();

      await alunoController.criarAluno(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // -----------------------------------------------
  // atualizarAluno
  // -----------------------------------------------
  describe('atualizarAluno', () => {
    test('deve atualizar e retornar o aluno', async () => {
      const alunoFake = {
        id: 1,
        nome: 'Carlos Atualizado',
        update: jest.fn().mockResolvedValue(true),
      };
      Aluno.findByPk.mockResolvedValue(alunoFake);

      const req = {
        params: { id: '1' },
        body: { nome: 'Carlos Atualizado', email: 'c@email.com', senha: 'nova123' },
      };
      const res = mockRes();

      await alunoController.atualizarAluno(req, res);

      expect(alunoFake.update).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(alunoFake);
    });

    test('deve retornar 404 ao tentar atualizar aluno inexistente', async () => {
      Aluno.findByPk.mockResolvedValue(null);

      const req = { params: { id: '99' }, body: {} };
      const res = mockRes();

      await alunoController.atualizarAluno(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // -----------------------------------------------
  // excluirAluno
  // -----------------------------------------------
  describe('excluirAluno', () => {
    test('deve excluir aluno e retornar mensagem de sucesso', async () => {
      const alunoFake = { id: 1, destroy: jest.fn().mockResolvedValue(true) };
      Aluno.findByPk.mockResolvedValue(alunoFake);

      const req = { params: { id: '1' } };
      const res = mockRes();

      await alunoController.excluirAluno(req, res);

      expect(alunoFake.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Aluno excluído com sucesso.' });
    });

    test('deve retornar 404 ao tentar excluir aluno inexistente', async () => {
      Aluno.findByPk.mockResolvedValue(null);

      const req = { params: { id: '99' } };
      const res = mockRes();

      await alunoController.excluirAluno(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Aluno não encontrado.' });
    });
  });
});