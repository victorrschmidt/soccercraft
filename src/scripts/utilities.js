export default class Utilities {
    /**
     * Retorna um inteiro pseudo-aleatório no intervalo [min, max].
     */
    static randint(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}