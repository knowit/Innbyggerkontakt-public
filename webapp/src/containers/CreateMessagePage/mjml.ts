import json2mjml from 'json2mjml';
import mjml2html from 'mjml-browser';

export interface MjmlElement {
  tagName?: string;
  children: MjmlElement[];
  attributes?: Record<string, string>;
  content?: string;
}

/* parses and injects bulletin variables into given mjml template - returns html */
export const generateHTMLfromTemplate = (template: MjmlElement, vars: Record<string, string>) => {
  /* will inject variables into template (in-place) */
  const injectContent = (child: MjmlElement) => {
    const reg = new RegExp(/{{var:([\w,\_]*):?\\?"?([\w0-9 _]*"?)}}/);
    const replacer = (match: string, p1: string, p2: string) => {
      return vars[p1] ? vars[p1] : p2.replace('"', '');
    };

    if (child.content) {
      child.content = child.content.replace(reg, replacer);
    }

    if (child.attributes) {
      for (const key in child.attributes) {
        if (typeof child.attributes[key] === 'string') {
          child.attributes[key] = child.attributes[key].replace(reg, replacer);
        }
      }
    }

    /* recurr on children */
    if (child.children) {
      child.children.forEach((child) => injectContent(child));
    }
  };

  /* given a str var:yourVariable it will return corresponding var */
  const findVariable = (str: string) => {
    const reg = new RegExp(/var:(\w*)/);

    const replacer = (match: string, p1: string) => {
      let varValue = '';

      switch (p1) {
        case 'org_emblem':
          varValue = vars[p1] ? (vars[p1] != '' && vars[p1] != '0' ? vars[p1] : 'NO_IMAGE') : 'NO_IMAGE';
          break;
        case 'bilde':
          varValue = vars[p1] ? (vars[p1] != '' && vars[p1] != '0' ? vars[p1] : 'NO_IMAGE') : 'NO_IMAGE';
          break;
        default:
          varValue = vars[p1] ? vars[p1] : '';
      }

      return varValue;
    };
    if (str == '"0"') return 'NO_IMAGE';
    return str.replace(reg, replacer);
  };

  const removeLinks = (mjml: string) => mjml.replace(/href=".+?(?=")"/g, 'href=""');

  const handleConditionals = (mjml: string): string => {
    const reg = new RegExp(/{% if (.+) %}(([\n, ]|.)+?)(?={% endif %}){% endif %}/g);

    const replacer = (match: string, p1: string, p2: string) => {
      const content = p2;
      const conditional = p1.split(/( and | or )/);

      const list_of_splits = conditional.filter((element) => element == ' and ' || element == ' or ');
      const list_of_conditionals = conditional.filter((element) => element != ' and ' && element != ' or ');

      let list_of_booleans = list_of_conditionals.map((element) => {
        const innerReg = new RegExp(/([\w, :]*) (>|<|==|<=|>=|!=) ([\w, :, ', ",\\]*)/g);

        const result = innerReg.exec(element);

        if (result != null) {
          const left = findVariable(result[1]).replaceAll('"', '');
          const right = findVariable(result[3]).replaceAll('"', '');
          const operator = result[2];

          let cond = false;
          switch (operator) {
            case '>':
              cond = left > right;
              break;
            case '<':
              cond = left < right;
              break;
            case '>=':
              cond = left >= right;
              break;
            case '<=':
              cond = left <= right;
              break;
            case '!=':
              cond = left != right;
              break;
            case '==':
              cond = left == right;
              break;
          }
          return cond;
        }
        return false;
      });

      let full_boolean = list_of_booleans[0];
      list_of_booleans = list_of_booleans.splice(0, 1);

      list_of_splits.forEach((element) => {
        const value = element.replaceAll(' ', '');
        const next_val = list_of_booleans[0];
        list_of_booleans = list_of_booleans.splice(0, 1);

        switch (value) {
          case 'and':
            full_boolean = full_boolean && next_val;
            break;
          case 'or':
            full_boolean = full_boolean || next_val;
            break;
        }
      });

      return full_boolean ? content : '';
    };

    return mjml.replace(reg, replacer);
  };

  /* inject variables, handle logic and parse to html */
  injectContent(template);
  const mjml = removeLinks(json2mjml(template));
  const html = mjml2html(handleConditionals(mjml));
  return html.html;
};
