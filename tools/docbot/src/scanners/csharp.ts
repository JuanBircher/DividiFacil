import { globby } from "globby";
import fs from "node:fs/promises";
import path from "node:path";

const ctrlRegex = /class\s+(\w+Controller)\b[\s\S]*?\{/g;
const routeBaseRegex = /\[Route\("([^"]+)"\)\]|\[Route\(\s*nameof\(([^)]+)\)\s*\)\]/;
const httpMethodRegex = /\[(HttpGet|HttpPost|HttpPut|HttpDelete|HttpPatch)(?:\("([^"]*)"\))?\]\s*(?:public|private|protected)?\s*(?:async\s+)?(?:[\w<>\[\],\s]+)\s+(\w+)\s*\(([^)]*)\)/g;
const methodRegex = /public\s+(\w+)\s+(\w+)\((.*?)\)/g;


export async function scanCSharpControllers(root: string) {
  const files = await globby(["**/*Controller.cs"], { cwd: root, absolute: true, gitignore: true });
  const results: any[] = [];

  for (const file of files) {
    const src = await fs.readFile(file, "utf8");
    let mCtrl;
    // buscar nombre de la clase de controller
    while ((mCtrl = ctrlRegex.exec(src)) !== null) {
      const name = mCtrl[1];
      const headerSlice = src.slice(0, mCtrl.index + mCtrl[0].length);
      const baseRouteMatch = headerSlice.match(routeBaseRegex);
      const baseRoute = baseRouteMatch?.[1] || baseRouteMatch?.[2] || "[controller]";

      const endpoints: any[] = [];
      let m;
      while ((m = httpMethodRegex.exec(src)) !== null) {
        const httpMethod = m[1].toUpperCase();
        const subRoute = m[2] || "";
        const actionName = m[3];
        const params = m[4].trim();
        endpoints.push({
          httpMethod,
          route: `/${baseRoute.replace('[controller]', name.replace(/Controller$/,''))}/${subRoute}`.replace(/\/+/g,'/'),
          actionName,
          params,
          summary: '',
          returns: ''
        });
      }

      results.push({
        name,
        baseRoute: `/${baseRoute.replace('[controller]', name.replace(/Controller$/,''))}`,
        filePath: path.relative(root, file).replace(/\\/g,'/'),
        endpoints,
        raw: src
      });
    }
  }

  return results;
}

// Suponiendo que tienes una lista de controllers con { name, code }
controllers.forEach(controller => {
  console.debug("Procesando controller:", controller.name); // Log de debug

  let mdContent = `# ${controller.name}\n\n## Métodos\n`;

  let match;
  while ((match = methodRegex.exec(controller.code)) !== null) {
    const returnType = match[1];
    const methodName = match[2];
    const paramsRaw = match[3];
    const params = paramsRaw.trim()
      ? paramsRaw.split(',').map(p => {
          // Ejemplo: "int id" o "string nombre"
          const [type, name] = p.trim().split(' ');
          return `${name}: ${type}`;
        }).join(', ')
      : 'Sin parámetros';

    mdContent += `\n### ${methodName}\n**Parámetros:** ${params}\n**Retorna:** ${returnType}\n**Descripción:** [pendiente]\n`;
  }

  // Aquí deberías guardar mdContent en el archivo correspondiente
  // Por ejemplo:
  // fs.writeFileSync(`docs/backend/controllers/${controller.name}.md`, mdContent);
});
