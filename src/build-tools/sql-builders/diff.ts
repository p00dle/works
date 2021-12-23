import { getIndexes, makeIndexesName, Table, TableColumn, TableDiff, TableForeignKey, WorksConfigFile } from './_common'

import { getPrimary, makeForeignKeyName } from './_common';
import { areArraysSame } from '../../lib/utils';

export function makeDiffs(current: Table, previous: Table, config: WorksConfigFile): TableDiff[] {
  if (!previous) return []
  const diffs: TableDiff[] = [];

  if (current.name !== previous.name) {
    diffs.push({ type: 'rename-table', table: current });
  }

  for (const currentCol of current.columns) {
    const prevCol = previous.columns.find(col => col.name === currentCol.name);
    if (!prevCol) {
      diffs.push({type: 'create-column', table: current, column: currentCol});
    } else if (!areColumnsSame(currentCol, prevCol)) {
      diffs.push({type: 'alter-column', table: current, prevTable: previous, column: currentCol, prevColumn: prevCol });
    }
  }
  for (const prevCol of previous.columns) {
    const col = current.columns.find(col => col.name === prevCol.name);
    if (!col) {
      diffs.push({type: 'drop-column', table: previous, column: prevCol });
    }
  }

  if (current.foreignKeys) {
    for (const currentFK of current.foreignKeys) {
      if (previous.foreignKeys) {
        const fkName = makeForeignKeyName(current, currentFK, config)
        const previousFK = previous.foreignKeys.find(fk => makeForeignKeyName(previous, fk, config) === fkName);
        if (!previousFK) {
          diffs.push({type: 'create-foreign-key', table: current, foreignKey: currentFK});
        } else if (!areForeignKeysSame(currentFK, previousFK)) {
          diffs.push({type: 'drop-foreign-key', table: previous, foreignKey: previousFK});
          diffs.push({type: 'create-foreign-key', table: current, foreignKey: currentFK});
        }
      } else {
        diffs.push({type: 'create-foreign-key', table: current, foreignKey: currentFK});
      }
    }
  }
  
  const currentIndexes = getIndexes(current);
  const previousIndexes = getIndexes(previous);
  if (currentIndexes) {
    for (const currentIndex of currentIndexes) {
      if (previousIndexes) {
        const indexName = makeIndexesName(current, currentIndex, config);
        const previousIndex = previousIndexes.find(ind => makeIndexesName(previous, ind, config) === indexName);
        if (!previousIndex) {
          diffs.push({type: 'create-index', table: current, columnNames: currentIndex });  
        } else if (!areArraysSame(currentIndex, previousIndex)) {
          diffs.push({type: 'drop-index', table: previous, columnNames: previousIndex });
          diffs.push({type: 'create-index', table: current, columnNames: currentIndex });  
        }
      } else {
        diffs.push({type: 'create-index', table: current, columnNames: currentIndex });
      }
    }
  }

  const currentPrimary = getPrimary(current);
  const previousPrimary = getPrimary(previous);
  const arePrimarySame = areArraysSame(currentPrimary, previousPrimary, true);
  if (previousPrimary && !arePrimarySame) {
    diffs.push({type: 'drop-primary', table: previous})
  }
  if (currentPrimary && !arePrimarySame) {
    diffs.push({type: 'create-primary', table: current, columnNames: currentPrimary});
  }
  return diffs;
}

export function areColumnsSame(col1: TableColumn, col2: TableColumn): boolean {
  return true &&
    (col1.type === col2.type) &&
    (col1.type === 'enum' && col2.type === 'enum' ? areArraysSame(col1.enumValues, col2.enumValues, false) : true) &&
    (col1.nullable === col2.nullable) &&
    (col1.unique === col2.unique) &&
    (col1.defaultTo === col2.defaultTo) &&
    (col1.indexed === col2.indexed);
}

export function areForeignKeysSame(fk1: TableForeignKey, fk2: TableForeignKey) {
  return true &&
    (fk1.name === fk2.name) &&
    (fk1.local === fk2.local) &&
    (fk1.onDelete === fk2.onDelete) &&
    (fk1.onUpdate === fk2.onUpdate) &&
    (fk1.remote === fk2.remote) &&
    (fk1.table === fk2.table);

}
2