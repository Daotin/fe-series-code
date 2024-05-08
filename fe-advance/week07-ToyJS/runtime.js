export class Realm {
    constructor() {
        this.globol = {};
        this.Object = {};
        this.Object.call = function () {
            
        }
        this.Object_prototype = {};
    }
}

export class EnvironmentRecord {
    constructor() {
        this.thisValue = '';
        this.variable = new Map();
        this.outer = null;
    }
}
    
export class ExecutionContext {
    constructor(realm, lexicalEnvironemnt, variableEnvironemnt) {
        variableEnvironemnt = variableEnvironemnt || lexicalEnvironemnt;
        this.lexicalEnvironemnt = lexicalEnvironemnt;
        this.variableEnvironemnt = variableEnvironemnt;
        this.realm = realm;
    }
}

// 新的类型，存储属性和值。在运行时所有对象属性的访问都会用到该属性
// （运行时JS引擎自动创建）
export class Reference {
    constructor(object, property) {
        this.object = object;
        this.property = property;
    }
    set(value) {
        this.object[this.property] = value;
    }
    get() {
        return this.object[this.property];
    }
}