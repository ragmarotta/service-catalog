// Este ficheiro é executado automaticamente pelo Jest antes dos testes.
// Ele importa a biblioteca jest-dom para adicionar matchers úteis
// para fazer asserções sobre os elementos do DOM.
import '@testing-library/jest-dom';


// ---- Ficheiro 2: frontend/src/__mocks__/axios.js ----
// Mock global para a biblioteca axios.
// O Jest irá substituir automaticamente qualquer importação de 'axios'
// por este objeto mockado, impedindo chamadas de rede reais.
export default {
    // Mock para a função create, que retorna um objeto com métodos mockados.
    create: jest.fn(() => ({
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
        interceptors: {
            request: { use: jest.fn(), eject: jest.fn() },
            response: { use: jest.fn(), eject: jest.fn() },
        },
    })),
    // Mocks para os métodos diretos (ex: axios.get)
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
};