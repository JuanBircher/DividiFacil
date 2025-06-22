namespace DividiFacil.Domain.DTOs.Base
{
    public class ResponseDto
    {
        public bool Exito { get; set; } = true;
        public string? Mensaje { get; set; }
    }

    public class ResponseDto<T> : ResponseDto
    {
        public T? Data { get; set; }
    }
}