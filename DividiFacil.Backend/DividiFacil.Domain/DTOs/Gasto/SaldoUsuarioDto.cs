using System;

namespace DividiFacil.Domain.DTOs.Gasto
{
    public class SaldoUsuarioDto
    {
        public Guid IdUsuario { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string? UrlImagen { get; set; }
        public decimal MontoDeuda { get; set; }   // Lo que debe
        public decimal MontoAFavor { get; set; }  // Lo que le deben
        public decimal SaldoNeto { get; set; }    // La diferencia
    }
}