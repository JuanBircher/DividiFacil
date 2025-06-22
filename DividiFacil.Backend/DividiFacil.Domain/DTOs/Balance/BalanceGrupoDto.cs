using System;
using System.Collections.Generic;

namespace DividiFacil.Domain.DTOs.Balance
{
    public class BalanceGrupoDto
    {
        public Guid IdGrupo { get; set; }
        public string NombreGrupo { get; set; }
        public decimal TotalGastos { get; set; }
        public List<BalanceUsuarioDto> BalancesUsuarios { get; set; } = new();
        public List<DeudaSimplificadaDto> DeudasSimplificadas { get; set; } = new();
    }
}