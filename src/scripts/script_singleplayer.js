import { SinglePlayerGame } from './game.js';

const task_number = Number(window.location.pathname.split('/').pop()[4]);
const game = new SinglePlayerGame(task_number);
game.generateTemplate();
game.interface.addEventListeners(game.play, game.generateTemplate, game.changeTeam);