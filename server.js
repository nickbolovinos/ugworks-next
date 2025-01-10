// server.js
const fs = require('fs');
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const { createHandler } = require("graphql-http/lib/use/express")
const { buildSchema } = require("graphql")
require('dotenv').config();

const app = express();
const DB_NAME = 'ugworks';
const PORT = 3500;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL Connection Pool
const pool = mysql.createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	multipleStatements: true, // Enable multiple statements
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0
});

// Create the schema
const createSchemaQuery = `CREATE SCHEMA IF NOT EXISTS \`${DB_NAME}\``;
// Create the users table
const createTableQuery = `
	CREATE TABLE IF NOT EXISTS \`${DB_NAME}\`.\`users\` (
		\`id\` INT AUTO_INCREMENT PRIMARY KEY,
		\`email\` VARCHAR(255) NOT NULL,
		\`password\` varchar(255) NOT NULL
	);
	CREATE TABLE IF NOT EXISTS \`${DB_NAME}\`.\`stocks\` (
		\`id\` INT AUTO_INCREMENT PRIMARY KEY,
		\`symbol\` VARCHAR(255) NOT NULL,
		\`asset\` VARCHAR(255) NOT NULL,
		\`sharesOwned\` INT,
		\`priceBought\` INT,
		\`account\` VARCHAR(255) NOT NULL,
		\`virtual\` VARCHAR(255) NOT NULL
	);
`;

pool.query(createSchemaQuery, (err) => {
	if (err) {
		console.error('Error creating schema:', err.message);
		return
	}
	console.log('Schema created or exists!');

	pool.query(createTableQuery, (err) => {
		if (err) {
			console.error('Error creating table:', err.message);
			return
		}
		console.log('Table created or exists!');
	});
});

// Construct a schema, using GraphQL schema language
const schema = buildSchema(`
	type Query {
		getCards(aid: Int!): [Card]
	}
	type Card {
		pid: Int
		filename: String
		filepath: String
		title: String
		caption: String
		user1: String
	}
	type Variables {
		aid: Int
	}
`)

// GraphQL Resolvers
const resolvers = {
	getCards: async (params) => {
		try {
			const query = `SELECT pid, filename, filepath, title, caption, user1 FROM ${DB_NAME}.gallery WHERE aid = ? ORDER BY ctime DESC`;
			const [results] = await pool.promise().query(query, [params.aid]);
			return results;
		} catch (err) {
			console.error('Database query error:', err.message);
			throw new Error('Failed to fetch cards');
		}
	}
};


// Server
app.all(
	'/api/graphql',
	createHandler({
		schema,
		rootValue: resolvers,
		graphiql: true, // Enable GraphiQL for testing queries
	})
);

// Start Server
app.listen(PORT, () => {
	console.log(`GraphQL MySQL Server running at //localhost:${PORT}`);
});
