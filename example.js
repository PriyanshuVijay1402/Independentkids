const { validateAndFormatAddressString } = require('./util/utils');

async function runExamples() {
    // Example 1: Valid complete address
    const example1 = "I live at 123 Main Street, San Francisco, CA";
    console.log("\nExample 1 input:", example1);
    const result1 = await validateAndFormatAddressString(example1);
    console.log("Result 1:", result1);

    // Example 2: Incomplete address (missing city/state)
    const example2 = "The meeting will be held at 456 Market Street Suite 200, and please bring your laptop.";
    console.log("\nExample 2 input:", example2);
    const result2 = await validateAndFormatAddressString(example2);
    console.log("Result 2:", result2);

    // Example 3: Text with no address
    const example3 = "Hello, how are you doing today?";
    console.log("\nExample 3 input:", example3);
    const result3 = await validateAndFormatAddressString(example3);
    console.log("Result 3:", result3);

    // Example 4: Invalid second address (incomplete)
    const example4 = "First location: 789 Howard Street, San Francisco, CA. Second location: 101 California Street, PA";
    console.log("\nExample 4 input:", example4);
    const result4 = await validateAndFormatAddressString(example4);
    console.log("Result 4:", result4);

    // Example 5: Multiple valid addresses
    const example5 = "Offices: 789 Howard Street, San Francisco, CA and 101 Market Street, Philadelphia, PA";
    console.log("\nExample 5 input:", example5);
    const result5 = await validateAndFormatAddressString(example5);
    console.log("Result 5:", result5);
}

// Run the examples
runExamples().catch(console.error);
