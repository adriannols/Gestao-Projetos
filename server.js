const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

// Configurar o servidor Express
const app = express();
const port = 3000;

// Middleware para parsear JSON e lidar com CORS
app.use(cors());
app.use(express.json());

// Configurações de conexão com o banco PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'gestao_tarefas',
  password: '12345',
  port: 5432,
});

// Endpoint para cadastrar projetos
app.post('/projetos', async (req, res) => {
  const { prj_descricao, prj_status } = req.body;

  // Verifica se o status é uma sigla válida
  const validStatuses = ['A', 'P', 'H', 'F'];
  if (!validStatuses.includes(prj_status)) {
    return res.status(400).json({ error: 'Status inválido. Use A, P, H ou F.' });
  }

  try {
    // Inserir o projeto no banco de dados
    const result = await pool.query(
      'INSERT INTO prj_gestaoprojeto (prj_descricao, prj_status) VALUES ($1, $2) RETURNING *',
      [prj_descricao, prj_status]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao cadastrar o projeto' });
  }
});

// Endpoint para atualizar o status e adicionar a data de conclusão, se necessário
app.put('/projetos/:id', async (req, res) => {
  const { id } = req.params;
  const { prj_status } = req.body;

  try {
    let query = 'UPDATE prj_gestaoprojeto SET prj_status = $1';
    let params = [prj_status];

    // Verifica se o status é 'Finalizado' e adiciona a data de conclusão
    if (prj_status === 'F') { // Ajustado para usar a sigla
      query += ', prj_dataconclusao = current_timestamp';
    }

    query += ' WHERE prj_id = $2 RETURNING *';
    params.push(id); // Adiciona o id ao array de parâmetros

    const result = await pool.query(query, params);

    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Projeto não encontrado' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar o projeto' });
  }
});

app.post('/tarefas', async (req, res) => {
  const { trf_titulo, trf_descricao, projeto_id } = req.body;  

  try {
    // Verifica se o projeto existe antes de inserir a tarefa
    const projetoExiste = await pool.query('SELECT prj_id FROM prj_gestaoprojeto WHERE prj_id = $1', [projeto_id]);

    if (projetoExiste.rowCount === 0) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    // Inserir a nova tarefa com o projeto associado
    const result = await pool.query(
      'INSERT INTO trf_gestaotarefa (trf_titulo, trf_descricao, prj_id) VALUES ($1, $2, $3) RETURNING *',
      [trf_titulo, trf_descricao, projeto_id]  // Removido o quarto parâmetro
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao cadastrar tarefa' });
  }
});


// Endpoint para listar todos os projetos
app.get('/projetos', async (req, res) => {
  try {
    const result = await pool.query('SELECT prj_id, prj_descricao FROM prj_gestaoprojeto'); // Ajustado para pegar o prj_id
    res.json(result.rows);  // Retornar os projetos como JSON
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar projetos' });
  }
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
