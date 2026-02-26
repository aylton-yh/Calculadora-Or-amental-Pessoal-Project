import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export const registerUser = async (req, res) => {
    const { nome_completo, nome_usuario, email, contacto, sexo, estado_civil, BI, endereço, palavra_passe, foto_perfil } = req.body;

    try {
        const [rows] = await pool.query('SELECT * FROM usuario WHERE email = ? OR nome_usuario = ?', [email, nome_usuario]);
        if (rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(palavra_passe, salt);

        const [result] = await pool.query(
            'INSERT INTO usuario (nome_completo, nome_usuario, email, contacto, sexo, estado_civil, BI, endereço, palavra_passe, foto_perfil) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [nome_completo, nome_usuario, email, contacto, sexo, estado_civil, BI, endereço, hashedPassword, foto_perfil || null]
        );

        res.status(201).json({
            user: {
                id_usuario: result.insertId,
                nome_completo,
                nome_usuario,
                email,
                contacto,
                sexo,
                estado_civil,
                BI,
                endereço,
                foto_perfil: foto_perfil || null,
            },
            token: generateToken(result.insertId)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const loginUser = async (req, res) => {
    const { nome_usuario, palavra_passe } = req.body;

    try {
        const [rows] = await pool.query('SELECT * FROM usuario WHERE nome_usuario = ?', [nome_usuario]);
        const user = rows[0];

        if (!user) {
            console.log(`[LOGIN] User not found: ${nome_usuario}`);
            return res.status(401).json({ message: 'Usuário não encontrado.' });
        }

        const isMatch = await bcrypt.compare(palavra_passe, user.palavra_passe);
        if (isMatch) {
            console.log(`[LOGIN] Success for user: ${nome_usuario}`);
            await pool.query('UPDATE usuario SET ultimo_acesso = CURRENT_TIMESTAMP WHERE id_usuario = ?', [user.id_usuario]);

            const responseBody = {
                user: {
                    id_usuario: user.id_usuario,
                    nome_completo: user.nome_completo,
                    nome_usuario: user.nome_usuario,
                    email: user.email,
                    contacto: user.contacto,
                    sexo: user.sexo,
                    estado_civil: user.estado_civil,
                    BI: user.BI,
                    endereço: user.endereço,
                    foto_perfil: user.foto_perfil,
                    moeda_padrao: user.moeda_padrao,
                    idioma: user.idioma,
                    tema_sistema: user.tema_sistema,
                    criado_em: user.criado_em,
                },
                token: generateToken(user.id_usuario)
            };
            console.log(`[TRACE-X1] Enviando resposta com estrutura {user, token} para: ${nome_usuario}`);
            res.json(responseBody);
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getProfile = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM usuario WHERE id_usuario = ?', [req.user.id]);
        const user = rows[0];

        if (user) {
            delete user.palavra_passe;
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateProfile = async (req, res) => {
    const { nome_completo, nome_usuario, email, contacto, sexo, estado_civil, BI, endereço, foto_perfil } = req.body;

    try {
        console.log(`[PROFILE] Updating user ${req.user.id}, Photo length: ${foto_perfil ? foto_perfil.length : 0}`);
        
        await pool.query(
            'UPDATE usuario SET nome_completo = ?, nome_usuario = ?, email = ?, contacto = ?, sexo = ?, estado_civil = ?, BI = ?, endereço = ?, foto_perfil = ? WHERE id_usuario = ?',
            [nome_completo, nome_usuario, email, contacto, sexo, estado_civil, BI, endereço, foto_perfil, req.user.id]
        );
        console.log(`[PROFILE] DB Update successful for user ${req.user.id}`);

        const [rows] = await pool.query('SELECT * FROM usuario WHERE id_usuario = ?', [req.user.id]);
        const user = rows[0];
        delete user.palavra_passe;

        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        console.error('CRITICAL ERROR UPDATING PROFILE:', {
            error: error.message,
            code: error.code,
            sqlMessage: error.sqlMessage,
            stack: error.stack
        });
        res.status(500).json({
            message: `Erro na base de dados: ${error.sqlMessage || error.message}`,
            detail: error.code
        });
    }
};

export const updatePreferences = async (req, res) => {
    const { currency, language, theme } = req.body;

    try {
        await pool.query(
            'UPDATE usuario SET moeda_padrao = ?, idioma = ?, tema_sistema = ? WHERE id_usuario = ?',
            [currency, language, theme, req.user.id]
        );

        const [rows] = await pool.query('SELECT * FROM usuario WHERE id_usuario = ?', [req.user.id]);
        const user = rows[0];
        delete user.palavra_passe;

        res.json({ message: 'Preferências actualizadas com sucesso', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
