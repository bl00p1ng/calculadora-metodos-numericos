import NumericalMethod from '../NumericalMethod.js';

/**
 * Implementación del Polinomio de Lagrange
 * Realiza interpolación polinomial
 */
class LagrangePolynomial extends NumericalMethod {
    /**
     * Constructor del Polinomio de Lagrange
     * @param {Logger} logger - Instancia del logger
     */
    constructor(logger) {
        super('Polinomio de Lagrange', logger);
    }

    /**
     * Valida los parámetros específicos del polinomio de Lagrange
     * @param {Object} params - Parámetros a validar
     * @returns {boolean} - True si son válidos
     */
    validateParams(params) {
        super.validateParams(params);
        
        if (!params.xPoints || !Array.isArray(params.xPoints)) {
            throw new Error('Los valores de x deben ser un array válido');
        }
        
        if (!params.yPoints || !Array.isArray(params.yPoints)) {
            throw new Error('Los valores de y deben ser un array válido');
        }
        
        if (params.xPoints.length !== params.yPoints.length) {
            throw new Error('Los arrays de x e y deben tener el mismo tamaño');
        }
        
        if (params.xPoints.length < 2) {
            throw new Error('Se necesitan al menos 2 puntos para la interpolación');
        }
        
        // Verifica que no haya valores x repetidos
        const uniqueX = new Set(params.xPoints);
        if (uniqueX.size !== params.xPoints.length) {
            throw new Error('Los valores de x no pueden estar repetidos');
        }
        
        // Verifica que todos los valores sean números
        for (let i = 0; i < params.xPoints.length; i++) {
            if (isNaN(params.xPoints[i]) || isNaN(params.yPoints[i])) {
                throw new Error(`El punto (${params.xPoints[i]}, ${params.yPoints[i]}) contiene valores inválidos`);
            }
        }
        
        if (isNaN(params.xEval)) {
            throw new Error('El punto a evaluar debe ser un número válido');
        }
        
        return true;
    }

    /**
     * Calcula el polinomio de Lagrange como string
     * @param {Array<number>} xPoints - Valores x de los puntos
     * @param {Array<number>} yPoints - Valores y de los puntos
     * @returns {string} - Expresión del polinomio
     */
    getPolynomialExpression(xPoints, yPoints) {
        const n = xPoints.length;
        let polynomial = '';
        
        for (let i = 0; i < n; i++) {
            if (Math.abs(yPoints[i]) < 1e-10) continue; // Omite términos con coeficiente cero
            
            let term = yPoints[i] > 0 && i > 0 ? ' + ' : ' ';
            term += yPoints[i].toFixed(4);
            
            for (let j = 0; j < n; j++) {
                if (i !== j) {
                    term += ` * (x - ${xPoints[j]})`;
                    term += ` / ${(xPoints[i] - xPoints[j]).toFixed(4)}`;
                }
            }
            
            polynomial += term;
        }
        
        return polynomial.trim();
    }

    /**
     * Calcula el i-ésimo polinomio base de Lagrange
     * @param {Array<number>} xPoints - Valores x de los puntos
     * @param {number} i - Índice del polinomio base
     * @param {number} x - Punto donde evaluar
     * @returns {number} - Valor del polinomio base L_i(x)
     */
    calculateBasisPolynomial(xPoints, i, x) {
        const n = xPoints.length;
        let li = 1;
        
        for (let j = 0; j < n; j++) {
            if (i !== j) {
                li *= (x - xPoints[j]) / (xPoints[i] - xPoints[j]);
            }
        }
        
        return li;
    }

    /**
     * Calcula el polinomio de Lagrange y evalúa en un punto
     * @param {Object} params - Parámetros del cálculo
     * @param {Array<number>} params.xPoints - Valores x de los puntos
     * @param {Array<number>} params.yPoints - Valores y de los puntos
     * @param {number} params.xEval - Punto donde evaluar el polinomio
     */
    calculate(params) {
        this.logger.info('Iniciando cálculo del polinomio de Lagrange');
        this.validateParams(params);
        
        const { xPoints, yPoints, xEval } = params;
        const n = xPoints.length;
        
        this.logger.info(`Número de puntos: ${n}`);
        this.logger.info('Puntos dados:');
        for (let i = 0; i < n; i++) {
            this.logger.info(`  (${xPoints[i]}, ${yPoints[i]})`);
        }
        this.logger.info(`Punto a evaluar: x = ${xEval}`);
        
        let result = 0;
        this.iterations = [];
        
        // Calcula cada término de Lagrange
        for (let i = 0; i < n; i++) {
            const li = this.calculateBasisPolynomial(xPoints, i, xEval);
            const term = yPoints[i] * li;
            result += term;
            
            // Construye la expresión del polinomio base L_i
            let liExpression = '';
            let numerator = 1;
            let denominator = 1;
            
            for (let j = 0; j < n; j++) {
                if (i !== j) {
                    numerator *= (xEval - xPoints[j]);
                    denominator *= (xPoints[i] - xPoints[j]);
                    
                    if (liExpression !== '') liExpression += ' × ';
                    liExpression += `(${xEval} - ${xPoints[j]})`;
                }
            }
            
            liExpression += ` / ${denominator.toFixed(4)}`;
            
            this.iterations.push({
                i: i,
                'x_i': xPoints[i],
                'y_i': yPoints[i],
                'L_i(x)': li,
                'L_i expresión': liExpression,
                numerador: numerator,
                denominador: denominator,
                'y_i × L_i(x)': term,
                'suma parcial': result
            });
            
            this.logger.info(`Término ${i}: L_${i}(${xEval}) = ${li.toFixed(6)}, y_${i} × L_${i} = ${term.toFixed(6)}`);
        }
        
        this.result = result;
        
        // Genera la expresión del polinomio
        const polynomialExpression = this.getPolynomialExpression(xPoints, yPoints);
        this.logger.info(`Expresión del polinomio: P(x) = ${polynomialExpression}`);
        
        // Verifica la interpolación en los puntos dados
        this.logger.info('Verificación de la interpolación:');
        let maxError = 0;
        for (let i = 0; i < n; i++) {
            let pxi = 0;
            for (let j = 0; j < n; j++) {
                const lj = this.calculateBasisPolynomial(xPoints, j, xPoints[i]);
                pxi += yPoints[j] * lj;
            }
            const error = Math.abs(pxi - yPoints[i]);
            maxError = Math.max(maxError, error);
            this.logger.info(`  P(${xPoints[i]}) = ${pxi.toFixed(6)}, y_${i} = ${yPoints[i]}, error = ${error.toExponential(2)}`);
        }
        
        if (maxError > 1e-10) {
            this.logger.warning(`Error máximo en la interpolación: ${maxError.toExponential(2)}`);
        }
        
        this.logger.success(`Valor interpolado: P(${xEval}) = ${this.result.toFixed(8)}`);
        
        // Advierte si se está extrapolando
        const minX = Math.min(...xPoints);
        const maxX = Math.max(...xPoints);
        if (xEval < minX || xEval > maxX) {
            this.logger.warning(`ADVERTENCIA: x = ${xEval} está fuera del intervalo [${minX}, ${maxX}]`);
            this.logger.warning('Se está realizando extrapolación, los resultados pueden ser menos confiables');
        }
    }
}

export default LagrangePolynomial;