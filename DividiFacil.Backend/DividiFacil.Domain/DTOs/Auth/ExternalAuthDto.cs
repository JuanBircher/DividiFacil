namespace DividiFacil.Domain.DTOs.Auth
{
    public class ExternalAuthDto
    {
        public string Provider { get; set; } = string.Empty; // Google, Facebook
        public string IdToken { get; set; } = string.Empty;
    }
}