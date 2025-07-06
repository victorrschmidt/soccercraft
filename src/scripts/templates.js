/**
 * Sobre:
 *   Um template é uma configuração dos jogadores no campo de futebol,
 *   representado por uma matriz 8x5 (dimensões do campo de futebol), onde:
 *
 *   task_templates[i][j] = j-ésimo template para a tarefa i
 *
 *   Cada template é uma matriz m, onde:
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
import Utilities from './utilities.js';

export default function getTemplate(task_number) {
    const task_config = {
        1: {half_field: true, has_goalkeeper: false, enemy_count: 5, friend_count: 0},
        2: {half_field: false, has_goalkeeper: false, enemy_count: 8, friend_count: 0},
        3: {half_field: false, has_goalkeeper: false, enemy_count: 6, friend_count: 3},
        4: {half_field: false, has_goalkeeper: true, enemy_count: 6, friend_count: 3}
    };
    const TASK = task_config[task_number];
    const ROWS = 8;
    const COLS = 5;
    const goalkeeper_position = {y: 0, x: Math.floor(COLS / 2)};
    let template = Array.from({length: ROWS}, () => Array(COLS).fill(0));

    if (TASK.has_goalkeeper) {
        template[goalkeeper_position.y][goalkeeper_position.x] = Utilities.randint(4, 6);
    }

    let positions = [];

    for (let i = 0; i < ROWS - 4 * Number(TASK.half_field); i++) {
        for (let j = 0; j < COLS; j++) {
            if (i != goalkeeper_position.y || j != goalkeeper_position.x) {
                positions.push([i, j]);
            }
        }
    }

    let main_player_index = Utilities.randint(0, positions.length - 1);
    let main_player_row = positions[main_player_index][0];
    let main_player_col = positions[main_player_index][1];
    template[main_player_row][main_player_col] = 2;
    positions.splice(main_player_index, 1);

    function canAddEnemy(i, j) {
        const dy = task_number == 1 ? [0, 1, 0] : [-1, 0, 1, 0];
        const dx = task_number == 1 ? [-1, 0, 1] : [0, 1, 0, -1];
        let vis = Array.from({length: ROWS - 4 * Number(TASK.half_field)}, () => Array(COLS).fill(false));
        template[i][j] = 3;

        function dfs(i, j) {
            vis[i][j] = true;

            for (let k = 0; k < dy.length; k++) {
                let _i = i + dy[k];
                let _j = j + dx[k];

                if (_i < ROWS - 4 * Number(TASK.half_field) && _j < COLS && 0 <= Math.min(_i, _j) && !vis[_i][_j] && (template[_i][_j] == 0 || template[_i][_j] == 2)) {
                    dfs(_i, _j);
                }
            }
        }

        dfs(0, Math.floor(COLS / 2));
        template[i][j] = 0;
        return vis[main_player_row][main_player_col];
    }

    for (let i = 0; i < TASK.enemy_count; i++) {
        let available_positions = Array(positions.length).fill().map((x, i) => i);
        let index = Utilities.randint(0, available_positions.length - 1);
        let y = positions[available_positions[index]][0];
        let x = positions[available_positions[index]][1];

        while (!canAddEnemy(y, x)) {
            available_positions.splice(index, 1);
            index = Utilities.randint(0, available_positions.length - 1);
            y = positions[available_positions[index]][0];
            x = positions[available_positions[index]][1];
        }

        template[y][x] = 3;
        positions.splice(available_positions[index], 1);
    }

    for (let i = 0; i < TASK.friend_count; i++) {
        let index = Utilities.randint(0, positions.length - 1);
        let y = positions[index][0];
        let x = positions[index][1];
        template[y][x] = 1;
        positions.splice(index, 1);
    }

    return template;
}