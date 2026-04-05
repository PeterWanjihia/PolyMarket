function isNonNullObject(value) {
    return typeof value === 'object' && value !== null;
}

export function getNodeKind(value){
    if (value === null){
        return 'null';
    }
    if(Array.isArray(value)){
        return 'array';
    }
    if(isNonNullObject(value)){
        return 'object';
    }
    return 'primitive';

}