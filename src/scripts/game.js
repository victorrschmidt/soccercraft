import Configs from './configs.js';
import Interface from './interface.js';
import Entity from './entity.js';
import getTemplate from './templates.js';

class PlayerInfo {
    constructor() {
        this.player_list = undefined;
        this.player_type_grid = undefined;
        this.player_pointer_grid = undefined;
        this.canvas_positions = {
            x: [42, 122, 206, 288, 370],
            y: [36, 103, 172, 240, 310, 378, 447, 515],
            goalkeeper: { x: 206, y: 12}
        };
        this.main_player_pos = {x: undefined, y: undefined};
        this.friend_team = 'blue';
        this.enemy_team = 'red';
        this.player_characters_ptrs = {'blue': 0, 'red': 0};
    }

    setPlayers(grid = this.player_type_grid[0]) {
        let rows = grid.length;
        let cols = grid[0].length;
        this.player_type_grid = Array.from({length: 2}, () =>
            Array.from({length: rows}, () =>
                Array(cols)));
        this.player_pointer_grid = Array.from({length: 2}, () =>
            Array.from({length: rows}, () =>
                Array(cols).fill(-1)));
        this.player_list = [];
        this.player_characters_ptrs.blue = 0;
        this.player_characters_ptrs.red = 0;
        let ptr = 0;
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                let n = grid[i][j];
                for (let k = 0; k < 2; k++) {
                    this.player_type_grid[k][i][j] = n;
                }
                if (n === 0) {
                    continue;
                }
                for (let k = 0; k < 2; k++) {
                    this.player_pointer_grid[k][i][j] = ptr;
                }
                ptr++;
                if (n === 2) {
                    this.main_player_pos.y = i;
                    this.main_player_pos.x = j;
                }
                let team = n < 3 ? this.friend_team : this.enemy_team;
                let src = `${Configs.assets.path}/player_${team}_${this.player_characters_ptrs[team] + 1}.png`;
                let x = this.canvas_positions.x[j];
                let y = this.canvas_positions.y[i];
                this.player_characters_ptrs[team]++;
                this.player_list.push(new Entity(
                    src, x, y,
                    Configs.assets.game_player_default_size.width,
                    Configs.assets.game_player_default_size.height,
                ));
            }
        }
    }

    copyGrid() {
        let rows = this.player_type_grid[0].length;
        let cols = this.player_type_grid[0][0].length;
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                this.player_type_grid[0][i][j] = this.player_type_grid[1][i][j];
                this.player_pointer_grid[0][i][j] = this.player_pointer_grid[1][i][j];
            }
        }
    }

    changePlayerPosition(cy, cx) {
        const y = this.main_player_pos.y;
        const x = this.main_player_pos.x;
        const player_ptr = this.player_pointer_grid[0][y][x];
        this.player_list[player_ptr].y = this.canvas_positions.y[y + cy];
        this.player_list[player_ptr].x = this.canvas_positions.x[x + cx];
        this.player_type_grid[0][y + cy][x + cx] = 2;
        this.player_type_grid[0][y][x] = 0;
        this.player_pointer_grid[0][y + cy][x + cx] = this.player_pointer_grid[0][y][x];
        this.player_pointer_grid[0][y][x] = -1;
        this.main_player_pos.y = y + cy;
        this.main_player_pos.x = x + cx;
    }

    processMove(move) {
        const rows = this.player_type_grid[0].length;
        const cols = this.player_type_grid[0][0].length;
        const y = this.main_player_pos.y;
        const x = this.main_player_pos.x;
        switch(move) {
            case 'player_move_up':
                if (y - 1 < 0 || this.player_type_grid[0][y - 1][x] !== 0) return false;
                this.changePlayerPosition(-1, 0);
                break;
            case 'player_move_right':
                if (cols <= x + 1 || this.player_type_grid[0][y][x + 1] !== 0) return false;
                this.changePlayerPosition(0, 1);
                break;
            case 'player_move_down':
                if (rows <= y + 1 || this.player_type_grid[0][y + 1][x] !== 0) return false;
                this.changePlayerPosition(1, 0);
                break;
            case 'player_move_left':
                if (x - 1 < 0 || this.player_type_grid[0][y][x - 1] !== 0) return false;
                this.changePlayerPosition(0, -1);
                break;
        }
        return true;
    }
}

export class SinglePlayerGame {
    constructor(task_number) {
        this.task_number = task_number;
        this.canvas = document.getElementById(Configs.html.main_content_game_screen_canvas);
        this.ctx = this.canvas.getContext('2d');
        this.background = new Entity(`${Configs.assets.path}/${Configs.assets.background_file_name}`, 0, 0, this.canvas.width, this.canvas.height);
        this.moveset = undefined;
        this.player_info = new PlayerInfo();
    }

    /**
     * Desenha as entidades no canvas.
     */
    drawEntities() {
        this.background.draw(this.ctx);
        for (const player of this.player_info.player_list) {
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
     * Pega a lista de movimentos da interface atual.
     */
    getMoveset() {
        this.moveset = Interface.getMoveList();
    }

    /**
     * Gera um template (configuração de posição dos jogadores) para o jogo.
     */
    generateTemplate = () => {
        this.player_info.setPlayers(getTemplate(this.task_number));
        Interface.deleteAllMoves();
    }

    /**
     * Muda o time que o aluno está controlando.
     */
    changeTeam = () => {
        [this.player_info.friend_team, this.player_info.enemy_team] = [this.player_info.enemy_team, this.player_info.friend_team];
        this.player_info.setPlayers();
    }

    /**
     * Inicia o jogo.
     */
    play = () => {
        if (Interface.getMoveAmount() === 0) {
            alert('A lista deve conter ao menos um comando!');
            return;
        }
        this.getMoveset();
        this.player_info.setPlayers();
        let i = 0;
        const step = () => {
            const move = this.moveset[i];
            if (!this.player_info.processMove(move)) {
                alert('comando impossível.');
                this.player_info.copyGrid();
                this.player_info.setPlayers();
                return;
            }
            this.drawEntities();
            if (++i < this.moveset.length) {
                setTimeout(step, Configs.game.delay);
            }
        };

        step();
    };
}