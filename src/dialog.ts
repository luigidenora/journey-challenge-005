const API = 'https://challange-server.vercel.app/';
// dialog.ts
export const openDialog = async () => {
  // Create a dialog container
  const dialogContainer = document.createElement('div');
  dialogContainer.classList.add('dialog-container');

  // Create dialog content
  const dialogContent = document.createElement('div');
  dialogContent.classList.add('dialog-content');

  // Create input for GitHub username
  const inputLabel = document.createElement('label');
  inputLabel.textContent = 'Enter your GitHub username:';
  const input = document.createElement('input');
  input.type = 'text';
  input.value = 'luigidenora';
  const closeButton = document.createElement('button');
  closeButton.textContent = 'Close';

  // Add elements to the dialog content
  dialogContent.appendChild(inputLabel);
  dialogContent.appendChild(input);
  dialogContent.appendChild(closeButton);

  // Add dialog content to the container
  dialogContainer.appendChild(dialogContent);

  // Append the dialog container to the body
  document.body.appendChild(dialogContainer);
  closeButton.click();
  // Add event listener for the close button
  closeButton.addEventListener('click', async () => {
    const githubUsername = input.value.trim();

    if (githubUsername) {
      // If the user provided a username, send it to the server
      await sendUsernameToServer(githubUsername);

      // After sending, fetch all names from the server
      const allNames = await fetchAllNames();
      console.log('All Names:', allNames);

      // Dispatch a custom event with the fetched data
      const fetchDataEvent = new CustomEvent('fetchData', { detail: allNames });
      window.dispatchEvent(fetchDataEvent);

      // In a real application, you might want to update your UI with the fetched data
    }

    // Remove the dialog container from the body
    document.body.removeChild(dialogContainer);
  });
};

const sendUsernameToServer = async (username: string) => {
  // Send the entered username to the server
  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');

  const raw = JSON.stringify({ name: username });

  const requestOptions: RequestInit = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow',
  };

  // Replace the URL with your actual server URL
  await fetch(`${API}/api/names`, requestOptions)
    .then((response) => response.text())
    .then((result) => console.log(result))
    .catch((error) => console.log('error', error));
};

const fetchAllNames = async () => {
  // Fetch all names from the server (replace with your actual logic)
  const response = await fetch(`${API}/api/names`);
  const data = await response.json();
  return data.names;
};
