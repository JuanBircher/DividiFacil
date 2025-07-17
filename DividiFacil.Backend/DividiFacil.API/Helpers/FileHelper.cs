using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Threading.Tasks;

namespace DividiFacil.API.Helpers
{
    public static class FileHelper
    {
        public static async Task<string> SaveComprobanteAsync(IFormFile file, string rootPath, string subFolder = "comprobantes")
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("Archivo inválido");

            var folderPath = Path.Combine(rootPath, "wwwroot", subFolder);
            if (!Directory.Exists(folderPath))
                Directory.CreateDirectory(folderPath);

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(folderPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Retornar la ruta relativa para guardar en la base de datos
            return $"/{subFolder}/{fileName}";
        }
    }
}
