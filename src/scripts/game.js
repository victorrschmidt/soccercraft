import Interface from './interface.js';
import Assets from './assets.js';
import getTemplate from './templates.js';
import { Entity, Player } from './entities.js';

export class SinglePlayerGame {
    constructor(task_number) {
        this.task_number = task_number;
        this.canvas = document.getElementById('main-content-game-screen-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.background = new Entity(`${Assets.path}/background.png`, 0, 0, this.canvas.width, this.canvas.height);
        this.canvas_positions = {
            x: [42, 122, 206, 288, 370],
            y: [36, 103, 172, 240, 310, 378, 447, 515],
            goalkeeper: { x: 206, y: 12}
        };
        this.friend_team = 'blue';
        this.enemy_team = 'red';
        this.player_characters_ptrs = {'blue': 0, 'red': 0};
        this.player_list = [];
        this.position_grid = undefined;
    }

    /**
     * Desenha as entidades no canvas.
     */
    drawEntities() {
        this.background.draw(this.ctx);
        for (const player of this.player_list) {
            player.draw(this.ctx);
        }
    }

    /**
     * Mantém as entidades desenhadas enquanto o jogo não é iniciado.
     */
    standBy = () => {
        this.drawEntities();
        requestAnimationFrame(this.standBy);
    }

    /**
     * Inicia o jogo.
     */
    play = () => {
        this.drawEntities();
        requestAnimationFrame(this.play);
    }

    /**
     * Adiciona os jogadores à lista de jogadores da classe.
     */
    createPlayers() {
        for (let i = 0; i < this.position_grid.length; i++) {
            for (let j = 0; j < this.position_grid[0].length; j++) {
                let n = this.position_grid[i][j];

                if (n == 0) {
                    continue;
                }

                let team = n < 3 ? this.friend_team : this.enemy_team;
                let src = `${Assets.path}/player_${team}_${this.player_characters_ptrs[team] + 1}.png`;
                let x = this.canvas_positions.x[j];
                let y = this.canvas_positions.y[i];
                let has_ball = n == 2;
                this.player_characters_ptrs[team]++;
                this.player_list.push(new Player(
                    src,
                    x,
                    y,
                    Assets.game_player_default_size.width,
                    Assets.game_player_default_size.height,
                    team,
                    has_ball
                ));
            }
        }
    }

    /**
     * Gera um template aleatório para o jogo.
     */
    generateTemplate = () => {
        this.position_grid = getTemplate(this.task_number);
        this.player_characters_ptrs.blue = 0;
        this.player_characters_ptrs.red = 0;
        this.player_list = [];
        this.createPlayers();
        this.standBy();
    }

    /**
     * Muda o time que o aluno está controlando.
     */
    changeTeam = () => {
        [this.friend_team, this.enemy_team] = [this.enemy_team, this.friend_team];
        this.createPlayers();
    }
}