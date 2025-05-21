export const sendImproveSelection = async (selectedOption: string) => {
  try {
    const response = await fetch('https://mockapi.io/improve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ selectedOption }),
    });
    return await response.json();
  } catch (error) {
    console.error('API error:', error);
    return null;
  }
}; 