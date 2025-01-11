
import _ from "lodash";


export const titleCase = (str: string): string => {
  return _.upperFirst(_.camelCase(str));
}
