import * as Utils from '../utils/type';

type SQLType = 'BOOLEAN' | 'TEXT' | 'INT' | 'DATE' | 'TIMESTAMP';

interface Lang {
  create: (name: string) => string;
  close: () => string;
  id: (name: string, type: string) => string;
  property: (name: string, type: string) => string;
  primary: (id: string) => string;
  foreign: (key: string, table: string, refKey: string) => string;
}

interface ProcessOptions {
  tableName: string;
  parentTableName?: string;
  parentTableId?: string;
  parentTableIdType?: keyof typeof types;
  tableId?: string;
}

const types: Record<string, SQLType | string> = {
  boolean: 'BOOLEAN',
  string: 'TEXT',
  number: 'INT',
  date: 'DATE',
  timestamp: 'TIMESTAMP',
  regexp: 'TEXT',
  undefined: 'TEXT',
  null: 'TEXT',
  uuid: 'CHAR(36)', // Added UUID mapping
};

const lang: Lang = {
  create: (name: string) => `CREATE TABLE ${name} (`,
  close: () => ');',
  id: (name: string, type: string) => `  ${name}_id ${type},`,
  property: (name: string, type: string) => `  ${name} ${type},`,
  primary: (id: string) => `  PRIMARY KEY (${id}),`,
  foreign: (key: string, table: string, refKey: string) => `  FOREIGN KEY (${key}) REFERENCES ${table}(${refKey}),`,
};

// Add a helper function to check UUID format
function isUUID(value: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return typeof value === 'string' && uuidRegex.test(value);
}

function processObject(obj: Record<string, any>, options: ProcessOptions): string[] {
  const { tableName, parentTableName, parentTableId, parentTableIdType, tableId } = options;
  const keys = Object.keys(obj);
  const output: string[] = [];
  const tables: string[] = [];

  let id = tableId || 'id';
  let idType: keyof typeof types = typeof obj[id] === 'undefined' ? 'string' : (typeof obj[id] as keyof typeof types);

  output.push(lang.create(tableName));

  if (parentTableName) {
    output.push(lang.property(`${parentTableName}_${parentTableId}`, types[parentTableIdType || 'string']));
  }

  for (const key of keys) {
    const value = obj[key];
    let type: string;

    if (isUUID(value)) {
      type = 'uuid'; // Recognize as UUID type
    } else {
      type = Utils.isTimestamp(value) ? 'timestamp' : String(value).toLowerCase();
    }

    if (type === 'object' && !Array.isArray(value)) {
      tables.push(processObject(value, {
        tableName: `${tableName}_${key}`,
        parentTableName: tableName,
        parentTableId: id,
        parentTableIdType: idType,
      }).join('\n'));
    } else if (Array.isArray(value) && typeof value[0] === 'object') {
      tables.push(processObject(value[0], {
        tableName: `${tableName}_${key}`,
        parentTableName: tableName,
        parentTableId: id,
        parentTableIdType: idType,
      }).join('\n'));
    } else if (type in types) {
      output.push(lang.property(key, types[type]));
    }
  }

  output.push(lang.primary(id));
  if (parentTableName) {
    output.push(lang.foreign(`${parentTableName}_id`, parentTableName, parentTableId || 'id'));
  }

  // Remove trailing comma
  if (output.length > 0) {
    output[output.length - 1] = output[output.length - 1].replace(/,$/, '');
  }

  output.push(lang.close());

  return output.concat(tables);
}

export default function Process(
  tableName: string | Record<string, any>,
  object?: Record<string, any>,
  options: Partial<ProcessOptions> = {}
): string {
  if (typeof tableName !== 'string') {
    object = tableName;
    tableName = 'generic';
  }

  return processObject(object || {}, { tableName, ...options }).join('\n');
}
