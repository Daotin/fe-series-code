function match(str) {
    let state = start;
    for (const c of str) {
        state = state(c);
    }
    console.log(state.name);
    return state === end;
}

function start(c) {
    if (c === 'a') return findA;
    return start;
}
function findA(c) {
    if (c === 'b') return findB;
    return start(c);
}
function findB(c) {
    if (c === 'c') return findC;
    return start(c);
}
function findC(c) {
    if (c === 'a') return findA2;
    return start(c);
}
function findA2(c) {
    if (c === 'b') return findB2;
    return start(c);
}
function findB2(c) {
    if (c === 'x') return end;
    return findB(c);
}
function end(c) {
    return end;
}

console.log(match('i am abcabcabx'));