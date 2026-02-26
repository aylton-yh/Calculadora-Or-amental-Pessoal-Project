-- MySQL Database for RealBalance (Premium Edition)
CREATE DATABASE IF NOT EXISTS `realbalance` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `realbalance`;

-- 1. Table: usuario (Detailed Profile)
DROP TABLE IF EXISTS `usuario`;
CREATE TABLE `usuario` (
  `id_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `nome_completo` varchar(100) NOT NULL,
  `nome_usuario` varchar(100) NOT NULL UNIQUE,
  `email` varchar(100) NOT NULL UNIQUE,
  `contacto` varchar(20) NOT NULL UNIQUE,
  `sexo` enum('M', 'F') NOT NULL,
  `estado_civil` enum('Solteiro', 'Casado', 'Divorciado', 'Viuvo') NOT NULL,
  `BI` varchar(50) NOT NULL UNIQUE,
  `endereço` varchar(255) NOT NULL,
  `palavra_passe` varchar(255) NOT NULL COMMENT 'Stored as bcrypt hash in production',
  `foto_perfil` varchar(255) DEFAULT NULL,
  `moeda_padrao` varchar(10) DEFAULT 'Kz' COMMENT 'Fixed: Kwanza (AOA) is the only currency',
  `idioma` varchar(10) DEFAULT 'pt-AO' COMMENT 'Fixed: Português de Angola is the only language',
  `tema_sistema` enum('dark', 'light', 'midnight', 'ocean', 'forest') DEFAULT 'dark' COMMENT 'UI theme chosen by user',
  `criado_em` timestamp DEFAULT CURRENT_TIMESTAMP,
  `ultimo_acesso` timestamp NULL DEFAULT NULL,
  `ultima_alteracao_senha` timestamp NULL DEFAULT NULL COMMENT 'Timestamp of last password change',
  PRIMARY KEY (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;


-- ------------------------------------------------------
-- 1b. Table: historico_palavras_passe (Password Change Audit Log)
-- Tracks every password change for security auditing
-- ------------------------------------------------------
DROP TABLE IF EXISTS `historico_palavras_passe`;
CREATE TABLE `historico_palavras_passe` (
  `id_historico` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario`   int(11) NOT NULL,
  `alterado_em`  timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'When the password was changed',
  `ip_origem`    varchar(45) DEFAULT NULL COMMENT 'Client IP address (optional, for security)',
  `user_agent`   varchar(255) DEFAULT NULL COMMENT 'Browser/client info (optional)',
  PRIMARY KEY (`id_historico`),
  KEY `fk_hist_senha_usuario` (`id_usuario`),
  KEY `idx_hist_senha_data` (`alterado_em`),
  CONSTRAINT `fk_hist_senha_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT='Audit trail for all password change events';


-- 2. Table: contas_bancarias (Bank Accounts/Wallets)
DROP TABLE IF EXISTS `contas_bancarias`;
CREATE TABLE `contas_bancarias` (
  `id_conta` int(11) NOT NULL AUTO_INCREMENT,
  `nome_conta` varchar(100) NOT NULL,
  `tipo_conta` enum('Corrente', 'Poupanca', 'Dinheiro', 'Investimento') NOT NULL,
  `banco` varchar(50) DEFAULT 'Carteira',
  `saldo_inicial` decimal(15,2) DEFAULT 0.00,
  `saldo_atual` decimal(15,2) DEFAULT 0.00,
  `cor_tema` varchar(20) DEFAULT '#10b981',
  `id_usuario` int(11) NOT NULL,
  PRIMARY KEY (`id_conta`),
  KEY `fk_contas_usuario` (`id_usuario`),
  CONSTRAINT `fk_contas_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

-- 3. Table: categoria (Expense/Income Categories)
DROP TABLE IF EXISTS `categoria`;
CREATE TABLE `categoria` (
  `id_categoria` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(60) NOT NULL,
  `icone` varchar(50) DEFAULT 'Circle', -- Name of the Lucide icon
  `cor` varchar(20) DEFAULT '#10b981', -- Hex color for the UI
  `tipo` enum('receita', 'despesa') NOT NULL, -- Category for Income or Expense
  `id_usuario` int(11) DEFAULT NULL, -- NULL for system-wide defaults, otherwise user-specific
  PRIMARY KEY (`id_categoria`),
  KEY `fk_categoria_usuario` (`id_usuario`),
  CONSTRAINT `fk_categoria_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

-- 4. Table: transacoes (Detailed Financial History)
DROP TABLE IF EXISTS `transacoes`;
CREATE TABLE `transacoes` (
  `id_transacao` int(11) NOT NULL AUTO_INCREMENT,
  `descricao` varchar(150) NOT NULL,
  `valor` decimal(15,2) NOT NULL,
  `data` date NOT NULL,
  `tipo` enum('receita', 'despesa') NOT NULL,
  `metodo_pagamento` enum('Dinheiro', 'Transferencia', 'Cartao', 'TPA') DEFAULT 'Transferencia',
  `status` enum('pago', 'pendente') DEFAULT 'pago',
  `id_usuario` int(11) NOT NULL,
  `id_categoria` int(11) DEFAULT NULL,
  `id_conta` int(11) DEFAULT NULL,
  `criado_em` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_transacao`),
  KEY `fk_transacao_usuario` (`id_usuario`),
  KEY `fk_transacao_categoria` (`id_categoria`),
  KEY `fk_transacao_conta` (`id_conta`),
  CONSTRAINT `fk_transacao_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT `fk_transacao_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id_categoria`) ON DELETE SET NULL,
  CONSTRAINT `fk_transacao_conta` FOREIGN KEY (`id_conta`) REFERENCES `contas_bancarias` (`id_conta`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

-- 5. Table: orcamentos (Monthly Budgets per Category)
DROP TABLE IF EXISTS `orcamentos`;
CREATE TABLE `orcamentos` (
  `id_orcamento` int(11) NOT NULL AUTO_INCREMENT,
  `mes` int(2) NOT NULL,
  `ano` int(4) NOT NULL,
  `valor_limite` decimal(15,2) NOT NULL,
  `id_categoria` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  PRIMARY KEY (`id_orcamento`),
  KEY `fk_orcamentos_usuario` (`id_usuario`),
  KEY `fk_orcamentos_categoria` (`id_categoria`),
  CONSTRAINT `fk_orcamentos_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT `fk_orcamentos_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id_categoria`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

-- 6. Table: metas (Financial Goals)
DROP TABLE IF EXISTS `metas`;
CREATE TABLE `metas` (
  `id_meta` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `valor_alvo` decimal(15,2) NOT NULL,
  `valor_atual` decimal(15,2) DEFAULT 0.00,
  `prazo` date DEFAULT NULL,
  `icone` varchar(50) DEFAULT 'Target',
  `id_usuario` int(11) NOT NULL,
  PRIMARY KEY (`id_meta`),
  KEY `fk_metas_usuario` (`id_usuario`),
  CONSTRAINT `fk_metas_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

-- 7. Table: cartoes (Credit/Debit Cards)
DROP TABLE IF EXISTS `cartoes`;
CREATE TABLE `cartoes` (
  `id_cartao` int(11) NOT NULL AUTO_INCREMENT,
  `nome_cartao` varchar(50) NOT NULL,
  `final_cartao` varchar(4) NOT NULL,
  `bandeira` enum('Visa', 'Mastercard', 'Multicaixa', 'Outro') DEFAULT 'Multicaixa',
  `validade` varchar(7) DEFAULT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_conta` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_cartao`),
  KEY `fk_cartoes_usuario` (`id_usuario`),
  KEY `fk_cartoes_conta` (`id_conta`),
  CONSTRAINT `fk_cartoes_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT `fk_cartoes_conta` FOREIGN KEY (`id_conta`) REFERENCES `contas_bancarias` (`id_conta`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT='Cartões (Débito/Crédito) e Cartões MultiCaixa';

-- ------------------------------------------------------
-- MAPEAMENTO DE CAMPOS PARA O SISTEMA (EXACT MATCH)
-- ------------------------------------------------------
-- 1. Saldo em contas      -> contas_bancarias.saldo_atual
-- 2. Receitas mensais     -> SUM(transacoes.valor) ONDE tipo='receita' E mes_actual
-- 3. Despesas mensais     -> SUM(transacoes.valor) ONDE tipo='despesa' E mes_actual
-- 4. Património total     -> SUM(contas_bancarias.saldo_atual)
-- 5. Atividades recentes  -> actividades_sistema (ORDER BY data DESC)
-- 6. Entradas no mês      -> transacoes WHERE tipo='receita' AND MONTH(data) = MONTH(NOW())
-- 7. Saídas no mês        -> transacoes WHERE tipo='despesa' AND MONTH(data) = MONTH(NOW())
-- 8. Resultado mensal     -> (Entradas no mês - Saídas no mês)
-- 9. Minhas contas        -> contas_bancarias
-- 10. Transações          -> transacoes
-- 11. Nova conta          -> INSERT INTO contas_bancarias
-- 12. Total acumulado     -> historico_diario.patrimonio_total
-- 13. Histórico Entradas  -> transacoes WHERE tipo='receita'
-- 14. Histórico Saídas    -> transacoes WHERE tipo='despesa'
-- 15. Categoria Receita   -> categoria WHERE tipo='receita'
-- 16. Categoria Despesas  -> categoria WHERE tipo='despesa'
-- 17. Nova Receita        -> INSERT INTO transacoes (tipo='receita')
-- 18. Nova Despesa        -> INSERT INTO transacoes (tipo='despesa')
-- 19. Alterar Senha       -> UPDATE usuario.palavra_passe & INSERT INTO historico_palavras_passe
-- ──────────────────────────────────────────────────────

-- ------------------------------------------------------
-- PREMIUM DUMP DATA (Angolan Context)
-- ------------------------------------------------------

-- Users
INSERT INTO `usuario` (`nome_completo`, `nome_usuario`, `email`, `contacto`, `sexo`, `estado_civil`, `BI`, `endereço`, `palavra_passe`) VALUES 
('Administrador Geral', 'admin', 'admin@realbalance.ao', '900123456', 'M', 'Casado', '001234567LA045', 'Rua da Missão, Luanda', 'admin123'),
('Mario Santos', 'mariosantos', 'mario@email.ao', '923999888', 'M', 'Solteiro', '009876543ZE090', 'Vila Alice, Luanda', '20242024');

-- User Accounts
INSERT INTO `contas_bancarias` (`nome_conta`, `tipo_conta`, `banco`, `saldo_inicial`, `saldo_atual`, `id_usuario`, `cor_tema`) VALUES 
('Carteira Principal', 'Dinheiro', 'Físico', 5000.00, 5000.00, 1, '#10b981'),
('Conta BFA', 'Corrente', 'BFA', 150000.00, 750000.00, 1, '#ef4444'),
('Poupança Sol', 'Poupanca', 'Banco Sol', 50000.00, 50000.00, 1, '#f59e0b');

-- Default Categories
INSERT INTO `categoria` (`nome`, `icone`, `cor`, `tipo`, `id_usuario`) VALUES 
('Salário Mensal', 'DollarSign', '#10b981', 'receita', 1),
('Consultoria Freelance', 'Briefcase', '#3b82f6', 'receita', 1),
('Aluguer de Imóvel', 'Home', '#6366f1', 'receita', 1),
('Supermercado', 'ShoppingBag', '#f59e0b', 'despesa', 1),
('Restaurantes', 'Utensils', '#f97316', 'despesa', 1),
('Transporte (Kandongueiro/Yango)', 'Car', '#64748b', 'despesa', 1),
('Saúde e Farmácia', 'Heart', '#ef4444', 'despesa', 1),
('Internet e Unidade', 'Wifi', '#06b6d4', 'despesa', 1),
('Educação', 'BookOpen', '#a855f7', 'despesa', 1);

-- Transactions Summary for Feb 2024
INSERT INTO `transacoes` (`descricao`, `valor`, `data`, `tipo`, `id_usuario`, `id_categoria`, `id_conta`, `status`) VALUES 
('Salário Líquido Jan', 450000.00, '2024-02-01', 'receita', 1, 1, 2, 'pago'),
('Compras Mensais Kero', 85000.50, '2024-02-03', 'despesa', 1, 4, 2, 'pago'),
('Recarga Unitel 5000', 5000.00, '2024-02-04', 'despesa', 1, 8, 1, 'pago'),
('Projecto Logo X', 35000.00, '2024-02-10', 'receita', 1, 2, 2, 'pago'),
('Jantar Ilha de Luanda', 18500.00, '2024-02-12', 'despesa', 1, 5, 2, 'pago'),
('Pagamento Faculdade', 45000.00, '2024-02-15', 'despesa', 1, 9, 2, 'pago'),
('Abastecimento Galp', 12000.00, '2024-02-18', 'despesa', 1, 6, 2, 'pago');

-- Budgets for Feb 2024
INSERT INTO `orcamentos` (`mes`, `ano`, `valor_limite`, `id_categoria`, `id_usuario`) VALUES 
(2, 2024, 100000.00, 4, 1),
(2, 2024, 25000.00, 5, 1),
(2, 2024, 15000.00, 8, 1);

-- Financial Goals
INSERT INTO `metas` (`nome`, `valor_alvo`, `valor_atual`, `prazo`, `icone`, `id_usuario`) VALUES 
('Reserva de Emergência', 1000000.00, 250000.00, '2024-12-31', 'Shield', 1),
('Novo iPhone 15', 850000.00, 120000.00, '2024-06-30', 'Smartphone', 1),
('Viagem para Namibe', 300000.00, 50000.00, '2024-09-15', 'Map', 1);

-- Cards linked to accounts
INSERT INTO `cartoes` (`nome_cartao`, `final_cartao`, `bandeira`, `validade`, `id_usuario`, `id_conta`) VALUES 
('Multicaixa BFA', '4512', 'Multicaixa', '05/26', 1, 2),
('Visa Gold', '9901', 'Visa', '11/27', 1, 3);

-- ------------------------------------------------------
-- 8. Table: relatorios (Generated Reports)
-- Stores every report the user generates (PDF, Excel, etc.)
-- ------------------------------------------------------
DROP TABLE IF EXISTS `relatorios`;
CREATE TABLE `relatorios` (
  `id_relatorio` int(11) NOT NULL AUTO_INCREMENT,
  `nome`         varchar(200) NOT NULL COMMENT 'Human-readable report name',
  `tipo`         enum('geral','receitas','despesas') NOT NULL DEFAULT 'geral' COMMENT 'Type of report',
  `periodo`      varchar(50) NOT NULL COMMENT 'Human label: Hoje, Este Mês, etc.',
  `periodo_valor` varchar(20) NOT NULL COMMENT 'Machine value: dia, semana, mes, ano, todos',
  `formato`      enum('PDF','EXCEL','PRINT') NOT NULL DEFAULT 'PDF' COMMENT 'Export format',
  `total_receitas` decimal(15,2) NOT NULL DEFAULT 0.00,
  `total_despesas` decimal(15,2) NOT NULL DEFAULT 0.00,
  `saldo_liquido`  decimal(15,2) NOT NULL DEFAULT 0.00,
  `total_transacoes` int(11) NOT NULL DEFAULT 0 COMMENT 'Number of transactions in this report',
  `total_actividades` int(11) NOT NULL DEFAULT 0 COMMENT 'Number of activity log entries in this report',
  `dados_json`   longtext DEFAULT NULL COMMENT 'JSON snapshot of the transactions array at the time of report generation',
  `gerado_em`    timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'When the report was generated',
  `id_usuario`   int(11) NOT NULL,
  PRIMARY KEY (`id_relatorio`),
  KEY `fk_relatorio_usuario` (`id_usuario`),
  KEY `idx_relatorio_tipo` (`tipo`),
  KEY `idx_relatorio_gerado` (`gerado_em`),
  CONSTRAINT `fk_relatorio_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT='Stores metadata and transaction snapshots for every generated report';

-- ------------------------------------------------------
-- 9. Table: actividades_sistema (System Activity Log)
-- Logs all meaningful actions across the application
-- ------------------------------------------------------
DROP TABLE IF EXISTS `actividades_sistema`;
CREATE TABLE `actividades_sistema` (
  `id_actividade` int(11) NOT NULL AUTO_INCREMENT,
  `descricao`     varchar(300) NOT NULL COMMENT 'Human-readable description of the action',
  `tipo`          enum('receita','despesa','login','sistema','conta','relatorio') NOT NULL DEFAULT 'sistema',
  `tela`          varchar(60) DEFAULT 'Sistema' COMMENT 'Screen/module where the action occurred',
  `valor`         decimal(15,2) DEFAULT NULL COMMENT 'Monetary value if relevant (e.g. income added)',
  `referencia_id` int(11) DEFAULT NULL COMMENT 'Optional ID of the related record (transaction, report, etc.)',
  `data`          timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'When the action occurred',
  `id_usuario`    int(11) NOT NULL,
  PRIMARY KEY (`id_actividade`),
  KEY `fk_actividade_usuario` (`id_usuario`),
  KEY `idx_actividade_tipo` (`tipo`),
  KEY `idx_actividade_data` (`data`),
  CONSTRAINT `fk_actividade_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT='Full audit trail: logins, income/expense CRUD, report generation, etc.';

-- ------------------------------------------------------
-- 10. Table: simulacoes_ratios (Regra 50/30/20)
-- ------------------------------------------------------
DROP TABLE IF EXISTS `simulacoes_ratios`;
CREATE TABLE `simulacoes_ratios` (
  `id_simulacao` int(11) NOT NULL AUTO_INCREMENT,
  `rendimento_mensal` decimal(15,2) NOT NULL,
  `necessidades` decimal(15,2) NOT NULL,
  `desejos` decimal(15,2) NOT NULL,
  `poupanca` decimal(15,2) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `criado_em` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_simulacao`),
  KEY `fk_ratios_usuario` (`id_usuario`),
  CONSTRAINT `fk_ratios_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------
-- 11. Table: simulacoes_projeccao (Projecção de Património)
-- ------------------------------------------------------
DROP TABLE IF EXISTS `simulacoes_projeccao`;
CREATE TABLE `simulacoes_projeccao` (
  `id_simulacao` int(11) NOT NULL AUTO_INCREMENT,
  `capital_inicial` decimal(15,2) NOT NULL,
  `poupanca_mensal` decimal(15,2) NOT NULL,
  `anos` int(3) NOT NULL,
  `taxa_juro` decimal(5,2) NOT NULL,
  `resultado_estimado` decimal(15,2) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `criado_em` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_simulacao`),
  KEY `fk_projeccao_usuario` (`id_usuario`),
  CONSTRAINT `fk_projeccao_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------
-- 12. Table: simulacoes_metas (Cálculo de Objetivos)
-- ------------------------------------------------------
DROP TABLE IF EXISTS `simulacoes_metas`;
CREATE TABLE `simulacoes_metas` (
  `id_simulacao` int(11) NOT NULL AUTO_INCREMENT,
  `nome_objetivo` varchar(100) DEFAULT 'Meu Objetivo',
  `valor_alvo` decimal(15,2) NOT NULL,
  `prazo_meses` int(4) NOT NULL,
  `poupanca_mensal_necessaria` decimal(15,2) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `criado_em` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_simulacao`),
  KEY `fk_metas_sim_usuario` (`id_usuario`),
  CONSTRAINT `fk_metas_sim_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------
-- 13. Table: historico_diario (Snapshots for Dashboard Chart)
-- ------------------------------------------------------
DROP TABLE IF EXISTS `historico_diario`;
CREATE TABLE `historico_diario` (
  `id_historico` int(11) NOT NULL AUTO_INCREMENT,
  `data` date NOT NULL,
  `total_entradas` decimal(15,2) DEFAULT 0.00,
  `total_saidas` decimal(15,2) DEFAULT 0.00,
  `patrimonio_total` decimal(15,2) DEFAULT 0.00,
  `id_usuario` int(11) NOT NULL,
  PRIMARY KEY (`id_historico`),
  UNIQUE KEY `idx_data_usuario` (`data`, `id_usuario`),
  KEY `fk_hist_diario_usuario` (`id_usuario`),
  CONSTRAINT `fk_hist_diario_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT='Snapshots diários para o gráfico de 3 linhas';

-- ------------------------------------------------------
-- Sample data: Reports & Activities
-- ------------------------------------------------------

-- Sample reports already generated
INSERT INTO `relatorios` (`nome`, `tipo`, `periodo`, `periodo_valor`, `formato`, `total_receitas`, `total_despesas`, `saldo_liquido`, `total_transacoes`, `total_actividades`, `dados_json`, `id_usuario`) VALUES
('Relatório Geral — Este Mês', 'geral', 'Este Mês', 'mes', 'PDF', 485000.00, 165500.50, 319499.50, 7, 3, NULL, 1),
('Relatório Só Receitas — Este Ano', 'receitas', 'Este Ano', 'ano', 'EXCEL', 485000.00, 0.00, 485000.00, 2, 1, NULL, 1);

-- Sample activity log
INSERT INTO `actividades_sistema` (`descricao`, `tipo`, `tela`, `valor`, `referencia_id`, `id_usuario`) VALUES
('Login efectuado por Administrador Geral', 'login', 'Login', NULL, NULL, 1),
('Receita adicionada: Salário Líquido Jan (Salário Mensal)', 'receita', 'Receitas', 450000.00, 1, 1),
('Despesa adicionada: Compras Mensais Kero (Supermercado)', 'despesa', 'Despesas', 85000.50, 2, 1),
('Relatório PDF gerado: Relatório Geral — Este Mês', 'relatorio', 'Relatórios', NULL, 1, 1),
('Despesa adicionada: Recarga Unitel 5000 (Internet e Unidade)', 'despesa', 'Despesas', 5000.00, 3, 1),
('Receita adicionada: Projecto Logo X (Consultoria Freelance)', 'receita', 'Receitas', 35000.00, 4, 1),
('Relatório EXCEL gerado: Relatório Só Receitas — Este Ano', 'relatorio', 'Relatórios', NULL, 2, 1);

