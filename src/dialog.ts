const API = 'https://challange-server.vercel.app/';
// dialog.ts
export const openDialog = async () => {
  await emitUsernameData();
  // Create a dialog container

  const form = document.getElementById('username-info');

  // Add event listener for the close button
  form.addEventListener('submit', onFormSubmit);
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
  await fetch(`${API}api/names`, requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
};

const fetchAllNames = async () => {
  // Fetch all names from the server (replace with your actual logic)
  const response = await fetch(`${API}api/names`);
  const data = await response.json();
  return data.names;
};

async function onFormSubmit(ev: SubmitEvent) {
  ev.preventDefault();
  const formData = new FormData(ev.target as HTMLFormElement);

  const githubUsername = formData.get('nickname').toString();
  if (githubUsername) {
    // If the user provided a username, send it to the server
    await sendUsernameToServer(githubUsername);

    // After sending, fetch all names from the server
    await emitUsernameData();

    // In a real application, you might want to update your UI with the fetched data
  }

  // Remove the dialog container from the body
  (document.getElementById('nickname-dialog') as HTMLDialogElement).close();
}

async function emitUsernameData() {
  const allNames = await fetchAllNames();

  // Dispatch a custom event with the fetched data
  const fetchDataEvent = new CustomEvent('fetchData', { detail: allNames });
  window.dispatchEvent(fetchDataEvent);
}
