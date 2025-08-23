import { SinglePlayerGame } from './game.js';

const TASK_NUMBER = Number(window.location.pathname.split('/').pop()[4]);
const game = new SinglePlayerGame(TASK_NUMBER);
game.generateTemplate();
game.interface.addEventListeners(game.play, game.generateTemplate, game.changeTeam);