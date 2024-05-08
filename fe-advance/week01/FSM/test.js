function match(str, c) {
    for (let s of str) {
        if (s === c) {
            return true;
        }
    }
    return false;
}

match('i am groot', 'a');