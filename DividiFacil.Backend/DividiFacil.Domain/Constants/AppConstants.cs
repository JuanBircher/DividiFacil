namespace DividiFacil.Domain.Constants
{
    public static class AppConstants
    {
        public static class Roles
        {
            public const string Admin = "Admin";
            public const string Miembro = "Miembro";
        }

        public static class Estados
        {
            public const string Pendiente = "Pendiente";
            public const string Confirmado = "Confirmado";
            public const string Cancelado = "Cancelado";
            public const string Pagado = "Pagado";
        }

        public static class CodigoAcceso
        {
            public const int LongitudCodigo = 8;
            public const string CaracteresPermitidos = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        }

        public static class Validaciones
        {
            public const int MaxLengthNombre = 100;
            public const int MaxLengthDescripcion = 500;
            public const int MaxLengthEmail = 255;
        }
    }
}