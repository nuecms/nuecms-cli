import fs from "fs";
import _ from "lodash";
import path from "path";
import util from "util";
import { FKSpec } from "./dialects/dialect-options";
import { AutoOptions, TableData, CaseFileOption, CaseOption, LangOption, makeIndent, makeTableName, pluralize, qNameSplit, recase, Relation, cutPrefix } from "./types";
import prettier from "prettier";
import { loadConfig } from '../../config/loadConfig';

/** Writes text into files from TableData.text, and writes init-models */

// 定义常量来管理标记字段
const MODEL_IMPORT_PLACEHOLDER = '// [AUTO_INSERT_MODEL_IMPORT]\n';
const MODEL_EXPORT_PLACEHOLDER = '// [AUTO_INSERT_MODEL_EXPORT]\n';
const TYPE_EXPORT_PLACEHOLDER = '// [AUTO_INSERT_TYPE_EXPORT]\n';
const MODEL_INIT_PLACEHOLDER = '// [AUTO_INSERT_MODEL_INIT]\n';
const MODEL_RETURN_PLACEHOLDER = '// [AUTO_INSERT_MODEL_RETURN]\n';
export class AutoWriter {
  tableText: { [name: string]: string };
  foreignKeys: { [tableName: string]: { [fieldName: string]: FKSpec } };
  relations: Relation[];
  space: string[];
  options: {
    template?: boolean | string;
    caseFile?: CaseFileOption;
    caseModel?: CaseOption;
    caseProp?: CaseOption;
    directory: string;
    lang?: LangOption;
    noAlias?: boolean;
    noInitModels?: boolean;
    noWrite?: boolean;
    singularize?: boolean;
    useDefine?: boolean;
    spaces?: boolean;
    indentation?: number;
    prefix?: string;
    ignore?: string[];
  };
  prettierConfig: prettier.Options | undefined;
  constructor(tableData: TableData, options: AutoOptions) {
    this.tableText = tableData.text as { [name: string]: string };
    this.foreignKeys = tableData.foreignKeys;
    this.relations = tableData.relations;
    this.options = options;
    this.space = makeIndent(this.options.spaces, this.options.indentation);
  }

  async write() {
    if (this.options.noWrite) {
      return Promise.resolve();
    }

    const nueConfig = await loadConfig();
    this.prettierConfig = nueConfig?.prettier;


    fs.mkdirSync(path.resolve(this.options.directory || "./models"), { recursive: true });

    const tables = _.keys(this.tableText);

    // write the individual model files
    const promises = tables.map(t => {
      return this.createFile(t);
    });

    const isTypeScript = this.options.lang === 'ts';
    const assoc = this.createAssociations(isTypeScript);

    // get table names without schema
    // TODO: add schema to model and file names when schema is non-default for the dialect
    const tableNames = tables.map(t => {
      const [schemaName, tableName] = qNameSplit(t);
      return tableName as string;
    }).sort();

    const isTemplate = this.options.template && typeof this.options.template === 'string';

    // write the init-models file
    if (!this.options.noInitModels) {
      const initFilePath = path.join(this.options.directory, "init-models" + (isTypeScript ? '.ts' : '.js'));
      if (isTemplate) {
        const indexString = await this.createInitTemplateIndexString(isTypeScript);
        const writeFile = util.promisify(fs.writeFile);
        const indexPromise = writeFile(path.resolve(initFilePath), indexString);
        promises.push(indexPromise);
      } else {
        const oldFileContent = fs.existsSync(initFilePath) ? fs.readFileSync(initFilePath, 'utf-8') : '';
        const initString = this.createInitString(tableNames, oldFileContent, assoc, this.options.lang);
        const writeFile = util.promisify(fs.writeFile);
        const initPromise = writeFile(path.resolve(initFilePath), initString);
        promises.push(initPromise);
      }
    }

    return Promise.all(promises);
  }

  /**
   * Create an index file that imports and exports all model files in the directory
   * Used when template mode is enabled
   */
  private async createInitTemplateIndexString(isTypeScript: boolean): Promise<string> {
    const directory = this.options.directory;
    const readdir = util.promisify(fs.readdir);
    const files = await readdir(directory);

    // Filter files to only include model files (exclude init-models and index files)
    const modelFiles = files.filter(file => {
      const ext = path.extname(file);
      const name = path.basename(file, ext);

      // Check if the file should be ignored based on options.ignore array
      const shouldIgnore = Array.isArray(this.options.ignore) &&
        this.options.ignore.some(ignoredFile => {
          // If ignoredFile contains an extension, do an exact match
          if (path.extname(ignoredFile)) {
            return file === ignoredFile;
          }
          // Otherwise, match just the basename
          return name === ignoredFile || file === ignoredFile;
        });

      return (ext === '.js' || ext === '.ts') &&
             name !== 'init-models' &&
             name !== 'index' &&
             !shouldIgnore;
    });

    let imports = '';
    let exports = '';
    const sp = this.space[1];

    if (isTypeScript) {
      imports += 'import type { Sequelize } from "sequelize";\n\n';

      // Generate imports for each model file - simplified without Attributes
      modelFiles.forEach(file => {
        const name = path.basename(file, path.extname(file));
        const modelName = recase(this.options.caseModel, name, false);
        imports += `import ${modelName} from "./${name}";\n`;
      });

      // Generate model exports
      exports += '\nexport {\n';
      modelFiles.forEach(file => {
        const name = path.basename(file, path.extname(file));
        const modelName = recase(this.options.caseModel, name, false);
        exports += `${sp}${modelName},\n`;
      });
      exports += '};\n\n';

      // Generate default export with all models
      exports += 'export default {\n';
      modelFiles.forEach(file => {
        const name = path.basename(file, path.extname(file));
        const modelName = recase(this.options.caseModel, name, false);
        exports += `${sp}${modelName},\n`;
      });
      exports += '};\n';
    } else {
      // For JavaScript
      modelFiles.forEach(file => {
        const name = path.basename(file, path.extname(file));
        const modelName = recase(this.options.caseModel, name, false);
        imports += `const { ${modelName} } = require("./${name}");\n`;
      });

      // Generate exports
      exports += '\nmodule.exports = {\n';
      modelFiles.forEach(file => {
        const name = path.basename(file, path.extname(file));
        const modelName = recase(this.options.caseModel, name, false);
        exports += `${sp}${modelName},\n`;
      });
      exports += '};\n';
    }

    // Format the final string with prettier if available
    const indexString = imports + exports;

    if (this.prettierConfig) {
      const prettierOptions: prettier.Options = _.merge({}, {
        printWidth: 120,
        semi: isTypeScript,
        singleQuote: true,
        bracketSpacing: true,
        trailingComma: 'none',
        tabWidth: 2,
        endOfLine: 'lf',
        parser: isTypeScript ? 'typescript' : 'babel'
      }, this.prettierConfig);

      return prettier.format(indexString, prettierOptions);
    }

    return indexString;
  }

  private createInitString(tableNames: string[], oldFileContent: string, assoc: string, lang?: string) {
    switch (lang) {
      case 'ts':
        return this.createTsInitString(tableNames, oldFileContent, assoc);
      case 'esm':
        return this.createESMInitString(tableNames, assoc);
      case 'es6':
        return this.createES5InitString(tableNames, assoc, "const");
      default:
        return this.createES5InitString(tableNames, assoc, "var");
    }
  }
  private async createFile(table: string) {
    // FIXME: schema is not used to write the file name and there could be collisions. For now it
    // is up to the developer to pick the right schema, and potentially chose different output
    // folders for each different schema.
    const [schemaName, tableName] = qNameSplit(table);
    const fileName = cutPrefix(this.options.prefix, recase(this.options.caseFile, tableName, this.options.singularize));
    const filePath = path.join(this.options.directory, fileName + (this.options.lang === 'ts' ? '.ts' : '.js'));
    const writeFile = util.promisify(fs.writeFile);
    const prettierOptions: prettier.Options = _.merge({}, {
      printWidth: 180,
      semi: false,
      singleQuote: true,
      bracketSpacing: true,
      trailingComma: 'none',
      tabWidth: 2,
      endOfLine: 'lf',
      parser: this.options.lang === 'ts' ? 'typescript' : 'babel'
    }, this.prettierConfig)
    const formattedContent = await prettier.format(this.tableText[table], prettierOptions)
    return writeFile(path.resolve(filePath), formattedContent.replace(/\n{2,}/g, "\n"));
  }

  /** Create the belongsToMany/belongsTo/hasMany/hasOne association strings */
  private createAssociations(typeScript: boolean) {
    let strBelongs = "";
    let strBelongsToMany = "";
    const sp = this.space[1];

    const rels = this.relations;
    rels.forEach(rel => {
      if (rel.isM2M) {
        const asprop = recase(this.options.caseProp, pluralize(rel.childProp));
        strBelongsToMany += `${sp}${rel.parentModel}.belongsToMany(${rel.childModel}, { as: '${asprop}', through: ${rel.joinModel}, foreignKey: "${rel.parentId}", otherKey: "${rel.childId}" });\n`;
      } else {
        // const bAlias = (this.options.noAlias && rel.parentModel.toLowerCase() === rel.parentProp.toLowerCase()) ? '' : `as: "${rel.parentProp}", `;
        const asParentProp = recase(this.options.caseProp, rel.parentProp);
        const bAlias = this.options.noAlias ? '' : `as: "${asParentProp}", `;
        strBelongs += `${sp}${rel.childModel}.belongsTo(${rel.parentModel}, { ${bAlias}foreignKey: "${rel.parentId}"});\n`;

        const hasRel = rel.isOne ? "hasOne" : "hasMany";
        // const hAlias = (this.options.noAlias && Utils.pluralize(rel.childModel.toLowerCase()) === rel.childProp.toLowerCase()) ? '' : `as: "${rel.childProp}", `;
        const asChildProp = recase(this.options.caseProp, rel.childProp);
        const hAlias = this.options.noAlias ? '' : `as: "${asChildProp}", `;
        strBelongs += `${sp}${rel.parentModel}.${hasRel}(${rel.childModel}, { ${hAlias}foreignKey: "${rel.parentId}"});\n`;
      }
    });

    // belongsToMany must come first
    return strBelongsToMany + strBelongs;
  }



  private createTsInitString(tables: string[], oldFileContent: string, assoc: string) {
    if (oldFileContent) {
      return this.updateTsInitString(oldFileContent, tables, assoc);
    }

    // 如果文件内容为空，生成全新的内容
    let str = 'import type { Sequelize } from "sequelize";\n' + MODEL_IMPORT_PLACEHOLDER;
    const sp = this.space[1];
    const modelNames: string[] = [];
    // import statements
    tables.forEach(t => {
      const fileName = cutPrefix(this.options.prefix, recase(this.options.caseFile, t, this.options.singularize));
      const modelName = cutPrefix(this.options.prefix, makeTableName(this.options.caseModel, t, this.options.singularize, this.options.lang));
      modelNames.push(modelName);
      str += `import { ${modelName} as _${modelName} } from "./${fileName}";\n`;
      str += `import type { ${modelName}Attributes, ${modelName}CreationAttributes } from "./${fileName}";\n`;
    });
    // re-export the model classes
    str += '\nexport {\n' + MODEL_EXPORT_PLACEHOLDER;
    modelNames.forEach(m => {
      str += `${sp}_${m} as ${m},\n`;
    });
    str += '};\n';

    // re-export the model attirbutes
    str += '\nexport type {\n' + TYPE_EXPORT_PLACEHOLDER;
    modelNames.forEach(m => {
      str += `${sp}${m}Attributes,\n`;
      str += `${sp}${m}CreationAttributes,\n`;
    });
    str += '};\n\n';

    // create the initialization function
    str += 'export function initModels(sequelize: Sequelize) {\n' + MODEL_INIT_PLACEHOLDER;
    modelNames.forEach(m => {
      str += `${sp}const ${m} = _${m}.initModel(sequelize);\n`;
    });

    // add the asociations
    str += "\n" + assoc;

    // return the models
    str += `\n${sp}return {\n` + MODEL_RETURN_PLACEHOLDER;
    modelNames.forEach(m => {
      str += `${this.space[2]}${m}: ${m},\n`;
    });
    str += `${sp}};\n`;
    str += '}\n';

    return str;
  }

  private updateTsInitString(oldFileContent: string, tables: string[], assoc: string): string {
    let updatedContent = oldFileContent;

    // 提取现有导入的模型，避免重复导入
    const existingModels = this.extractExistingModels(updatedContent);
    const newModels: string[] = [];

    // 生成新的 import 和类型语句
    tables.forEach(t => {
      const fileName = cutPrefix(this.options.prefix, recase(this.options.caseFile, t, this.options.singularize));
      const modelName = cutPrefix(this.options.prefix, makeTableName(this.options.caseModel, t, this.options.singularize, this.options.lang));

      if (!existingModels.includes(modelName)) {
        newModels.push(modelName);

        // 插入导入语句
        updatedContent = this.insertAfterPlaceholder(
          updatedContent,
          MODEL_IMPORT_PLACEHOLDER,
          `import { ${modelName} as _${modelName} } from "./${fileName}";\nimport type { ${modelName}Attributes, ${modelName}CreationAttributes } from "./${fileName}";\n`
        );

        // 插入模型导出
        updatedContent = this.insertAfterPlaceholder(
          updatedContent,
          MODEL_EXPORT_PLACEHOLDER,
          `  _${modelName} as ${modelName},\n`
        );

        // 插入类型导出
        updatedContent = this.insertAfterPlaceholder(
          updatedContent,
          TYPE_EXPORT_PLACEHOLDER,
          `  ${modelName}Attributes,\n  ${modelName}CreationAttributes,\n`
        );

        // 插入初始化语句
        updatedContent = this.insertAfterPlaceholder(
          updatedContent,
          MODEL_INIT_PLACEHOLDER,
          `  const ${modelName} = _${modelName}.initModel(sequelize);\n`
        );

        // 插入返回模型
        updatedContent = this.insertAfterPlaceholder(
          updatedContent,
          MODEL_RETURN_PLACEHOLDER,
          `    ${modelName}: ${modelName},\n`
        );
      }
    });

    // 如果有新的关联逻辑，追加到关联占位符
    if (assoc) {
      updatedContent = this.insertAfterPlaceholder(updatedContent, MODEL_INIT_PLACEHOLDER, `\n${assoc}\n`);
    }

    return updatedContent;
  }

  /**
   * 提取现有文件中的模型名
   */
  private extractExistingModels(fileContent: string): string[] {
    const modelRegex = /import { (\w+) as _\1 }/g;
    const existingModels: string[] = [];
    let match;

    while ((match = modelRegex.exec(fileContent)) !== null) {
      existingModels.push(match[1]);
    }

    return existingModels;
  }

  /**
   * 在指定占位符后插入新的内容
   */
  private insertAfterPlaceholder(fileContent: string, placeholder: string, newContent: string): string {
    const index = fileContent.indexOf(placeholder);
    if (index === -1) {
      return fileContent; // 如果找不到占位符，不做任何修改
    }

    const before = fileContent.slice(0, index + placeholder.length);
    const after = fileContent.slice(index + placeholder.length);

    // 避免重复插入同一内容
    if (after.includes(newContent.trim())) {
      return fileContent;
    }

    return before + '\n' + newContent + after;
  }

  // create the ES5 init-models file to load all the models into Sequelize
  private createES5InitString(tables: string[], assoc: string, vardef: string) {
    let str = `${vardef} DataTypes = require("sequelize").DataTypes;\n`;
    const sp = this.space[1];
    const modelNames: string[] = [];
    // import statements
    tables.forEach(t => {
      const fileName = cutPrefix(this.options.prefix, recase(this.options.caseFile, t, this.options.singularize));
      const modelName = cutPrefix(this.options.prefix, makeTableName(this.options.caseModel, t, this.options.singularize, this.options.lang));
      modelNames.push(modelName);
      str += `${vardef} _${modelName} = require("./${fileName}");\n`;
    });

    // create the initialization function
    str += '\nfunction initModels(sequelize) {\n';
    modelNames.forEach(m => {
      str += `${sp}${vardef} ${m} = _${m}(sequelize, DataTypes);\n`;
    });

    // add the asociations
    str += "\n" + assoc;

    // return the models
    str += `\n${sp}return {\n`;
    modelNames.forEach(m => {
      str += `${this.space[2]}${m},\n`;
    });
    str += `${sp}};\n`;
    str += '}\n';
    str += 'module.exports = initModels;\n';
    str += 'module.exports.initModels = initModels;\n';
    str += 'module.exports.default = initModels;\n';
    return str;
  }

  // create the ESM init-models file to load all the models into Sequelize
  private createESMInitString(tables: string[], assoc: string) {
    let str = 'import _sequelize from "sequelize";\n';
    str += 'const DataTypes = _sequelize.DataTypes;\n';
    const sp = this.space[1];
    const modelNames: string[] = [];
    // import statements
    tables.forEach(t => {
      const fileName = cutPrefix(this.options.prefix, recase(this.options.caseFile, t, this.options.singularize));
      const modelName = cutPrefix(this.options.prefix, makeTableName(this.options.caseModel, t, this.options.singularize, this.options.lang));
      modelNames.push(modelName);
      str += `import _${modelName} from  "./${fileName}.js";\n`;
    });
    // create the initialization function
    str += '\nexport default function initModels(sequelize) {\n';
    modelNames.forEach(m => {
      str += `${sp}const ${m} = _${m}.init(sequelize, DataTypes);\n`;
    });

    // add the associations
    str += "\n" + assoc;

    // return the models
    str += `\n${sp}return {\n`;
    modelNames.forEach(m => {
      str += `${this.space[2]}${m},\n`;
    });
    str += `${sp}};\n`;
    str += '}\n';
    return str;
  }
}
