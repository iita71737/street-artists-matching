export const isEmpty = (obj) => {
  return obj && Object.keys(obj).length === 0;
};

export const fetcher = (url) => {
  fetch(`http://localhost:8000${url}`).then((res) => res.json())
};
