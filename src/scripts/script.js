/*

Tarefa 1 - Mexer pra cima, pros lados e chutar
Tarefa 2 - Correr para trás
Tarefa 3 - Passar a bola
Tarefa 4 - Chutar em diferentes posições + goleiro

*/

import { Entity, Player } from './entities';

console.log(Player, Entity);

class Assets {
    static path = '../assets'
    static display_icon_default_size = '40';
    static game_player_default_size = ['99', '197'];
}

class Game {
    constructor() {
        this.canvas = document.getElementById('main-content-game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.background = new Entity(`${Assets.path}/background.png`, 0, 0, this.canvas.width, this.canvas.height);
        this.grid_positions = [
            [0, 0]
        ];
        this.templates = [
            [[0, 0, false], [100, 100, false]]
        ];
        this.chosen_template = this.templates[Utilities.randomInt(this.templates.length)];
        this.players = Array(this.chosen_template.length).map((player, index) =>
            new Player(
                `${Assets.path}/player_blue_male_1.png`,
                this.chosen_template[index][0],
                this.chosen_template[index][1],
                Assets.game_player_default_size[0],
                Assets.game_player_default_size[1],

            ));
    }

    standBy = () => {
        this.background.draw(this.ctx);
        requestAnimationFrame(this.standBy);
    }

    play = () => {
        this.background.draw(this.ctx);
        this.player.draw(this.ctx);
        requestAnimationFrame(this.play);
    }
}

const game = new Game();
game.standBy();

class Interface {
    static moveset_display = document.getElementById('main-content-game-controls-display');
    static play_button = document.getElementById('play-button');
    static erase_button = document.getElementById('erase-button');
    static move_buttons = document.getElementsByClassName('move-button');

    static addEventListeners() {
        Interface.play_button.addEventListener('click', () => { game.play(); });
        Interface.erase_button.addEventListener('click', Interface.deleteMove);
        for (const button of Interface.move_buttons) {
            button.addEventListener('click', () => {
                Interface.addMove(button.id);
            });
        }
    }

    /**
     * Retorna a quantidade de movimentos contidos no display (máx = 24)
     */
    static getMoveAmount() {
        return Interface.moveset_display.children.length;
    }

    /**
     * Retorna um array contendo strings relativas aos movimentos.
     */
    static getMoveList() {
        return [...Interface.moveset_display.children].map((element) =>
            element.className.split('-').slice(1).join('-'));
    }

    /**
     * Adiciona um movimento à lista de movimentos do display.
     * O movimento no display é um elemento <img>.
     */
    static addMove(id) {
        if (Interface.getMoveAmount() === 24) {
            return;
        }

        const element = document.createElement('img');
        element.className = `display-${id}`;
        element.src = `${Assets.path}/${id.split('-').join('_')}.png`;
        element.width = Assets.display_icon_default_size;
        element.height = Assets.display_icon_default_size;
        Interface.moveset_display.appendChild(element);
    }

    /**
     * Remove o último movimento da lista de movimentos do display.
     * O último elemento <img> na <div> do display é removida.
     */
    static deleteMove() {
        if (Interface.getMoveAmount() !== 0) {
            Interface.moveset_display.removeChild(Interface.moveset_display.lastChild);
        }
    }
}

Interface.addEventListeners();