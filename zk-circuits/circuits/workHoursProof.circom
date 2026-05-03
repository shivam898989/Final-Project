pragma circom 2.1.6;

/**
 * Work Hours Proof Circuit
 * Proves: workHours >= minHours
 * Without revealing the actual number of hours worked.
 *
 * Private inputs: workHours
 * Public inputs: minHours
 * Output: 1 if workHours >= minHours
 */

template GreaterThanOrEqual(n) {
    signal input in[2];
    signal output out;

    signal diff;
    diff <== in[0] - in[1];

    signal bits[n];
    var bitSum = 0;

    for (var i = 0; i < n; i++) {
        bits[i] <-- (diff >> i) & 1;
        bits[i] * (bits[i] - 1) === 0;
        bitSum += bits[i] * (1 << i);
    }

    bitSum === diff;
    out <== 1;
}

template WorkHoursProof() {
    // Private input: actual hours worked
    signal input workHours;

    // Public input: minimum hours threshold
    signal input minHours;

    // Public output: 1 if valid
    signal output isValid;

    component gte = GreaterThanOrEqual(32); // 32-bit range (up to ~4 billion hours)
    gte.in[0] <== workHours;
    gte.in[1] <== minHours;

    isValid <== gte.out;
}

component main { public [ minHours ] } = WorkHoursProof();
