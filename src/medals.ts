export const showMedals = (allNames: string[]) => {
  const modalsDiv = document.getElementById('medals') as HTMLDivElement;
  modalsDiv.classList.remove('hidden') 
  appendUniqueImgChildren(modalsDiv, allNames);
};

function appendUniqueImgChildren(parent: HTMLDivElement, children: string[]) {
  const documentFragment = document.createDocumentFragment();
  const imgIds = new Set();
  children.forEach(child => {
    if (!imgIds.has(child)) {
      imgIds.add(child);
      if (!parent.querySelector(`#${child}`)) {
        documentFragment.appendChild(createImgFromString(child));
      }
    }
  });
  parent.appendChild(documentFragment);
}

function createImgFromString(str:string) {
  const img = document.createElement('img');
  img.src = `https://avatars.githubusercontent.com/${str}`;
  img.id = `${str}`;
  img.classList.add('medals');
  return img;
}
