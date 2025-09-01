import { Project, SyntaxKind } from "ts-morph";
import { globby } from "globby";
import path from "node:path";

export async function scanAngularComponents(root: string) {
  const project = new Project({ skipAddingFilesFromTsConfig: true });
  const files = await globby(["**/*.component.ts"], { cwd: root, absolute: true, gitignore: true });
  files.forEach(f => project.addSourceFileAtPath(f));

  const results: any[] = [];

  for (const sf of project.getSourceFiles()) {
    const text = sf.getFullText();
    const classes = sf.getClasses();
    for (const cls of classes) {
      const deco = cls.getDecorators().find(d => d.getName() === "Component");
      if (!deco) continue;

      const arg = deco.getCallExpression()?.getArguments()[0];
      let selector = "";
      if (arg && arg.getKind() === SyntaxKind.ObjectLiteralExpression) {
        const obj = arg.asKindOrThrow(SyntaxKind.ObjectLiteralExpression);
        const selProp = obj.getProperty("selector");
        if (selProp && selProp.getKind() === SyntaxKind.PropertyAssignment) {
          const val = selProp.getFirstChildByKind(SyntaxKind.StringLiteral);
          if (val) selector = val.getLiteralValue();
        }
      }

      const inputs = cls.getProperties()
        .filter(p => p.getDecorators().some(d => d.getName() === "Input"))
        .map(p => ({ name: p.getName(), type: p.getType().getText() }));

      const outputs = cls.getProperties()
        .filter(p => p.getDecorators().some(d => d.getName() === "Output"))
        .map(p => ({ name: p.getName(), type: p.getType().getText() }));

      const ctor = cls.getConstructors()[0];
      const providers = (ctor ? ctor.getParameters().map(p => p.getType().getText()) : []);

      results.push({
        name: cls.getName() || path.basename(sf.getFilePath()),
        selector,
        inputs,
        outputs,
        providers,
        filePath: path.relative(root, sf.getFilePath()).replace(/\\/g,'/'),
        raw: text
      });
    }
  }
  return results;
}
