const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { validateTagPayload } = require('./tagValidation');

const payloadBase = {
  id: 'E2801160600002052A5D1234',
  produtoId: 1,
  lote: '24051201',
  quantidade: 240,
  dataFabricacao: '2025-05-12',
  validade: '2025-11-12',
};

describe('validateTagPayload - create', () => {
  it('accepts a valid payload', () => {
    assert.deepEqual(validateTagPayload(payloadBase), []);
  });

  it('trims/keeps id but rejects empty id', () => {
    assert.ok(validateTagPayload({ ...payloadBase, id: '   ' }).includes('id é obrigatório'));
  });

  it('rejects id longer than 64 characters', () => {
    const errors = validateTagPayload({ ...payloadBase, id: 'a'.repeat(65) });
    assert.ok(errors.some((e) => e.includes('id deve ter no máximo')));
  });

  it('rejects non-positive produtoId', () => {
    const errors = validateTagPayload({ ...payloadBase, produtoId: -1 });
    assert.ok(errors.includes('produtoId deve ser um número inteiro positivo'));
  });

  it('rejects lotes with letters', () => {
    const errors = validateTagPayload({ ...payloadBase, lote: '24A51201' });
    assert.ok(errors.includes('lote deve conter apenas dígitos e ter no máximo 11 caracteres'));
  });

  it('rejects lotes longer than 11 digits', () => {
    const errors = validateTagPayload({ ...payloadBase, lote: '123456789012' });
    assert.ok(errors.includes('lote deve conter apenas dígitos e ter no máximo 11 caracteres'));
  });

  it('rejects negative quantity', () => {
    const errors = validateTagPayload({ ...payloadBase, quantidade: -10 });
    assert.ok(errors.includes('quantidade deve ser um número inteiro positivo'));
  });

  it('rejects zero quantity', () => {
    const errors = validateTagPayload({ ...payloadBase, quantidade: 0 });
    assert.ok(errors.includes('quantidade deve ser um número inteiro positivo'));
  });

  it('rejects invalid manufacture date', () => {
    const errors = validateTagPayload({ ...payloadBase, dataFabricacao: 'not-a-date' });
    assert.ok(errors.includes('dataFabricacao deve ser uma data válida'));
  });

  it('rejects expiry before manufacture', () => {
    const errors = validateTagPayload({
      ...payloadBase,
      dataFabricacao: '2025-11-12',
      validade: '2025-05-12',
    });
    assert.ok(errors.includes('validade deve ser igual ou posterior a dataFabricacao'));
  });

  it('reports multiple missing fields', () => {
    const errors = validateTagPayload({});
    assert.ok(errors.includes('id é obrigatório'));
    assert.ok(errors.includes('produtoId é obrigatório'));
    assert.ok(errors.includes('lote é obrigatório'));
    assert.ok(errors.includes('quantidade é obrigatória'));
    assert.ok(errors.includes('dataFabricacao é obrigatória'));
    assert.ok(errors.includes('validade é obrigatória'));
  });
});

describe('validateTagPayload - update', () => {
  const existing = {
    dataFabricacao: new Date('2025-05-12'),
    validade: new Date('2025-11-12'),
  };

  it('accepts valid partial update', () => {
    assert.deepEqual(validateTagPayload({ quantidade: 100 }, { partial: true, existing }), []);
  });

  it('rejects changing id', () => {
    const errors = validateTagPayload({ id: 'X' }, { partial: true, existing });
    assert.ok(errors.includes('id não pode ser alterado'));
  });

  it('rejects changing produtoId', () => {
    const errors = validateTagPayload({ produtoId: 2 }, { partial: true, existing });
    assert.ok(errors.includes('produtoId não pode ser alterado'));
  });

  it('validates lote in partial update', () => {
    const errors = validateTagPayload({ lote: 'abc' }, { partial: true, existing });
    assert.ok(errors.includes('lote deve conter apenas dígitos e ter no máximo 11 caracteres'));
  });

  it('validates quantity in partial update', () => {
    const errors = validateTagPayload({ quantidade: 0 }, { partial: true, existing });
    assert.ok(errors.includes('quantidade deve ser um número inteiro positivo'));
  });

  it('compares new validade against existing dataFabricacao', () => {
    const errors = validateTagPayload(
      { validade: '2025-01-01' },
      { partial: true, existing }
    );
    assert.ok(errors.includes('validade deve ser igual ou posterior a dataFabricacao'));
  });

  it('compares new dataFabricacao against existing validade', () => {
    const errors = validateTagPayload(
      { dataFabricacao: '2025-12-01' },
      { partial: true, existing }
    );
    assert.ok(errors.includes('validade deve ser igual ou posterior a dataFabricacao'));
  });
});
