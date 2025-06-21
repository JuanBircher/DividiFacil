-- Crear la base de datos
USE master;
GO

IF EXISTS (SELECT * FROM sys.databases WHERE name = 'DividiFacil')
BEGIN
    ALTER DATABASE DividiFacil SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE DividiFacil;
END
GO

CREATE DATABASE DividiFacil;
GO

USE DividiFacil;
GO