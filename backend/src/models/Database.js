// Arquivo: ControleDocenteFaltosos/backend/src/models/Database.js
// Função: Conexão com SQLite e criação das tabelas

const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

class Database {
  static async conectar() {
    const dbPath = path.resolve(__dirname, '..', '..', 'data', 'sistema.db');
    
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Criar tabelas se não existirem
    await db.exec(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        cpf TEXT UNIQUE NOT NULL,
        senha_hash TEXT NOT NULL,
        perfil_id INTEGER,
        master BOOLEAN DEFAULT 0,
        ativo BOOLEAN DEFAULT 1,
        data_cadastro DATE DEFAULT CURRENT_DATE
      );

      CREATE TABLE IF NOT EXISTS docentes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        aulas REAL NOT NULL,
        ativo BOOLEAN DEFAULT 1,
        disciplinas TEXT NOT NULL,
        cursos TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS faltas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        docente_id INTEGER NOT NULL,
        disciplina TEXT NOT NULL,
        curso TEXT NOT NULL,
        quantidade_faltas INTEGER NOT NULL,
        justificada BOOLEAN DEFAULT 0,
        justificativa TEXT,
        observacoes TEXT,
        data DATE NOT NULL,
        horario_inicio TEXT NOT NULL,
        horario_fim TEXT NOT NULL,
        FOREIGN KEY (docente_id) REFERENCES docentes(id)
      );

      CREATE TABLE IF NOT EXISTS disciplinas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT UNIQUE NOT NULL
      );

      CREATE TABLE IF NOT EXISTS cursos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT UNIQUE NOT NULL
      );

      CREATE TABLE IF NOT EXISTS justificativas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        descricao TEXT UNIQUE NOT NULL
      );
    `);

    console.log('✅ Banco de dados SQLite conectado e tabelas criadas');
    return db;
  }
}

module.exports = Database;