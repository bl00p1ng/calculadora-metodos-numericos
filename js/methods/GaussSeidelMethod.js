import NumericalMethod from '../NumericalMethod.js';

/**
 * Implementación del método de Gauss-Seidel
 * Versión mejorada del método de Jacobi con convergencia más rápida
 */
class GaussSeidelMethod extends NumericalMethod {
    /**
     * Constructor del método de Gauss-Seidel
     * @param {Logger} logger - Instancia del logger
     */
    constructor(logger) {
        super('Gauss-Seidel', logger);
    }

    /**
     * Valida los parámetros específicos del método de Gauss-Seidel
     * @param {Object} params - Parámetros a validar
     * @returns {boolean} - True si son válidos
     */
    validateParams(params) {
        super.validateParams(params);
        
        if (!params.matrix || !Array.isArray(params.matrix)) {
            throw new Error('La matriz de coeficientes debe ser un array válido');
        }
        
        if (!params.vector || !Array.isArray(params.vector)) {
            throw new Error('El vector de términos independientes debe ser un array válido');
        }
        
        if (!params.initialGuess || !Array.isArray(params.initialGuess)) {
            throw new Error('El vector inicial debe ser un array válido');
        }
        
        const n = params.matrix.length;
        
        // Verifica que la matriz sea cuadrada
        for (let i = 0; i < n; i++) {
            if (!Array.isArray(params.matrix[i]) || params.matrix[i].length !== n) {
                throw new Error('La matriz debe ser cuadrada');
            }
        }
        
        // Verifica que los vectores tengan el tamaño correcto
        if (params.vector.length !== n) {
            throw new Error('El vector de términos independientes debe tener el mismo tamaño que la matriz');
        }
        
        if (params.initialGuess.length !== n) {
            throw new Error('El vector inicial debe tener el mismo tamaño que la matriz');
        }
        
        // Verifica diagonal dominante (advertencia)
        for (let i = 0; i < n; i++) {
            let sum = 0;
            for (let j = 0; j < n; j++) {
                if (i !== j) {
                    sum += Math.abs(params.matrix[i][j]);
                }
            }
            if (Math.abs(params.matrix[i][i]) <= sum) {
                this.logger.warning(`Fila ${i + 1}: La matriz no es estrictamente diagonal dominante`);
                this.logger.warning('El método podría no converger');
            }
        }
        
        // Verifica que no haya ceros en la diagonal
        for (let i = 0; i < n; i++) {
            if (Math.abs(params.matrix[i][i]) < 1e-10) {
                throw new Error(`Elemento diagonal (${i + 1},${i + 1}) es cero o muy pequeño`);
            }
        }
        
        if (params.tolerance <= 0) {
            throw new Error('La tolerancia debe ser mayor que cero');
        }
        
        if (params.maxIterations <= 0) {
            throw new Error('El número máximo de iteraciones debe ser mayor que cero');
        }
        
        return true;
    }

    /**
     * Ejecuta el método de Gauss-Seidel
     * @param {Object} params - Parámetros del cálculo
     * @param {Array<Array<number>>} params.matrix - Matriz de coeficientes
     * @param {Array<number>} params.vector - Vector de términos independientes
     * @param {Array<number>} params.initialGuess - Vector inicial
     * @param {number} params.tolerance - Tolerancia del error
     * @param {number} params.maxIterations - Máximo número de iteraciones
     */
    calculate(params) {
        this.logger.info('Iniciando cálculo por método de Gauss-Seidel');
        this.validateParams(params);
        
        const { matrix, vector, initialGuess, tolerance, maxIterations } = params;
        
        const n = matrix.length;
        let x = [...initialGuess];
        let xOld = [...x];
        let iter = 0;
        this.iterations = [];
        this.result = null;
        
        this.logger.info(`Sistema de ${n}x${n} ecuaciones`);
        this.logger.info(`Vector inicial: [${x.join(', ')}]`);
        
        while (iter < maxIterations) {
            // Guarda el vector anterior para calcular el error
            xOld = [...x];
            
            // Calcula nuevos valores usando los valores más recientes
            for (let i = 0; i < n; i++) {
                let sum = 0;
                
                // Usa los nuevos valores ya calculados (j < i)
                for (let j = 0; j < i; j++) {
                    sum += matrix[i][j] * x[j];
                }
                
                // Usa los valores anteriores para el resto (j > i)
                for (let j = i + 1; j < n; j++) {
                    sum += matrix[i][j] * x[j];
                }
                
                // Actualiza x[i] inmediatamente
                x[i] = (vector[i] - sum) / matrix[i][i];
            }
            
            // Calcula el error máximo
            let error = 0;
            for (let i = 0; i < n; i++) {
                error = Math.max(error, Math.abs(x[i] - xOld[i]));
            }
            
            // Calcula la norma del vector residual
            let residual = 0;
            for (let i = 0; i < n; i++) {
                let sum = 0;
                for (let j = 0; j < n; j++) {
                    sum += matrix[i][j] * x[j];
                }
                residual += Math.pow(sum - vector[i], 2);
            }
            residual = Math.sqrt(residual);
            
            // Calcula el error relativo
            let relativeError = 0;
            let xNorm = 0;
            for (let i = 0; i < n; i++) {
                relativeError += Math.pow(x[i] - xOld[i], 2);
                xNorm += Math.pow(x[i], 2);
            }
            relativeError = Math.sqrt(relativeError) / Math.sqrt(xNorm);
            
            this.iterations.push({
                iteration: iter + 1,
                xOld: [...xOld],
                x: [...x],
                error: error,
                relativeError: relativeError,
                residual: residual
            });
            
            this.logger.info(`Iteración ${iter + 1}:`);
            this.logger.info(`  x = [${x.map(v => v.toFixed(6)).join(', ')}]`);
            this.logger.info(`  error = ${error.toFixed(8)}, error relativo = ${relativeError.toFixed(8)}`);
            this.logger.info(`  residual = ${residual.toFixed(8)}`);
            
            if (error < tolerance || relativeError < tolerance) {
                this.result = [...x];
                this.logger.success(`Convergencia alcanzada en ${iter + 1} iteraciones`);
                this.logger.success(`Solución: [${x.map(v => v.toFixed(6)).join(', ')}]`);
                break;
            }
            
            iter++;
        }
        
        if (!this.result) {
            this.logger.warning('Máximo de iteraciones alcanzado sin convergencia');
            this.result = [...x];
            this.logger.warning(`Mejor aproximación: [${x.map(v => v.toFixed(6)).join(', ')}]`);
        }
    }
}

export default GaussSeidelMethod;