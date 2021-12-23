// import type { Type } from 'ts-morph';
// import { Project }  from 'ts-morph'
// import { TypeFormatFlags } from "typescript";


// async function generateClientLibraries(outputDir: string) {
//   const project = new Project({ tsConfigFilePath: ''})
// } 
// const project = new Project({
//   tsConfigFilePath: './tsconfig.json',
// });

// // type Output = { str: string };

// // function stringifyTypeAlias(builder: StringBuilder, type: Type) {
// //   const symbol = type.getSymbolOrThrow();
// //   const isUnion = type.isUnion();
// //   builder.write(`export type ${symbol.getName()} = `);
// //   const children = isUnion ? type.getUnionTypes() : type.getIntersectionTypes();

  
// // }

// function stringifyType(type: Type): string {
//   return type.getText(undefined, TypeFormatFlags.NodeBuilderFlagsMask | TypeFormatFlags.NoTruncation)
// }

// project.addSourceFileAtPath('types/api.ts');
// project.addSourceFileAtPath('types/models.ts');
// const diagnostics = project.getPreEmitDiagnostics();
// const checker = project.getTypeChecker();
// console.log(project.formatDiagnosticsWithColorAndContext(diagnostics));

// const modelsSourceFile = project.getSourceFileOrThrow('types/models.ts');
// const modelsText = modelsSourceFile.getFullText();


// const sourceFile = project.getSourceFileOrThrow('types/api.ts');
// const alias = sourceFile.getTypeAliasOrThrow(a => a.hasExportKeyword()) || sourceFile.getInterface(a => a.hasExportKeyword());
// const aliasType = alias.getType();

// const aliasName = alias.getName();
// const props = aliasType.getProperties();
// const { read, write } = stringBuilder();
// write(`export type ${aliasName} = {\n`);
// props.forEach(propSymbol => {
//   write(`  ${propSymbol.getEscapedName()}: {\n`);
//   const propType = checker.getTypeOfSymbolAtLocation(propSymbol, alias);
//   const props2 = propType.getProperties();
//   props2.forEach(propSymbol2 => {
//     write(`    ${propSymbol2.getEscapedName()}: {\n`);
//     const propType2 = checker.getTypeOfSymbolAtLocation(propSymbol2, alias);
//     const props3 = propType2.getProperties();
//     props3.forEach(propSymbol3 => {
//       let propType3 = checker.getTypeOfSymbolAtLocation(propSymbol3, alias);
//       const propName = propSymbol3.getEscapedName() as 'query' | 'response' | 'payload';
//       write(`      ${propSymbol3.getEscapedName()}: `);
//       const typeStr = stringifyType(propType3);
//       switch(propName) {
//         case 'query':
//           if (typeStr === 'QueryType<QueryParams> | undefined') write(`void`);
//           else {
//             const props = typeStr.match(/[a-zA-Z]+: '[^']+/g);
//             if (!props) write(`void`);
//             else {
//               write('{ ')
//               write(props.map(propStr => {
//                 const prop = propStr.replace(/\:[\s\S]+$/, '');
//                 const optional = /\?/.test(propStr) ? '?' : ''
//                 const type = propStr.replace(/^[^']+'/, '').replace(/\?/, '');
//                 return `${prop}${optional}: ${type}`;
//               }).join(', '));
//               write(' }')
//             }
//           }
//           break;
//         case 'response':
//           write(typeStr);
//           break;
//         case 'payload':
//           write(typeStr === 'unknown' ? 'void' : typeStr);
//           break;
//         default:
//           throw Error('Invalid property found: ' + propName);
//       }
//       write(`,\n`);
//     })
//     write('  ,\n')
//   })
// });


// write('};')
// console.log(read())
// // console.log(aliasType.getText(undefined, TypeFormatFlags.NodeBuilderFlagsMask & TypeFormatFlags.InTypeAlias ));
// // for (const [name, flag] of Object.entries(flags)) {
// //   console.log('-------- ' + name)
// //   console.log(checker.getTypeText(aliasType, undefined, TypeFormatFlags.NodeBuilderFlagsMask | TypeFormatFlags.NoTruncation).replace(/\{/g, '{\n').replace(/\s*\}/g, str => '\n' + str));
// // }
// // console.log(aliasType.isIntersection());
// // aliasType.getIntersectionTypes().forEach(type => {
// //   const props = type.getProperties();
// //   props[0].getName();
// //   const propType = props[0].getTypeAtLocation(alias);
// //   console.log(checker.getTypeText(propType, undefined, ))
// //   console.log(propType.getText());
  
// //   throw '';
// // });

// // import * as ts from 'typescript';




// // type Output = {str: string};

// // function isNodeExported(node: ts.Node): boolean {
// //   return (ts.getCombinedModifierFlags(node as ts.Declaration) & ts.ModifierFlags.Export) !== 0;
// // }

// // function stringifyProp(checker: ts.TypeChecker, node: ts.Node, propSymbol: ts.Symbol, output: Output, indent: number) {
// //   const indentStr = ''.padStart(indent, ' ');
// //   const type = checker.getTypeOfSymbolAtLocation(propSymbol, node);
// //   // console.log(checker.typeToString(checker.getBaseConstraintOfType(type) || type));
// //   // if (type.isLiteral()) {
// //   //   console.log(type);
// //   //   throw '';
// //   // }
// //   if (propSymbol.escapedName === 'query') {
// //     // @ts-ignore
// //     // console.log(checker.typeToString(checker.));
// //     throw '';
// //   }
// //   // checker.getSignaturesOfType()
// //   output.str += `\n${indentStr}'${propSymbol.escapedName}': `;
// //   if (type.aliasSymbol) {
// //     output.str += type.aliasSymbol.escapedName + ',';
// //   } else {
// //     const props = checker.getPropertiesOfType(type);
// //     if (Array.isArray(props) && props.length > 0) {
// //       output.str += `{`
// //       for (const childPropSymbol of props) {
// //         stringifyProp(checker, node, childPropSymbol, output, indent + 2)
// //       }
// //       output.str += `${indentStr}},\n`;
// //     } else {
// //       output.str += 'void,\n';
// //     }
// //   }
// //   // throw 'gucio';
// // }

// // function stringifyTopNode(checker: ts.TypeChecker, node: ts.Node, output: Output): Output {
// //   console.log(node);
// //   // @ts-ignore
// //   const type = checker.getTypeOfSymbolAtLocation(node.symbol, node)
// //   const text = checker.typeToString(type, undefined, ts.TypeFormatFlags.NodeBuilderFlagsMask | ts.TypeFormatFlags.NoTruncation);
// //   console.log(text);
// //   // console.log(checker.typeToString(type.))  ;
// //   // if (!type.aliasSymbol) throw Error('ts.Type object has no aliasSymbol property');
// //   // output.str += `export interface ${type.aliasSymbol.escapedName} {`;
// //   // for (const propSymbol of checker.getPropertiesOfType(type)) {
// //   //   stringifyProp(checker, node, propSymbol, output, 2)
// //   // }
// //   // output.str += '};';
// //   return output;
// // }

// // function stringifyNode(checker: ts.TypeChecker, symbol: ts.Symbol, output: {str: string} = {str: ''}, indent = 2): {str: string} {
// //   const name = symbol.escapedName;
// //   const indentStr = ''.padStart(indent, ' ');
// //   output.str += `${indentStr}"${name}": {`;
// //   const props = checker.getT
// //   propSymbols.forEach(symbol => {
    
// //   })
// //   node.forEachChild(child => stringifyNode(checker, child, output, indent + 2))
// //   output.str += `${indentStr}},`;
// //   return output;
// //   // type.ge
// //   // let output = `"${node.escapedText}":`
// //   // return `"${node.escapedText}": ${node.forEachChild()}`
// // }


// // function generateInterfaces(fileNames: string[], options: ts.CompilerOptions): Record<string, string> {
// //   let program = ts.createProgram(fileNames, options);
// //   let checker = program.getTypeChecker();
// //   const outputMap: Record<string, string> = {}
// //   for (const fileName of fileNames) {
// //     const sourceFile = program.getSourceFile(fileName);
// //     if (!sourceFile) {
// //       throw Error ('Source file not found: ' + sourceFile);
// //     }
// //     ts.forEachChild(sourceFile, node => {
// //       const output: Output = { str: '' };
// //       if (!isNodeExported(node)) return;
// //       try { // TEMP
// //       console.log(checker.typeToString(checker.getTypeAtLocation(node)));
// //       // stringifyTopNode(checker, node, output);
// //       } catch (err ) { // TEMP
// //         console.log(output.str); // TEMP
// //         throw err; // TEMP
// //       } //TEMP
// //       outputMap[fileName] = output.str;
// //     });
// //   }
// //   for (const [file, str] of Object.entries(outputMap)) {
// //     console.log(file);
// //     console.log(str);
// //   }
// //   return outputMap;
// // }
  
// // generateInterfaces([
// //   'types/api.ts'
// // ], {
// //   target: ts.ScriptTarget.ES5,
// //   module: ts.ModuleKind.CommonJS,
// //   paths: {
// //     "~/*": ["./*"]
// //   },
// // });

// // /*
// // const userRoles = ['admin', 'non-admin'] as const;

// // type UserRole = typeof userRoles[0];

// // interface User {
// //     uuid: string;
// //     username: string;
// //     role: UserRole;
// // }

// // type UserApi = {
// //     readonly GET: {
// //         readonly '/users/:uuid': {
// //             query: { uuid: string }
// //             response: Promise<User>;
// //             payload: unknown;
// //         };
// //         readonly '/users': {
// //             query: Partial<{uuid: string}>
// //             response: Promise<User[]>;
// //             payload: unknown;
// //         };
// //     };
// //     readonly POST: {
// //         readonly '/users/create': {
// //             query: any;
// //             response: any;
// //             payload: User;
// //         }
// //     };
// // }

// // type OtherApi = {
// //     readonly GET: {
// //         readonly '/other/:id': {
// //             query: Partial<{id: string}>;
// //             response: string;
// //             payload: unknown;
// //         };
// //     readonly POST: {
// //         readonly '/other/create-many': {
// //         query: any;
// //         response: any;
// //         payload: string[];
// //     };
// //     }
    
// //     }
// // }
// // */