function match(str) {
    let state = start;
    for (let c of str) {
        state = state(c);
    }
    return state === end;
}
function start(c) {
    if (c === 'a') {
        return findA;
    }
    return start;
}
function findA(c) {
    if (c === 'b') {
        return findB;
    }
    return start(c);
}
function findB(c) {
    if (c === 'c') {
        return findC;
    }
    return start(c);
}
function findC(c) {
    if (c === 'd') {
        return end;
    }
    return start(c);
}
function end(c) {
    return end;
}

console.log(match('I am ababcd'));