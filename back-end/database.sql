CREATE DATABASE plataforma_agendamento;

-- para conectar no banco
\c plataforma_agendamento

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(50) NOT NULL CHECK (tipo_usuario IN ('cliente', 'profissional', 'admin')),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE funcionarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    cargo VARCHAR(50) NOT NULL,
    estabelecimento_id INT NOT NULL,
    FOREIGN KEY (estabelecimento_id) REFERENCES estabelecimentos(id) ON DELETE CASCADE
);

CREATE TABLE servicos (
    id SERIAL PRIMARY KEY,
    profissional_id INT NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    preco NUMERIC(10, 2) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE agendamentos (
    id SERIAL PRIMARY KEY,
    cliente_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    servico_id INT NOT NULL REFERENCES servicos(id) ON DELETE CASCADE,
    horario TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('pendente', 'confirmado', 'cancelado')),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pagamentos (
    id SERIAL PRIMARY KEY,
    agendamento_id INT NOT NULL REFERENCES agendamentos(id) ON DELETE CASCADE,
    valor NUMERIC(10, 2) NOT NULL,
    metodo_pagamento VARCHAR(50) NOT NULL CHECK (metodo_pagamento IN ('cartao_credito', 'cartao_debito', 'pix', 'dinheiro')),
    status_pagamento VARCHAR(50) NOT NULL CHECK (status_pagamento IN ('pendente', 'pago', 'falha')),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notificacoes (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    mensagem TEXT NOT NULL,
    lida BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
