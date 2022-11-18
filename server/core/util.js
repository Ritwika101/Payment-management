
  function isUndefined(str, emptyStringCheck) {
    if (
      typeof str === "undefined" ||
      str === null ||
      str === "undefined" ||
      str === "null"
    ) {
      return true;
    }
    if (
      emptyStringCheck &&
      typeof str === "string" &&
      str.toString().trim().length === 0
    ) {
      return true;
    }
    return false;
  }
  
  function isNumberInt(n) {
    return n % 1 === 0;
  }
  
  function isTypeString(val) {
    return toString.call(val) === "[object String]" ? true : false;
  }
  
  function isTypeNumber(val) {
    return toString.call(val) === "[object Number]" ? true : false;
  }
  
  function isTypeBoolean(val) {
    return toString.call(val) === "[object Boolean]" ? true : false;
  }
  
  function isTypeObject(val) {
    return toString.call(val) === "[object Object]" ? true : false;
  }
  
  function isTypeArray(val) {
    return toString.call(val) === "[object Array]" ? true : false;
  }
  
  function isTypeFunction(val) {
    return toString.call(val) === "[object Function]" ? true : false;
  }
  
  function isStringValidNumber(val) {
    if (isTypeString(val)) {
      const num = Number(val.trim());
      if (isNaN(num)) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }
  
  function getValidStr(val) {
    if (!isUndefined(val) && isTypeString(val)) {
      return val.trim();
    } else if (isTypeNumber(val)) {
      return val.toString().trim();
    } else {
      return null;
    }
  }
  
  function getValidNumber(val) {
    if (isUndefined(val)) {
      return null;
    }
  
    if (isTypeNumber(val)) {
      return val;
    } else if (isTypeString(val) && isStringValidNumber(val)) {
      return Number(val);
    } else {
      return null;
    }
  }
  
  function getValidBool(val) {
    if (!isUndefined(val) && isTypeBoolean(val)) {
      return val;
    }
  }
  
  function getValidDate(val) {
    // var num = getValidNumber(val);
    if (!isUndefined(val)) {
      const date = new Date(val);
      if (!isNaN(date.getTime())) {
        return date;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
  
  
  module.exports =  {
    isUndefined: isUndefined,
    isNumberInt: isNumberInt,
    isTypeString: isTypeString,
    isTypeNumber: isTypeNumber,
    isTypeBoolean: isTypeBoolean,
    getValidStr: getValidStr,
    getValidNumber: getValidNumber,
    isStringValidNumber: isStringValidNumber,
    isTypeObject: isTypeObject,
    getValidBool: getValidBool,
    getValidDate: getValidDate,
    isTypeArray: isTypeArray,
    isTypeFunction: isTypeFunction,
    
  };
  