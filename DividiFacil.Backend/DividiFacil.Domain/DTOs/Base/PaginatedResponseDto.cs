using System.Collections.Generic;

namespace DividiFacil.Domain.DTOs.Base
{
    public class PaginatedResponseDto<T> : ResponseDto
    {
        public IEnumerable<T> Items { get; set; } = new List<T>();
        public int TotalItems { get; set; }
        public int PaginaActual { get; set; }
        public int ItemsPorPagina { get; set; }
        public int TotalPaginas { get; set; }
    }
}