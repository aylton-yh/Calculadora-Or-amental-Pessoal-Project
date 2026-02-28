import mysql from 'mysql2/promise';

async function run() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'realbalance'
    });

    await connection.beginTransaction();
    try {
        console.log('--- MIGRATION START ---');
        console.log('Creating new category tables...');
        await connection.execute(`
      CREATE TABLE IF NOT EXISTS categoria_receita (
        id_categoria_receita int(11) NOT NULL AUTO_INCREMENT,
        nome varchar(60) NOT NULL,
        icone varchar(50) DEFAULT 'Circle',
        cor varchar(20) DEFAULT '#10b981',
        id_usuario int(11) DEFAULT NULL,
        PRIMARY KEY (id_categoria_receita),
        KEY fk_cat_rec_usuario (id_usuario),
        CONSTRAINT fk_cat_rec_usuario FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

        await connection.execute(`
      CREATE TABLE IF NOT EXISTS categoria_despesa (
        id_categoria_despesa int(11) NOT NULL AUTO_INCREMENT,
        nome varchar(60) NOT NULL,
        icone varchar(50) DEFAULT 'Circle',
        cor varchar(20) DEFAULT '#10b981',
        id_usuario int(11) DEFAULT NULL,
        PRIMARY KEY (id_categoria_despesa),
        KEY fk_cat_desp_usuario (id_usuario),
        CONSTRAINT fk_cat_desp_usuario FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

        console.log('Migrating data...');
        const [oldCats] = await connection.execute('SELECT * FROM categoria');
        console.log(`Found ${oldCats.length} categories to migrate.`);

        const recMap = {};
        const despMap = {};

        for (const cat of oldCats) {
            if (cat.tipo === 'receita') {
                const [res] = await connection.execute(
                    'INSERT INTO categoria_receita (nome, icone, cor, id_usuario) VALUES (?, ?, ?, ?)',
                    [cat.nome, cat.icone, cat.cor, cat.id_usuario]
                );
                recMap[cat.id_categoria] = res.insertId;
            } else {
                const [res] = await connection.execute(
                    'INSERT INTO categoria_despesa (nome, icone, cor, id_usuario) VALUES (?, ?, ?, ?)',
                    [cat.nome, cat.icone, cat.cor, cat.id_usuario]
                );
                despMap[cat.id_categoria] = res.insertId;
            }
        }

        console.log('Updating transacoes table...');
        await connection.execute('ALTER TABLE transacoes ADD COLUMN id_categoria_receita INT NULL, ADD COLUMN id_categoria_despesa INT NULL');

        for (const [oldId, newId] of Object.entries(recMap)) {
            await connection.execute('UPDATE transacoes SET id_categoria_receita = ? WHERE id_categoria = ?', [newId, oldId]);
        }
        for (const [oldId, newId] of Object.entries(despMap)) {
            await connection.execute('UPDATE transacoes SET id_categoria_despesa = ? WHERE id_categoria = ?', [newId, oldId]);
        }

        console.log('Updating orcamentos table...');
        await connection.execute('ALTER TABLE orcamentos ADD COLUMN id_categoria_despesa_new INT NULL');
        for (const [oldId, newId] of Object.entries(despMap)) {
            await connection.execute('UPDATE orcamentos SET id_categoria_despesa_new = ? WHERE id_categoria = ?', [newId, oldId]);
        }

        console.log('Cleaning up old constraints and columns...');
        try { await connection.execute('ALTER TABLE transacoes DROP FOREIGN KEY fk_transacao_categoria'); } catch (e) { console.log('Notice: fk_transacao_categoria not found'); }
        try { await connection.execute('ALTER TABLE orcamentos DROP FOREIGN KEY fk_orcamentos_categoria'); } catch (e) { console.log('Notice: fk_orcamentos_categoria not found'); }

        await connection.execute('ALTER TABLE transacoes DROP COLUMN id_categoria');
        await connection.execute('ALTER TABLE orcamentos DROP COLUMN id_categoria');
        await connection.execute('ALTER TABLE orcamentos CHANGE COLUMN id_categoria_despesa_new id_categoria_despesa INT NOT NULL');

        console.log('Adding new foreign keys...');
        await connection.execute('ALTER TABLE transacoes ADD CONSTRAINT fk_trans_cat_rec FOREIGN KEY (id_categoria_receita) REFERENCES categoria_receita (id_categoria_receita) ON DELETE SET NULL');
        await connection.execute('ALTER TABLE transacoes ADD CONSTRAINT fk_trans_cat_desp FOREIGN KEY (id_categoria_despesa) REFERENCES categoria_despesa (id_categoria_despesa) ON DELETE SET NULL');
        await connection.execute('ALTER TABLE orcamentos ADD CONSTRAINT fk_orc_cat_desp FOREIGN KEY (id_categoria_despesa) REFERENCES categoria_despesa (id_categoria_despesa) ON DELETE CASCADE');

        console.log('Dropping old category table...');
        await connection.execute('DROP TABLE categoria');

        await connection.commit();
        console.log('--- MIGRATION COMPLETED SUCCESSFULLY ---');
        process.exit(0);
    } catch (err) {
        console.error('--- MIGRATION FAILED ---');
        console.error(err);
        await connection.rollback();
        process.exit(1);
    } finally {
        await connection.end();
    }
}

run();
