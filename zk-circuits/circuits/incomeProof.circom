pragma circom 2.1.6;

/**
 * Income Proof Circuit
 * Proves: income >= threshold
 * Without revealing the actual income value.
 * 
 * Private inputs: income
 * Public inputs: threshold
 * Output: 1 if income >= threshold, constrained to be valid
 */

template GreaterThanOrEqual(n) {
    signal input in[2]; // in[0] = income, in[1] = threshold
    signal output out;

    // Compute difference: income - threshold
    signal diff;
    diff <== in[0] - in[1];

    // We need to prove diff >= 0 (i.e., income >= threshold)
    // Decompose diff into n bits to prove it's non-negative
    signal bits[n];
    var bitSum = 0;

    for (var i = 0; i < n; i++) {
        bits[i] <-- (diff >> i) & 1;
        bits[i] * (bits[i] - 1) === 0; // Constrain each bit to 0 or 1
        bitSum += bits[i] * (1 << i);
    }

    // Verify bit decomposition matches diff
    bitSum === diff;

    out <== 1;
}

template IncomeProof() {
    // Private input: actual income
    signal input income;
    
    // Public input: minimum threshold to prove against
    signal input threshold;
    
    // Public output: 1 if valid
    signal output isValid;

    // Instantiate comparator (64-bit range for income values up to ~1.8 * 10^19)
    component gte = GreaterThanOrEqual(64);
    gte.in[0] <== income;
    gte.in[1] <== threshold;

    isValid <== gte.out;
}

component main { public [ threshold ] } = IncomeProof();
