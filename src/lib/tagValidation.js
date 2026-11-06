const LOTE_REGEX = /^\d{1,11}$/;
const MAX_TAG_ID_LENGTH = 64;

function isValidDateString(value) {
  if (!value || typeof value !== 'string') return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function isPositiveInteger(value) {
  const num = Number(value);
  return Number.isInteger(num) && num > 0;
}

function validateTagPayload(payload, { partial = false, existing = null } = {}) {
  const errors = [];
  const { id, produtoId, lote, quantidade, dataFabricacao, validade } = payload;

  if (!partial) {
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      errors.push('id é obrigatório');
    } else if (id.trim().length > MAX_TAG_ID_LENGTH) {
      errors.push(`id deve ter no máximo ${MAX_TAG_ID_LENGTH} caracteres`);
    }

    if (produtoId === undefined || produtoId === null || produtoId === '') {
      errors.push('produtoId é obrigatório');
    } else if (!isPositiveInteger(produtoId)) {
      errors.push('produtoId deve ser um número inteiro positivo');
    }

    if (lote === undefined || lote === null || lote === '') {
      errors.push('lote é obrigatório');
    } else if (typeof lote !== 'string' || !LOTE_REGEX.test(lote)) {
      errors.push('lote deve conter apenas dígitos e ter no máximo 11 caracteres');
    }

    if (quantidade === undefined || quantidade === null || quantidade === '') {
      errors.push('quantidade é obrigatória');
    } else if (!isPositiveInteger(quantidade)) {
      errors.push('quantidade deve ser um número inteiro positivo');
    }

    if (!dataFabricacao) {
      errors.push('dataFabricacao é obrigatória');
    } else if (!isValidDateString(dataFabricacao)) {
      errors.push('dataFabricacao deve ser uma data válida');
    }

    if (!validade) {
      errors.push('validade é obrigatória');
    } else if (!isValidDateString(validade)) {
      errors.push('validade deve ser uma data válida');
    }
  } else {
    if (id !== undefined) errors.push('id não pode ser alterado');
    if (produtoId !== undefined) errors.push('produtoId não pode ser alterado');

    if (lote !== undefined && (typeof lote !== 'string' || !LOTE_REGEX.test(lote))) {
      errors.push('lote deve conter apenas dígitos e ter no máximo 11 caracteres');
    }

    if (quantidade !== undefined && !isPositiveInteger(quantidade)) {
      errors.push('quantidade deve ser um número inteiro positivo');
    }

    if (dataFabricacao !== undefined && !isValidDateString(dataFabricacao)) {
      errors.push('dataFabricacao deve ser uma data válida');
    }

    if (validade !== undefined && !isValidDateString(validade)) {
      errors.push('validade deve ser uma data válida');
    }
  }

  const fabDate = parseDate(dataFabricacao) || (existing ? existing.dataFabricacao : null);
  const valDate = parseDate(validade) || (existing ? existing.validade : null);

  if (fabDate && valDate && valDate < fabDate) {
    errors.push('validade deve ser igual ou posterior a dataFabricacao');
  }

  return errors;
}

module.exports = {
  validateTagPayload,
};
