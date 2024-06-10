//import sizeOf from 'image-size';
import browserImageSize from 'browser-image-size';
import { ValidationType } from '../../models';

const validateType = async (validation: ValidationType, file: File) => {
  return validation.metricValue.split(',').includes(file.type.toLowerCase());
};

const validateWidth = async (validation: ValidationType, file: File) => {
  let resultWithinBoundary = false;
  if (file.type.split('/')[0] === 'image') {
    await browserImageSize(file).then((size: Record<string, number>) => {
      if (validation.check && validation.check === 'max') {
        resultWithinBoundary = size.width <= parseInt(validation.metricValue);
      }
      if (validation.check && validation.check === 'min') {
        resultWithinBoundary = size.width >= parseInt(validation.metricValue);
      }
    });
    /*
    await file.arrayBuffer().then((e) => {
      const buffer = Buffer.from(e);
      const dimensions = sizeOf(buffer);
      if (dimensions.width !== undefined) {
        if (validation.check && validation.check === 'max') {
          resultWithinBoundary = dimensions.width <= parseInt(validation.metricValue);
        }
        if (validation.check && validation.check === 'min') {
          resultWithinBoundary = dimensions.width >= parseInt(validation.metricValue);
        }
      }
    });
    */
  }
  return resultWithinBoundary;
};

const validateHeight = async (validation: ValidationType, file: File) => {
  let resultWithinBoundary = false;
  if (file.type.split('/')[0] === 'image') {
    await browserImageSize(file).then((size: Record<string, number>) => {
      if (validation.check && validation.check === 'max') {
        resultWithinBoundary = size.height <= parseInt(validation.metricValue);
      }
      if (validation.check && validation.check === 'min') {
        resultWithinBoundary = size.height >= parseInt(validation.metricValue);
      }
    });
    /*
    await file.arrayBuffer().then((e) => {
      const buffer = Buffer.from(e);
      const dimensions = sizeOf(buffer);
      if (dimensions.height !== undefined) {
        if (validation.check && validation.check === 'max') {
          resultWithinBoundary = dimensions.height <= parseInt(validation.metricValue);
        }
        if (validation.check && validation.check === 'min') {
          resultWithinBoundary = dimensions.height >= parseInt(validation.metricValue);
        }
      }
    });
    */
  }
  return resultWithinBoundary;
};

const validateSize = async (validation: ValidationType, file: File) => {
  if (validation.check && validation.check === 'max') {
    return parseInt(validation.metricValue) >= file.size;
  }
  if (validation.check && validation.check === 'min') {
    return parseInt(validation.metricValue) <= file.size;
  }
  return true;
};

const switchValidators = async (rule: ValidationType, file: File) => {
  let result = false;
  if (rule.metric === 'type') {
    await validateType(rule, file).then((res) => {
      result = !res;
    });
  } else if (rule.metric === 'width') {
    await validateWidth(rule, file).then((res) => {
      result = !res;
    });
  } else if (rule.metric === 'height') {
    await validateHeight(rule, file).then((res) => {
      result = !res;
    });
  } else if (rule.metric === 'size') {
    await validateSize(rule, file).then((res) => {
      result = !res;
    });
  }
  return result;
};

export const validateFile = async (validationRules: ValidationType[], file: File) => {
  validationRules.sort((a, b) => (a.type > b.type ? 1 : -1));

  let feedback: ValidationType | undefined = undefined;
  for (const validation of validationRules) {
    if (feedback === undefined) {
      await switchValidators(validation, file).then((res) => {
        feedback = !feedback && res ? validation : feedback;
      });
    }
  }

  return feedback;
};
