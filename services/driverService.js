async function getAvailableDrivers() {
  // In production, you’d pull this from DB
  return [
    {
      id: 'd1',
      name: 'Ravi Kumar',
      address: 'Ameerpet, Hyderabad',
      trustScore: 0.87,
    },
    {
      id: 'd2',
      name: 'Sneha Patel',
      address: 'Madhapur, Hyderabad',
      trustScore: 0.78,
    },
    // Add more mock drivers here
  ];
}

module.exports = { getAvailableDrivers };
