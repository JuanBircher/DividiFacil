using System;

namespace DividiFacil.Domain.DTOs.Base
{
    public class PaginacionDto
    {
        private int _tamanioPagina = 10;
        private const int MaximoPagina = 50;

        public int Pagina { get; set; } = 1;

        public int TamanioPagina
        {
            get => _tamanioPagina;
            set => _tamanioPagina = (value > MaximoPagina) ? MaximoPagina : value;
        }
    }
}