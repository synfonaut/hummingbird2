export function isOutput(out) {
    return (out
        && out.len > 20
        && out.o1 == "OP_RETURN"
        && out.s5 == "text"
    );
}

