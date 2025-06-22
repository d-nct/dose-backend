const Avaliacao = require('../models/Avaliacao');

/**
 * Gerencia a lógica de upvote e downvote para uma avaliação.
 *
 * @param {string} avaliacaoId - O ID da avaliação a ser votada.
 * @param {string} usuarioId - O ID do usuário que está votando.
 * @param {'upvote' | 'downvote'} tipoVoto - O tipo de voto.
 */
async function votarAvaliacao(avaliacaoId, usuarioId, tipoVoto) {
  if (tipoVoto !== 'upvote' && tipoVoto !== 'downvote') {
    throw new Error("Tipo de voto inválido. Use 'upvote' ou 'downvote'.");
  }

  const avaliacao = await Avaliacao.findById(avaliacaoId);
  if (!avaliacao) {
    throw new Error('Avaliação não encontrada.');
  }

  // Regra: Um usuário não pode votar na sua própria avaliação.
  if (avaliacao.usuario.toString() === usuarioId) {
    throw new Error('Você não pode votar na sua própria avaliação.');
  }

  // Converte o ID do usuário para string para facilitar comparações
  const idUsuarioString = usuarioId.toString();

  // Verificando o estado atual do voto do usuário
  const jaDeuUpvote = avaliacao.upvotes.some(id => id.toString() === idUsuarioString);
  const jaDeuDownvote = avaliacao.downvotes.some(id => id.toString() === idUsuarioString);

  let update = {};

  if (tipoVoto === 'upvote') {
    // Se o usuário já deu upvote, o segundo clique remove o upvote.
    if (jaDeuUpvote) {
      update = { $pull: { upvotes: usuarioId } };
    } else {
      // Se não deu upvote, adiciona o upvote e remove qualquer downvote existente.
      update = { 
        $addToSet: { upvotes: usuarioId },
        $pull: { downvotes: usuarioId } 
      };
    }
  } else { // tipoVoto === 'downvote'
    // Se o usuário já deu downvote, o segundo clique remove o downvote.
    if (jaDeuDownvote) {
      update = { $pull: { downvotes: usuarioId } };
    } else {
      // Se não deu downvote, adiciona o downvote e remove qualquer upvote existente.
      update = {
        $addToSet: { downvotes: usuarioId },
        $pull: { upvotes: usuarioId }
      };
    }
  }

  // Executa a atualização no banco de dados de forma atômica e retorna o documento atualizado.
  const avaliacaoAtualizada = await Avaliacao.findByIdAndUpdate(
    avaliacaoId,
    update,
    { new: true } // Retorna o documento após a atualização
  );

  return avaliacaoAtualizada;
}

module.exports = {
  votarAvaliacao
};