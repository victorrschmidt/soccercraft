import Configs from './configs.js';
import Interface from './interface.js';
import Entity from './entity.js';
import getTemplate from './templates.js';

export class SinglePlayerGame {
    constructor(task_number) {
        this.task_number = task_number;
        this.canvas = document.getElementById(Configs.html.main_content_game_screen_canvas);
        this.ctx = this.canvas.getContext('2d');
        this.background = new Entity(`${Configs.assets.path}/${Configs.assets.background_file_name}`, 0, 0, this.canvas.width, this.canvas.height);
        this.canvas_positions = {
            x: [42, 122, 206, 288, 370],
            y: [36, 103, 172, 240, 310, 378, 447, 515],
            goalkeeper: { x: 206, y: 12}
        };
        this.friend_team = 'blue';
        this.enemy_team = 'red';
        this.player_characters_ptrs = {'blue': 0, 'red': 0};
        this.main_player_pos = {x: undefined, y: undefined};
        this.player_list = [];
        this.position_grid = undefined;
        this.position_grid_cur = undefined;
        this.moveset = undefined;
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
        this.getMoveset();
        this.copyPositionGrid();
        console.log(this.main_player_pos);
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
                let src = `${Configs.assets.path}/player_${team}_${this.player_characters_ptrs[team] + 1}.png`;
                let x = this.canvas_positions.x[j];
                let y = this.canvas_positions.y[i];
                this.player_characters_ptrs[team]++;
                if (n == 2) {
                    this.main_player_pos.y = i;
                    this.main_player_pos.x = j;
                }
                this.player_list.push(new Entity(
                    src, x, y,
                    Configs.assets.game_player_default_size.width,
                    Configs.assets.game_player_default_size.height,
                ));
            }
        }
    }

    /**
     * Reconfigura as classes e a lista de jogadores.
     */
    resetPlayers = () => {
        this.player_characters_ptrs.blue = 0;
        this.player_characters_ptrs.red = 0;
        this.player_list = [];
        this.createPlayers();
    }

    /**
     * Gera um template aleatório para o jogo.
     */
    generateTemplate = () => {
        this.position_grid = getTemplate(this.task_number);
        this.resetPlayers();
    }

    /**
     * Muda o time que o aluno está controlando.
     */
    changeTeam = () => {
        [this.friend_team, this.enemy_team] = [this.enemy_team, this.friend_team];
        this.resetPlayers();
    }

    /**
     * Pega a lista de movimentos da interface atual.
     */
    getMoveset() {
        this.moveset = Interface.getMoveList();
    }

    /**
     * Salva as posições dos jogadores para caso o jogador tenha que começar novamente.
     */
    copyPositionGrid() {
        this.position_grid_cur = Array.from({length: this.position_grid.length}, () => Array(this.position_grid[0].length));
        for (let i = 0; i < this.position_grid.length; i++) {
            for (let j = 0; j < this.position_grid[0].length; j++) {
                this.position_grid_cur[i][j] = this.position_grid[i][j];
            }
        }
    }
}