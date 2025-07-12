/*

Tarefa 1 - Mexer pra cima, pros lados e chutar
Tarefa 2 - Correr para trás
Tarefa 3 - Passar a bola
Tarefa 4 - Chutar em diferentes posições + goleiro

*/

import Interface from './interface.js';
import { SinglePlayerGame } from './game.js';
import Template from './templates.js';

const TASK_NUMBER = Number(window.location.pathname.split('/').pop()[6]);
//const game = new SinglePlayerGame(TASK_NUMBER);
//
//game.generateTemplate();
//game.standBy();
//Interface.addEventListeners(game.play, game.generateTemplate, game.changeTeam);

let p = new Template(1);
p.generateNewTemplate();
console.log(p);