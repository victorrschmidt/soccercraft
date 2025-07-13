/**
 * Tarefa 1: Mexer pra cima, pros lados e chutar
 *   - 1 jogador aliado que começa com a bola
 *   - 5 jogadores adversários
 *   - Apenas a metade do campo é utilizada
 *
 * Tarefa 2: Correr para trás
 *   - 1 jogador aliado que começa com a bola
 *   - 8 jogadores adversários
 *
 * Tarefa 3: Passar a bola
 *   - 1 jogador aliado que começa com a bola
 *   - 3 jogadores aliados
 *   - 6 jogadores adversários
 *
 * Tarefa 4: Chutar em diferentes posições + goleiro
 *   - 1 jogador aliado que começa com a bola
 *   - 3 jogadores aliados
 *   - 6 jogadores adversários
 *   - 1 goleiro adversário
 */

import Interface from './interface.js';
import { SinglePlayerGame } from './game.js';

const TASK_NUMBER = Number(window.location.pathname.split('/').pop()[6]);
const game = new SinglePlayerGame(TASK_NUMBER);

game.generateTemplate();
Interface.addEventListeners(game.play, game.generateTemplate, game.changeTeam);