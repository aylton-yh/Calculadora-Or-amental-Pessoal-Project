import pool from './src/config/db.js';

async function migrate() {
    console.log('🚀 Iniciando migração da Base de Dados...');

    try {
        const connection = await pool.getConnection();

        console.log('⏳ Atualizando tabela usuario (foto_perfil e sexo)...');
        await connection.query(`
            ALTER TABLE usuario 
            MODIFY COLUMN foto_perfil LONGTEXT NULL,
            MODIFY COLUMN sexo ENUM('M', 'F', 'O') NOT NULL;
        `);

        console.log('🔐 Garantindo que senhas padrão estão encriptadas...');
        const bcrypt = await import('bcryptjs');
        const salt = await bcrypt.default.genSalt(10);
        
        const adminHash = await bcrypt.default.hash('admin123', salt);
        const marioHash = await bcrypt.default.hash('20242024', salt);

        await connection.query('UPDATE usuario SET palavra_passe = ? WHERE nome_usuario = ? AND (palavra_passe = "admin123" OR LENGTH(palavra_passe) < 20)', [adminHash, 'admin']);
        await connection.query('UPDATE usuario SET palavra_passe = ? WHERE nome_usuario = ? AND (palavra_passe = "20242024" OR LENGTH(palavra_passe) < 20)', [marioHash, 'mariosantos']);

        console.log('✅ Migração concluída com sucesso!');
        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro durante a migração:', error.message);
        process.exit(1);
    }
}

migrate();
