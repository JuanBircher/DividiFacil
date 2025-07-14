# Script para automatizar la carga de datos de prueba en DividiFacil
# Modifica los valores de servidor, usuario y base de datos según corresponda

$server = "JM2804"           # Cambia por el nombre de tu servidor SQL
$database = "DividiFacil"    # Cambia si tu base tiene otro nombre
$user = "juanb"              # Cambia por tu usuario SQL (o elimina para autenticación Windows)
$password = "Portulaco.88"   # Cambia por tu contraseña SQL (o elimina para autenticación Windows)
$scriptCarga = "c:\\Users\\juanb\\OneDrive\\Escritorio\\Programar\\Desarrollando\\DividiFacil\\scripts\\09_InsertDatosReales_Pruebas.sql"
$scriptValidacion = "c:\\Users\\juanb\\OneDrive\\Escritorio\\Programar\\Desarrollando\\DividiFacil\\scripts\\10_Validaciones_Completas.sql"
$resultadoValidacion = "c:\\Users\\juanb\\OneDrive\\Escritorio\\Programar\\Desarrollando\\DividiFacil\\scripts\\resultado_validaciones.txt"

# Si usas autenticación de Windows, usa -E en vez de -U y -P

Write-Host "Ejecutando carga de datos de prueba en $database..."

# Ejecutar el script directamente
sqlcmd -S $server -d $database -U $user -P $password -i $scriptCarga

Write-Host "Carga de datos finalizada."

Write-Host "Ejecutando validaciones..."
sqlcmd -S $server -d $database -U $user -P $password -i $scriptValidacion -o $resultadoValidacion
Write-Host "Validaciones finalizadas. Revisa el archivo: $resultadoValidacion"
