const testCarpoolMatch = async () => {
  const userId = '674de5ac85a6306d9791bb7a';
  const data = {
    dependent_name: 'Megan Albert',
    activity_name: 'Violin',
    radius: 2
  };

  try {
    console.log('\nMaking request to match carpool...');
    console.log('Request data:', JSON.stringify(data, null, 2));

    const matchResponse = await fetch(`http://localhost:3000/api/users/${userId}/match-carpool`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await matchResponse.json();

    if (!matchResponse.ok) {
      console.error('Server error response:', result);
      throw new Error(`Match failed with status: ${matchResponse.status}`);
    }

    console.log('\nCarpool matches:', JSON.stringify(result, null, 2));
  } catch (error) {
    if (error.cause?.code === 'ECONNREFUSED') {
      console.error('Error: Could not connect to the server. Make sure the server is running on localhost:3000');
    } else {
      console.error('Error:', error.message);
    }
  }
};

// Note: Make sure the server (app.js) is running before executing this test
console.log('Starting carpool match test...');
console.log('Note: Ensure the server is running (node app.js) before running this test\n');
testCarpoolMatch();
