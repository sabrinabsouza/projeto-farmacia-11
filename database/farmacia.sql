CREATE DATABASE IF NOT EXISTS farmacia
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE farmacia;

CREATE TABLE IF NOT EXISTS medicamento (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  laboratorio VARCHAR(100) NOT NULL,
  preco DECIMAL(10,2) NOT NULL
);

INSERT INTO medicamento (nome, laboratorio, preco) VALUES
  ('Dipirona 500mg', 'EMS', 8.90),
  ('Paracetamol 750mg', 'Medley', 12.50),
  ('Amoxicilina 500mg', 'Eurofarma', 29.90);