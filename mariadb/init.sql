-- ./mariadb/init.sql

CREATE DATABASE IF NOT EXISTS usuariosT2_db;

CREATE USER IF NOT EXISTS 'devuser'@'%' IDENTIFIED BY 'superseguro123';

GRANT ALL PRIVILEGES ON usuariosT2_db.* TO 'devuser'@'%' WITH GRANT OPTION;

FLUSH PRIVILEGES;
