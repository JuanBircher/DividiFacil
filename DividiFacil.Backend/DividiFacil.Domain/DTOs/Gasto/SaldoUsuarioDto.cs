using System;

namespace DividiFacil.Domain.DTOs.Gasto
{
    public class SaldoUsuarioDto
    {
        public Guid IdUsuario { get; set; }
        public string NombreUsuario { get; set; } = string.Empty;
        public string? ImagenPerfil { get; set; }
        public decimal TotalPagado { get; set; }
        public decimal TotalAPagar { get; set; }
        public decimal Saldo { get; set; } // Positivo: Le deben, Negativo: Debe
    }
}