CREATE DATABASE  IF NOT EXISTS `calculadoraorcamental` /*!40100 DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci */;
USE `calculadoraorcamental`;

DROP TABLE IF EXISTS `categoria`;

CREATE TABLE `categoria` (
  `idCategoria` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(60) NOT NULL,
  `Usuario` int(11) DEFAULT NULL,
  PRIMARY KEY (`idCategoria`),
  KEY `Usuario` (`Usuario`),
  CONSTRAINT `categoria_ibfk_1` FOREIGN KEY (`Usuario`) REFERENCES `usuario` (`idUsuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;


LOCK TABLES `categoria` WRITE;

UNLOCK TABLES;


DROP TABLE IF EXISTS `despesas`;

CREATE TABLE `despesas` (
  `idDespesas` int(11) NOT NULL AUTO_INCREMENT,
  `Descricao` varchar(70) DEFAULT NULL,
  `valor` decimal(50,2) DEFAULT NULL,
  `dataDes` date DEFAULT NULL,
  `categoria` varchar(60) DEFAULT NULL,
  `Usuario` int(11) DEFAULT NULL,
  `CategoriaFK` int(11) DEFAULT NULL,
  PRIMARY KEY (`idDespesas`),
  KEY `Usuario` (`Usuario`),
  KEY `CategoriaFK` (`CategoriaFK`),
  CONSTRAINT `despesas_ibfk_1` FOREIGN KEY (`Usuario`) REFERENCES `usuario` (`idUsuario`),
  CONSTRAINT `despesas_ibfk_2` FOREIGN KEY (`CategoriaFK`) REFERENCES `categoria` (`idCategoria`),
  CONSTRAINT `despesas_ibfk_3` FOREIGN KEY (`CategoriaFK`) REFERENCES `categoria` (`idCategoria`),
  CONSTRAINT `despesas_ibfk_4` FOREIGN KEY (`CategoriaFK`) REFERENCES `categoria` (`idCategoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

LOCK TABLES `despesas` WRITE;

UNLOCK TABLES;


DROP TABLE IF EXISTS `receitas`;

CREATE TABLE `receitas` (
  `idReceitas` int(11) NOT NULL AUTO_INCREMENT,
  `Descricao` varchar(70) DEFAULT NULL,
  `valor` decimal(50,2) DEFAULT NULL,
  `dataRec` date DEFAULT NULL,
  `Usuario` int(11) DEFAULT NULL,
  PRIMARY KEY (`idReceitas`),
  KEY `Usuario` (`Usuario`),
  CONSTRAINT `receitas_ibfk_1` FOREIGN KEY (`Usuario`) REFERENCES `usuario` (`idUsuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

LOCK TABLES `receitas` WRITE;

UNLOCK TABLES;

DROP TABLE IF EXISTS `usuario`;

CREATE TABLE `usuario` (
  `idUsuario` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(50) NOT NULL,
  `senha` varchar(60) NOT NULL,
  PRIMARY KEY (`idUsuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;


LOCK TABLES `usuario` WRITE;

UNLOCK TABLES;

