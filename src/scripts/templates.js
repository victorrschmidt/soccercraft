import Configs from './configs.js';
import Entity from './entity.js';
import Utilities from './utilities.js';

/**
 * Função responsável por gerar um template para o modo de um jogador.
 *
 * Sobre:
 *   Um template é uma configuração dos jogadores no campo de futebol,
 *   representado por uma matriz 8x5 (dimensões do campo de futebol), onde:
 *
 *   m[i][j] = 0 <=> Espaço vazio
 *   m[i][j] = 1 <=> Jogador aliado
 *   m[i][j] = 2 <=> Jogador aliado que começa com a bola
 *   m[i][j] = 3 <=> Jogador adversário
 *   m[i][j] = 4 <=> Goleiro adversário na esquerda
 *   m[i][j] = 5 <=> Goleiro adversário no meio
 *   m[i][j] = 6 <=> Goleiro adversário na direita
 *
 * Tarefa 1:
 *   - 1 jogador aliado que começa com a bola
 *   - 5 jogadores adversários
 *   - Apenas a metade do campo é utilizada
 *
 * Tarefa 2:
 *   - 1 jogador aliado que começa com a bola
 *   - 8 jogadores adversários
 *
 * Tarefa 3:
 *   - 1 jogador aliado que começa com a bola
 *   - 3 jogadores aliados
 *   - 6 jogadores adversários
 *
 * Tarefa 4:
 *   - 1 jogador aliado que começa com a bola
 *   - 3 jogadores aliados
 *   - 6 jogadores adversários
 *   - 1 goleiro adversário
 */

export default class Template {
    constructor(task_number) {
        this.task_number = task_number;
        this.task = Configs.game.tasks[task_number];
        this.player_type_grid = undefined;
        this.player_ptr_grid = undefined;
        this.player_list = undefined;
        this.rows = Configs.game.field_rows;
        this.cols = Configs.game.field_cols;
        this.used_rows = this.rows;
        this.canvas_positions = {
            x: [42, 122, 206, 288, 370],
            y: [36, 103, 172, 240, 310, 378, 447, 515],
            goalkeeper: {x: 206, y: 12}
        };
        this.goalkeeper_position = {x: Math.floor(this.cols / 2), y: 0};
        this.main_player_position = {x: undefined, y: undefined};
        this.friend_team = 'blue';
        this.enemy_team = 'red';
        this.player_characters_ptrs = {'blue': 0, 'red': 0};
        this.vis = undefined;
        this.dy = undefined;
        this.dx = undefined;
    }

    canAddEnemy(y, x) {
        this.dy = this.task_number === 1 ? [0, 1, 0] : [-1, 0, 1, 0];
        this.dx = this.task_number === 1 ? [-1, 0, 1] : [0, 1, 0, -1];
        this.vis = Array.from({length: this.rows}, () => Array(this.cols).fill(false));
        this.player_type_grid[1][y][x] = 3;
        this.dfs(this.goalkeeper_position.y, this.goalkeeper_position.x);
        this.player_type_grid[1][y][x] = 0;
        return this.vis[this.main_player_position.y][this.main_player_position.x];
    }

    dfs(i, j) {
        this.vis[i][j] = true;
        for (let k = 0; k < this.dy.length; k++) {
            let _i = i + this.dy[k];
            let _j = j + this.dx[k];
            let check = 0 <= Math.min(_i, _j);
            check &&= _i < this.used_rows;
            check &&= _j < this.cols;
            check &&= !this.vis[_i][_j];
            check &&= (this.player_type_grid[1][_i][_j] == 0 || this.player_type_grid[1][_i][_j] == 2);
            if (check) {
                this.dfs(_i, _j);
            }
        }
    }

    generatePlayerTypeGrid() {
        const used_rows = this.rows / (1 + Number(this.task.half_field));
        this.player_type_grid = Array.from({length: 2}, () => Array.from({length: this.rows}, () => Array(this.cols).fill(0)));
        if (this.task.has_goalkeeper) {
            this.player_type_grid[1][this.goalkeeper_position.y][this.goalkeeper_position.x] = Utilities.randint(4, 6);
        }
        let positions = [];
        for (let i = 0; i < used_rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (i !== this.goalkeeper_position.y || j !== this.goalkeeper_position.x) {
                    positions.push([i, j]);
                }
            }
        }
        let main_player_index = Utilities.randint(0, positions.length - 1);
        let main_player_row = positions[main_player_index][0];
        let main_player_col = positions[main_player_index][1];
        this.player_type_grid[1][main_player_row][main_player_col] = 2;
        this.main_player_position.y = main_player_row;
        this.main_player_position.x = main_player_col;
        positions.splice(main_player_index, 1);
        for (let i = 0; i < this.task.enemy_count; i++) {
            let available_positions = Array(positions.length).fill().map((x, i) => i);
            let index = Utilities.randint(0, available_positions.length - 1);
            let y = positions[available_positions[index]][0];
            let x = positions[available_positions[index]][1];
            while (!this.canAddEnemy(y, x)) {
                available_positions.splice(index, 1);
                index = Utilities.randint(0, available_positions.length - 1);
                y = positions[available_positions[index]][0];
                x = positions[available_positions[index]][1];
            }
            this.player_type_grid[1][y][x] = 3;
            positions.splice(available_positions[index], 1);
        }
        for (let i = 0; i < this.task.friend_count; i++) {
            let index = Utilities.randint(0, positions.length - 1);
            let y = positions[index][0];
            let x = positions[index][1];
            this.player_type_grid[1][y][x] = 1;
            positions.splice(index, 1);
        }
    }

    copyGrids() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                this.player_type_grid[0][i][j] = this.player_type_grid[1][i][j];
            }
        }
    }

    generatePlayerList() {
        this.player_ptr_grid = Array.from({length: this.rows}, () => Array(this.cols).fill(-1));
        this.player_list = [];
        this.player_characters_ptrs.blue = 0;
        this.player_characters_ptrs.red = 0;
        let ptr = 0;
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                let n = this.player_type_grid[0][i][j];
                if (n === 0) {
                    continue;
                }
                this.player_ptr_grid[i][j] = ptr++;
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

    resetTemplate() {
        this.copyGrids();
        this.generatePlayerList();
    }

    generateTemplate() {
        this.generatePlayerTypeGrid();
        this.resetTemplate();
    }

    changeTeam() {
        [this.friend_team, this.enemy_team] = [this.enemy_team, this.friend_team];
        this.generatePlayerList();
    }

    changePlayerPosition(cy, cx) {
        const y = this.main_player_position.y;
        const x = this.main_player_position.x;
        const player_ptr = this.player_ptr_grid[y][x];
        this.player_list[player_ptr].y = this.canvas_positions.y[y + cy];
        this.player_list[player_ptr].x = this.canvas_positions.x[x + cx];
        this.player_type_grid[0][y + cy][x + cx] = 2;
        this.player_type_grid[0][y][x] = 0;
        this.player_ptr_grid[y + cy][x + cx] = this.player_ptr_grid[y][x];
        this.player_ptr_grid[y][x] = -1;
        this.main_player_position.y = y + cy;
        this.main_player_position.x = x + cx;
    }

    processMove(move) {
        const y = this.main_player_position.y;
        const x = this.main_player_position.x;
        switch(move) {
            case 'player_move_up':
                if (y - 1 < 0 || this.player_type_grid[0][y - 1][x] !== 0) return false;
                this.changePlayerPosition(-1, 0);
                break;
            case 'player_move_right':
                if (this.cols <= x + 1 || this.player_type_grid[0][y][x + 1] !== 0) return false;
                this.changePlayerPosition(0, 1);
                break;
            case 'player_move_down':
                if (this.rows <= y + 1 || this.player_type_grid[0][y + 1][x] !== 0) return false;
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