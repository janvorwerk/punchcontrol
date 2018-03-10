import { snakeCase } from 'change-case';
import { DefaultNamingStrategy, NamingStrategyInterface } from "typeorm";

export class CustomNamingStrategy extends DefaultNamingStrategy implements NamingStrategyInterface {

    joinColumnName(relationName: string, referencedColumnName: string): string {
        return snakeCase(relationName + "_" + referencedColumnName);
    }

    columnName(propertyName: string, customName: string, embeddedPrefixes: string[]): string { // todo: simplify
        let ret = snakeCase(customName ? customName : propertyName);
        if (embeddedPrefixes.length) {
            ret = snakeCase(embeddedPrefixes.join("_")) + '_' + ret;
        }
        return ret;
    }
}
